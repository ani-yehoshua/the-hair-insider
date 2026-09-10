import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { claimPendingEntitlements } from '@/lib/entitlements/claimPending';
import { claimPendingAssessment } from '@/lib/growthEdit/claimPendingAssessment';
import { enrollInResendWelcome } from '@/lib/email/resendWelcome';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const next = url.searchParams.get('next');

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
        // A failed exchange is expected on cross-device confirmation (PKCE
        // verifier lives on the initiating browser, not the confirming device).
        // Supabase already confirmed the email before this redirect.
        if (error) {
            console.error('Code exchange failed:', error.message);
        } else if (data.session?.user?.email) {
            // Same-device confirmation; subscribe to Resend now that we have the session
            const firstName =
                data.session.user.user_metadata?.full_name?.split(' ')[0] ?? '';
            enrollInResendWelcome(data.session.user.email, firstName).catch(e =>
                console.error('Resend welcome enroll error:', e),
            );
            claimPendingEntitlements(
                data.session.user.id,
                data.session.user.email,
            ).catch(e =>
                console.error('Claim pending entitlements error:', e),
            );
            // Awaited: the redirect below can land straight on
            // /hair-growth-edit, which needs the assessment row to already
            // exist to show results immediately rather than the quiz intro.
            await claimPendingAssessment(
                data.session.user.id,
                data.session.user.email,
            ).catch(e => console.error('Claim pending assessment error:', e));

            // Same-device confirmation actually has a session now, so send
            // them straight to whatever they were doing (e.g. back to
            // /hair-growth-edit to pick up their claimed assessment) instead
            // of the generic "you're confirmed" page.
            if (next) {
                return NextResponse.redirect(new URL(next, url.origin));
            }
        }
    }

    const confirmedUrl = new URL('/auth/confirmed', url.origin);
    if (next) confirmedUrl.searchParams.set('next', next);
    return NextResponse.redirect(confirmedUrl);
}
