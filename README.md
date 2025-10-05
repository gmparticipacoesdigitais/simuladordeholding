# Sistema de Login e Assinatura - Estimador IRPF

Sistema completo de autenticação, pagamento e acesso ao estimador de Imposto de Renda.

## 📋 Funcionalidades

- ✅ Login e cadastro com email/senha
- ✅ Login e cadastro com Google
- ✅ Integração com Stripe para assinaturas
- ✅ Verificação de pagamento antes de acessar a aplicação
- ✅ Estimador completo de IRPF 2024
- ✅ Webhooks do Stripe para atualização automática de status

## 🏗️ Estrutura do Projeto

```
.
├── index.html              # Página de login
├── register.html           # Página de cadastro
├── checkout.html           # Página de checkout (Stripe)
├── success.html            # Página de sucesso após pagamento
├── app.html                # Aplicação principal (Estimador IRPF)
├── auth.js                 # Lógica de autenticação
├── checkout.js             # Lógica do Stripe checkout
├── app.js                  # Lógica do estimador
├── login.css               # Estilos globais
├── functions/
│   ├── index.js            # Cloud Functions
│   └── package.json        # Dependências das functions
├── firebase.json           # Configuração do Firebase
├── firestore.rules         # Regras de segurança do Firestore
└── .env.example            # Variáveis de ambiente (exemplo)
```

## 🚀 Configuração Inicial

### 1. Pré-requisitos

- Node.js 18+ instalado
- Conta no Firebase (https://console.firebase.google.com)
- Conta no Stripe (https://dashboard.stripe.com)
- Firebase CLI instalado: `npm install -g firebase-tools`

### 2. Configurar Firebase

1. Crie um novo projeto no Firebase Console
2. Ative Authentication (Email/Password e Google)
3. Ative Firestore Database
4. Copie as credenciais do projeto

### 3. Configurar Stripe

1. Acesse o Stripe Dashboard
2. Copie as chaves de API (publishable e secret)
3. Configure o webhook apontando para sua Cloud Function
4. Use os IDs dos produtos já configurados:
   - Produto: `prod_TAfijhTULkKnag`
   - Preço: `price_1SEKNFIPGzIfZaTDXox4NygH`

### 4. Configurar Variáveis de Ambiente

#### Para o frontend (auth.js, checkout.js, app.js):

Edite os arquivos e substitua as credenciais do Firebase:

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

Em `checkout.js`, adicione sua chave publicável do Stripe:

```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_...';
```

#### Para as Cloud Functions:

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Configure as variáveis no Firebase:

```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_..." \
  stripe.webhook_secret="whsec_..."
```

### 5. Instalar Dependências

```bash
# Dependências das Cloud Functions
cd functions
npm install
cd ..
```

### 6. Deploy

#### Deploy completo:

```bash
firebase deploy
```

#### Deploy apenas das functions:

```bash
firebase deploy --only functions
```

#### Deploy apenas do hosting:

```bash
firebase deploy --only hosting
```

#### Deploy das regras do Firestore:

```bash
firebase deploy --only firestore:rules
```

### 7. Configurar URL da Cloud Function

Após o deploy, copie a URL da Cloud Function `createCheckoutSession` e atualize em `checkout.js`:

```javascript
const response = await fetch('https://SUA_REGIAO-SEU_PROJETO.cloudfunctions.net/createCheckoutSession', {
    // ...
});
```

### 8. Configurar Webhook do Stripe

1. Acesse o Stripe Dashboard > Webhooks
2. Adicione um endpoint com a URL: `https://SUA_REGIAO-SEU_PROJETO.cloudfunctions.net/stripeWebhook`
3. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copie o webhook secret e configure no Firebase

## 🔄 Fluxo da Aplicação

1. **Usuário acessa** → `index.html` (login)
2. **Novo usuário** → `register.html` (cadastro)
3. **Após cadastro/login** → Verifica se já pagou
4. **Se não pagou** → `checkout.html` (Stripe)
5. **Pagamento aprovado** → Webhook atualiza Firestore
6. **Sucesso** → `success.html` → Redireciona para `app.html`
7. **Se já pagou** → Vai direto para `app.html`

## 🔐 Segurança

- Regras do Firestore impedem que usuários alterem `hasPaid` manualmente
- Apenas Cloud Functions podem atualizar status de pagamento
- Webhook do Stripe valida assinatura antes de processar
- Autenticação obrigatória para acessar a aplicação

## 🧪 Testes Locais

```bash
# Iniciar emuladores do Firebase
firebase emulators:start

# Testar webhooks localmente (use Stripe CLI)
stripe listen --forward-to localhost:5001/SEU_PROJETO/us-central1/stripeWebhook
```

## 📊 Estrutura do Firestore

### Coleção `users`:

```json
{
  "uid": {
    "email": "usuario@email.com",
    "displayName": "Nome do Usuário",
    "createdAt": "2024-01-01T00:00:00Z",
    "hasPaid": true,
    "stripeCustomerId": "cus_...",
    "subscriptionId": "sub_...",
    "subscriptionStatus": "active",
    "paidAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## 🐛 Solução de Problemas

### Usuário não é redirecionado após pagamento:

- Verifique se o webhook está configurado corretamente
- Confira os logs das Cloud Functions: `firebase functions:log`
- Verifique se o `userId` está nos metadados da sessão do Stripe

### Erro ao criar checkout:

- Confirme que a Cloud Function está deployada
- Verifique as chaves do Stripe
- Confira CORS na Cloud Function

### Usuário não consegue acessar app.html:

- Verifique se `hasPaid: true` no Firestore
- Confira as regras de segurança do Firestore
- Veja o console do navegador para erros de autenticação

## 📝 Notas Importantes

1. As credenciais do Firebase devem ser substituídas em **3 arquivos**:
   - `auth.js`
   - `checkout.js`
   - `app.js`

2. Os IDs do Stripe já estão configurados:
   - Produto: `prod_TAfijhTULkKnag`
   - Preço: `price_1SEKNFIPGzIfZaTDXox4NygH`

3. **Não commite** arquivos com credenciais reais no Git

4. Para produção, use as chaves de produção do Stripe (não as de teste)

## 📄 Licença

Este projeto é privado e proprietário.
