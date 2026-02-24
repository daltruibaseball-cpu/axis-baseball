const Stripe = require('stripe');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        console.error('STRIPE_SECRET_KEY is not set');
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Payment configuration error' })
        };
    }

    const stripe = new Stripe(stripeSecretKey);

    try {
        const { email, name } = JSON.parse(event.body || '{}');

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2700, // $27.00 in cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: {
                product: 'Full In-Season Power Program',
                customer_email: email || '',
                customer_name: name || ''
            },
            receipt_email: email || undefined
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                clientSecret: paymentIntent.client_secret
            })
        };
    } catch (err) {
        console.error('Stripe PaymentIntent error:', err);
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: err.message })
        };
    }
};
