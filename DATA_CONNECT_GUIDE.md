# Guia de Uso do Firebase Data Connect

## ✅ O que foi implementado

### 1. **Schema do Data Connect** (`dataconnect/schema/schema.gql`)

Estrutura de banco de dados PostgreSQL com as seguintes tabelas:

- **User**: Dados de usuários (autenticação, pagamento, perfil)
- **Payment**: Histórico de pagamentos Stripe
- **Calculation**: Cálculos de IRPF salvos
- **AuditLog**: Logs de auditoria do sistema

### 2. **Connectors e Operações** (`dataconnect/irpf/`)

#### Queries (`queries.gql`)
- `GetUser`: Buscar usuário por ID
- `GetUserByEmail`: Buscar usuário por email
- `CheckPaymentStatus`: Verificar se usuário pagou
- `GetLatestCalculation`: Buscar último cálculo
- `GetCalculationHistory`: Histórico de cálculos
- `GetUserPayments`: Histórico de pagamentos
- `GetLatestPayment`: Último pagamento
- `GetUserAuditLogs`: Logs de auditoria

#### Mutations (`mutations.gql`)
- `UpsertUser`: Criar/atualizar usuário
- `UpdateUserLogin`: Atualizar timestamp de login
- `UpdatePaymentStatus`: Marcar usuário como pago
- `CreatePayment`: Registrar pagamento
- `SaveCalculation`: Salvar novo cálculo IRPF
- `CreateAuditLog`: Criar log de auditoria
- `DeleteUser`: Deletar todos os dados do usuário (GDPR)

### 3. **SDK JavaScript Gerado**

SDK TypeScript/JavaScript gerado em `src/dataconnect-generated/` com:
- Funções tipadas para todas as queries e mutations
- Validação automática de tipos
- Documentação inline

### 4. **Camada de Integração** (`dataconnect-integration.js`)

Wrapper simplificado para uso fácil das operações do Data Connect.

## 🚀 Como usar no código

### Importar a integração

```javascript
import DataConnect from './dataconnect-integration.js';
```

### Exemplo: Criar/Atualizar Usuário

```javascript
// No auth.js, após criar usuário
await DataConnect.upsertUser(
  user.uid,
  user.email,
  user.displayName,
  'google' // ou 'email'
);

// Atualizar último login
await DataConnect.updateUserLogin(user.uid);
```

### Exemplo: Verificar Pagamento

```javascript
// Verificar se usuário pagou
const hasPaid = await DataConnect.checkPaymentStatus(user.uid);

if (hasPaid) {
  // Redirecionar para app
  window.location.href = 'app.html';
} else {
  // Redirecionar para checkout
  window.location.href = 'checkout.html';
}
```

### Exemplo: Salvar Cálculo

```javascript
// No app.js, após calcular IRPF
await DataConnect.saveCalculation(user.uid, {
  rendaBruta: 5000.00,
  dependentes: 2,
  pensaoAlimenticia: 500.00,
  despesasMedicas: 200.00,
  despesasEducacao: 300.00,
  previdenciaPrivada: 600.00,
  inss: 550.00,
  baseCalculo: 2850.00,
  impostoDevido: 120.50,
  metodo: 'Deduções Legais',
  totalDeducoes: 2150.00
});
```

### Exemplo: Carregar Último Cálculo

```javascript
// Restaurar último cálculo do usuário
const lastCalc = await DataConnect.getLatestCalculation(user.uid);

if (lastCalc) {
  document.getElementById('rendaBruta').value = lastCalc.rendaBruta;
  document.getElementById('dependentes').value = lastCalc.dependentes;
  // ... restaurar outros campos
}
```

### Exemplo: Registrar Pagamento

```javascript
// No checkout.js, após pagamento confirmado
await DataConnect.createPayment(user.uid, {
  amount: 2990, // em centavos
  currency: 'brl',
  status: 'completed',
  stripeSessionId: 'cs_test_...',
  stripePaymentIntentId: 'pi_...',
  paymentMethod: 'card'
});

// Atualizar status do usuário
await DataConnect.updatePaymentStatus(user.uid, true, 'cus_...');
```

### Exemplo: Criar Log de Auditoria

```javascript
// Registrar ação importante
await DataConnect.createAuditLog(
  user.uid,
  'LOGIN_SUCCESS',
  'Usuário fez login com sucesso'
);

await DataConnect.createAuditLog(
  user.uid,
  'CALCULATION_SAVED',
  `Cálculo salvo: R$ ${impostoDevido.toFixed(2)}`
);
```

## 🔧 Configuração e Deploy

### 1. **Corrigir bug do Firebase Auth Domain**

✅ **JÁ CORRIGIDO** - O `.env` foi atualizado:
```env
FIREBASE_AUTH_DOMAIN=irpf-login-50933822-96b79.firebaseapp.com
```

### 2. **Deploy do Data Connect**

```bash
# Deploy do schema e connectors
firebase deploy --only dataconnect

# Ou deploy completo
firebase deploy
```

### 3. **Regenerar SDK (se alterar schema)**

```bash
firebase dataconnect:sdk:generate
```

### 4. **Testar localmente com emulador**

```bash
# Iniciar emulador do Data Connect
firebase emulators:start --only dataconnect

# Em outro terminal, rodar o app
npm run dev
```

## 🐛 Bugs Corrigidos

### 1. **Firebase Auth Domain Incorreto**
- ❌ Antes: `-login-50933822-96b79.firebasirpfeapp.com`
- ✅ Depois: `irpf-login-50933822-96b79.firebaseapp.com`

### 2. **Schema Data Connect**
- ✅ Schema completo criado com tabelas User, Payment, Calculation, AuditLog
- ✅ Relacionamentos corretos entre tabelas
- ✅ Campos com tipos adequados (Timestamp, UUID, etc)

### 3. **Connectors GraphQL**
- ✅ Queries e mutations completas
- ✅ Sintaxe GraphQL corrigida (remoção de operadores ternários)
- ✅ Tipos de retorno corretos (sem seleção em _Key types)

## 📝 Próximos Passos

### Para usar Data Connect no lugar do Realtime Database:

1. **Atualizar `auth.js`**:
   - Substituir chamadas `database.ref()` por `DataConnect.upsertUser()`, etc
   - Usar `DataConnect.checkPaymentStatus()` ao invés de ler diretamente do DB

2. **Atualizar `app.js`**:
   - Substituir `database.ref('calculations/...')` por `DataConnect.saveCalculation()`
   - Usar `DataConnect.getLatestCalculation()` para carregar dados

3. **Atualizar `checkout.js`**:
   - Usar `DataConnect.createPayment()` para registrar pagamentos
   - Usar `DataConnect.updatePaymentStatus()` após confirmação

## 🔐 Segurança

O Data Connect usa regras de autenticação:
- `@auth(level: USER)` - Requer autenticação Firebase
- Queries e mutations automaticamente filtram por `auth.uid`
- Schema validation em `COMPATIBLE` mode

## 📊 Vantagens do Data Connect

✅ **Performance**: PostgreSQL otimizado para queries complexas
✅ **Tipagem**: SDK TypeScript com validação automática
✅ **Relacionamentos**: JOIN tables com performance nativa SQL
✅ **Escalabilidade**: Cloud SQL com auto-scaling
✅ **Consistência**: Transações ACID completas
✅ **Auditoria**: Logs automáticos de todas as operações

## 🆘 Troubleshooting

### Erro ao gerar SDK
```bash
firebase dataconnect:sdk:generate --project irpf-login-50933822-96b79
```

### Ver logs do emulador
```bash
firebase emulators:start --only dataconnect --debug
```

### Verificar schema
```bash
firebase dataconnect:sql:diff
```

## 📚 Documentação

- [Firebase Data Connect Docs](https://firebase.google.com/docs/data-connect)
- [GraphQL Schema](https://graphql.org/learn/schema/)
- [SDK Gerado](./src/dataconnect-generated/README.md)
