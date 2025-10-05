import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Configuração do Firebase - substituir com suas credenciais
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Produtos Stripe
const STRIPE_PRODUCT_ID = 'prod_TAfijhTULkKnag';
const STRIPE_PRICE_ID = 'price_1SEKNFIPGzIfZaTDXox4NygH';

// Verificar se usuário já está autenticado
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await checkPaymentAndRedirect(user);
    }
});

// Função para verificar pagamento e redirecionar
async function checkPaymentAndRedirect(user) {
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists() && userDoc.data().hasPaid) {
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
            const userCredential = await signInWithEmailAndPassword(auth, email, senha);
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
            const result = await signInWithPopup(auth, googleProvider);

            // Criar documento do usuário se não existir
            const userDocRef = doc(db, 'users', result.user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: result.user.email,
                    displayName: result.user.displayName,
                    createdAt: new Date().toISOString(),
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

            // Criar documento do usuário no Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                displayName: nome,
                email: email,
                createdAt: new Date().toISOString(),
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
            const result = await signInWithPopup(auth, googleProvider);

            // Criar documento do usuário
            const userDocRef = doc(db, 'users', result.user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: result.user.email,
                    displayName: result.user.displayName,
                    createdAt: new Date().toISOString(),
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
