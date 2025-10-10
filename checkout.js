// ============================================================================
// CHECKOUT.JS - Sistema de Checkout Melhorado com Stripe (Firebase Modular SDK v9+)
// Integração completa usando Cloud Functions e helpers
// Refatorado para usar Data Connect para todas as operações de dados do usuário
// ============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { firebaseConfig, stripeConfig } from './firebase-config.js';
import { StripeHelper, UIManager, ErrorHandler } from './stripe-helper.js';
import {
    checkPaymentStatus,
    getUserData,
    createPayment,
    updateUserLogin,
    createAuditLog
} from './dataconnect-integration.js';

// Inicializar Firebase App e Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log('✅ Firebase modular SDK inicializado com sucesso no checkout');

// Inicializar helper do Stripe (necessita de um objeto Stripe, será inicializado no redirectToCheckout)
const stripeHelper = new StripeHelper(stripeConfig.publishableKey, stripeConfig.priceId);

// Elementos do DOM
const checkoutButton = document.getElementById('checkout-button');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error-message');

// Controle de método de checkout
let checkoutMethod = 'checkout_session'; // 'checkout_session' ou 'payment_link'

// ============================================================================
// VERIFICAR AUTENTICAÇÃO E STATUS DE PAGAMENTO
// ============================================================================

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log('❌ Usuário não autenticado, redirecionando para login...');
        window.location.href = 'index.html';
        return;
    }

    console.log('✅ Usuário autenticado:', user.email);
    await updateUserLogin(user.uid); // Atualiza o último login também aqui no checkout

    // Verificar se já pagou usando Data Connect
    try {
        const hasPaid = await checkPaymentStatus(user.uid);
        
        console.log('📊 Status de pagamento (Data Connect):', hasPaid ? 'PAGO' : 'PENDENTE');

        if (hasPaid) {
            console.log('✅ Usuário já pagou! Redirecionando para app...');
            UIManager.showNotification('Você já possui uma assinatura ativa!', 'success');
            setTimeout(() => {
                window.location.href = 'app.html';
            }, 1500);
            return;
        }

        console.log('💳 Pagamento pendente, mostrando opções de checkout...');

    } catch (error) {
        console.error('❌ Erro ao verificar pagamento:', error);
        ErrorHandler.handle(error, 'verificação de pagamento');
        UIManager.showNotification('Erro ao verificar status de pagamento. Tente novamente.', 'error');
    }
});

// ============================================================================
// MOSTRAR AVISO DE CHECKOUT PENDENTE (Mantido, mas a lógica de ativação pode mudar)
// ============================================================================

function showPendingCheckoutWarning() {
    errorDiv.innerHTML = `
        <i class="fas fa-info-circle"></i>
        Você tem um checkout em andamento. Se não completou o pagamento, você pode iniciar um novo.
    `;
    errorDiv.style.display = 'block';
    errorDiv.style.background = 'rgba(251, 146, 60, 0.1)';
    errorDiv.style.borderColor = '#fb923c';
    errorDiv.style.color = '#fdba74';
}

// ============================================================================
// PROCESSAR CHECKOUT VIA CHECKOUT SESSION (MÉTODO RECOMENDADO)
// ============================================================================

async function processCheckoutSession(user) {
    try {
        console.log('🎯 Processando checkout via Checkout Session...');

        if (!user.email) {
            throw new Error('Email do usuário não encontrado');
        }

        await createAuditLog(user.uid, 'INITIATE_CHECKOUT_SESSION', `Email: ${user.email}`);

        // Criar checkout session usando o helper
        await stripeHelper.redirectToCheckout(
            user.uid,
            user.email,
            user.displayName || 'Usuário',
            {
                priceId: stripeConfig.priceId
            }
        );

    } catch (error) {
        console.error('❌ Erro ao processar checkout session:', error);
        throw error;
    }
}

// ============================================================================
// PROCESSAR CHECKOUT VIA PAYMENT LINK (MÉTODO ALTERNATIVO)
// ============================================================================

async function processPaymentLink(user) {
    try {
        console.log('🔗 Processando checkout via Payment Link...');

        // Validar se o Payment Link está configurado
        const PAYMENT_LINK = stripeConfig.paymentLink;

        if (!PAYMENT_LINK || PAYMENT_LINK.includes('SEU_LINK')) {
            throw new Error('Payment Link não configurado corretamente no firebase-config.js');
        }

        await createAuditLog(user.uid, 'INITIATE_PAYMENT_LINK', `Email: ${user.email}`);

        // Construir URL do Payment Link com parâmetros
        const paymentUrl = new URL(PAYMENT_LINK);
        paymentUrl.searchParams.set('client_reference_id', user.uid);
        paymentUrl.searchParams.set('prefilled_email', user.email);

        console.log('🔗 Redirecionando para Payment Link...');

        // Redirecionar
        setTimeout(() => {
            window.location.href = paymentUrl.toString();
        }, 800);

    } catch (error) {
        console.error('❌ Erro ao processar payment link:', error);
        throw error;
    }
}

// ============================================================================
// HANDLER DO BOTÃO DE CHECKOUT
// ============================================================================

checkoutButton.addEventListener('click', async () => {
    const user = auth.currentUser;

    if (!user) {
        UIManager.showNotification('Você precisa estar autenticado para continuar', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    // Desabilitar botão e mostrar loading
    UIManager.setButtonLoading(checkoutButton, true);
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';

    try {
        console.log('🚀 Iniciando processo de checkout...');
        console.log('👤 Usuário:', user.email);
        console.log('📋 Método:', checkoutMethod);

        // Escolher método de checkout
        if (checkoutMethod === 'checkout_session') {
            await processCheckoutSession(user);
        } else {
            await processPaymentLink(user);
        }

        // Se chegou aqui sem redirecionar, mostrar mensagem
        UIManager.showNotification('Redirecionando para pagamento...', 'info');

    } catch (error) {
        console.error('❌ Erro no processo de checkout:', error);

        // Determinar mensagem de erro
        let errorMessage = 'Erro ao processar pagamento. Tente novamente.';

        if (error.message.includes('Payment Link')) {
            errorMessage = 'Sistema de pagamento não configurado corretamente. Entre em contato com o suporte.';
        } else if (error.message.includes('email')) {
            errorMessage = 'Email do usuário inválido. Verifique suas informações.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        }

        // Mostrar erro
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <strong>Erro:</strong> ${errorMessage}
            ${error.message ? `<br><small style="opacity: 0.8;">${error.message}</small>` : ''}
        `;
        errorDiv.style.display = 'block';
        errorDiv.style.background = 'rgba(239, 68, 68, 0.1)';
        errorDiv.style.borderColor = '#ef4444';

        // Notificação
        ErrorHandler.handle(error, 'checkout');

        // Restaurar botão
        UIManager.setButtonLoading(checkoutButton, false);
        checkoutButton.innerHTML = '<i class="fas fa-credit-card"></i> Tentar Novamente';
        loadingDiv.style.display = 'none';
    }
});

// ============================================================================
// DETECÇÃO AUTOMÁTICA DO MELHOR MÉTODO
// ============================================================================

(async function detectCheckoutMethod() {
    try {
        // Tentar usar Checkout Session por padrão (mais robusto)
        checkoutMethod = 'checkout_session';
        console.log('✅ Método de checkout definido:', checkoutMethod);

        // Se Payment Link estiver configurado e for preferido, usar ele
        if (stripeConfig.preferPaymentLink && stripeConfig.paymentLink && !stripeConfig.paymentLink.includes('YOUR_PAYMENT_LINK')) {
            checkoutMethod = 'payment_link';
            console.log('🔄 Usando Payment Link (preferência configurada)');
        }
    } catch (error) {
        console.error('❌ Erro ao detectar método:', error);
    }
})();

// ============================================================================
// LISTENER PARA MUDANÇAS NO STATUS DE PAGAMENTO
// ============================================================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Observar mudanças em tempo real no Data Connect para o status de pagamento
        // Nota: Idealmente, essa observação deveria ser feita via um mecanismo de real-time do Data Connect
        // ou uma checagem periódica mais eficiente. Por simplicidade, faremos uma checagem
        // no carregamento e a página de sucesso fará o redirecionamento final.

        // Removida a observação direta do Realtime Database.
        // O redirecionamento após pagamento é tratado na página de sucesso ou no `onAuthStateChanged` inicial.
    }
});

console.log('✅ Checkout.js inicializado com sucesso');
