import 'server-only';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
    return new Stripe(key);
}

// None of these have a foreign key to auth.users (confirmed by inspecting
// the schema), so deleting the auth user alone leaves every one of these
// orphaned -- each must be deleted explicitly.
const USER_ID_TABLES = ['entitlements', 'growth_edit_assessments', 'guide_progress', 'hair_profiles'] as const;
const EMAIL_KEYED_TABLES = ['pending_entitlements', 'pending_growth_edit_assessments'] as const;

type DeleteResult = {
    email: string;
    supabase: {
        userId: string | null;
        tablesDeleted: Record<string, number>;
        authUserDeleted: boolean;
        error?: string;
    };
    stripe: { customersDeleted: string[]; error?: string };
    resend: { deleted: boolean; error?: string };
};

// Admin-only, and deliberately destructive across three live external
// systems (Supabase, Stripe, Resend) -- built for cleaning up test
// purchases (e.g. you+test123@gmail.com), not for general customer
// deletion. Requires the "+" test-address convention unless explicitly
// overridden, so a typo'd email can't silently erase a real customer's
// account and purchase history.
export async function POST(req: Request) {
    const authRes = await requireAdminFromRequest(req);
    if (!authRes.ok) {
        return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const { email, confirmNonTestEmail } = (await req.json()) as {
        email?: string;
        confirmNonTestEmail?: boolean;
    };

    if (!email) {
        return NextResponse.json({ error: 'Missing email.' }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes('+') && !confirmNonTestEmail) {
        return NextResponse.json(
            {
                error: `"${normalizedEmail}" doesn't look like a test address (no "+" tag). Pass confirmNonTestEmail: true to delete it anyway.`,
            },
            { status: 400 },
        );
    }

    const result: DeleteResult = {
        email: normalizedEmail,
        supabase: { userId: null, tablesDeleted: {}, authUserDeleted: false },
        stripe: { customersDeleted: [] },
        resend: { deleted: false },
    };

    // --- Supabase ---
    try {
        const { data: rows } = await admin.rpc('get_user_id_by_email', { p_email: normalizedEmail });
        const userId: string | null = rows?.[0]?.id ?? null;
        result.supabase.userId = userId;

        if (userId) {
            for (const table of USER_ID_TABLES) {
                const { error, count } = await admin.from(table).delete({ count: 'exact' }).eq('user_id', userId);
                if (error) throw new Error(`${table}: ${error.message}`);
                result.supabase.tablesDeleted[table] = count ?? 0;
            }

            const { error: stripeRowErr, count: stripeRowCount } = await admin
                .from('stripe')
                .delete({ count: 'exact' })
                .eq('id', userId);
            if (stripeRowErr) throw new Error(`stripe: ${stripeRowErr.message}`);
            result.supabase.tablesDeleted.stripe = stripeRowCount ?? 0;
        }

        for (const table of EMAIL_KEYED_TABLES) {
            const { error, count } = await admin
                .from(table)
                .delete({ count: 'exact' })
                .ilike('email', normalizedEmail);
            if (error) throw new Error(`${table}: ${error.message}`);
            result.supabase.tablesDeleted[table] = count ?? 0;
        }

        if (userId) {
            const { error: deleteUserErr } = await admin.auth.admin.deleteUser(userId);
            if (deleteUserErr) throw new Error(`auth user: ${deleteUserErr.message}`);
            result.supabase.authUserDeleted = true;
        }
    } catch (err) {
        result.supabase.error = err instanceof Error ? err.message : 'Unknown Supabase error';
    }

    // --- Stripe ---
    try {
        const stripe = getStripe();
        const customers = await stripe.customers.list({ email: normalizedEmail, limit: 100 });
        for (const customer of customers.data) {
            await stripe.customers.del(customer.id);
            result.stripe.customersDeleted.push(customer.id);
        }
    } catch (err) {
        result.stripe.error = err instanceof Error ? err.message : 'Unknown Stripe error';
    }

    // --- Resend ---
    try {
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const { error } = await resend.contacts.remove({ email: normalizedEmail });
        if (error) throw new Error(error.message);
        result.resend.deleted = true;
    } catch (err) {
        result.resend.error = err instanceof Error ? err.message : 'Unknown Resend error';
    }

    return NextResponse.json(result);
}
