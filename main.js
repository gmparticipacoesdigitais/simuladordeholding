// ============================================================================
// MAIN.JS - Refatorado para usar Realtime Database
// Estimador de Imposto de Renda com proteção de autenticação e pagamento
// ============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, once, update, push, ServerValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Usar configuração centralizada do Firebase
const firebaseConfig = window.FIREBASE_CONFIG;

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

console.log('✅ Firebase inicializado com sucesso no app (Realtime Database)');

// ============================================================================
// VERIFICAÇÃO DE AUTENTICAÇÃO E PAGAMENTO
// ============================================================================

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log('❌ Usuário não autenticado, redirecionando para login...');
        window.location.href = 'index.html';
        return;
    }

    console.log('✅ Usuário autenticado:', user.email);
    currentUser = user;

    // Verificar se o usuário pagou
    try {
        const snapshot = await once(ref(database, `users/${user.uid}`));
        const userData = snapshot.val();

        console.log('📊 Dados do usuário:', userData);

        if (!userData || !userData.hasPaid) {
            console.log('❌ Usuário não pagou, redirecionando para checkout...');
            window.location.href = 'checkout.html';
            return;
        }

        console.log('✅ Usuário tem acesso ao app!');
        initializeAppContent(user, userData);

    } catch (error) {
        console.error('❌ Erro ao verificar pagamento:', error);
        alert('Erro ao verificar seu acesso. Redirecionando...');
        window.location.href = 'checkout.html';
    }
});

// ============================================================================
// INICIALIZAR APLICAÇÃO
// ============================================================================

function initializeAppContent(user, userData) {
    console.log('🚀 Inicializando aplicação...');

    // Mostrar informações do usuário (opcional)
    displayUserInfo(user, userData);

    // Carregar dados salvos do usuário (se existirem)
    loadUserCalculations(user.uid);

    // Setup dos event listeners
    setupEventListeners(user.uid);
}

// ============================================================================
// EXIBIR INFORMAÇÕES DO USUÁRIO
// ============================================================================

function displayUserInfo(user, userData) {
    const userName = userData.displayName || user.displayName || user.email.split('@')[0];
    console.log(`👤 Bem-vindo, ${userName}!`);

    // Você pode adicionar um elemento para mostrar o nome do usuário na interface
    // Por exemplo:
    // document.getElementById('user-name').textContent = userName;
}

// ============================================================================
// FUNÇÃO DE LOGOUT
// ============================================================================

window.logout = async function() {
    try {
        console.log('🚪 Fazendo logout...');
        await signOut(auth);
        console.log('✅ Logout realizado com sucesso');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
    }
};

// ============================================================================
// CARREGAR CÁLCULOS SALVOS DO USUÁRIO
// ============================================================================

async function loadUserCalculations(uid) {
    try {
        const snapshot = await once(ref(database, `calculations/${uid}/latest`));
        const savedData = snapshot.val();

        if (savedData) {
            console.log('📂 Cálculos salvos encontrados, restaurando...');

            // Restaurar os valores nos campos
            if (savedData.rendaBruta) document.getElementById('rendaBruta').value = savedData.rendaBruta;
            if (savedData.dependentes) document.getElementById('dependentes').value = savedData.dependentes;
            if (savedData.pensaoAlimenticia) document.getElementById('pensaoAlimenticia').value = savedData.pensaoAlimenticia;
            if (savedData.despesasMedicas) document.getElementById('despesasMedicas').value = savedData.despesasMedicas;
            if (savedData.despesasEducacao) document.getElementById('despesasEducacao').value = savedData.despesasEducacao;
            if (savedData.previdenciaPrivada) document.getElementById('previdenciaPrivada').value = savedData.previdenciaPrivada;

            console.log('✅ Dados restaurados!');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar cálculos salvos:', error);
    }
}

// ============================================================================
// SALVAR CÁLCULOS DO USUÁRIO
// ============================================================================

async function saveUserCalculations(uid, data) {
    try {
        const calculationData = {
            ...data,
            savedAt: ServerValue.TIMESTAMP
        };

        await update(ref(database, `calculations/${uid}`), {
            latest: calculationData,
            lastUpdated: ServerValue.TIMESTAMP
        });

        // Também salvar no histórico
        await push(ref(database, `calculations/${uid}/history`), calculationData);

        console.log('💾 Cálculos salvos com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao salvar cálculos:', error);
    }
}

// ============================================================================
// SETUP DOS EVENT LISTENERS
// ============================================================================

function setupEventListeners(uid) {
    const calculateBtn = document.getElementById('calculateBtn');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            analisarSituacao(uid);
        });
    }
}

// ============================================================================
// CONSTANTES TRIBUTÁRIAS (Vigência: FEV/2024)
// ============================================================================

const DEDUCAO_DEPENDENTE = 189.59;
const DESCONTO_SIMPLIFICADO_MENSAL = 564.80;
const LIMITE_ISENCAO_TABELA = 2259.20;

const TABELA_INSS_2024 = [
    { limite: 1412.00, aliquota: 0.075, deducao: 0 },
    { limite: 2666.68, aliquota: 0.09,  deducao: 21.18 },
    { limite: 4000.03, aliquota: 0.12,  deducao: 101.18 },
    { limite: 7786.02, aliquota: 0.14,  deducao: 181.18 }
];
const TETO_INSS = 7786.02;
const CONTRIBUICAO_TETO_INSS = 908.85;

// Tabela IRPF Vigente a partir de FEV/2024
const TABELA_IRPF_2024 = [
    { limite: 2259.20, aliquota: 0,     deducao: 0 },
    { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
    { limite: 3751.05, aliquota: 0.15,  deducao: 381.44 },
    { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
    { limite: Infinity,aliquota: 0.275, deducao: 896.00 }
];

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

function getNumericValue(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ============================================================================
// FUNÇÕES DE CÁLCULO
// ============================================================================

function calcularINSS(rendaBruta) {
    if (rendaBruta > TETO_INSS) {
        return CONTRIBUICAO_TETO_INSS;
    }
    for (const faixa of TABELA_INSS_2024) {
        if (rendaBruta <= faixa.limite) {
            return (rendaBruta * faixa.aliquota) - faixa.deducao;
        }
    }
    return CONTRIBUICAO_TETO_INSS;
}

function calcularIRPF(baseCalculo) {
    if (baseCalculo <= LIMITE_ISENCAO_TABELA) return 0;

    for (const faixa of TABELA_IRPF_2024) {
        if (baseCalculo <= faixa.limite) {
            return Math.max(0, (baseCalculo * faixa.aliquota) - faixa.deducao);
        }
    }
    return 0;
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE ORQUESTRAÇÃO
// ============================================================================

function analisarSituacao(uid) {
    const rendaBruta = getNumericValue('rendaBruta');

    const resultadoDiv = document.getElementById('resultado');
    const resultadoMobileDiv = document.getElementById('resultado-mobile');

    if (rendaBruta <= 0) {
        const alertHtml = `
            <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg" role="alert">
                <p class="font-bold">Atenção</p>
                <p>Por favor, informe uma Renda Bruta Mensal válida para iniciar a simulação.</p>
            </div>`;
        resultadoDiv.innerHTML = alertHtml;
        resultadoMobileDiv.innerHTML = alertHtml;
        resultadoDiv.classList.remove('hidden');
        resultadoMobileDiv.classList.remove('hidden');
        return;
    }

    const dependentes = getNumericValue('dependentes');
    const pensaoAlimenticia = getNumericValue('pensaoAlimenticia');
    const despesasMedicas = getNumericValue('despesasMedicas');
    const despesasEducacao = getNumericValue('despesasEducacao');
    const previdenciaPrivadaInput = getNumericValue('previdenciaPrivada');

    const inss = calcularINSS(rendaBruta);
    const deducaoDependentes = dependentes * DEDUCAO_DEPENDENTE;

    const limitePGBL = rendaBruta * 0.12;
    const previdenciaDedutivel = Math.min(previdenciaPrivadaInput, limitePGBL);
    const pgblExcedeu = previdenciaPrivadaInput > limitePGBL;

    const outrasDeducoesLegais = pensaoAlimenticia + despesasMedicas + despesasEducacao + previdenciaDedutivel;
    const totalDeducoesLegais = inss + deducaoDependentes + outrasDeducoesLegais;

    // Cenário 1: Usando as deduções completas
    const baseCalculoCompleta = Math.max(0, rendaBruta - totalDeducoesLegais);
    const impostoDevidoCompleto = calcularIRPF(baseCalculoCompleta);

    // Cenário 2: Usando o desconto simplificado
    const totalDeducoesSimplificado = inss + DESCONTO_SIMPLIFICADO_MENSAL;
    const baseCalculoSimplificada = Math.max(0, rendaBruta - inss);
    let impostoDevidoSimplificado;
    let baseFinalSimplificada;

    if (baseCalculoSimplificada > LIMITE_ISENCAO_TABELA) {
        baseFinalSimplificada = Math.max(0, baseCalculoSimplificada - DESCONTO_SIMPLIFICADO_MENSAL)
        impostoDevidoSimplificado = calcularIRPF(baseFinalSimplificada);
    } else {
        baseFinalSimplificada = baseCalculoSimplificada;
        impostoDevidoSimplificado = 0;
    }

    let resultadoFinal;
    if (impostoDevidoCompleto < impostoDevidoSimplificado) {
        resultadoFinal = {
            metodo: 'Deduções Legais',
            baseCalculo: baseCalculoCompleta,
            impostoDevido: impostoDevidoCompleto,
            totalDeducoes: totalDeducoesLegais
        };
    } else {
         resultadoFinal = {
            metodo: 'Desconto Simplificado',
            baseCalculo: baseFinalSimplificada,
            impostoDevido: impostoDevidoSimplificado,
            totalDeducoes: totalDeducoesSimplificado
        };
    }

    // Salvar os dados do cálculo
    if (uid) {
        saveUserCalculations(uid, {
            rendaBruta,
            dependentes,
            pensaoAlimenticia,
            despesasMedicas,
            despesasEducacao,
            previdenciaPrivada: previdenciaPrivadaInput,
            ...resultadoFinal
        });
    }

    exibirResultado({
        rendaBruta, inss, deducaoDependentes,
        outrasDeducoesItens: { pensaoAlimenticia, despesasMedicas, despesasEducacao, previdenciaDedutivel },
        pgblExcedeu, limitePGBL, ...resultadoFinal
    });
}

// ============================================================================
// FUNÇÃO DE RENDERIZAÇÃO DO RESULTADO
// ============================================================================

function exibirResultado(data) {
    const isento = data.impostoDevido <= 0;
    let html = '';

    const statusClass = isento ? 'bg-green-100 border-green-500 text-green-800' : 'bg-orange-100 border-orange-500 text-orange-800';
    const statusIcon = isento
        ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`;
    const statusTitle = isento ? 'Cenário de Isenção Atingido!' : 'Cenário Tributável';
    const statusMessage = isento
        ? `Você está <strong class="font-semibold">isento(a)</strong> do pagamento mensal de imposto.`
        : `Sua base de cálculo resultou em imposto a pagar. Veja os detalhes abaixo.`;

    html += `
        <div class="border-l-4 p-4 rounded-r-lg ${statusClass}">
            <div class="flex items-center space-x-3">
                ${statusIcon}
                <div>
                    <h3 class="text-xl font-bold">${statusTitle}</h3>
                    <p class="text-sm mt-1">${statusMessage}</p>
                </div>
            </div>
        </div>

        <div class="mt-4 text-center bg-indigo-50 p-2 rounded-lg">
             <p class="text-xs text-indigo-800">Cálculo mais vantajoso: <strong class="font-semibold">${data.metodo}</strong></p>
        </div>

        <h3 class="text-lg font-semibold text-gray-800 pt-4">Demonstrativo de Cálculo</h3>
        <div class="text-sm space-y-2 text-gray-600">
            <div class="flex justify-between items-center py-2 border-b">
                <span>Renda Bruta Mensal</span>
                <span class="font-semibold text-gray-900">${formatCurrency(data.rendaBruta)}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b">
                <span>(-) Contribuição INSS</span>
                <span class="font-semibold text-red-600">-${formatCurrency(data.inss)}</span>
            </div>`;

     if(data.metodo === 'Deduções Legais') {
         html += `
            <div class="flex justify-between items-center py-2 border-b">
                <span>(-) Dependentes</span>
                <span class="font-semibold text-red-600">-${formatCurrency(data.deducaoDependentes)}</span>
            </div>
            <div class="flex justify-between items-center py-2">
                <span>(-) Outras Deduções</span>
                <span class="font-semibold text-red-600">-${formatCurrency(data.outrasDeducoesItens.pensaoAlimenticia + data.outrasDeducoesItens.despesasMedicas + data.outrasDeducoesItens.despesasEducacao + data.outrasDeducoesItens.previdenciaDedutivel)}</span>
            </div>`;
            if (data.pgblExcedeu) {
                html += `
                <div class="text-xs text-yellow-700 bg-yellow-100 p-2 rounded-md ml-4 -mt-1">
                    *Sua dedução de PGBL foi limitada a 12% da renda: ${formatCurrency(data.limitePGBL)}.
                </div>`;
            }
     } else {
          html += `
            <div class="flex justify-between items-center py-2 border-b">
                <span>(-) Desconto Simplificado</span>
                <span class="font-semibold text-red-600">-${formatCurrency(DESCONTO_SIMPLIFICADO_MENSAL)}</span>
            </div>`;
     }

    html += `
            <div class="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-2">
                <span class="font-bold text-gray-800">(=) Base de Cálculo do IRPF</span>
                <span class="font-bold text-lg text-blue-700">${formatCurrency(data.baseCalculo)}</span>
            </div>
        </div>
    `;

    const finalResultColor = isento ? 'text-green-600' : 'text-red-600';
     html += `
        <div class="mt-4 bg-gray-100 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-800 font-semibold">Imposto Mensal Devido (Estimativa):</p>
            <p class="text-2xl font-bold ${finalResultColor}">${formatCurrency(data.impostoDevido)}</p>
        </div>
    `;

    if (!isento) {
        const valorFaltante = data.baseCalculo - LIMITE_ISENCAO_TABELA;
        html += `
            <p class="text-center text-xs text-gray-500 mt-2">Para zerar o imposto, sua base de cálculo precisaria ser reduzida em ${formatCurrency(valorFaltante)}.</p>
        `;
    }

    const resultadoDiv = document.getElementById('resultado');
    const resultadoMobileDiv = document.getElementById('resultado-mobile');

    resultadoDiv.innerHTML = html;
    resultadoMobileDiv.innerHTML = html;
    resultadoDiv.classList.remove('hidden');
    resultadoMobileDiv.classList.remove('hidden');

    if(window.innerWidth >= 768) {
       resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

console.log('📱 main.js carregado e pronto!');
