# ✅ Checklist de Testes - Integração Stripe

Use este checklist para validar que tudo está funcionando corretamente.

---

## 📋 Pré-Testes

### Configuração

- [ ] Stripe configurado com produto e preço
- [ ] `firebase-config.js` atualizado com chaves corretas
- [ ] Variáveis de ambiente configuradas (`firebase functions:config:get`)
- [ ] Cloud Functions deployadas (`firebase deploy --only functions`)
- [ ] Webhook configurado no Stripe Dashboard
- [ ] Webhook secret configurado nas variáveis de ambiente

---

## 🧪 Testes Funcionais

### 1. Checkout Flow

#### Teste 1.1: Checkout Session (Método Recomendado)
- [ ] Acessar `/checkout.html` logado
- [ ] Clicar em "Assinar Agora"
- [ ] Verificar redirecionamento para Stripe Checkout
- [ ] Usar cartão de teste: `4242 4242 4242 4242`
- [ ] Completar pagamento
- [ ] Verificar redirecionamento para `/success.html`
- [ ] Verificar mensagem de sucesso
- [ ] Verificar redirecionamento automático para `/app.html`

**Verificações Backend:**
```bash
# Ver logs
firebase functions:log --only createCheckoutSession

# Verificar no Stripe Dashboard
# Events → checkout.session.completed

# Verificar no Firebase RTDB
# users/{userId}/hasPaid deve ser true
```

#### Teste 1.2: Payment Link (Método Alternativo)
- [ ] Configurar `preferPaymentLink: true` em `stripe-config.js`
- [ ] Repetir fluxo do Teste 1.1
- [ ] Verificar que usa Payment Link ao invés de Checkout Session

---

### 2. Webhook Processing

#### Teste 2.1: Webhook de Checkout Completado
- [ ] Completar um checkout
- [ ] Verificar logs da function `stripeWebhook`
- [ ] Verificar que evento `checkout.session.completed` foi recebido
- [ ] Verificar que usuário foi atualizado no banco

```bash
firebase functions:log --only stripeWebhook
```

Verificar no banco:
```javascript
users/{userId}/ {
  hasPaid: true,
  stripeCustomerId: "cus_...",
  subscriptionId: "sub_...",
  subscriptionStatus: "active",
  paidAt: <timestamp>
}
```

#### Teste 2.2: Webhook de Renovação
- [ ] No Stripe Dashboard, criar um evento de teste
- [ ] Events → `invoice.payment_succeeded` → "Send test webhook"
- [ ] Verificar logs da function
- [ ] Verificar atualização no banco (`lastPaymentStatus: "paid"`)

#### Teste 2.3: Webhook de Falha de Pagamento
- [ ] Criar evento de teste `invoice.payment_failed`
- [ ] Verificar logs
- [ ] Verificar `lastPaymentStatus: "failed"` no banco

---

### 3. Account Management Page

#### Teste 3.1: Visualização de Conta
- [ ] Acessar `/account.html` logado e com assinatura ativa
- [ ] Verificar exibição de:
  - [ ] Email do usuário
  - [ ] Status da assinatura (badge "Ativa")
  - [ ] Próxima data de renovação
  - [ ] Último status de pagamento

#### Teste 3.2: Customer Portal
- [ ] Na página `/account.html`
- [ ] Clicar em "Acessar Portal de Cobrança"
- [ ] Verificar redirecionamento para Stripe Customer Portal
- [ ] Verificar que pode visualizar:
  - [ ] Faturas anteriores
  - [ ] Método de pagamento
  - [ ] Opções de cancelamento

#### Teste 3.3: Cancelamento de Assinatura
- [ ] Na página `/account.html`
- [ ] Clicar em "Cancelar" na zona de perigo
- [ ] Confirmar cancelamento
- [ ] Verificar mensagem de sucesso
- [ ] Verificar que status mudou para "Será cancelada em..."
- [ ] Verificar no banco: `cancelAtPeriodEnd: true`

---

### 4. API Endpoints

#### Teste 4.1: Get Subscription Status
```bash
# Obter userId do Firebase Auth

curl "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/getSubscriptionStatus?userId=USER_ID"
```

Verificar resposta:
```json
{
  "success": true,
  "user": {
    "hasPaid": true,
    "subscriptionStatus": "active",
    ...
  },
  "subscription": {
    "id": "sub_...",
    "status": "active",
    ...
  }
}
```

#### Teste 4.2: Cancel Subscription
```bash
curl -X POST \
  "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/cancelSubscription" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "immediate": false}'
```

Verificar resposta com status de cancelamento.

---

### 5. Error Handling

#### Teste 5.1: Checkout sem Autenticação
- [ ] Deslogar
- [ ] Tentar acessar `/checkout.html`
- [ ] Verificar redirecionamento para login

#### Teste 5.2: Webhook com Assinatura Inválida
- [ ] Enviar webhook manualmente com assinatura incorreta
- [ ] Verificar erro 400 "Webhook signature verification failed"

#### Teste 5.3: Checkout com Dados Inválidos
- [ ] Tentar criar checkout sem email
- [ ] Verificar erro 400 com mensagem apropriada

---

### 6. Real-time Sync

#### Teste 6.1: Atualização em Tempo Real
- [ ] Abrir `/checkout.html` em uma aba
- [ ] Abrir Firebase Console → RTDB em outra aba
- [ ] Completar checkout
- [ ] Verificar que banco atualiza em tempo real
- [ ] Verificar que página redireciona automaticamente

---

### 7. Access Control

#### Teste 7.1: Usuário Sem Pagamento
- [ ] Criar novo usuário
- [ ] Fazer login
- [ ] Tentar acessar `/app.html`
- [ ] Verificar redirecionamento para `/checkout.html`

#### Teste 7.2: Usuário Com Pagamento
- [ ] Com assinatura ativa
- [ ] Acessar `/checkout.html`
- [ ] Verificar redirecionamento automático para `/app.html`

---

### 8. UI/UX

#### Teste 8.1: Loading States
- [ ] Verificar spinner ao clicar em "Assinar Agora"
- [ ] Verificar botão desabilitado durante processamento
- [ ] Verificar mensagem "Redirecionando..."

#### Teste 8.2: Error Messages
- [ ] Simular erro de rede (offline)
- [ ] Tentar fazer checkout
- [ ] Verificar mensagem de erro apropriada
- [ ] Verificar que botão é reabilitado

#### Teste 8.3: Success Messages
- [ ] Completar pagamento
- [ ] Verificar mensagem de sucesso
- [ ] Verificar animação de sucesso

---

## 🔍 Testes de Validação

### Validação de Dados

#### Teste de Email Inválido
- [ ] Tentar criar checkout com email malformado
- [ ] Verificar erro de validação

#### Teste de userId Ausente
- [ ] Tentar criar checkout sem userId
- [ ] Verificar erro 400

---

## 📊 Verificações de Log

### Logs Estruturados

Verificar que todos os logs incluem:
- [ ] Timestamp
- [ ] Level (INFO, ERROR, WARN)
- [ ] Message descritiva
- [ ] Metadata relevante (userId, sessionId, etc)

```bash
# Ver logs formatados
firebase functions:log | grep -E "(INFO|ERROR|WARN)"
```

---

## 🔐 Testes de Segurança

### CORS

- [ ] Fazer request de origem diferente
- [ ] Verificar headers CORS na resposta
- [ ] Verificar que OPTIONS request funciona

### Webhook Security

- [ ] Enviar webhook sem assinatura
- [ ] Verificar rejeição (400)
- [ ] Enviar webhook com assinatura inválida
- [ ] Verificar rejeição com erro apropriado

---

## 📱 Testes de Responsividade

### Mobile

- [ ] Testar `/checkout.html` em mobile
- [ ] Testar `/account.html` em mobile
- [ ] Verificar que Stripe Checkout é responsivo
- [ ] Verificar que Customer Portal é responsivo

---

## 🌐 Testes em Diferentes Navegadores

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 📈 Testes de Performance

### Load Testing

- [ ] Criar múltiplas sessões de checkout simultaneamente
- [ ] Verificar que todas são processadas
- [ ] Verificar logs para erros

---

## 🎯 Cenários Completos (E2E)

### Cenário 1: Novo Usuário → Assinatura Ativa

1. [ ] Criar conta
2. [ ] Fazer login
3. [ ] Redirecionado para checkout
4. [ ] Completar pagamento
5. [ ] Redirecionado para app
6. [ ] Acessar página de conta
7. [ ] Verificar status "Ativa"

### Cenário 2: Cancelamento e Reativação

1. [ ] Com assinatura ativa
2. [ ] Acessar `/account.html`
3. [ ] Cancelar assinatura
4. [ ] Verificar "Será cancelada em..."
5. [ ] Acessar Customer Portal
6. [ ] Reativar assinatura
7. [ ] Verificar webhook `subscription.updated`
8. [ ] Verificar status volta para "Ativa"

### Cenário 3: Falha de Pagamento

1. [ ] Simular falha de pagamento no Stripe
2. [ ] Verificar webhook `invoice.payment_failed`
3. [ ] Verificar status no banco
4. [ ] Verificar que usuário ainda tem acesso (grace period)

---

## ✅ Checklist Final

Antes de ir para produção:

### Configuração
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Webhook apontando para URL correta
- [ ] Customer Portal ativado no Stripe
- [ ] Chaves de produção configuradas (quando em produção)

### Código
- [ ] Todos os arquivos commitados
- [ ] `.env` e secrets no `.gitignore`
- [ ] Documentação atualizada
- [ ] TODOs resolvidos

### Testes
- [ ] Todos os testes acima passaram ✅
- [ ] Logs estão funcionando corretamente
- [ ] Webhooks processando sem erros
- [ ] Real-time sync funcionando

### Monitoramento
- [ ] Alertas configurados
- [ ] Logs sendo monitorados
- [ ] Dashboard do Stripe configurado
- [ ] Firebase Analytics configurado (opcional)

---

## 🐛 Problemas Encontrados

Use esta seção para anotar problemas encontrados durante os testes:

```
Data: ___________
Teste: ___________
Problema: ___________
Solução: ___________
Status: [ ] Resolvido [ ] Pendente
```

---

## 📝 Notas

- Execute testes em ambiente de **teste/staging** primeiro
- Use cartões de teste do Stripe
- Verifique logs após cada teste
- Documente quaisquer comportamentos inesperados
- Teste com diferentes usuários e cenários

---

**Status dos Testes:**
- [ ] Todos os testes passaram
- [ ] Sistema pronto para produção
- [ ] Documentação completa
- [ ] Time treinado

**Assinatura:** _________________
**Data:** _________________

---

## 🎉 Próximos Passos

Após todos os testes passarem:

1. [ ] Deploy para produção
2. [ ] Configurar monitoramento
3. [ ] Treinar equipe de suporte
4. [ ] Anunciar nova funcionalidade
5. [ ] Coletar feedback inicial

**BOA SORTE! 🚀**
