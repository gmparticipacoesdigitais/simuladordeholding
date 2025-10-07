// ============================================================================
// AUTH.JS - Refatorado para usar Realtime Database e firebase-config.js
// Sistema completo de autenticação com verificação de pagamento
// ============================================================================

import { firebaseConfig, stripeConfig } from './firebase-config.js';

// Inicializar Firebase
let auth, database;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    database = firebase.database();
    console.log('✅ Firebase inicializado com sucesso (Realtime Database)');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    alert('Erro ao inicializar Firebase. Verifique sua configuração.');
}

// Produtos Stripe
const STRIPE_PRODUCT_ID = stripeConfig.productId;
const STRIPE_PRICE_ID = stripeConfig.priceId;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Verifica se o usuário já pagou
 * @param {string} uid - ID do usuário
 * @returns {Promise<boolean>}
 */
async function checkUserPayment(uid) {
    try {
        const snapshot = await database.ref(`users/${uid}`).once('value');
        const userData = snapshot.val();

        console.log('📊 Dados do usuário:', userData);

        return userData && userData.hasPaid === true;
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

/**
 * Atualiza o lastLogin do usuário no Realtime Database
 * @param {string} uid - ID do usuário
 */
async function updateLastLogin(uid) {
    try {
        await database.ref(`users/${uid}`).update({
            lastLogin: firebase.database.ServerValue.TIMESTAMP
        });
        console.log('✅ lastLogin atualizado para o usuário:', uid);
    } catch (error) {
        console.error('❌ Erro ao atualizar lastLogin:', error);
    }
}

// ============================================================================
// VERIFICAR AUTENTICAÇÃO
// ============================================================================

auth.onAuthStateChanged(async (user) => {
    // Só redirecionar se não estiver na página de login ou registro
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (user && (currentPage === 'index.html' || currentPage === '')) {
        // Se o usuário está logado e na página inicial/login, atualiza o lastLogin
        await updateLastLogin(user.uid);
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

        const email = loginForm.querySelector('input[name="e-mail"]').value;
        const senha = loginForm.querySelector('input[name="senha"]').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Entrando...</span>';

        try {
            console.log('🔐 Tentando fazer login com:', email);
            const userCredential = await auth.signInWithEmailAndPassword(email, senha);
            console.log('✅ Login bem-sucedido!');

            await updateLastLogin(userCredential.user.uid);
            await checkPaymentAndRedirect(userCredential.user);
        } catch (error) {
            console.error('❌ Erro no login:', error);
            let errorMessage = 'Erro ao fazer login. Tente novamente.';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Usuário não encontrado. Verifique seu e-mail.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Senha incorreta. Tente novamente.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'E-mail inválido.';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'E-mail ou senha incorretos.';
            }

            alert(errorMessage);
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

            // Criar/atualizar documento do usuário no Realtime Database
            const userRef = database.ref(`users/${result.user.uid}`);
            const snapshot = await userRef.once('value');

            if (!snapshot.exists()) {
                console.log('📝 Criando novo usuário no database');
                await userRef.set({
                    email: result.user.email,
                    displayName: result.user.displayName,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    hasPaid: false,
                    provider: 'google',
                    lastLogin: firebase.database.ServerValue.TIMESTAMP
                });
            } else {
                console.log('✅ Usuário já existe no database');
                await updateLastLogin(result.user.uid);
            }

            await checkPaymentAndRedirect(result.user);
        } catch (error) {
            console.error('❌ Erro no login com Google:', error);
            alert('Erro ao fazer login com Google. Tente novamente.');
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

        const nome = registerForm.querySelector('input[name="nome"]').value;
        const email = registerForm.querySelector('input[name="email"]').value;
        const senha = registerForm.querySelector('input[name="senha"]').value;
        const confirmarSenha = registerForm.querySelector('input[name="confirmar-senha"]').value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem. Tente novamente.');
            return;
        }

        if (senha.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Criando conta...</span>';

        try {
            console.log('📝 Criando nova conta para:', email);
            const userCredential = await auth.createUserWithEmailAndPassword(email, senha);

            console.log('✅ Conta criada com sucesso!');
            console.log('📝 Salvando dados no Realtime Database...');

            // Criar documento do usuário no Realtime Database
            await database.ref(`users/${userCredential.user.uid}`).set({
                displayName: nome,
                email: email,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                hasPaid: false,
                provider: 'email',
                lastLogin: firebase.database.ServerValue.TIMESTAMP // Adicionar lastLogin no cadastro inicial
            });

            console.log('✅ Dados salvos com sucesso!');
            console.log('➡️ Redirecionando para checkout...');

            // Redirecionar para checkout
            window.location.href = `checkout.html?uid=${userCredential.user.uid}`;
        } catch (error) {
            console.error('❌ Erro no cadastro:', error);
            let errorMessage = 'Erro ao criar conta. Tente novamente.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este e-mail já está cadastrado. Faça login.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'E-mail inválido.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Senha muito fraca. Use no mínimo 6 caracteres.';
            }

            alert(errorMessage);
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

            // Criar documento do usuário no Realtime Database
            const userRef = database.ref(`users/${result.user.uid}`);
            const snapshot = await userRef.once('value');

            if (!snapshot.exists()) {
                console.log('📝 Criando novo usuário no database');
                await userRef.set({
                    email: result.user.email,
                    displayName: result.user.displayName,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    hasPaid: false,
                    provider: 'google',
                    lastLogin: firebase.database.ServerValue.TIMESTAMP
                });
            }

            await checkPaymentAndRedirect(result.user);
        } catch (error) {
            console.error('❌ Erro no cadastro com Google:', error);
            alert('Erro ao cadastrar com Google. Tente novamente.');
            googleRegisterBtn.disabled = false;
            googleRegisterBtn.textContent = 'Cadastrar com Google';
        }
    });
}

// Exportar funções para uso global
window.checkUserPayment = checkUserPayment;
window.checkPaymentAndRedirect = checkPaymentAndRedirect;
