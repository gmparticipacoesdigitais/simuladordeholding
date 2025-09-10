# Simulador de Holding Patrimonial (PF × PJ) — IBS/CBS

## Visão Geral

Este simulador permite comparar cenários fiscais entre Pessoa Física (PF) e Pessoa Jurídica (PJ) no regime IBS/CBS, calculando tributos e gerando relatórios profissionais conforme a legislação vigente em setembro de 2025 no Brasil.

## 🔐 Sistema de Acesso

A aplicação possui um sistema de controle de acesso baseado em allowlist de emails. Apenas emails autorizados podem acessar o simulador.

### Email Autorizado
- **gmparticipacoes@gmail.com** - Acesso completo ao simulador

### Como Adicionar Novos Emails

1. Abra o arquivo `hash-generator.html` no navegador
2. Digite o email que deseja autorizar
3. Clique em "Gerar Hash"
4. Copie o hash SHA-256 gerado
5. Edite o arquivo `index.html` e adicione o hash à constante `ALLOWLIST_SHA256`:

```javascript
const ALLOWLIST_SHA256 = [
  "6c73e10b855181d66d9241415ee1aa71f535b49bd8c420f8890a76f64db6b727", // gmparticipacoes@gmail.com
  "SEU_NOVO_HASH_AQUI" // novo@email.com
];
```

## 🚀 Como Usar

### 1. Acesso à Aplicação
1. Abra o arquivo `index.html` no navegador
2. Digite o email autorizado (gmparticipacoes@gmail.com)
3. Clique em "Entrar"

### 2. Configuração da Simulação
1. **Ano da Simulação**: Selecione o ano (2024-2028)
2. **Número de Imóveis**: Quantidade de imóveis da PF
3. **Receita Anual PF**: Valor da receita anual em reais
4. **Despesas Anuais PF**: Valor das despesas anuais em reais

### 3. Configuração PJ
- **Usar mesma receita da PF**: Recomendado para comparação direta
- **Receita específica da PJ**: Para cenários customizados

### 4. Configurações Avançadas
Clique em "Configurações Avançadas" para ajustar:
- Limiares de contribuição IVA para PF
- Alíquotas de IBS/CBS
- Parâmetros de cálculo da PJ (base presumida, IRPJ, CSLL, etc.)

## 📊 Funcionalidades

### Dashboard Interativo
- **KPIs em tempo real**: Economia potencial, payback, tributos PF vs PJ
- **Gráficos visuais**: Comparativo de barras e distribuição de tributos
- **Tema claro/escuro**: Interface adaptável

### Cálculos Automáticos
- **IRPF**: Baseado na tabela progressiva vigente
- **IBS/CBS**: Alíquotas automáticas por ano (2024-2027+)
- **Validação de limiares**: PF contribuinte IVA apenas acima dos limiares
- **Regime Lucro Presumido**: Cálculo completo para PJ

### Interface Responsiva
- Funciona em desktop, tablet e mobile
- Navegação intuitiva com sidebar
- Acessibilidade otimizada

## 🔧 Estrutura de Arquivos

```
simulador-holding-novo/
├── index.html              # Aplicação principal
├── hash-generator.html     # Gerador de hashes para allowlist
└── README.md              # Esta documentação
```

## 💻 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Design system com variáveis CSS e Tailwind
- **JavaScript**: Lógica de cálculo e interatividade
- **Chart.js**: Visualização de dados
- **WebCrypto API**: Geração de hashes SHA-256

## 📋 Cálculos Implementados

### Pessoa Física (PF)
- **IRPF**: Tabela progressiva mensal (Lei 11.482/2007 + Lei 15.191/2025)
- **IBS/CBS**: Aplicação condicionada aos limiares (art. 251, LC 214/25)
- **Alíquotas 2026**: 0,1% IBS + 0,9% CBS (período de teste)
- **Alíquotas 2027+**: 30% da alíquota de referência (26,5%)

### Pessoa Jurídica (PJ)
- **Regime**: Lucro Presumido
- **IRPJ**: 15% + 10% adicional sobre excedente
- **CSLL**: 9% sobre a base presumida
- **IBS/CBS**: Mesmas alíquotas da PF
- **Custos**: Fixos anuais + ITBI amortizado

## ⚠️ Limitações e Disclaimers

**Importante**: Este simulador tem caráter **estimativo** e não substitui aconselhamento jurídico ou contábil profissional.

### Limitações Conhecidas
- Não considera dependentes, INSS, pensão ou outras deduções
- Não inclui créditos de IBS/CBS para PJ
- Baseado na legislação vigente em setembro de 2025
- Parâmetros podem ser alterados conforme mudanças legais

### Legislação de Referência
- **IRPF**: Lei 11.482/2007 + Lei 15.191/2025
- **IBS/CBS**: LC 214/25 (art. 251, 261, 475)
- **Limiares**: Art. 251 da LC 214/25

## 🔒 Segurança

### Sistema de Allowlist
- Controle de acesso baseado em hash SHA-256 dos emails
- Validação client-side (adequada para controle básico)
- Sessão persistente via localStorage

### Considerações de Segurança
- O sistema atual é adequado para controle básico de acesso
- Para segurança robusta, considere implementar autenticação server-side
- Os hashes SHA-256 são visíveis no código fonte (por design)

## 🚀 Implantação

### Requisitos
- Servidor web (Apache, Nginx, ou similar)
- Suporte a HTTPS (requerido para WebCrypto API)
- Navegador moderno com suporte a ES6+

### Passos para Implantação
1. Faça upload dos arquivos para o servidor web
2. Configure HTTPS (obrigatório para WebCrypto)
3. Teste o acesso com o email autorizado
4. Monitore logs de acesso se necessário

## 📞 Suporte

Para questões técnicas ou solicitações de acesso:
- Verifique se está usando HTTPS ou localhost
- Confirme que o email está na allowlist
- Teste em navegador atualizado

## 📄 Licença

Este projeto é de uso restrito conforme configuração da allowlist. Consulte sempre um contador ou advogado para validações específicas dos cálculos tributários.

---

**Versão**: 2.0  
**Data**: Setembro 2025  
**Desenvolvido com foco em usabilidade, precisão e conformidade legal.**

