// Usar configuração centralizada do Firebase
const firebaseConfig = window.FIREBASE_CONFIG;

// Inicializar Firebase
let auth, db;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.firestore();
    console.log('✅ Firebase inicializado com sucesso no checkout');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    alert('Erro ao inicializar Firebase. Verifique sua configuração.');
}

// Payment Link do Stripe (não precisa de Cloud Functions!)
const STRIPE_PAYMENT_LINK = window.STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/test_cNi8wQg3BcFm6DN2TQfw402';

const checkoutButton = document.getElementById('checkout-button');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error-message');

// Verificar autenticação e status de pagamento
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Verificar se já pagou
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().hasPaid) {
            window.location.href = 'app.html';
            return;
        }
    } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
    }
});

// Redirecionar para Payment Link do Stripe
checkoutButton.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        alert('❌ Você precisa estar autenticado para continuar.');
        window.location.href = 'index.html';
        return;
    }

    checkoutButton.disabled = true;
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    checkoutButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecionando...';

    try {
        console.log('✅ Redirecionando para Payment Link do Stripe...');
        console.log('User ID:', user.uid);
        console.log('Email:', user.email);

        // Salvar informações do usuário no Firestore antes de redirecionar
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            displayName: user.displayName || 'Usuário',
            pendingPayment: true,
            paymentInitiatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log('✅ Informações do usuário salvas no Firestore');

        // Construir URL do Payment Link com parâmetros
        const successUrl = window.location.origin + '/success.html?session_id={CHECKOUT_SESSION_ID}&uid=' + user.uid;
        const cancelUrl = window.location.origin + '/checkout.html?uid=' + user.uid;

        // Adicionar client_reference_id e prefill_email ao Payment Link
        const paymentUrl = new URL(STRIPE_PAYMENT_LINK);
        paymentUrl.searchParams.set('client_reference_id', user.uid);
        paymentUrl.searchParams.set('prefilled_email', user.email);

        console.log('🔗 Redirecionando para:', paymentUrl.toString());

        // Pequeno delay para dar feedback visual
        setTimeout(() => {
            window.location.href = paymentUrl.toString();
        }, 500);

    } catch (error) {
        console.error('❌ Erro ao redirecionar:', error);

        errorDiv.innerHTML = '❌ Erro ao salvar informações. Tente novamente.<br>' + error.message;
        errorDiv.style.display = 'block';
        checkoutButton.disabled = false;
        checkoutButton.innerHTML = '<i class="fas fa-credit-card"></i> Tentar Novamente';
        loadingDiv.style.display = 'none';
    }
});
