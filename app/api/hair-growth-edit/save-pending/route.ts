import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Stashes a completed-but-unauthenticated quiz result keyed by the email
// the visitor is about to sign in with, so results survive even if they
// confirm on a different device than the one they took the quiz on.
// Claimed (and deleted) at sign-in by claimPendingAssessment().
export async function POST(req: Request) {
    let body: { email?: unknown; answers?: unknown };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const answers = body.answers;

    if (!email || !EMAIL_RE.test(email)) {
        return NextResponse.json(
            { error: 'Missing or invalid email.' },
            { status: 400 },
        );
    }
    if (
        !answers ||
        typeof answers !== 'object' ||
        Array.isArray(answers) ||
        Object.keys(answers).length === 0
    ) {
        return NextResponse.json(
            { error: 'Missing or invalid answers.' },
            { status: 400 },
        );
    }

    // Replace any prior pending answers for this email (e.g. a resend, or
    // a retaken quiz before ever confirming) rather than accumulating rows.
    await admin
        .from('pending_growth_edit_assessments')
        .delete()
        .ilike('email', email);

    const { error } = await admin
        .from('pending_growth_edit_assessments')
        .insert({ email, answers });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
