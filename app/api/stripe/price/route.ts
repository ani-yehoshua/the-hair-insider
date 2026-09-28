import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { GROWTH_EDIT_PRICE_CENTS, GROWTH_EDIT_SLUG } from '@/lib/pricing/growthEdit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

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

        const { data: growthEdit, error: courseError } = await admin
            .from('courses')
            .select('stripe_price_id')
            .eq('slug', GROWTH_EDIT_SLUG)
            .maybeSingle();
        if (courseError) throw courseError;

        const isGrowthEditPrice = growthEdit?.stripe_price_id === priceId;
        if (isGrowthEditPrice && (price.currency !== 'usd' || price.type !== 'one_time')) {
            throw new Error('The Growth Edit requires a one-time USD Stripe product.');
        }
        // Display the same $49 offer that both checkout routes actually charge.
        const unitAmount = isGrowthEditPrice
            ? GROWTH_EDIT_PRICE_CENTS
            : price.unit_amount ?? null;
        const currency = price.currency ?? 'usd';

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
