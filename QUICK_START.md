# 🚀 Início Rápido

## Configuração em 5 Passos

### 1️⃣ Configure o Firebase

```bash
# Instale o Firebase CLI
npm install -g firebase-tools

# Faça login
firebase login

# Inicialize (se necessário)
firebase init
```

No Firebase Console (https://console.firebase.google.com):
- Crie um projeto
- Ative **Authentication** → Email/Password e Google
- Ative **Firestore Database**
- Copie as credenciais do projeto

### 2️⃣ Configure as Credenciais do Firebase

Edite os seguintes arquivos e substitua as credenciais:

**auth.js, checkout.js e app.js:**

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_MESSAGING_ID",
    appId: "SEU_APP_ID"
};
```

### 3️⃣ Configure o Stripe

No Stripe Dashboard (https://dashboard.stripe.com):
- Copie sua **Chave Publicável** (pk_test_...)
- Copie sua **Chave Secreta** (sk_test_...)

**Em checkout.js:**

```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_...'; // Sua chave
```

**Configure as variáveis de ambiente para Cloud Functions:**

```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_SUA_CHAVE_SECRETA"
```

### 4️⃣ Instale Dependências e Deploy

```bash
# Instale dependências das Cloud Functions
cd functions
npm install
cd ..

# Deploy completo
firebase deploy
```

### 5️⃣ Configure o Webhook do Stripe

Após o deploy, você receberá a URL da Cloud Function.

No Stripe Dashboard → Webhooks:
- Adicione endpoint: `https://REGIAO-PROJETO.cloudfunctions.net/stripeWebhook`
- Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Copie o Webhook Secret (whsec_...)

Configure o webhook secret:

```bash
firebase functions:config:set \
  stripe.webhook_secret="whsec_SEU_WEBHOOK_SECRET"
```

Re-deploy as functions:

```bash
firebase deploy --only functions
```

### 6️⃣ Atualize a URL da Cloud Function

Em **checkout.js**, substitua:

```javascript
const response = await fetch('https://REGIAO-PROJETO.cloudfunctions.net/createCheckoutSession', {
    // ...
});
```

## ✅ Pronto!

Acesse seu site hospedado no Firebase:
```
https://SEU_PROJETO.web.app
```

## 🧪 Para Testar Localmente

```bash
# Inicie os emuladores
firebase emulators:start

# Acesse
http://localhost:5000
```

## 📝 IDs do Stripe Já Configurados

- **Produto**: `prod_TAfijhTULkKnag`
- **Preço**: `price_1SEKNFIPGzIfZaTDXox4NygH` (R$ 29,90/mês)

## 🆘 Problemas Comuns

**Erro ao fazer checkout:**
- Verifique se as Cloud Functions foram deployadas
- Confirme que as credenciais do Stripe estão corretas
- Veja os logs: `firebase functions:log`

**Usuário não é redirecionado após pagamento:**
- Verifique se o webhook está configurado
- Confirme que o webhook secret está correto
- Cheque os logs das functions

**Firestore permission denied:**
- Rode `firebase deploy --only firestore:rules`
- Verifique se o usuário está autenticado

## 📚 Mais Informações

Leia o [README.md](README.md) completo para detalhes técnicos.
