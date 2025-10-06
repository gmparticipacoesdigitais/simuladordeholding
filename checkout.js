// Configuração do Firebase - SUBSTITUA COM SUAS CREDENCIAIS
const firebaseConfig = {
    apiKey: "AIzaSyBYourAPIKey",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Configuração do Stripe
const STRIPE_PUBLISHABLE_KEY = 'pk_test_...'; // Substituir pela sua chave
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

// IDs do produto e preço do Stripe
const STRIPE_PRODUCT_ID = 'prod_TAfijhTULkKnag';
const STRIPE_PRICE_ID = 'price_1SEKNFIPGzIfZaTDXox4NygH';

const checkoutButton = document.getElementById('checkout-button');
const loadingDiv = document.querySelector('.loading');
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

// Criar sessão de checkout do Stripe
checkoutButton.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    checkoutButton.disabled = true;
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';

    try {
        // Chamar Cloud Function para criar sessão de checkout
        const cloudFunctionUrl = window.location.origin + '/api/createCheckoutSession';

        const response = await fetch(cloudFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId: STRIPE_PRICE_ID,
                userId: user.uid,
                userEmail: user.email
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao criar sessão de checkout');
        }

        const { sessionId } = await response.json();

        // Redirecionar para o Stripe Checkout
        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Erro:', error);
        errorDiv.textContent = 'Erro ao processar pagamento. Verifique a configuração das Cloud Functions.';
        errorDiv.style.display = 'block';
        checkoutButton.disabled = false;
        loadingDiv.style.display = 'none';
    }
});
