// ============================================================================
// STRIPE SERVICE - Serviço Centralizado para Integração com Stripe
// Gerencia todos os aspectos da integração: checkout, webhooks, assinaturas
// ============================================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

const STRIPE_CONFIG = {
  priceId: process.env.STRIPE_PRICE_ID || 'price_1SEKNFIPGzIfZaTDXox4NygH',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: 'brl',
  billingCycleAnchor: true,
  trialPeriodDays: 0
};

// ============================================================================
// LOGGER ESTRUTURADO
// ============================================================================

class Logger {
  static log(level, message, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    };
    console.log(JSON.stringify(logEntry));
  }

  static info(message, metadata) {
    this.log('INFO', message, metadata);
  }

  static error(message, metadata) {
    this.log('ERROR', message, metadata);
  }

  static warn(message, metadata) {
    this.log('WARN', message, metadata);
  }
}

// ============================================================================
// DATABASE HELPER - Abstração para operações no Realtime Database
// ============================================================================

class DatabaseHelper {
  static async getUserByUid(uid) {
    try {
      const snapshot = await admin.database().ref(`users/${uid}`).once('value');
      return snapshot.val();
    } catch (error) {
      Logger.error('Erro ao buscar usuário por UID', { uid, error: error.message });
      throw error;
    }
  }

  static async getUserByCustomerId(customerId) {
    try {
      const snapshot = await admin.database()
        .ref('users')
        .orderByChild('stripeCustomerId')
        .equalTo(customerId)
        .limitToFirst(1)
        .once('value');

      if (!snapshot.exists()) {
        return null;
      }

      const users = snapshot.val();
      const userId = Object.keys(users)[0];
      return { uid: userId, ...users[userId] };
    } catch (error) {
      Logger.error('Erro ao buscar usuário por Customer ID', { customerId, error: error.message });
      throw error;
    }
  }

  static async updateUser(uid, data) {
    try {
      await admin.database().ref(`users/${uid}`).update({
        ...data,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      });
      Logger.info('Usuário atualizado com sucesso', { uid, fields: Object.keys(data) });
    } catch (error) {
      Logger.error('Erro ao atualizar usuário', { uid, error: error.message });
      throw error;
    }
  }

  static async logWebhookEvent(eventId, eventType, status, metadata = {}) {
    try {
      await admin.database().ref(`webhookLogs/${eventId}`).set({
        eventType,
        status,
        metadata,
        processedAt: admin.database.ServerValue.TIMESTAMP
      });
    } catch (error) {
      Logger.error('Erro ao logar evento de webhook', { eventId, error: error.message });
    }
  }
}

// ============================================================================
// STRIPE CUSTOMER MANAGEMENT
// ============================================================================

class StripeCustomerService {
  /**
   * Cria ou recupera um customer do Stripe
   */
  static async getOrCreateCustomer(userId, userEmail, userName) {
    try {
      // Verificar se já existe customer ID
      const userData = await DatabaseHelper.getUserByUid(userId);

      if (userData && userData.stripeCustomerId) {
        Logger.info('Customer existente encontrado', { userId, customerId: userData.stripeCustomerId });
        return userData.stripeCustomerId;
      }

      // Criar novo customer
      const customer = await stripe.customers.create({
        email: userEmail,
        name: userName || 'Usuário IRPF',
        metadata: {
          firebaseUid: userId
        }
      });

      // Salvar customer ID no banco
      await DatabaseHelper.updateUser(userId, {
        stripeCustomerId: customer.id
      });

      Logger.info('Novo customer criado', { userId, customerId: customer.id });
      return customer.id;
    } catch (error) {
      Logger.error('Erro ao criar/obter customer', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Atualiza informações do customer
   */
  static async updateCustomer(customerId, updates) {
    try {
      await stripe.customers.update(customerId, updates);
      Logger.info('Customer atualizado', { customerId, updates: Object.keys(updates) });
    } catch (error) {
      Logger.error('Erro ao atualizar customer', { customerId, error: error.message });
      throw error;
    }
  }
}

// ============================================================================
// CHECKOUT SESSION MANAGEMENT
// ============================================================================

class CheckoutSessionService {
  /**
   * Cria uma sessão de checkout do Stripe
   */
  static async createSession(userId, userEmail, userName, options = {}) {
    try {
      // Obter ou criar customer
      const customerId = await StripeCustomerService.getOrCreateCustomer(userId, userEmail, userName);

      const sessionConfig = {
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: options.priceId || STRIPE_CONFIG.priceId,
            quantity: 1,
          },
        ],
        metadata: {
          firebaseUid: userId,
        },
        subscription_data: {
          metadata: {
            firebaseUid: userId,
          },
          trial_period_days: options.trialDays || STRIPE_CONFIG.trialPeriodDays,
        },
        success_url: options.successUrl || `${options.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: options.cancelUrl || `${options.origin}/checkout.html`,
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
      };

      const session = await stripe.checkout.sessions.create(sessionConfig);

      // Registrar início do checkout
      await DatabaseHelper.updateUser(userId, {
        pendingCheckoutSessionId: session.id,
        pendingPayment: true,
        checkoutInitiatedAt: admin.database.ServerValue.TIMESTAMP
      });

      Logger.info('Sessão de checkout criada', {
        userId,
        sessionId: session.id,
        customerId
      });

      return session;
    } catch (error) {
      Logger.error('Erro ao criar sessão de checkout', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Recupera uma sessão de checkout
   */
  static async retrieveSession(sessionId) {
    try {
      return await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer']
      });
    } catch (error) {
      Logger.error('Erro ao recuperar sessão', { sessionId, error: error.message });
      throw error;
    }
  }
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

class SubscriptionService {
  /**
   * Recupera uma assinatura
   */
  static async getSubscription(subscriptionId) {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      Logger.error('Erro ao recuperar assinatura', { subscriptionId, error: error.message });
      throw error;
    }
  }

  /**
   * Cancela uma assinatura
   */
  static async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });

      Logger.info('Assinatura cancelada', {
        subscriptionId,
        cancelAtPeriodEnd,
        cancelAt: subscription.cancel_at
      });

      return subscription;
    } catch (error) {
      Logger.error('Erro ao cancelar assinatura', { subscriptionId, error: error.message });
      throw error;
    }
  }

  /**
   * Reativa uma assinatura cancelada
   */
  static async reactivateSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      Logger.info('Assinatura reativada', { subscriptionId });
      return subscription;
    } catch (error) {
      Logger.error('Erro ao reativar assinatura', { subscriptionId, error: error.message });
      throw error;
    }
  }

  /**
   * Atualiza método de pagamento
   */
  static async updatePaymentMethod(subscriptionId, paymentMethodId) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId,
      });

      Logger.info('Método de pagamento atualizado', { subscriptionId, paymentMethodId });
      return subscription;
    } catch (error) {
      Logger.error('Erro ao atualizar método de pagamento', { subscriptionId, error: error.message });
      throw error;
    }
  }

  /**
   * Cria portal de gerenciamento para o cliente
   */
  static async createBillingPortalSession(customerId, returnUrl) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      Logger.info('Portal de cobrança criado', { customerId });
      return session;
    } catch (error) {
      Logger.error('Erro ao criar portal de cobrança', { customerId, error: error.message });
      throw error;
    }
  }
}

// ============================================================================
// WEBHOOK EVENT HANDLERS
// ============================================================================

class WebhookHandlers {
  /**
   * Processa checkout.session.completed
   */
  static async handleCheckoutSessionCompleted(session) {
    const userId = session.metadata.firebaseUid;

    if (!userId) {
      Logger.warn('Sessão sem userId no metadata', { sessionId: session.id });
      return;
    }

    try {
      const updates = {
        hasPaid: true,
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription,
        subscriptionStatus: 'active',
        paidAt: admin.database.ServerValue.TIMESTAMP,
        pendingPayment: false,
        pendingCheckoutSessionId: null,
        lastPaymentStatus: 'paid'
      };

      await DatabaseHelper.updateUser(userId, updates);
      await DatabaseHelper.logWebhookEvent(session.id, 'checkout.session.completed', 'success', { userId });

      Logger.info('Checkout completado com sucesso', { userId, sessionId: session.id });
    } catch (error) {
      await DatabaseHelper.logWebhookEvent(session.id, 'checkout.session.completed', 'error', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Processa customer.subscription.created
   */
  static async handleSubscriptionCreated(subscription) {
    const userId = subscription.metadata.firebaseUid;

    if (!userId) {
      // Tentar buscar por customer ID
      const user = await DatabaseHelper.getUserByCustomerId(subscription.customer);
      if (!user) {
        Logger.warn('Assinatura sem userId identificável', { subscriptionId: subscription.id });
        return;
      }
      return this.handleSubscriptionCreated({ ...subscription, metadata: { firebaseUid: user.uid } });
    }

    try {
      await DatabaseHelper.updateUser(userId, {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      });

      Logger.info('Assinatura criada', { userId, subscriptionId: subscription.id });
    } catch (error) {
      Logger.error('Erro ao processar criação de assinatura', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Processa customer.subscription.updated
   */
  static async handleSubscriptionUpdated(subscription) {
    const user = await DatabaseHelper.getUserByCustomerId(subscription.customer);

    if (!user) {
      Logger.warn('Usuário não encontrado para atualização de assinatura', {
        customerId: subscription.customer,
        subscriptionId: subscription.id
      });
      return;
    }

    try {
      const isActive = ['active', 'trialing'].includes(subscription.status);
      const isCanceled = subscription.cancel_at_period_end;

      await DatabaseHelper.updateUser(user.uid, {
        hasPaid: isActive,
        subscriptionStatus: subscription.status,
        subscriptionCanceledAt: isCanceled ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        cancelAtPeriodEnd: isCanceled,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      });

      Logger.info('Assinatura atualizada', {
        userId: user.uid,
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: isCanceled
      });
    } catch (error) {
      Logger.error('Erro ao processar atualização de assinatura', {
        userId: user.uid,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Processa customer.subscription.deleted
   */
  static async handleSubscriptionDeleted(subscription) {
    const user = await DatabaseHelper.getUserByCustomerId(subscription.customer);

    if (!user) {
      Logger.warn('Usuário não encontrado para deleção de assinatura', {
        customerId: subscription.customer
      });
      return;
    }

    try {
      await DatabaseHelper.updateUser(user.uid, {
        hasPaid: false,
        subscriptionStatus: 'canceled',
        subscriptionCanceledAt: admin.database.ServerValue.TIMESTAMP,
        subscriptionEndedAt: admin.database.ServerValue.TIMESTAMP,
      });

      Logger.info('Assinatura deletada', { userId: user.uid, subscriptionId: subscription.id });
    } catch (error) {
      Logger.error('Erro ao processar deleção de assinatura', {
        userId: user.uid,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Processa invoice.payment_succeeded
   */
  static async handlePaymentSucceeded(invoice) {
    const user = await DatabaseHelper.getUserByCustomerId(invoice.customer);

    if (!user) {
      Logger.warn('Usuário não encontrado para pagamento bem-sucedido', {
        customerId: invoice.customer
      });
      return;
    }

    try {
      await DatabaseHelper.updateUser(user.uid, {
        lastPaymentStatus: 'paid',
        lastPaymentAmount: invoice.amount_paid,
        lastPaymentDate: admin.database.ServerValue.TIMESTAMP,
        hasPaid: true,
      });

      Logger.info('Pagamento bem-sucedido', {
        userId: user.uid,
        invoiceId: invoice.id,
        amount: invoice.amount_paid
      });
    } catch (error) {
      Logger.error('Erro ao processar pagamento bem-sucedido', {
        userId: user.uid,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Processa invoice.payment_failed
   */
  static async handlePaymentFailed(invoice) {
    const user = await DatabaseHelper.getUserByCustomerId(invoice.customer);

    if (!user) {
      Logger.warn('Usuário não encontrado para falha de pagamento', {
        customerId: invoice.customer
      });
      return;
    }

    try {
      await DatabaseHelper.updateUser(user.uid, {
        lastPaymentStatus: 'failed',
        lastPaymentError: invoice.last_payment_error?.message || 'Pagamento falhou',
        lastPaymentAttemptDate: admin.database.ServerValue.TIMESTAMP,
        paymentRetryCount: (user.paymentRetryCount || 0) + 1,
      });

      Logger.warn('Pagamento falhou', {
        userId: user.uid,
        invoiceId: invoice.id,
        error: invoice.last_payment_error?.message
      });

      // TODO: Enviar email notificando falha
    } catch (error) {
      Logger.error('Erro ao processar falha de pagamento', {
        userId: user.uid,
        error: error.message
      });
      throw error;
    }
  }
}

// ============================================================================
// WEBHOOK PROCESSOR
// ============================================================================

class WebhookProcessor {
  /**
   * Processa evento de webhook
   */
  static async processEvent(event) {
    try {
      Logger.info('Processando evento de webhook', { type: event.type, id: event.id });

      switch (event.type) {
        case 'checkout.session.completed':
          await WebhookHandlers.handleCheckoutSessionCompleted(event.data.object);
          break;

        case 'customer.subscription.created':
          await WebhookHandlers.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await WebhookHandlers.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await WebhookHandlers.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await WebhookHandlers.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await WebhookHandlers.handlePaymentFailed(event.data.object);
          break;

        default:
          Logger.info('Evento não tratado', { type: event.type });
      }

      await DatabaseHelper.logWebhookEvent(event.id, event.type, 'success');
    } catch (error) {
      Logger.error('Erro ao processar evento de webhook', {
        type: event.type,
        id: event.id,
        error: error.message
      });
      await DatabaseHelper.logWebhookEvent(event.id, event.type, 'error', { error: error.message });
      throw error;
    }
  }

  /**
   * Valida e constrói evento de webhook
   */
  static constructEvent(payload, signature) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_CONFIG.webhookSecret
      );
    } catch (error) {
      Logger.error('Erro ao validar assinatura do webhook', { error: error.message });
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Services
  StripeCustomerService,
  CheckoutSessionService,
  SubscriptionService,
  WebhookProcessor,

  // Helpers
  DatabaseHelper,
  Logger,

  // Config
  STRIPE_CONFIG,

  // Direct Stripe access (para casos especiais)
  stripe
};
