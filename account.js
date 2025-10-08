// ============================================================================
// ACCOUNT.JS - Gerenciamento de Conta e Assinatura
// Sistema completo de visualização e gerenciamento de assinatura
// ============================================================================

import { firebaseConfig, cloudFunctionUrl } from './firebase-config.js';

// Inicializar Firebase
let auth, database;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    database = firebase.database();
    console.log('✅ Firebase inicializado no gerenciamento de conta');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

// ============================================================================
// ELEMENTOS DO DOM
// ============================================================================

const loadingState = document.getElementById('loading-state');
const accountContent = document.getElementById('account-content');
const alertContainer = document.getElementById('alert-container');

const userEmailEl = document.getElementById('user-email');
const userIdEl = document.getElementById('user-id');
const subscriptionStatusEl = document.getElementById('subscription-status');
const periodEndEl = document.getElementById('period-end');
const cancelDateEl = document.getElementById('cancel-date');
const paymentStatusEl = document.getElementById('payment-status');

const btnPortal = document.getElementById('btn-portal');
const btnCancel = document.getElementById('btn-cancel');
const dangerZone = document.getElementById('danger-zone');
const rowCancelDate = document.getElementById('row-cancel-date');

// ============================================================================
// ALERTAS
// ============================================================================

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    alert.style.display = 'block';

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    // Auto-remover após 5 segundos
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// ============================================================================
// FORMATAÇÃO DE DATAS
// ============================================================================

function formatDate(dateString) {
    if (!dateString) return '-';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return '-';
    }
}

// ============================================================================
// STATUS BADGE
// ============================================================================

function getStatusBadge(status) {
    const statusMap = {
        'active': { label: 'Ativa', class: 'status-active' },
        'trialing': { label: 'Trial', class: 'status-active' },
        'canceled': { label: 'Cancelada', class: 'status-canceled' },
        'incomplete': { label: 'Incompleta', class: 'status-inactive' },
        'incomplete_expired': { label: 'Expirada', class: 'status-inactive' },
        'past_due': { label: 'Atrasada', class: 'status-inactive' },
        'unpaid': { label: 'Não Paga', class: 'status-inactive' }
    };

    const statusInfo = statusMap[status] || { label: status || 'Inativa', class: 'status-inactive' };
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>`;
}

// ============================================================================
// CARREGAR INFORMAÇÕES DA CONTA
// ============================================================================

async function loadAccountInfo(userId) {
    try {
        console.log('📊 Buscando informações da conta...');

        const response = await fetch(`${cloudFunctionUrl}/getSubscriptionStatus?userId=${userId}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar status da assinatura');
        }

        const data = await response.json();
        console.log('✅ Dados recebidos:', data);

        return data;
    } catch (error) {
        console.error('❌ Erro ao carregar informações:', error);
        throw error;
    }
}

// ============================================================================
// RENDERIZAR INFORMAÇÕES DA CONTA
// ============================================================================

function renderAccountInfo(user, data) {
    // Informações do usuário
    userEmailEl.textContent = user.email;
    userIdEl.textContent = user.uid;

    // Status da assinatura
    const subscription = data.subscription || {};
    const userInfo = data.user || {};

    subscriptionStatusEl.innerHTML = getStatusBadge(userInfo.subscriptionStatus);

    if (subscription.currentPeriodEnd) {
        periodEndEl.textContent = formatDate(subscription.currentPeriodEnd);
    } else {
        periodEndEl.textContent = '-';
    }

    // Mostrar data de cancelamento se aplicável
    if (subscription.cancelAtPeriodEnd && subscription.cancelAt) {
        rowCancelDate.style.display = 'flex';
        cancelDateEl.textContent = formatDate(subscription.cancelAt);
    } else {
        rowCancelDate.style.display = 'none';
    }

    // Status do último pagamento
    const paymentStatusMap = {
        'paid': '✅ Pago',
        'failed': '❌ Falhou',
        'pending': '⏳ Pendente'
    };
    paymentStatusEl.textContent = paymentStatusMap[userInfo.lastPaymentStatus] || '-';

    // Gerenciar visibilidade dos botões
    const hasActiveSubscription = userInfo.hasPaid && userInfo.subscriptionId;

    if (!hasActiveSubscription) {
        dangerZone.style.display = 'none';
        btnPortal.innerHTML = '<i class="fas fa-shopping-cart"></i> Assinar Agora';
        btnPortal.onclick = () => window.location.href = 'checkout.html';
    } else {
        dangerZone.style.display = 'block';

        // Se já está cancelada, esconder botão de cancelar
        if (subscription.cancelAtPeriodEnd || userInfo.subscriptionStatus === 'canceled') {
            btnCancel.disabled = true;
            btnCancel.textContent = 'Já Cancelada';
        }
    }
}

// ============================================================================
// CRIAR SESSÃO DO PORTAL DE COBRANÇA
// ============================================================================

async function openBillingPortal(userId) {
    try {
        btnPortal.disabled = true;
        btnPortal.innerHTML = '<span class="loading-spinner"></span> Abrindo portal...';

        console.log('🔗 Criando sessão do portal...');

        const response = await fetch(`${cloudFunctionUrl}/createPortalSession`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.error || 'Erro ao criar portal');
        }

        const data = await response.json();
        console.log('✅ Portal criado:', data.url);

        // Redirecionar para o portal
        window.location.href = data.url;

    } catch (error) {
        console.error('❌ Erro ao abrir portal:', error);
        showAlert(error.message, 'error');

        btnPortal.disabled = false;
        btnPortal.innerHTML = '<i class="fas fa-external-link-alt"></i> Acessar Portal de Cobrança';
    }
}

// ============================================================================
// CANCELAR ASSINATURA
// ============================================================================

async function cancelSubscription(userId) {
    const confirmed = confirm(
        'Tem certeza que deseja cancelar sua assinatura?\n\n' +
        'Você ainda terá acesso até o final do período de cobrança atual.'
    );

    if (!confirmed) return;

    try {
        btnCancel.disabled = true;
        btnCancel.innerHTML = '<span class="loading-spinner"></span> Cancelando...';

        console.log('🚫 Cancelando assinatura...');

        const response = await fetch(`${cloudFunctionUrl}/cancelSubscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                immediate: false
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.error || 'Erro ao cancelar');
        }

        const data = await response.json();
        console.log('✅ Assinatura cancelada:', data);

        showAlert('Assinatura cancelada com sucesso. Você terá acesso até ' + formatDate(data.subscription.cancelAt), 'success');

        // Recarregar informações
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error('❌ Erro ao cancelar:', error);
        showAlert(error.message, 'error');

        btnCancel.disabled = false;
        btnCancel.innerHTML = 'Cancelar';
    }
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        console.log('❌ Usuário não autenticado');
        window.location.href = 'index.html';
        return;
    }

    console.log('✅ Usuário autenticado:', user.email);

    try {
        // Carregar informações da conta
        const accountData = await loadAccountInfo(user.uid);

        // Renderizar informações
        renderAccountInfo(user, accountData);

        // Configurar event listeners
        btnPortal.addEventListener('click', () => {
            if (accountData.user.stripeCustomerId) {
                openBillingPortal(user.uid);
            } else {
                window.location.href = 'checkout.html';
            }
        });

        btnCancel.addEventListener('click', () => cancelSubscription(user.uid));

        // Esconder loading e mostrar conteúdo
        loadingState.style.display = 'none';
        accountContent.style.display = 'block';

    } catch (error) {
        console.error('❌ Erro ao carregar conta:', error);

        loadingState.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 48px; margin-bottom: 16px;"></i>
            <p>Erro ao carregar informações da conta</p>
            <button class="btn-outline" onclick="window.location.reload()" style="margin-top: 16px;">
                Tentar Novamente
            </button>
        `;
    }
});

// ============================================================================
// LISTENER PARA MUDANÇAS NO BANCO
// ============================================================================

auth.onAuthStateChanged((user) => {
    if (user) {
        // Observar mudanças nos dados do usuário
        database.ref(`users/${user.uid}`).on('value', (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                console.log('🔄 Dados atualizados em tempo real:', userData);
                // Poderia recarregar a UI aqui se necessário
            }
        });
    }
});
