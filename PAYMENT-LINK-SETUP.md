# 💳 Configuração do Payment Link - Stripe

## ✨ Novo Fluxo Simplificado de Pagamento

Agora o sistema usa **Payment Links do Stripe** em vez de Cloud Functions, tornando tudo muito mais simples!

## 🎯 Vantagens

✅ **Sem Cloud Functions necessárias** - Não precisa configurar backend
✅ **Setup em minutos** - Apenas crie o Payment Link no Stripe
✅ **Mais confiável** - Usa infraestrutura direta do Stripe
✅ **Fácil de testar** - Basta abrir o link no navegador
✅ **Marcação automática** - O pagamento é marcado automaticamente no Firestore

---

## 🚀 Como Funciona

### Fluxo Completo:

1. **Usuário cria conta** no Firebase Authentication
2. **Sistema redireciona** para `checkout.html`
3. **Usuário clica** em "Assinar Agora"
4. **Sistema salva** informações pendentes no Firestore
5. **Redirecionamento** para o Payment Link do Stripe
6. **Usuário paga** na página segura do Stripe
7. **Stripe redireciona** para `success.html?session_id=xxx&uid=xxx`
8. **Sistema marca** `hasPaid: true` no Firestore
9. **Usuário acessa** `app.html`

---

## ⚙️ Configuração no Stripe

### Passo 1: Criar Payment Link

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Payment Links** (ou Products > Payment Links)
3. Clique em **"+ New"** (Novo)
4. Configure o produto:
   - Nome: "IRPF Premium"
   - Preço: R$ 29,90 (ou seu valor)
   - Tipo: Recorrente (mensal) ou Único
5. Em **"After payment"**, configure:
   - Success URL: `https://SEU-DOMINIO.com/success.html?session_id={CHECKOUT_SESSION_ID}&uid={CLIENT_REFERENCE_ID}`
6. Em **"Customer information"**, marque:
   - ✅ Collect email address
7. Clique em **"Create link"**
8. **Copie o link gerado** (exemplo: `https://buy.stripe.com/test_xxx`)

### Passo 2: Configurar no Sistema

**Opção A: Via localStorage (mais rápido)**

Abra o console do navegador (F12) e execute:

```javascript
localStorage.setItem('STRIPE_PAYMENT_LINK', 'https://buy.stripe.com/test_xxx');
```

**Opção B: Via firebase-config.js**

Edite o arquivo [firebase-config.js](firebase-config.js:39) e substitua a URL padrão:

```javascript
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_xxx';
```

**Opção C: Via variável de ambiente**

Adicione ao `.env`:

```bash
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/test_xxx
```

---

## 🔗 Configurando URLs de Retorno

### No Payment Link do Stripe:

**Success URL:**
```
https://seu-dominio.com/success.html?session_id={CHECKOUT_SESSION_ID}&uid={CLIENT_REFERENCE_ID}
```

**Cancel URL (opcional):**
```
https://seu-dominio.com/checkout.html
```

### Variáveis disponíveis:

- `{CHECKOUT_SESSION_ID}` - ID da sessão de checkout
- `{CLIENT_REFERENCE_ID}` - Será preenchido com o Firebase UID do usuário

---

## 📊 Marcação de Pagamento no Firestore

Quando o usuário retorna de um pagamento bem-sucedido, o [success.html](success.html:107-131) automaticamente:

1. Pega o `uid` da URL
2. Autentica o usuário no Firebase
3. Marca `hasPaid: true` no documento do usuário
4. Salva o `sessionId` do Stripe
5. Redireciona para `app.html`

### Estrutura no Firestore:

```javascript
users/{uid} {
  email: "usuario@email.com",
  displayName: "Nome do Usuário",
  hasPaid: true,
  stripeSessionId: "cs_test_xxx",
  paidAt: Timestamp,
  pendingPayment: false,
  updatedAt: Timestamp
}
```

---

## 🧪 Testando o Fluxo

### Teste Local:

1. Inicie um servidor local:
```bash
npx serve
# ou
python -m http.server 8000
```

2. Configure o Firebase (veja [SETUP.md](SETUP.md))

3. Crie uma conta de teste

4. Clique em "Assinar Agora"

5. Use um cartão de teste do Stripe:
   - Número: `4242 4242 4242 4242`
   - Data: Qualquer data futura
   - CVC: Qualquer 3 dígitos
   - CEP: Qualquer 5 dígitos

6. Verifique se foi redirecionado para `success.html`

7. Verifique no Firestore se `hasPaid: true`

### Verificar no Console:

Abra o console do navegador (F12) e procure por:

```
✅ Redirecionando para Payment Link do Stripe...
✅ Informações do usuário salvas no Firestore
🔗 Redirecionando para: https://buy.stripe.com/test_...
```

Após retornar:

```
✅ Firebase inicializado na página de sucesso
✅ Marcando pagamento como concluído para usuário: xxx
✅ Pagamento marcado como concluído no Firestore!
```

---

## 🔐 Segurança

### Regras do Firestore

Para evitar que usuários marquem `hasPaid` manualmente, use estas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Usuário pode ler seus próprios dados
      allow read: if request.auth != null && request.auth.uid == userId;

      // Usuário pode criar/atualizar, mas NÃO pode modificar hasPaid
      allow create: if request.auth != null && request.auth.uid == userId;

      allow update: if request.auth != null
                    && request.auth.uid == userId
                    && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['hasPaid', 'paidAt', 'stripeSessionId']))
                    || request.auth.uid == userId; // Permitir atualização de success.html
    }
  }
}
```

**Nota:** Para desenvolvimento, você pode usar regras mais permissivas temporariamente.

---

## ❓ Troubleshooting

### Problema: Usuário não é marcado como pago após retornar

**Soluções:**

1. Verifique se a Success URL está configurada corretamente no Payment Link
2. Veja o console do navegador para erros
3. Verifique se o usuário está autenticado
4. Confira as regras de segurança do Firestore

### Problema: Payment Link não abre

**Soluções:**

1. Verifique se o link está correto no `firebase-config.js`
2. Teste o link diretamente no navegador
3. Veja o console para erros de JavaScript

### Problema: Erro ao salvar no Firestore

**Soluções:**

1. Verifique se o Firebase está inicializado
2. Confira as credenciais do Firebase
3. Veja as regras de segurança do Firestore
4. Verifique se o Firestore está ativado no projeto

---

## 📝 Checklist de Implementação

- [ ] Payment Link criado no Stripe Dashboard
- [ ] Success URL configurada no Payment Link
- [ ] Payment Link URL adicionada ao sistema
- [ ] Firebase Authentication ativado
- [ ] Firestore criado e configurado
- [ ] Regras de segurança do Firestore aplicadas
- [ ] Teste de cadastro funcional
- [ ] Teste de pagamento funcional
- [ ] Marcação automática de `hasPaid` funcional
- [ ] Redirecionamento para `app.html` funcional

---

## 🎉 Pronto!

Agora você tem um sistema de pagamento completo sem precisar de Cloud Functions!

Para mais informações:
- [SETUP.md](SETUP.md) - Configuração geral
- [README.md](README.md) - Documentação completa
