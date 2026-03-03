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
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Payment configuration error' })
        };
    }

    const stripe = new Stripe(stripeSecretKey);

    try {
        const { success_url, cancel_url } = JSON.parse(event.body || '{}');

        if (!success_url || !cancel_url) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'success_url and cancel_url are required' })
            };
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Full Power Program',
                            description: 'Complete In-Season Power System: 6-week plan, 4-day split, video library, recovery playbook, and coaching support.',
                            metadata: { product: 'Full Power Program' }
                        },
                        unit_amount: 2700 // $27.00 in cents
                    },
                    quantity: 1
                }
            ],
            phone_number_collection: { enabled: true },
            billing_address_collection: 'required',
            success_url,
            cancel_url,
            metadata: { product: 'Full Power Program' }
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ url: session.url })
        };
    } catch (err) {
        console.error('Stripe Checkout Session error:', err);
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: err.message })
        };
    }
};
