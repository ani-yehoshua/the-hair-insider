import { loadStripe } from '@stripe/stripe-js';

// loadStripe must be called once outside any component render, per Stripe's
// own guidance, to avoid recreating the Stripe object on every render.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
