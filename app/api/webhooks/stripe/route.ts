import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

async function addMailchimpTag(email: string) {
    const apiKey = process.env.MAILCHIMP_API_KEY!;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID!;
    const prefix = process.env.MAILCHIMP_SERVER_PREFIX!;

    const emailHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

    const res = await fetch(
        `https://${prefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${emailHash}/tags`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tags: [{ name: 'course-purchased', status: 'active' }],
            }),
        },
    );

    if (!res.ok) {
        const text = await res.text();
        console.error('Mailchimp tag failed:', text);
    }
}

export async function POST(req: Request) {
    const sig = req.headers.get('stripe-signature');
    if (!sig) {
        return NextResponse.json(
            { error: 'Missing signature' },
            { status: 400 },
        );
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch {
        return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 },
        );
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const course_id = session.metadata?.course_id;
        const user_id = session.metadata?.user_id;

        if (!course_id || !user_id) {
            return NextResponse.json(
                { error: 'Missing metadata' },
                { status: 400 },
            );
        }

        const stripeCustomerId =
            typeof session.customer === 'string' ? session.customer : null;
        const stripePaymentIntentId =
            typeof session.payment_intent === 'string'
                ? session.payment_intent
                : null;

        // Resolve all course IDs to grant — for bundles, include component courses
        const courseIdsToGrant = [course_id];

        const { data: purchasedCourse } = await admin
            .from('courses')
            .select('slug')
            .eq('id', course_id)
            .maybeSingle();

        if (purchasedCourse?.slug === 'hair-growth-bundle') {
            const { data: components } = await admin
                .from('courses')
                .select('id')
                .in('slug', [
                    'hair-growth-foundations-mini-course',
                    '21-day-workbook',
                ]);
            for (const c of components ?? []) courseIdsToGrant.push(c.id);
        }

        const entitlements = courseIdsToGrant.map(cid => ({
            user_id,
            course_id: cid,
            status: 'active',
            stripe_customer_id: stripeCustomerId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: stripePaymentIntentId,
        }));

        const { error } = await admin
            .from('entitlements')
            .upsert(entitlements, { onConflict: 'user_id,course_id' });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Tag in Mailchimp — non-blocking, don't fail the webhook if this errors
        try {
            const { data: userData } =
                await admin.auth.admin.getUserById(user_id);
            if (userData.user?.email) {
                await addMailchimpTag(userData.user.email);
            }
        } catch (e) {
            console.error('Mailchimp tagging error:', e);
        }

        return NextResponse.json({ received: true });
    }

    if (event.type === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge;

        const paymentIntentId =
            typeof charge.payment_intent === 'string'
                ? charge.payment_intent
                : null;

        if (!paymentIntentId) {
            return NextResponse.json({ received: true });
        }

        const shouldRevoke =
            (charge.amount_refunded ?? 0) >= (charge.amount ?? 0);

        if (shouldRevoke) {
            const { error } = await admin
                .from('entitlements')
                .update({ status: 'refunded' })
                .eq('stripe_payment_intent_id', paymentIntentId);

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 },
                );
            }
        }

        return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
}
