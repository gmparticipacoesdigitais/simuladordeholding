# 🚀 Setup Rápido - Integração Stripe

Guia rápido para configurar a integração com Stripe em 5 minutos.

---

## 📋 Pré-requisitos

- ✅ Conta no [Stripe](https://stripe.com)
- ✅ Projeto Firebase configurado
- ✅ Firebase CLI instalado (`npm install -g firebase-tools`)
- ✅ Node.js 18+ instalado

---

## ⚡ Setup em 5 Passos

### 1️⃣ Configurar Produto no Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá em **Products** → **Add Product**
3. Configure:
   - Nome: "Plano Premium IRPF"
   - Descrição: "Acesso completo ao estimador de IRPF"
   - Preço: R$ 29,90/mês (ou seu valor)
   - Modelo: **Recurring** (mensal)
4. Copie o **Price ID** (ex: `price_1ABC...`)
5. Copie o **Product ID** (ex: `prod_ABC...`)

### 2️⃣ Obter Chaves do Stripe

1. Vá em **Developers** → **API Keys**
2. Copie:
   - **Publishable key** (começa com `pk_test_`)
   - **Secret key** (começa com `sk_test_`)

### 3️⃣ Configurar firebase-config.js

Edite `firebase-config.js`:

```javascript
export const stripeConfig = {
    publishableKey: "pk_test_...", // Cole sua chave pública
    priceId: "price_...",           // Cole seu Price ID
    productId: "prod_...",          // Cole seu Product ID
    paymentLink: ""                 // Deixe vazio por enquanto
};
```

### 4️⃣ Configurar Variáveis de Ambiente

```bash
# Entre na pasta functions
cd functions

# Configure as variáveis
firebase functions:config:set \
  stripe.secret_key="sk_test_..." \
  stripe.price_id="price_..."

# Verifique se foi salvo
firebase functions:config:get
```

### 5️⃣ Deploy das Cloud Functions

```bash
# Instalar dependências
cd functions
npm install

# Deploy
firebase deploy --only functions

# Anote as URLs das functions que aparecerem:
# ✔ createCheckoutSession: https://...
# ✔ stripeWebhook: https://...
# etc.
```

---

## 🔔 Configurar Webhooks (IMPORTANTE!)

### Criar Webhook no Stripe

1. Vá em **Developers** → **Webhooks** no Stripe Dashboard
2. Clique em **Add endpoint**
3. Configure:
   - **URL**: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stripeWebhook`
   - **Description**: "IRPF Webhook"
   - **Version**: Deixe padrão

4. Selecione os eventos:
   ```
   ☑ checkout.session.completed
   ☑ customer.subscription.created
   ☑ customer.subscription.updated
   ☑ customer.subscription.deleted
   ☑ invoice.payment_succeeded
   ☑ invoice.payment_failed
   ```

5. Clique em **Add endpoint**
6. Copie o **Signing secret** (começa com `whsec_`)

### Adicionar Webhook Secret

```bash
firebase functions:config:set stripe.webhook_secret="whsec_..."
firebase deploy --only functions
```

---

## 🎯 Configurar Customer Portal (Opcional mas Recomendado)

O Customer Portal permite que os usuários gerenciem suas próprias assinaturas.

1. Vá em **Settings** → **Billing** → **Customer Portal**
2. Clique em **Activate**
3. Configure:
   - ☑ **Update payment method**
   - ☑ **Cancel subscription**
   - ☑ **View invoices**
4. Salve as configurações

---

## ✅ Testar a Integração

### 1. Testar Checkout

1. Execute o projeto localmente:
   ```bash
   firebase emulators:start
   # ou
   firebase serve
   ```

2. Acesse `http://localhost:PORTA`
3. Faça login
4. Vá para `/checkout.html`
5. Clique em "Assinar Agora"
6. Use um cartão de teste:
   - Número: `4242 4242 4242 4242`
   - Data: Qualquer data futura
   - CVC: Qualquer 3 dígitos
   - CEP: Qualquer CEP

### 2. Verificar Webhook

Após completar o pagamento de teste:

1. Verifique os logs da Cloud Function:
   ```bash
   firebase functions:log
   ```

2. Verifique o Stripe Dashboard → **Events**
   - Deve aparecer `checkout.session.completed`
   - Status: **Succeeded**

3. Verifique o Firebase Realtime Database
   - Vá em `users/{userId}`
   - Deve ter `hasPaid: true`

---

## 🔍 Verificar Configuração

Use este checklist para garantir que tudo está configurado:

```bash
# ✅ Checklist de Configuração

□ Produto criado no Stripe
□ Price ID copiado
□ Chaves de API copiadas
□ firebase-config.js atualizado
□ Variáveis de ambiente configuradas
□ Cloud Functions deployadas
□ Webhook configurado no Stripe
□ Webhook secret adicionado
□ Customer Portal ativado
□ Teste de checkout realizado
□ Webhook recebido com sucesso
□ Usuário marcado como pago no banco
```

---

## 🐛 Problemas Comuns

### "Error: Missing stripe-signature header"

**Causa:** Webhook não está configurado ou URL está incorreta.

**Solução:**
1. Verifique se o webhook está apontando para a URL correta
2. Verifique se a função foi deployada com sucesso

### "Webhook signature verification failed"

**Causa:** Webhook secret incorreto.

**Solução:**
```bash
# Obter novo secret do Stripe
# Configurar novamente
firebase functions:config:set stripe.webhook_secret="whsec_NEW_SECRET"
firebase deploy --only functions
```

### Usuário não é marcado como pago após checkout

**Causa:** Webhook não está sendo processado.

**Solução:**
1. Verifique logs: `firebase functions:log`
2. Verifique eventos no Stripe Dashboard
3. Teste webhook manualmente no Stripe Dashboard

### "CORS error" ao criar checkout

**Causa:** CORS não configurado nas Cloud Functions.

**Solução:** As functions já estão configuradas com CORS. Certifique-se de que deployou a versão mais recente.

---

## 📊 Logs e Monitoramento

### Ver Logs das Functions

```bash
# Todos os logs
firebase functions:log

# Logs em tempo real
firebase functions:log --only stripeWebhook

# Últimas 100 linhas
firebase functions:log --lines 100
```

### Verificar Eventos no Stripe

1. Stripe Dashboard → **Developers** → **Events**
2. Filtre por tipo de evento
3. Clique em um evento para ver detalhes
4. Verifique se o webhook foi entregue (delivered)

---

## 🔐 Migrar para Produção

Quando estiver pronto para produção:

### 1. Ativar Modo Live no Stripe

1. Stripe Dashboard → Ativar conta (preencher informações da empresa)
2. Obter chaves de produção (começam com `pk_live_` e `sk_live_`)

### 2. Atualizar Configurações

```bash
# Atualizar chaves para produção
firebase functions:config:set \
  stripe.secret_key="sk_live_..." \
  stripe.webhook_secret="whsec_live_..." \
  stripe.price_id="price_live_..."

# Atualizar firebase-config.js
# publishableKey: "pk_live_..."
# priceId: "price_live_..."

# Deploy
firebase deploy --only functions
```

### 3. Criar Novo Webhook para Produção

1. Crie outro webhook no Stripe (modo live)
2. Use a mesma URL das functions
3. Copie o novo webhook secret
4. Configure nas variáveis de ambiente

---

## 📚 Próximos Passos

Agora que a integração está configurada:

1. ✅ Customize a página de checkout (`checkout.html`)
2. ✅ Personalize a página de sucesso (`success.html`)
3. ✅ Configure a página de conta (`account.html`)
4. ✅ Adicione analytics para tracking
5. ✅ Configure emails de notificação (via Stripe)
6. ✅ Implemente cupons de desconto (se necessário)

---

## 🆘 Precisa de Ajuda?

1. 📖 Consulte a [Documentação Completa](./STRIPE_INTEGRATION.md)
2. 🔍 Verifique os logs das functions
3. 📊 Consulte o Stripe Dashboard → Events
4. 🐛 Verifique o Firebase Realtime Database

---

## 🎉 Pronto!

Sua integração com Stripe está configurada e funcionando!

**Teste agora:**
1. Acesse sua aplicação
2. Faça login
3. Vá para checkout
4. Complete um pagamento de teste
5. Verifique se foi redirecionado para app.html

---

**Última atualização:** 2025-01-08
**Tempo estimado de setup:** 10-15 minutos
