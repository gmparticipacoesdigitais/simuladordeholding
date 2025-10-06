# ⚡ Configuração Rápida - IRPF Login

## 🚨 Problemas Comuns e Soluções

### ❌ "Não consigo criar conta"
### ❌ "Não consigo fazer login"
### ❌ "Não consigo pagar"

**Causa principal:** Firebase não está configurado corretamente.

---

## ✅ Solução Rápida (5 minutos)

### Passo 1: Configure o Firebase

1. **Acesse:** https://console.firebase.google.com
2. **Crie um projeto** ou selecione um existente
3. **Ative Authentication:**
   - Vá em Build > Authentication > Sign-in method
   - Ative "Email/Password"
   - Ative "Google" (opcional)

4. **Ative Firestore:**
   - Vá em Build > Firestore Database
   - Clique em "Create database"
   - Selecione modo "Test" (para começar)

5. **Copie suas credenciais:**
   - Vá em Project Settings (ícone de engrenagem)
   - Role até "Your apps"
   - Copie o objeto `firebaseConfig`

### Passo 2: Configure no Navegador

1. **Abra o site** (index.html no navegador)
2. **Quando aparecer o prompt**, digite suas credenciais:
   - API Key (AIza...)
   - Auth Domain (seu-projeto.firebaseapp.com)
   - Project ID (seu-projeto-id)
   - Storage Bucket (seu-projeto.appspot.com)
   - Messaging Sender ID (número)
   - App ID (1:número:web:...)

3. **Pronto!** As credenciais serão salvas no localStorage

**OU** configure via console do navegador (F12):

```javascript
localStorage.setItem('FIREBASE_API_KEY', 'AIza...');
localStorage.setItem('FIREBASE_AUTH_DOMAIN', 'seu-projeto.firebaseapp.com');
localStorage.setItem('FIREBASE_PROJECT_ID', 'seu-projeto-id');
localStorage.setItem('FIREBASE_STORAGE_BUCKET', 'seu-projeto.appspot.com');
localStorage.setItem('FIREBASE_MESSAGING_SENDER_ID', '123456789');
localStorage.setItem('FIREBASE_APP_ID', '1:123456789:web:abc123');
```

Depois recarregue a página.

### Passo 3: Configure o Stripe (para pagamentos)

1. **Acesse:** https://dashboard.stripe.com
2. **Copie sua Publishable Key** (começa com `pk_test_`)
3. **Configure no navegador (F12):**

```javascript
localStorage.setItem('STRIPE_PUBLISHABLE_KEY', 'pk_test_...');
```

### Passo 4: Teste!

1. ✅ Tente criar uma conta
2. ✅ Faça login
3. ✅ Tente processar um pagamento

---

## 🔧 Configuração das Cloud Functions (para pagamentos funcionarem)

**Nota:** Os passos acima permitem criar conta e fazer login. Para pagamentos funcionarem completamente, você precisa configurar as Cloud Functions.

### 1. Instale o Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Faça login

```bash
firebase login
```

### 3. Inicialize o projeto (se necessário)

```bash
firebase init
```

Selecione:
- Functions
- Firestore
- Hosting

### 4. Configure as variáveis do Stripe

```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_..." \
  stripe.webhook_secret="whsec_..."
```

### 5. Instale dependências das Functions

```bash
cd functions
npm install
cd ..
```

### 6. Deploy

```bash
firebase deploy --only functions
```

### 7. Configure o Webhook do Stripe

1. Acesse: https://dashboard.stripe.com/webhooks
2. Adicione endpoint: `https://REGION-PROJECT.cloudfunctions.net/stripeWebhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copie o webhook secret
5. Atualize a config: `firebase functions:config:set stripe.webhook_secret="whsec_..."`

---

## 📊 Verificando se está funcionando

### Console do Navegador (F12)

Após carregar a página, você deve ver:

```
✅ Firebase inicializado com sucesso
✅ Stripe inicializado com sucesso
```

Se ver erros:
- ❌ Verifique se as credenciais estão corretas
- ❌ Verifique se Firebase Authentication está ativado
- ❌ Verifique se Firestore está criado

---

## 🆘 Ainda não funciona?

### Debug passo a passo:

1. **Abra o console (F12)** e veja os erros
2. **Verifique o localStorage:**
```javascript
console.log(localStorage.getItem('FIREBASE_API_KEY'));
console.log(localStorage.getItem('FIREBASE_AUTH_DOMAIN'));
```

3. **Limpe e tente novamente:**
```javascript
localStorage.clear();
location.reload();
```

4. **Verifique o Firebase Console:**
   - Authentication está ativado?
   - Firestore está criado?
   - Há regras de segurança bloqueando?

### Regras do Firestore

Se estiver bloqueando, vá em Firestore > Rules e use (temporariamente para testes):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📞 Suporte

Se nada funcionar:

1. Verifique o README.md completo
2. Veja os logs do Firebase: `firebase functions:log`
3. Veja o console do navegador (F12) para erros detalhados

---

## ✨ Checklist Final

- [ ] Firebase criado e configurado
- [ ] Authentication ativado (Email/Password)
- [ ] Firestore criado
- [ ] Credenciais salvas no localStorage
- [ ] Console mostra "Firebase inicializado com sucesso"
- [ ] Consegue criar conta
- [ ] Consegue fazer login
- [ ] (Opcional) Stripe configurado
- [ ] (Opcional) Cloud Functions deployadas
- [ ] (Opcional) Webhook do Stripe configurado
