// ============================================================================
// CHECKOUT.JS - Refatorado para usar Realtime Database
// Sistema de checkout com Payment Link do Stripe
// ============================================================================

import { firebaseConfig, stripeConfig } from './firebase-config.js';

// Inicializar Firebase
let auth, database;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    database = firebase.database();
    console.log('✅ Firebase inicializado com sucesso no checkout');
    console.log('🔑 Project ID:', firebaseConfig.projectId);
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    alert('Erro ao inicializar Firebase. Verifique sua configuração.');
}

// Payment Link do Stripe
const STRIPE_PAYMENT_LINK = stripeConfig.paymentLink;
console.log('💳 Payment Link configurado:', STRIPE_PAYMENT_LINK ? 'Sim' : 'Não');

const checkoutButton = document.getElementById('checkout-button');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error-message');

// ============================================================================
// VERIFICAR AUTENTICAÇÃO E STATUS DE PAGAMENTO
// ============================================================================

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        console.log('❌ Usuário não autenticado, redirecionando para login...');
        window.location.href = 'index.html';
        return;
    }

    console.log('✅ Usuário autenticado:', user.email);

    // Verificar se já pagou
    try {
        const snapshot = await database.ref(`users/${user.uid}`).once('value');
        const userData = snapshot.val();

        console.log('📊 Dados do usuário:', userData);

        if (userData && userData.hasPaid) {
            console.log('✅ Usuário já pagou! Redirecionando para app...');
            window.location.href = 'app.html';
            return;
        }

        console.log('💳 Pagamento pendente, mostrando opções de checkout...');
    } catch (error) {
        console.error('❌ Erro ao verificar pagamento:', error);
    }
});

// ============================================================================
// REDIRECIONAR PARA PAYMENT LINK DO STRIPE
// ============================================================================

checkoutButton.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        errorDiv.innerHTML = '❌ Você precisa estar autenticado para continuar.';
        errorDiv.style.display = 'block';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    checkoutButton.disabled = true;
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    checkoutButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecionando...';

    try {
        console.log('✅ Preparando redirecionamento para Stripe...');
        console.log('👤 User ID:', user.uid);
        console.log('📧 Email:', user.email);
        console.log('🔗 Payment Link:', STRIPE_PAYMENT_LINK);

        // Validar se o Payment Link está configurado
        if (!STRIPE_PAYMENT_LINK || STRIPE_PAYMENT_LINK === 'SEU_LINK_DE_PAGAMENTO_DO_STRIPE') {
            throw new Error('Payment Link do Stripe não configurado. Verifique firebase-config.js');
        }

        // Salvar informações do usuário no Realtime Database antes de redirecionar
        const userRef = database.ref(`users/${user.uid}`);

        await userRef.update({
            email: user.email,
            displayName: user.displayName || 'Usuário',
            pendingPayment: true,
            paymentInitiatedAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });

        console.log('✅ Informações salvas no Realtime Database');

        // Construir URL do Payment Link com parâmetros
        const paymentUrl = new URL(STRIPE_PAYMENT_LINK);
        paymentUrl.searchParams.set('client_reference_id', user.uid);
        paymentUrl.searchParams.set('prefilled_email', user.email);

        console.log('🔗 URL completa:', paymentUrl.toString());
        console.log('✅ Redirecionando em 1 segundo...');

        // Pequeno delay para dar feedback visual
        setTimeout(() => {
            window.location.href = paymentUrl.toString();
        }, 1000);

    } catch (error) {
        console.error('❌ Erro ao processar checkout:', error);

        let errorMessage = 'Erro ao processar pagamento. Tente novamente.';
        if (error.message.includes('Payment Link')) {
            errorMessage = 'Payment Link não configurado. Entre em contato com o suporte.';
        }

        errorDiv.innerHTML = `❌ ${errorMessage}<br><small>${error.message}</small>`;
        errorDiv.style.display = 'block';
        checkoutButton.disabled = false;
        checkoutButton.innerHTML = '<i class="fas fa-credit-card"></i> Tentar Novamente';
        loadingDiv.style.display = 'none';
    }
});
