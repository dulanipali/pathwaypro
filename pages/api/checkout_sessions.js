import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const referer = req.headers.referer;
      const origin = referer ? new URL(referer).origin : 'http://localhost:3000'; // Default to localhost for development

      const { userId, plan } = req.body; // Modify this based on your implementation

      const formatAmountForStripe = (amount) => Math.round(amount * 100);

      const params = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Premium Tier',
              },
              unit_amount: formatAmountForStripe(5), // $10 in cents
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          userId: userId, // Store the user's ID in the session metadata
          plan: plan, // Store the selected plan in the session metadata
        },
      };

      const checkoutSession = await stripe.checkout.sessions.create(params);
      console.log('Checkout session created:', checkoutSession); // Debugging log

      res.status(200).json(checkoutSession);
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error); // Detailed error log
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
