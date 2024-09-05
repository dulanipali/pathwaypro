import { loadStripe } from "@stripe/stripe-js";
//function to load stripe into our browser so user can pay 
let stripePromise

const getStripe = () => {
    if (!stripePromise) {
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
    }
    return stripePromise
}

export default getStripe