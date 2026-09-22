import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
    return new Stripe(key);
}

// Only reached when a payment method required a redirect (Klarna, Amazon
// Pay, etc.) -- card payments complete inline via onComplete and never hit
// this route. The session_id in the URL isn't itself sensitive (it can't be
// used to charge anything), so no auth is required here, matching Stripe's
// own recommended return-page pattern.
export async function GET(req: Request) {
    const stripe = getStripe();
    try {
        const sessionId = new URL(req.url).searchParams.get('session_id');
        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session_id.' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return NextResponse.json({ status: session.status });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
