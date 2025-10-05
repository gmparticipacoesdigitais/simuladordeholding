// Copie este arquivo para firebase-config.js e preencha com suas credenciais do Firebase
// Obtenha suas credenciais em: https://console.firebase.google.com/

export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Configuração do Stripe
export const stripeConfig = {
    publishableKey: "pk_test_...", // Sua chave pública do Stripe
    priceId: "price_1SEKNFIPGzIfZaTDXox4NygH",
    productId: "prod_TAfijhTULkKnag"
};

// URL da sua Cloud Function
export const cloudFunctionUrl = "https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net";
