import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getGrowthEditOffer } from '@/lib/pricing/growthEditFounder';

function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
    return new Stripe(key);
}

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

// Unauthenticated by design: purchases made signed-out are matched to an
// account by email once one exists, via pending_entitlements (the same
// mechanism the existing Payment Links already rely on -- see
// app/api/webhooks/stripe/route.ts and lib/entitlements/claimPending.ts).
// Requiring sign-in before this route would defeat the point of embedding
// checkout in the first place.
export async function POST(req: Request) {
    const stripe = getStripe();
    try {
        const { courseSlug, expectedUnitAmount, email } = (await req.json()) as {
            courseSlug?: string;
            expectedUnitAmount?: number;
            email?: string;
        };
        // The email asked for before payment pre-fills Stripe's email field, so
        // the receipt and the account that claims the purchase use it.
        const customerEmail =
            typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                ? email.trim().toLowerCase()
                : undefined;
        if (!courseSlug) {
            return NextResponse.json({ error: 'Missing courseSlug.' }, { status: 400 });
        }

        const { data: course, error: courseErr } = await admin
            .from('courses')
            .select('id, stripe_price_id, is_published')
            .eq('slug', courseSlug)
            .eq('is_published', true)
            .maybeSingle();

        if (courseErr || !course || !course.stripe_price_id) {
            return NextResponse.json(
                { error: 'Course not found or not purchasable.' },
                { status: 404 },
            );
        }

        // The Growth Edit's founder price is a Stripe promo code applied here,
        // server-side, so the buyer is charged exactly what the page showed.
        // If their screen is out of date (the price changed since it loaded),
        // refuse rather than quietly charge a different amount.
        let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
        if (courseSlug === 'hair-growth-edit') {
            const offer = await getGrowthEditOffer(stripe, course.stripe_price_id);
            if (typeof expectedUnitAmount === 'number' && expectedUnitAmount !== offer.unitAmount) {
                return NextResponse.json(
                    { error: 'The price has changed. Please refresh to see the current price.', code: 'PRICE_CHANGED' },
                    { status: 409 },
                );
            }
            if (offer.promotionCodeId) discounts = [{ promotion_code: offer.promotionCodeId }];
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-hair-insider.com';

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded_page',
            mode: 'payment',
            line_items: [{ price: course.stripe_price_id, quantity: 1 }],
            ...(discounts ? { discounts } : {}),
            ...(customerEmail ? { customer_email: customerEmail } : {}),
            // 'if_required' keeps card completing inline (no navigation),
            // but still allows methods that can't complete without one
            // (Klarna, Amazon Pay, etc.) -- 'never' would silently drop
            // every one of those from the checkout entirely instead of
            // erroring, which is the opposite of what we want here.
            redirect_on_completion: 'if_required',
            return_url: `${siteUrl}/hair-growth-edit?checkout_session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                course_id: course.id,
            },
        });

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
