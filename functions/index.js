// ============================================================================
// FIREBASE CLOUD FUNCTIONS - Sistema de Pagamento com Stripe
// Integração completa e robusta usando stripe-service.js
// Refatorado para usar Data Connect para todas as operações de dados
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {
  CheckoutSessionService,
  SubscriptionService,
  WebhookProcessor,
  Logger,
  DataConnectHelper // Importar o novo DataConnectHelper
} = require('./stripe-service');

admin.initializeApp();

// ============================================================================
// CORS MIDDLEWARE
// ============================================================================

const setCorsHeaders = (res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '3600');
};

// ============================================================================
// CREATE CHECKOUT SESSION
// Cria sessão de checkout do Stripe com tratamento robusto de erros
// ============================================================================

exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { userId, userEmail, userName, priceId, trialDays } = req.body;

    // Validações
    if (!userId || !userEmail) {
      Logger.warn('Requisição de checkout com dados incompletos', { userId, userEmail });
      res.status(400).json({
        error: 'Dados incompletos',
        details: 'userId e userEmail são obrigatórios'
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      res.status(400).json({
        error: 'Email inválido',
        details: 'Forneça um endereço de email válido'
      });
      return;
    }

    const origin = req.headers.origin || req.headers.referer || 'http://localhost';

    // Criar sessão usando o serviço
    const session = await CheckoutSessionService.createSession(
      userId,
      userEmail,
      userName,
      {
        priceId,
        trialDays,
        origin,
        successUrl: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/checkout.html`
      }
    );

    Logger.info('Sessão de checkout criada com sucesso', {
      userId,
      sessionId: session.id
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    Logger.error('Erro ao criar sessão de checkout', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro ao criar sessão de checkout',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// STRIPE WEBHOOK
// Processa eventos do Stripe com validação de assinatura
// ============================================================================

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    Logger.warn('Webhook recebido sem assinatura');
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  let event;

  try {
    // Construir e validar evento
    event = WebhookProcessor.constructEvent(req.rawBody, signature);
    Logger.info('Webhook recebido e validado', { type: event.type, id: event.id });
  } catch (error) {
    Logger.error('Falha na validação do webhook', { error: error.message });
    res.status(400).json({ error: error.message });
    return;
  }

  try {
    // Processar evento
    await WebhookProcessor.processEvent(event);

    res.status(200).json({ received: true, processed: true });
  } catch (error) {
    Logger.error('Erro ao processar webhook', {
      type: event.type,
      id: event.id,
      error: error.message
    });

    // Retornar 200 mesmo com erro para evitar retries desnecessários do Stripe
    // O erro já foi logado e pode ser investigado
    res.status(200).json({ received: true, processed: false });
  }
});

// ============================================================================
// CREATE BILLING PORTAL SESSION
// Cria sessão do Customer Portal para gerenciamento de assinatura
// ============================================================================

exports.createPortalSession = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'userId é obrigatório' });
      return;
    }

    // Buscar dados do usuário via Data Connect
    const userData = await DataConnectHelper.getUserByUid(userId);

    if (!userData || !userData.stripeCustomerId) {
      Logger.warn('Usuário sem customer ID do Stripe (Data Connect)', { userId });
      res.status(404).json({
        error: 'Cliente não encontrado',
        details: 'Você precisa ter uma assinatura ativa'
      });
      return;
    }

    const origin = req.headers.origin || req.headers.referer || 'http://localhost';
    const returnUrl = `${origin}/account.html`;

    // Criar sessão do portal
    const session = await SubscriptionService.createBillingPortalSession(
      userData.stripeCustomerId,
      returnUrl
    );

    Logger.info('Portal de cobrança criado', { userId, customerId: userData.stripeCustomerId });

    res.status(200).json({
      success: true,
      url: session.url
    });

  } catch (error) {
    Logger.error('Erro ao criar portal de cobrança', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro ao criar portal de cobrança',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// GET SUBSCRIPTION STATUS
// Retorna status detalhado da assinatura do usuário
// ============================================================================

exports.getSubscriptionStatus = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const userId = req.query.userId;

    if (!userId) {
      res.status(400).json({ error: 'userId é obrigatório' });
      return;
    }

    // Buscar dados do usuário via Data Connect
    const userData = await DataConnectHelper.getUserByUid(userId);

    if (!userData) {
      res.status(404).json({ error: 'Usuário não encontrado no Data Connect' });
      return;
    }

    // Buscar detalhes da assinatura no Stripe se existir
    let subscriptionDetails = null;
    if (userData.subscriptionId) {
      try {
        const subscription = await SubscriptionService.getSubscription(userData.subscriptionId);
        subscriptionDetails = {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        };
      } catch (error) {
        Logger.warn('Erro ao buscar assinatura no Stripe', {
          userId,
          subscriptionId: userData.subscriptionId,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      user: {
        uid: userData.uid,
        email: userData.email,
        hasPaid: userData.hasPaid || false,
        subscriptionStatus: userData.subscriptionStatus,
        subscriptionId: userData.subscriptionId,
        stripeCustomerId: userData.stripeCustomerId,
        lastPaymentStatus: userData.lastPaymentStatus,
        cancelAtPeriodEnd: userData.cancelAtPeriodEnd,
      },
      subscription: subscriptionDetails
    });

  } catch (error) {
    Logger.error('Erro ao buscar status de assinatura', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro ao buscar status de assinatura',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// CANCEL SUBSCRIPTION
// Cancela assinatura do usuário
// ============================================================================

exports.cancelSubscription = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { userId, immediate } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'userId é obrigatório' });
      return;
    }

    // Buscar dados do usuário via Data Connect
    const userData = await DataConnectHelper.getUserByUid(userId);

    if (!userData || !userData.subscriptionId) {
      res.status(404).json({
        error: 'Assinatura não encontrada no Data Connect',
        details: 'Você não possui uma assinatura ativa'
      });
      return;
    }

    // Cancelar assinatura no Stripe
    const cancelAtPeriodEnd = !immediate;
    const subscription = await SubscriptionService.cancelSubscription(
      userData.subscriptionId,
      cancelAtPeriodEnd
    );

    // Atualizar status no Data Connect
    await DataConnectHelper.updateUser(userId, {
      subscriptionStatus: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      subscriptionCanceledAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      hasPaid: subscription.status === 'active' || subscription.status === 'trialing' // Se for cancelamento imediato, setar hasPaid para false
    });

    Logger.info('Assinatura cancelada por requisição do usuário', {
      userId,
      subscriptionId: userData.subscriptionId,
      immediate
    });

    res.status(200).json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      }
    });

  } catch (error) {
    Logger.error('Erro ao cancelar assinatura', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Erro ao cancelar assinatura',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
