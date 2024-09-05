import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const referer = req.headers.get('referer');
    const origin = referer ? new URL(referer).origin : 'http://localhost:3000'; // Default to localhost for development

    const { userId, plan } = await req.json(); // Modify this based on your implementation

    const formatAmountForStripe = (amount) => Math.round(amount * 100);

    const params = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Pro Subscription",
            },
            unit_amount: formatAmountForStripe(10), // $10 in cents
            recurring: {
              interval: "month",
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
    console.log('Checkout session created:', checkoutSession);  // Debugging log
    return NextResponse.json(checkoutSession, { status: 200 });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);  // Detailed error log
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
