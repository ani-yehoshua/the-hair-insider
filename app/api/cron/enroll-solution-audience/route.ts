import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { startReengagement } from '@/lib/email/resendReengagement';

export const runtime = 'nodejs';
export const maxDuration = 300;

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);
const resend = new Resend(process.env.RESEND_API_KEY!);

// Starts the Re-engagement automation for the contacts that were already in
// Resend when the Solution Sequence launched, a day at a time so a cold list
// isn't mailed all at once. Contacts who click "keep me on the list" are then
// enrolled in the Solution Sequence by the Resend webhook
// (/api/webhooks/resend); this job never sends them sales emails directly.
// The first run snapshots the audience into solution_enrollment_queue; after
// that it only works through that queue, newest signups first, so contacts who
// join later are not pulled in. A contact is never started twice (the queue
// row guards it), and unsubscribed contacts, buyers and anyone already in the
// Solution Sequence are skipped.
//
// To pause: remove the cron entry in vercel.json, or set attempts = 3 on the
// pending rows. To resume: set attempts = 0 on them and restore the entry.
const DAILY_LIMIT = 200;
const MAX_ATTEMPTS = 3;
// Resend allows 10 requests/second; each enrollment makes about three calls.
const PACE_MS = 350;
const TIME_BUDGET_MS = 240_000;
const MAX_CONSECUTIVE_ERRORS = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedQueueIfEmpty() {
    const { count, error } = await admin
        .from('solution_enrollment_queue')
        .select('email', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    if ((count ?? 0) > 0) return 0;

    const rows: { email: string; contact_id: string; contact_created_at: string }[] = [];
    let after: string | undefined;
    for (;;) {
        const { data, error: listError } = await resend.contacts.list({ limit: 100, ...(after ? { after } : {}) });
        if (listError || !data) throw new Error(`Resend list failed: ${listError?.message}`);
        for (const contact of data.data) {
            if (contact.unsubscribed) continue;
            rows.push({
                email: contact.email.trim().toLowerCase(),
                contact_id: contact.id,
                contact_created_at: contact.created_at,
            });
        }
        if (!data.has_more) break;
        after = data.data.at(-1)!.id;
        await sleep(120);
    }

    for (let i = 0; i < rows.length; i += 500) {
        const { error: insertError } = await admin
            .from('solution_enrollment_queue')
            .upsert(rows.slice(i, i + 500), { onConflict: 'email', ignoreDuplicates: true });
        if (insertError) throw new Error(insertError.message);
    }
    return rows.length;
}

async function nextPending(limit: number) {
    const { data, error } = await admin
        .from('solution_enrollment_queue')
        .select('email')
        .is('enrolled_at', null)
        .lt('attempts', MAX_ATTEMPTS)
        .order('contact_created_at', { ascending: false })
        .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => row.email as string);
}

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = new URL(req.url).searchParams;
    const dryRun = params.get('dryRun') === '1';
    // ?limit=N lets a manual run enroll just a few contacts as a first check.
    const requested = Number(params.get('limit'));
    const limit = Number.isInteger(requested) && requested > 0 ? Math.min(requested, DAILY_LIMIT) : DAILY_LIMIT;
    const startedAt = Date.now();

    try {
        const seeded = await seedQueueIfEmpty();

        if (dryRun) {
            const { count } = await admin
                .from('solution_enrollment_queue')
                .select('email', { count: 'exact', head: true })
                .is('enrolled_at', null);
            return NextResponse.json({ dryRun: true, seeded, pending: count ?? 0, wouldEnrollToday: Math.min(count ?? 0, DAILY_LIMIT) });
        }

        const outcomes: Record<string, number> = {};
        let processed = 0;
        let consecutiveErrors = 0;

        while (processed < limit && Date.now() - startedAt < TIME_BUDGET_MS && consecutiveErrors < MAX_CONSECUTIVE_ERRORS) {
            const batch = await nextPending(Math.min(25, limit - processed));
            if (batch.length === 0) break;

            for (const email of batch) {
                if (Date.now() - startedAt >= TIME_BUDGET_MS || consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) break;

                const outcome = await startReengagement(email);
                outcomes[outcome] = (outcomes[outcome] ?? 0) + 1;

                if (outcome === 'error') {
                    consecutiveErrors++;
                    const { data: row } = await admin
                        .from('solution_enrollment_queue')
                        .select('attempts')
                        .eq('email', email)
                        .maybeSingle();
                    await admin
                        .from('solution_enrollment_queue')
                        .update({ attempts: (row?.attempts ?? 0) + 1, ...((row?.attempts ?? 0) + 1 >= MAX_ATTEMPTS ? { outcome: 'failed' } : {}) })
                        .eq('email', email);
                } else {
                    consecutiveErrors = 0;
                    await admin
                        .from('solution_enrollment_queue')
                        .update({ enrolled_at: new Date().toISOString(), outcome })
                        .eq('email', email);
                    processed++;
                }
                await sleep(PACE_MS);
            }
        }

        const { count: remaining } = await admin
            .from('solution_enrollment_queue')
            .select('email', { count: 'exact', head: true })
            .is('enrolled_at', null)
            .lt('attempts', MAX_ATTEMPTS);

        return NextResponse.json({ seeded, processed, outcomes, remaining: remaining ?? 0 });
    } catch (e) {
        console.error('Solution audience enrollment failed:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
    }
}
