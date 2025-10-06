// Usar configuração centralizada do Firebase
const firebaseConfig = window.FIREBASE_CONFIG;

// Verificar se Firebase está configurado antes de inicializar
if (!window.isFirebaseConfigured || !window.isFirebaseConfigured()) {
    const setupFirebase = confirm(
        '⚠️ Firebase não está configurado!\n\n' +
        'Para usar esta aplicação, você precisa configurar o Firebase.\n\n' +
        'Deseja configurar agora?'
    );

    if (setupFirebase) {
        const apiKey = prompt('Digite sua Firebase API Key:');
        const authDomain = prompt('Digite seu Firebase Auth Domain (ex: projeto.firebaseapp.com):');
        const projectId = prompt('Digite seu Firebase Project ID:');
        const storageBucket = prompt('Digite seu Firebase Storage Bucket (ex: projeto.appspot.com):');
        const messagingSenderId = prompt('Digite seu Firebase Messaging Sender ID:');
        const appId = prompt('Digite seu Firebase App ID:');

        if (apiKey && authDomain && projectId && storageBucket && messagingSenderId && appId) {
            localStorage.setItem('FIREBASE_API_KEY', apiKey);
            localStorage.setItem('FIREBASE_AUTH_DOMAIN', authDomain);
            localStorage.setItem('FIREBASE_PROJECT_ID', projectId);
            localStorage.setItem('FIREBASE_STORAGE_BUCKET', storageBucket);
            localStorage.setItem('FIREBASE_MESSAGING_SENDER_ID', messagingSenderId);
            localStorage.setItem('FIREBASE_APP_ID', appId);

            alert('✅ Configuração salva! Recarregando a página...');
            window.location.reload();
        }
    }
}

// Inicializar Firebase
let auth, db;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.firestore();
    console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    alert('Erro ao inicializar Firebase. Verifique sua configuração.');
}

// Produtos Stripe
const STRIPE_PRODUCT_ID = window.STRIPE_PRODUCT_ID;
const STRIPE_PRICE_ID = window.STRIPE_PRICE_ID;

// Verificar se usuário já está autenticado
auth.onAuthStateChanged(async (user) => {
    // Só redirecionar se não estiver na página de login ou registro
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (user && (currentPage === 'index.html' || currentPage === '')) {
        await checkPaymentAndRedirect(user);
    }
});

// Função para verificar pagamento e redirecionar
async function checkPaymentAndRedirect(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (userDoc.exists && userDoc.data().hasPaid) {
            // Usuário já pagou, vai para a aplicação
            window.location.href = 'app.html';
        } else {
            // Usuário precisa pagar
            window.location.href = `checkout.html?uid=${user.uid}`;
        }
    } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        // Em caso de erro, redireciona para checkout por segurança
        window.location.href = `checkout.html?uid=${user.uid}`;
    }
}

// Login com email e senha
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
            const userCredential = await auth.signInWithEmailAndPassword(email, senha);
            await checkPaymentAndRedirect(userCredential.user);
        } catch (error) {
            console.error('Erro no login:', error);
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

// Login com Google
const googleLoginBtn = document.getElementById('google-login-btn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        googleLoginBtn.disabled = true;
        googleLoginBtn.textContent = 'Conectando...';

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);

            // Criar documento do usuário se não existir
            const userDocRef = db.collection('users').doc(result.user.uid);
            const userDoc = await userDocRef.get();

            if (!userDoc.exists) {
                await userDocRef.set({
                    email: result.user.email,
                    displayName: result.user.displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    hasPaid: false
                });
            }

            await checkPaymentAndRedirect(result.user);
        } catch (error) {
            console.error('Erro no login com Google:', error);
            alert('Erro ao fazer login com Google. Tente novamente.');
            googleLoginBtn.disabled = false;
            googleLoginBtn.textContent = 'Continuar com Google';
        }
    });
}

// Cadastro com email e senha
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
            const userCredential = await auth.createUserWithEmailAndPassword(email, senha);

            // Criar documento do usuário no Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                displayName: nome,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                hasPaid: false
            });

            // Redirecionar para checkout
            window.location.href = `checkout.html?uid=${userCredential.user.uid}`;
        } catch (error) {
            console.error('Erro no cadastro:', error);
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

// Cadastro com Google
const googleRegisterBtn = document.getElementById('google-register-btn');
if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener('click', async () => {
        googleRegisterBtn.disabled = true;
        googleRegisterBtn.textContent = 'Conectando...';

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);

            // Criar documento do usuário
            const userDocRef = db.collection('users').doc(result.user.uid);
            const userDoc = await userDocRef.get();

            if (!userDoc.exists) {
                await userDocRef.set({
                    email: result.user.email,
                    displayName: result.user.displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    hasPaid: false
                });
            }

            await checkPaymentAndRedirect(result.user);
        } catch (error) {
            console.error('Erro no cadastro com Google:', error);
            alert('Erro ao cadastrar com Google. Tente novamente.');
            googleRegisterBtn.disabled = false;
            googleRegisterBtn.textContent = 'Cadastrar com Google';
        }
    });
}
