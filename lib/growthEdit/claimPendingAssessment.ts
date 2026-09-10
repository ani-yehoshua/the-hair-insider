import { createClient } from '@supabase/supabase-js';

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

// Claims a Growth Edit assessment stashed pre-signup (see
// /api/hair-growth-edit/save-pending), matched by email. Safe to call on
// every sign-in -- most of the time there's nothing pending. This is what
// makes results survive a visitor confirming their email on a different
// device than the one they took the quiz on: the pending row was written
// by whichever device sent the sign-in code/link, independent of which
// device completes the confirmation.
export async function claimPendingAssessment(
    userId: string,
    email: string,
): Promise<boolean> {
    const { data: pending, error: pendingErr } = await admin
        .from('pending_growth_edit_assessments')
        .select('*')
        .ilike('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (pendingErr) throw new Error(pendingErr.message);
    if (!pending) return false;

    const { error: upsertErr } = await admin
        .from('growth_edit_assessments')
        .upsert(
            { user_id: userId, answers: pending.answers },
            { onConflict: 'user_id' },
        );

    if (upsertErr) throw new Error(upsertErr.message);

    await admin
        .from('pending_growth_edit_assessments')
        .delete()
        .ilike('email', email);

    return true;
}
