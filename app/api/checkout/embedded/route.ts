import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
        const { courseSlug } = (await req.json()) as { courseSlug?: string };
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

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-hair-insider.com';

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            mode: 'payment',
            line_items: [{ price: course.stripe_price_id, quantity: 1 }],
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
