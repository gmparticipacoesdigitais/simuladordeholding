// ============================================================================
// AUTH.JS - Sistema de autenticação com Firebase Data Connect + Stripe
// ============================================================================

import { firebaseConfig, stripeConfig } from './firebase-config.js';
import {
    upsertUser,
    checkPaymentStatus,
    updateUserLogin,
    createAuditLog
} from './dataconnect-integration.js';

// Inicializar Firebase
let auth;
let isFirebaseInitialized = false;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    isFirebaseInitialized = true;
    console.log('✅ Firebase inicializado com sucesso');
    console.log('🔑 Project ID:', firebaseConfig.projectId);
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    alert('❌ Erro ao inicializar Firebase. Verifique sua configuração e recarregue a página.');
}

// Verificar se Firebase está inicializado antes de qualquer operação
function checkFirebaseInit() {
    if (!isFirebaseInitialized || !auth) {
        throw new Error('Firebase não está inicializado');
    }
    return true;
}

// ============================================================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================================================

/**
 * Mostrar notificação visual na página
 * @param {string} message - Mensagem a exibir
 * @param {string} type - 'success', 'error', 'info', 'warning'
 */
function showNotification(message, type = 'info') {
    // Criar elemento de notificação se não existir
    let notification = document.getElementById('notification-toast');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification-toast';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            max-width: 500px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
    }

    // Definir cores baseado no tipo
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    notification.style.backgroundColor = colors[type] || colors.info;
    notification.innerHTML = `
        <span style="font-size: 20px;">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;
    notification.style.display = 'flex';

    // Adicionar animação CSS se não existir
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 5000);
}

// Produtos Stripe
const STRIPE_PRODUCT_ID = stripeConfig.productId;
const STRIPE_PRICE_ID = stripeConfig.priceId;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Verifica se o usuário já pagou usando Data Connect
 * @param {string} uid - ID do usuário
 * @returns {Promise<boolean>}
 */
async function checkUserPayment(uid) {
    try {
        const hasPaid = await checkPaymentStatus(uid);
        console.log('📊 Status de pagamento:', hasPaid ? 'PAGO' : 'PENDENTE');
        return hasPaid;
    } catch (error) {
        console.error('❌ Erro ao verificar pagamento:', error);
        return false;
    }
}

/**
 * Redireciona o usuário com base no status de pagamento
 * @param {Object} user - Objeto do usuário Firebase
 */
async function checkPaymentAndRedirect(user) {
    try {
        const hasPaid = await checkUserPayment(user.uid);
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        console.log(`✅ Usuário: ${user.email}`);
        console.log(`💳 Status de pagamento: ${hasPaid ? 'PAGO' : 'PENDENTE'}`);
        console.log(`📄 Página atual: ${currentPage}`);

        // Só redirecionar se estiver na página de login ou registro
        if (currentPage === 'index.html' || currentPage === '') {
            if (hasPaid) {
                console.log('➡️ Redirecionando para app.html');
                window.location.href = 'app.html';
            } else {
                console.log('➡️ Redirecionando para checkout.html');
                window.location.href = `checkout.html?uid=${user.uid}`;
            }
        }
    } catch (error) {
        console.error('❌ Erro ao verificar pagamento:', error);
        // Em caso de erro, redireciona para checkout por segurança
        window.location.href = `checkout.html?uid=${user.uid}`;
    }
}

// ============================================================================
// VERIFICAR AUTENTICAÇÃO
// ============================================================================

auth.onAuthStateChanged(async (user) => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (user && (currentPage === 'index.html' || currentPage === '')) {
        // Atualizar último login no Data Connect
        await updateUserLogin(user.uid);
        // Log de auditoria
        await createAuditLog(user.uid, 'LOGIN', `Login from ${currentPage}`);
        await checkPaymentAndRedirect(user);
    }
});

// ============================================================================
// LOGIN COM EMAIL E SENHA
// ============================================================================

const loginForm = document.getElementById('email-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector('input[name="e-mail"]').value.trim();
        const senha = loginForm.querySelector('input[name="senha"]').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        // Validação básica
        if (!email || !senha) {
            showNotification('Por favor, preencha todos os campos.', 'warning');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Entrando...</span>';

        try {
            checkFirebaseInit();
            console.log('🔐 Tentando fazer login com:', email);
            const userCredential = await auth.signInWithEmailAndPassword(email, senha);
            console.log('✅ Login bem-sucedido!');

            showNotification('Login realizado com sucesso!', 'success');

            await updateUserLogin(userCredential.user.uid);
            await createAuditLog(userCredential.user.uid, 'LOGIN_SUCCESS', `Email: ${email}`);

            // Pequeno delay para mostrar a notificação antes de redirecionar
            setTimeout(() => {
                checkPaymentAndRedirect(userCredential.user);
            }, 800);
        } catch (error) {
            console.error('❌ Erro no login:', error);
            console.error('Código do erro:', error.code);
            console.error('Mensagem do erro:', error.message);

            let errorMessage = 'Erro ao fazer login. Tente novamente.';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Usuário não encontrado. Verifique seu e-mail ou crie uma conta.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Senha incorreta. Tente novamente.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'E-mail inválido. Verifique o formato do e-mail.';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'E-mail ou senha incorretos. Verifique seus dados.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            }

            showNotification(errorMessage, 'error');
            await createAuditLog(email, 'LOGIN_FAILED', `Error: ${error.code} - ${error.message}`).catch(e => console.error('Erro ao registrar auditoria:', e));
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Entrar</span>';
        }
    });
}

// ============================================================================
// LOGIN COM GOOGLE
// ============================================================================

const googleLoginBtn = document.getElementById('google-login-btn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        googleLoginBtn.disabled = true;
        googleLoginBtn.textContent = 'Conectando...';

        try {
            console.log('🔐 Iniciando login com Google...');
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);

            console.log('✅ Login com Google bem-sucedido!');

            // Criar/atualizar usuário no Data Connect
            await upsertUser(
                result.user.email,
                result.user.displayName,
                'google'
            );

            await updateUserLogin(result.user.uid);
            await createAuditLog(result.user.uid, 'GOOGLE_LOGIN', `Email: ${result.user.email}`);
            await checkPaymentAndRedirect(result.user);
        } catch (error) {
            console.error('❌ Erro no login com Google:', error);
            showNotification('Erro ao fazer login com Google. Tente novamente.', 'error');
            googleLoginBtn.disabled = false;
            googleLoginBtn.textContent = 'Continuar com Google';
        }
    });
}

// ============================================================================
// CADASTRO COM EMAIL E SENHA
// ============================================================================

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = registerForm.querySelector('input[name="nome"]').value.trim();
        const email = registerForm.querySelector('input[name="email"]').value.trim();
        const senha = registerForm.querySelector('input[name="senha"]').value;
        const confirmarSenha = registerForm.querySelector('input[name="confirmar-senha"]').value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        // Validação
        if (!nome || !email || !senha || !confirmarSenha) {
            showNotification('Por favor, preencha todos os campos.', 'warning');
            return;
        }

        if (senha !== confirmarSenha) {
            showNotification('As senhas não coincidem. Tente novamente.', 'warning');
            return;
        }

        if (senha.length < 6) {
            showNotification('A senha deve ter no mínimo 6 caracteres.', 'warning');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Criando conta...</span>';

        try {
            checkFirebaseInit();
            console.log('📝 Criando nova conta para:', email);
            const userCredential = await auth.createUserWithEmailAndPassword(email, senha);

            console.log('✅ Conta criada com sucesso!');
            showNotification('Conta criada com sucesso! Redirecionando...', 'success');

            console.log('📝 Salvando dados no Data Connect...');

            // Criar usuário no Data Connect
            await upsertUser(email, nome, 'email');

            await updateUserLogin(userCredential.user.uid);
            await createAuditLog(userCredential.user.uid, 'REGISTER', `New user: ${email}`);

            console.log('✅ Dados salvos com sucesso!');
            console.log('➡️ Redirecionando para checkout...');

            // Redirecionar para checkout após 1 segundo
            setTimeout(() => {
                window.location.href = `checkout.html?uid=${userCredential.user.uid}`;
            }, 1000);
        } catch (error) {
            console.error('❌ Erro no cadastro:', error);
            console.error('Código do erro:', error.code);
            console.error('Mensagem do erro:', error.message);

            let errorMessage = 'Erro ao criar conta. Tente novamente.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este e-mail já está cadastrado. Faça login na página inicial.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'E-mail inválido. Verifique o formato do e-mail.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Senha muito fraca. Use no mínimo 6 caracteres.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            }

            showNotification(errorMessage, 'error');
            await createAuditLog(email, 'REGISTER_FAILED', `Error: ${error.code} - ${error.message}`).catch(e => console.error('Erro ao registrar auditoria:', e));
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Criar Conta</span>';
        }
    });
}

// ============================================================================
// CADASTRO COM GOOGLE
// ============================================================================

const googleRegisterBtn = document.getElementById('google-register-btn');
if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener('click', async () => {
        googleRegisterBtn.disabled = true;
        googleRegisterBtn.textContent = 'Conectando...';

        try {
            console.log('📝 Iniciando cadastro com Google...');
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);

            console.log('✅ Cadastro com Google bem-sucedido!');

            // Criar usuário no Data Connect
            await upsertUser(
                result.user.email,
                result.user.displayName,
                'google'
            );

            await updateUserLogin(result.user.uid);
            await createAuditLog(result.user.uid, 'GOOGLE_REGISTER', `Email: ${result.user.email}`);
            await checkPaymentAndRedirect(result.user);
        } catch (error) {
            console.error('❌ Erro no cadastro com Google:', error);
            showNotification('Erro ao cadastrar com Google. Tente novamente.', 'error');
            googleRegisterBtn.disabled = false;
            googleRegisterBtn.textContent = 'Cadastrar com Google';
        }
    });
}

// Exportar funções para uso global
window.checkUserPayment = checkUserPayment;
window.checkPaymentAndRedirect = checkPaymentAndRedirect;
