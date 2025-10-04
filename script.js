// ============================================
// UTILITY FUNCTIONS
// ============================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function parseNumberBR(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.')) || 0;
}

function formatBRL(value) {
  if (isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatCurrencyInput(e) {
  let value = e.target.value;
  value = value.replace(/\D/g, "");
  if (value === "") {
    e.target.value = "";
    return;
  }
  value = (Number(value) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
  e.target.value = value;
}

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

// ============================================
// TAX CALCULATION FUNCTIONS
// ============================================

// Tabela IRPF 2025 (Lei 15.191/2025)
function calculaIrpfAnual(baseAnual) {
  if (baseAnual <= 0) return { irAnual: 0, aliquotaEfetiva: 0 };

  const baseMensal = baseAnual / 12;
  const faixas = [
    { limite: 2428.80, aliquota: 0.000, deducao: 0.00 },
    { limite: 2826.65, aliquota: 0.075, deducao: 182.16 },
    { limite: 3751.05, aliquota: 0.150, deducao: 394.16 },
    { limite: 4664.68, aliquota: 0.225, deducao: 675.49 },
    { limite: Infinity, aliquota: 0.275, deducao: 908.73 }
  ];

  let faixa = faixas.find(f => baseMensal <= f.limite);
  if (!faixa) faixa = faixas[faixas.length - 1];

  const irMensal = Math.max(0, baseMensal * faixa.aliquota - faixa.deducao);
  const irAnual = irMensal * 12;
  const aliquotaEfetiva = baseAnual > 0 ? irAnual / baseAnual : 0;

  return { irAnual, aliquotaEfetiva };
}

function getTaxRates(ano, params) {
  let rates = { ibs: 0, cbs: 0, pis: 0, cofins: 0, compensacao2026: false, ivaEfetivo: 0 };

  if (ano <= 2025) {
    rates.pis = params.aliqPis / 100;
    rates.cofins = params.aliqCofins / 100;
  } else if (ano === 2026) {
    rates.ibs = 0.001;
    rates.cbs = 0.009;
    rates.ivaEfetivo = 0.01;
    rates.pis = params.aliqPis / 100;
    rates.cofins = params.aliqCofins / 100;
    rates.compensacao2026 = true;
  } else {
    const taxaBase = params.taxaIvaRef / 100;
    const reducao = params.reducaoBase / 100;
    const ivaReduzido = taxaBase * (1 - reducao);

    rates.ibs = ivaReduzido * (params.propIbs / 100);
    rates.cbs = ivaReduzido * (params.propCbs / 100);
    rates.ivaEfetivo = ivaReduzido;
  }

  return rates;
}

function isPFContribuinteIVA(numImoveis, receitaAnual) {
  return numImoveis > 3 && receitaAnual > 240000;
}

// ============================================
// CALCULATION ENGINE
// ============================================

function calcularPF(params) {
  const receita = params.receitaBruta;
  const despesas = receita * (params.pfDespesasPerc / 100);
  const baseIRPF = Math.max(0, receita - despesas);

  const irpfResult = calculaIrpfAnual(baseIRPF);
  const irpf = irpfResult.irAnual;

  const taxRates = getTaxRates(params.ano, params);
  let ivaContrib = 0;

  if (params.ano >= 2026) {
    if (isPFContribuinteIVA(params.numImoveis, receita)) {
      if (params.ano === 2026 && taxRates.compensacao2026) {
        const ivaBase = receita * taxRates.ivaEfetivo;
        const pisCofinsBase = receita * (taxRates.pis + taxRates.cofins);
        ivaContrib = Math.max(0, ivaBase - pisCofinsBase);
      } else {
        ivaContrib = receita * taxRates.ivaEfetivo;
      }
    }
  }

  const totalAnual = irpf + ivaContrib;

  return {
    receita,
    despesas,
    baseIRPF,
    irpf,
    irpfAliqEfetiva: irpfResult.aliquotaEfetiva,
    ivaContrib,
    ivaAliq: taxRates.ivaEfetivo,
    isPFContribuinte: isPFContribuinteIVA(params.numImoveis, receita),
    totalAnual
  };
}

function calcularPJ(params) {
  const receita = params.receitaBruta;
  const taxRates = getTaxRates(params.ano, params);

  let tribReceita = 0;
  let pisCofins = 0;
  let ibsCbs = 0;

  if (params.ano <= 2025) {
    pisCofins = receita * (taxRates.pis + taxRates.cofins);
    tribReceita = pisCofins;
  } else if (params.ano === 2026) {
    pisCofins = receita * (taxRates.pis + taxRates.cofins);
    ibsCbs = receita * taxRates.ivaEfetivo;

    if (taxRates.compensacao2026) {
      const compensacao = Math.min(pisCofins, ibsCbs);
      tribReceita = pisCofins + ibsCbs - compensacao;
    } else {
      tribReceita = pisCofins + ibsCbs;
    }
  } else {
    ibsCbs = receita * taxRates.ivaEfetivo;
    tribReceita = ibsCbs;
  }

  const basePresumida = receita * (params.pjBasePresumida / 100);
  const irpj = basePresumida * (params.pjAliqIrpj / 100);

  let adicionalIRPJ = 0;
  if (basePresumida > params.pjLimiteAdicional) {
    adicionalIRPJ = (basePresumida - params.pjLimiteAdicional) * (params.pjAliqIrpjAdicional / 100);
  }

  const csll = basePresumida * (params.pjAliqCsll / 100);
  const lucroLiquido = basePresumida - irpj - adicionalIRPJ - csll;
  const irDividendos = lucroLiquido * (params.pjAliqIrDividendos / 100);

  const totalTributosAnual = tribReceita + irpj + adicionalIRPJ + csll + irDividendos;
  const totalCustosOperacionais = totalTributosAnual + params.pjCustosFixos;

  const investimentoInicial = params.custoSetupFixo + (params.valorPatrimonio * (params.custoItbiAliq / 100));
  const amortizacaoAnual = investimentoInicial / params.pjAnosAnalise;
  const totalCustoAnual = totalCustosOperacionais + amortizacaoAnual;

  return {
    receita,
    tribReceita,
    pisCofins,
    ibsCbs,
    basePresumida,
    irpj,
    adicionalIRPJ,
    csll,
    lucroLiquido,
    irDividendos,
    totalTributos: totalTributosAnual,
    custosFixos: params.pjCustosFixos,
    totalCustosOperacionais,
    investimentoInicial,
    amortizacaoAnual,
    totalCustoAnual
  };
}

// ============================================
// DATA COLLECTION
// ============================================

function coletarParametros() {
  const receitaBruta = parseNumberBR($('#pf-receita').value);
  const numImoveis = parseInt($('#pf-imoveis').value) || 0;
  const ano = parseInt($('#ano').value);

  const mercadoCapRate = parseFloat($('#mercado-cap-rate').value) / 100;
  const valorPatrimonio = receitaBruta / mercadoCapRate;

  const custoItbiAliq = parseFloat($('#custo-itbi-aliq').value);
  const custoSetupFixo = parseNumberBR($('#custo-setup-fixo').value);
  const pjCustosFixos = parseNumberBR($('#pj-custos-fixos').value);
  const pjAnosAnalise = parseInt($('#pj-anos-analise').value) || 10;

  const pfDespesasPerc = parseFloat($('#pf-despesas-perc').value);

  const taxaIvaRef = parseFloat($('#taxa-iva-ref').value);
  const reducaoBase = parseFloat($('#reducao-base').value);
  const propIbs = parseFloat($('#prop-ibs').value);
  const propCbs = parseFloat($('#prop-cbs').value);

  const aliqPis = parseFloat($('#aliq-pis').value);
  const aliqCofins = parseFloat($('#aliq-cofins').value);

  const pjBasePresumida = parseFloat($('#pj-base-presumida').value);
  const pjAliqIrpj = parseFloat($('#pj-aliq-irpj').value);
  const pjAliqCsll = parseFloat($('#pj-aliq-csll').value);
  const pjAliqIrpjAdicional = parseFloat($('#pj-aliq-irpj-adicional').value);
  const pjLimiteAdicional = parseNumberBR($('#pj-limite-adicional').value);
  const pjAliqIrDividendos = parseFloat($('#pj-aliq-ir-dividendos').value);

  return {
    receitaBruta,
    numImoveis,
    ano,
    valorPatrimonio,
    custoItbiAliq,
    custoSetupFixo,
    pjCustosFixos,
    pjAnosAnalise,
    pfDespesasPerc,
    taxaIvaRef,
    reducaoBase,
    propIbs,
    propCbs,
    aliqPis,
    aliqCofins,
    pjBasePresumida,
    pjAliqIrpj,
    pjAliqCsll,
    pjAliqIrpjAdicional,
    pjLimiteAdicional,
    pjAliqIrDividendos
  };
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function atualizarKPIs(pf, pj) {
  const economia = pf.totalAnual - pj.totalCustoAnual;

  $('#kpi-economia').textContent = formatBRL(economia);
  $('#kpi-pf').textContent = formatBRL(pf.totalAnual);
  $('#kpi-pj').textContent = formatBRL(pj.totalCustoAnual);

  const payback = pj.investimentoInicial / Math.max(economia, 1);
  $('#kpi-payback').textContent = payback > 0 && payback < 100 ? `${payback.toFixed(1)} anos` : 'N/A';
  $('#kpi-investimento').textContent = `Investimento: ${formatBRL(pj.investimentoInicial)}`;
}

function atualizarConclusao(pf, pj) {
  const banner = $('#conclusao-banner');
  const texto = $('#conclusao-texto');
  const economia = pf.totalAnual - pj.totalCustoAnual;
  const economiaPerc = (economia / pf.totalAnual) * 100;

  banner.className = 'conclusion-banner';

  if (economia > 0) {
    banner.classList.add('conclusion-success');
    texto.textContent = `A estruturação via Holding apresenta vantagem tributária de ${formatBRL(economia)} por ano (${economiaPerc.toFixed(1)}% de economia). O investimento inicial de ${formatBRL(pj.investimentoInicial)} pode se pagar em aproximadamente ${(pj.investimentoInicial / economia).toFixed(1)} anos.`;
  } else if (economia < 0) {
    banner.classList.add('conclusion-danger');
    texto.textContent = `Neste cenário, a Pessoa Física apresenta menor custo tributário. A diferença é de ${formatBRL(Math.abs(economia))} por ano a favor da PF. Avalie se outros benefícios não-tributários justificariam a Holding.`;
  } else {
    banner.classList.add('conclusion-neutral');
    texto.textContent = `Os custos entre Pessoa Física e Holding são equivalentes neste cenário. Considere outros fatores como proteção patrimonial, sucessão e planejamento de longo prazo.`;
  }
}

function atualizarDetalhamento(pf, pj, params) {
  // Detalhamento PF
  const pfHTML = `
    <div class="detail-header">
      <span class="detail-badge detail-badge-pf">Pessoa Física</span>
      <span class="detail-title">Custo Anual</span>
    </div>
    <div class="detail-items">
      <div class="detail-item">
        <span class="detail-item-label">Receita Bruta (Aluguéis)</span>
        <span class="detail-item-value">${formatBRL(pf.receita)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-item-label">(-) Despesas Dedutíveis (${params.pfDespesasPerc}%)</span>
        <span class="detail-item-value">${formatBRL(pf.despesas)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-item-label">Base de Cálculo IRPF</span>
        <span class="detail-item-value">${formatBRL(pf.baseIRPF)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-item-label">IRPF (Alíq. Efetiva: ${(pf.irpfAliqEfetiva * 100).toFixed(2)}%)</span>
        <span class="detail-item-value">${formatBRL(pf.irpf)}</span>
      </div>
      ${pf.isPFContribuinte ? `
      <div class="detail-item">
        <span class="detail-item-label">IBS/CBS (Alíq: ${(pf.ivaAliq * 100).toFixed(2)}%)</span>
        <span class="detail-item-value">${formatBRL(pf.ivaContrib)}</span>
      </div>` : ''}
    </div>
    <div class="detail-total detail-item">
      <strong class="detail-item-label">Total Custo PF</strong>
      <strong class="detail-item-value">${formatBRL(pf.totalAnual)}</strong>
    </div>
  `;
  $('#pf-result').innerHTML = pfHTML;

  // Detalhamento PJ
  const pjHTML = `
    <div class="detail-header">
      <span class="detail-badge detail-badge-pj">Holding (PJ)</span>
      <span class="detail-title">Custo Anual</span>
    </div>
    <div class="detail-items">
      <div class="detail-item">
        <span class="detail-item-label">Receita Bruta</span>
        <span class="detail-item-value">${formatBRL(pj.receita)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-item-label">Tributos sobre Receita</span>
        <span class="detail-item-value">${formatBRL(pj.tribReceita)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-item-label">IRPJ + Adicional</span>
        <span class="detail-item-value">${formatBRL(pj.irpj + pj.adicionalIRPJ)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-item-label">CSLL</span>
        <span class="detail-item-value">${formatBRL(pj.csll)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-item-label">IR sobre Dividendos</span>
        <span class="detail-item-value">${formatBRL(pj.irDividendos)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-item-label">Custos Operacionais</span>
        <span class="detail-item-value">${formatBRL(pj.custosFixos)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-item-label">Amortização Investimento</span>
        <span class="detail-item-value">${formatBRL(pj.amortizacaoAnual)}</span>
      </div>
    </div>
    <div class="detail-total detail-item">
      <strong class="detail-item-label">Total Custo PJ</strong>
      <strong class="detail-item-value">${formatBRL(pj.totalCustoAnual)}</strong>
    </div>
  `;
  $('#pj-result').innerHTML = pjHTML;
}

// ============================================
// CHARTING FUNCTIONS
// ============================================

let tributosChart, distribuicaoChart;

function renderCharts(pf, pj) {
  const ctxTributos = document.getElementById('tributos-chart').getContext('2d');
  const ctxDistribuicao = document.getElementById('distribuicao-chart').getContext('2d');

  const theme = document.body.dataset.theme || 'light';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = theme === 'dark' ? '#f1f5f9' : '#0f172a';

  if (tributosChart) tributosChart.destroy();
  tributosChart = new Chart(ctxTributos, {
    type: 'bar',
    data: {
      labels: ['Pessoa Física', 'Holding (PJ)'],
      datasets: [{
        label: 'Custo Anual Total',
        data: [pf.totalAnual, pj.totalCustoAnual],
        backgroundColor: ['#1e40af', '#d97706'],
        borderColor: ['#1e3a8a', '#b45309'],
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatBRL(context.raw)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: (value) => formatBRL(value)
          },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { display: false }
        }
      }
    }
  });

  if (distribuicaoChart) distribuicaoChart.destroy();
  distribuicaoChart = new Chart(ctxDistribuicao, {
    type: 'doughnut',
    data: {
      labels: ['Tributos/Receita', 'IRPJ/CSLL', 'Custos Fixos', 'Amortização'],
      datasets: [{
        data: [pj.tribReceita, pj.irpj + pj.adicionalIRPJ + pj.csll, pj.custosFixos, pj.amortizacaoAnual],
        backgroundColor: ['#0284c7', '#ea580c', '#65a30d', '#7c3aed'],
        borderColor: theme === 'dark' ? '#1e293b' : '#ffffff',
        borderWidth: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 15,
            boxWidth: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${formatBRL(context.raw)}`
          }
        }
      }
    }
  });
}

// ============================================
// MAIN APPLICATION LOGIC
// ============================================

function runSimulation() {
  const params = coletarParametros();

  // Update display values
  $('#display-valor-patrimonio').value = formatBRL(params.valorPatrimonio);
  const investimentoInicial = params.custoSetupFixo + (params.valorPatrimonio * (params.custoItbiAliq / 100));
  $('#display-investimento-inicial').value = formatBRL(investimentoInicial);

  const pfResult = calcularPF(params);
  const pjResult = calcularPJ({ ...params, investimentoInicial });

  atualizarKPIs(pfResult, pjResult);
  atualizarConclusao(pfResult, pjResult);
  atualizarDetalhamento(pfResult, pjResult, params);
  renderCharts(pfResult, pjResult);
}

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================

function setupEventListeners() {
  const debouncedRun = debounce(runSimulation, 400);

  $$('.input').forEach(input => {
    const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventType, debouncedRun);
  });

  $$('.currency').forEach(input => {
    input.addEventListener('input', formatCurrencyInput);
  });

  $('#reset-btn').addEventListener('click', () => {
    if (confirm('Deseja resetar todos os campos para os valores iniciais?')) {
      // This is a simple way to reset; a more robust solution would re-read default values.
      window.location.reload();
    }
  });

  // Theme Toggle
  const themeToggle = $('#theme-toggle');
  const sunIcon = $('#sun-icon');
  const moonIcon = $('#moon-icon');

  function setTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    sunIcon.classList.toggle('hidden', theme === 'dark');
    moonIcon.classList.toggle('hidden', theme === 'light');
    runSimulation(); // Re-render charts for new theme
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(currentTheme);
  });

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}

// Initial Run
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  runSimulation();
});