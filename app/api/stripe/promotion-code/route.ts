import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const { code } = (await req.json()) as { code?: string };
        if (!code) {
            return NextResponse.json({ error: 'Missing code' }, { status: 400 });
        }

        const list = await stripe.promotionCodes.list({
            code,
            active: true,
            limit: 1,
            expand: ['data.promotion.coupon'],
        });
        const promo = list.data[0];

        if (!promo) {
            return NextResponse.json({ active: false });
        }

        const coupon = promo.promotion.coupon;
        if (!coupon || typeof coupon === 'string') {
            return NextResponse.json({ active: false });
        }

        return NextResponse.json({
            active: true,
            expiresAt: promo.expires_at ?? coupon.redeem_by ?? null, // unix seconds
            percentOff: coupon.percent_off ?? null,
            amountOff: coupon.amount_off ?? null,
            currency: coupon.currency ?? null,
        });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
