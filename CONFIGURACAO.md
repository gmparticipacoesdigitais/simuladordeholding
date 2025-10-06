# 🔧 Guia de Configuração - IRPF Login

## ⚠️ CORREÇÕES DE BUGS IMPLEMENTADAS

### Bugs Corrigidos:
1. ✅ **Erro 404 ao clicar em "Criar conta"** - Removido uso de módulos ES6, agora funciona em qualquer ambiente
2. ✅ **Botão "Entrar" não funcionava** - Corrigida integração com Firebase usando SDK compat
3. ✅ **Sistema de pagamento** - Integração com Stripe configurada corretamente

## 📝 CONFIGURAÇÃO OBRIGATÓRIA

Você precisa configurar as credenciais do Firebase em **3 arquivos**:

### 1. auth.js (linhas 2-9)
```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdefgh"
};
```

### 2. checkout.js (linhas 2-9)
```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdefgh"
};
```

E também a chave do Stripe (linha 20):
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_SUA_CHAVE_AQUI';
```

### 3. app.js (linhas 2-9)
```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdefgh"
};
```

## 🔥 Como Obter as Credenciais do Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em **Configurações do Projeto** (⚙️) → **Geral**
4. Role até "Seus aplicativos" → **Aplicativo da Web**
5. Se não tiver um app, clique em **Adicionar app** → Escolha **Web** (`</>`)
6. Copie o objeto `firebaseConfig` que aparece
7. Cole nos 3 arquivos mencionados acima

## 🔐 Configurar Autenticação no Firebase

1. No Firebase Console, vá em **Authentication**
2. Clique em **Começar** (se for a primeira vez)
3. Vá na aba **Sign-in method**
4. Ative os seguintes métodos:
   - **E-mail/Senha**
   - **Google** (opcional, mas recomendado)

## 💾 Configurar Firestore

1. No Firebase Console, vá em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Modo de produção**
4. Escolha a localização (ex: southamerica-east1)
5. Após criar, vá em **Regras**
6. Cole as regras do arquivo `firestore.rules` deste projeto

## 💳 Configurar Stripe

### Obter Chaves:
1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Desenvolvedores** → **Chaves de API**
3. Copie:
   - **Chave publicável** (começa com `pk_test_...`)
   - **Chave secreta** (começa com `sk_test_...`)

### Configurar no Projeto:
1. Cole a **chave publicável** no `checkout.js` (linha 20)
2. Configure a **chave secreta** no Firebase:

```bash
firebase functions:config:set stripe.secret_key="sk_test_SUA_CHAVE_SECRETA"
```

## 🚀 Deploy

### 1. Instalar Dependências das Functions:
```bash
cd functions
npm install
cd ..
```

### 2. Deploy Completo:
```bash
firebase deploy
```

### 3. Após o Deploy:
Copie a URL da Cloud Function que aparecerá no terminal, algo como:
```
https://southamerica-east1-seu-projeto.cloudfunctions.net/createCheckoutSession
```

Essa URL já está configurada automaticamente no `checkout.js` para usar o rewrite do Firebase.

## 🔗 Configurar Webhook do Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Desenvolvedores** → **Webhooks**
3. Clique em **Adicionar endpoint**
4. URL do endpoint:
   ```
   https://seu-site.web.app/api/stripeWebhook
   ```
   (substitua `seu-site.web.app` pela URL do seu Firebase Hosting)

5. Eventos para escutar:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

6. Copie o **Webhook secret** (começa com `whsec_...`)

7. Configure no Firebase:
```bash
firebase functions:config:set stripe.webhook_secret="whsec_SEU_SECRET"
```

8. Re-deploy as functions:
```bash
firebase deploy --only functions
```

## ✅ Testar Localmente

Para testar sem fazer deploy:

```bash
# Terminal 1 - Emuladores do Firebase
firebase emulators:start

# Abra http://localhost:5000
```

## 📊 IDs do Stripe Já Configurados

Os seguintes IDs já estão no código:
- **Produto**: `prod_TAfijhTULkKnag`
- **Preço**: `price_1SEKNFIPGzIfZaTDXox4NygH` (R$ 29,90/mês)

Se você quiser usar seus próprios produtos:
1. Crie um produto no Stripe Dashboard
2. Crie um preço para esse produto
3. Substitua os IDs em `auth.js`, `checkout.js` e `functions/index.js`

## 🧪 Testar o Fluxo

1. Abra seu site (deploy ou localhost)
2. Clique em **Criar conta**
3. Preencha os dados e crie conta
4. Você será redirecionado para o checkout
5. Use um cartão de teste:
   - Número: `4242 4242 4242 4242`
   - Data: qualquer data futura (ex: 12/34)
   - CVC: qualquer 3 dígitos (ex: 123)
6. Complete o pagamento
7. Você será redirecionado para a aplicação

## 🐛 Solução de Problemas

### Erro: "Firebase: Firebase App named '[DEFAULT]' already exists"
**Solução**: Limpe o cache do navegador ou use modo anônimo

### Erro: "Stripe publishable key not set"
**Solução**: Configure a chave publicável do Stripe no `checkout.js`

### Erro: "Permission denied" no Firestore
**Solução**: Faça deploy das regras: `firebase deploy --only firestore:rules`

### Botão de checkout não funciona
**Solução**:
1. Verifique se as Cloud Functions foram deployadas
2. Abra o console do navegador (F12) e veja os erros
3. Verifique se a URL da Cloud Function está correta

### Webhook não atualiza o status de pagamento
**Solução**:
1. Verifique se o webhook está configurado no Stripe
2. Veja os logs: `firebase functions:log`
3. Confirme que o webhook secret está configurado

## 📚 Arquivos Importantes

- `index.html` - Página de login
- `register.html` - Página de cadastro
- `checkout.html` - Página de pagamento
- `app.html` - Estimador de IRPF
- `auth.js` - Lógica de autenticação
- `checkout.js` - Lógica de pagamento
- `app.js` - Lógica do estimador
- `functions/index.js` - Cloud Functions (webhook e checkout)

## 🎯 Próximos Passos

1. Configure as credenciais do Firebase
2. Configure as chaves do Stripe
3. Faça o deploy
4. Configure o webhook
5. Teste o fluxo completo
6. 🎉 Pronto!

## ⚠️ IMPORTANTE

- **Nunca** comite arquivos com credenciais reais no Git
- Use as chaves de **teste** do Stripe durante desenvolvimento
- Para produção, use as chaves de **produção** do Stripe
- Mantenha o arquivo `.env` no `.gitignore`
