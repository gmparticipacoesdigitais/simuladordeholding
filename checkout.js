import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Configuração do Firebase - substituir com suas credenciais
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Verificar se já pagou
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().hasPaid) {
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
        // Chamar sua Cloud Function para criar sessão de checkout
        const response = await fetch('YOUR_CLOUD_FUNCTION_URL/createCheckoutSession', {
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
        errorDiv.textContent = 'Erro ao processar pagamento. Tente novamente.';
        errorDiv.style.display = 'block';
        checkoutButton.disabled = false;
        loadingDiv.style.display = 'none';
    }
});
