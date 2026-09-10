import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 60;

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

// Passwordless sign-up creates the auth.users row the moment the
// code/link is sent, not once it's confirmed -- a typo'd address (or
// someone who just never checks the email) leaves a permanently
// unconfirmed account behind forever. This sweeps those out once
// they've had a full week to still complete sign-in.
const STALE_AFTER_DAYS = 7;

// Caps deletions per run so a large backlog (e.g. the first-ever run)
// doesn't fire hundreds of concurrent admin API calls at once; the daily
// cron just catches the rest on subsequent days.
const MAX_DELETIONS_PER_RUN = 200;
const DELETE_BATCH_SIZE = 20;

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cutoffMs = Date.now() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;

    // supabase-js has no query surface over auth.users -- page through the
    // admin API instead and filter client-side.
    const stale: { id: string; email: string }[] = [];
    for (let page = 1; ; page++) {
        const { data, error } = await admin.auth.admin.listUsers({
            page,
            perPage: 1000,
        });
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        for (const u of data.users) {
            if (
                !u.email_confirmed_at &&
                u.email &&
                new Date(u.created_at).getTime() < cutoffMs
            ) {
                stale.push({ id: u.id, email: u.email });
            }
        }
        if (data.users.length < 1000) break;
    }

    if (stale.length === 0) {
        return NextResponse.json({ deleted: 0 });
    }

    const batch = stale.slice(0, MAX_DELETIONS_PER_RUN);
    const emails = batch.map(u => u.email);

    // Clean up email-keyed pending rows first -- these don't cascade from
    // auth.users (they're not linked by user_id, since no account existed
    // yet when they were written) and a stale one could otherwise be
    // wrongly claimed if that exact address is ever registered again.
    await Promise.all([
        admin.from('pending_entitlements').delete().in('email', emails),
        admin
            .from('pending_growth_edit_assessments')
            .delete()
            .in('email', emails),
    ]);

    let deleted = 0;
    let failed = 0;
    for (let i = 0; i < batch.length; i += DELETE_BATCH_SIZE) {
        const chunk = batch.slice(i, i + DELETE_BATCH_SIZE);
        const results = await Promise.allSettled(
            chunk.map(u => admin.auth.admin.deleteUser(u.id)),
        );
        deleted += results.filter(r => r.status === 'fulfilled').length;
        failed += results.filter(r => r.status === 'rejected').length;
    }

    return NextResponse.json({
        deleted,
        failed,
        matchedThisRun: stale.length,
        remaining: stale.length - batch.length,
    });
}
