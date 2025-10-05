const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();

// IDs do produto e preço do Stripe
const STRIPE_PRICE_ID = 'price_1SEKNFIPGzIfZaTDXox4NygH';

// Criar sessão de checkout do Stripe
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
    // Habilitar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const { priceId, userId, userEmail } = req.body;

        if (!userId || !userEmail) {
            res.status(400).send('Dados incompletos');
            return;
        }

        // Criar sessão de checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId || STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            customer_email: userEmail,
            metadata: {
                userId: userId,
            },
            success_url: `${req.headers.origin || 'http://localhost'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin || 'http://localhost'}/checkout.html`,
        });

        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        res.status(500).send('Erro ao criar sessão de checkout');
    }
});

// Webhook do Stripe para processar eventos
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
        console.error('Erro ao verificar webhook:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Processar eventos do Stripe
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const userId = session.metadata.userId;

            if (userId && session.payment_status === 'paid') {
                try {
                    // Atualizar o documento do usuário no Firestore
                    await admin.firestore().collection('users').doc(userId).set({
                        hasPaid: true,
                        stripeCustomerId: session.customer,
                        subscriptionId: session.subscription,
                        paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true });

                    console.log(`Pagamento confirmado para usuário ${userId}`);
                } catch (error) {
                    console.error('Erro ao atualizar usuário:', error);
                }
            }
            break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const subscription = event.data.object;

            try {
                // Buscar usuário pelo customer ID
                const usersSnapshot = await admin.firestore()
                    .collection('users')
                    .where('stripeCustomerId', '==', subscription.customer)
                    .limit(1)
                    .get();

                if (!usersSnapshot.empty) {
                    const userDoc = usersSnapshot.docs[0];
                    const isActive = subscription.status === 'active';

                    await userDoc.ref.update({
                        hasPaid: isActive,
                        subscriptionStatus: subscription.status,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });

                    console.log(`Assinatura atualizada: ${subscription.status}`);
                }
            } catch (error) {
                console.error('Erro ao atualizar assinatura:', error);
            }
            break;

        case 'invoice.payment_failed':
            const invoice = event.data.object;
            console.log('Pagamento falhou:', invoice.customer);
            // Aqui você pode enviar um email ao usuário notificando sobre a falha
            break;

        default:
            console.log(`Evento não tratado: ${event.type}`);
    }

    res.status(200).json({ received: true });
});
