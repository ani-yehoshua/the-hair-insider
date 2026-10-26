import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getFoundingAvailability } from '@/lib/pricing/growthEditFounding';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function isStripeProduct(
    p: Stripe.Product | Stripe.DeletedProduct,
): p is Stripe.Product {
    // DeletedProduct has deleted: true and no name
    return !('deleted' in p) || p.deleted !== true;
}

export async function POST(req: Request) {
    try {
        const { priceId } = (await req.json()) as { priceId?: string };
        if (!priceId) {
            return NextResponse.json(
                { error: 'Missing priceId' },
                { status: 400 },
            );
        }

        const price = await stripe.prices.retrieve(priceId, {
            expand: ['product'],
        });

        let unitAmount = price.unit_amount ?? null;
        const currency = price.currency ?? 'usd';
        // Other pages that request the course's original $49 price must also
        // display $69 after the founding allocation is exhausted.
        const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
        const { data: growthEdit, error: courseError } = await admin.from('courses')
            .select('stripe_price_id').eq('slug', 'hair-growth-edit').maybeSingle();
        if (courseError) throw new Error('Could not verify current pricing.');
        if (growthEdit?.stripe_price_id === priceId) {
            unitAmount = (await getFoundingAvailability(admin, stripe, priceId)).unitAmount;
        }

        const productName =
            price.product &&
            typeof price.product === 'object' &&
            isStripeProduct(price.product)
                ? (price.product.name ?? null)
                : null;

        return NextResponse.json({
            unitAmount,
            currency,
            productName,
        });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
