import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { enrollInSolutionSequence } from '@/lib/email/resendSolution';
import { REENGAGEMENT_SUBJECTS, REENGAGEMENT_TEMPLATE_IDS } from '@/lib/email/resendReengagement';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Resend webhook. A click on any Re-engagement email means the contact wants
// to stay on the list, so they are marked as re-engaged and enrolled in the
// Solution Sequence. Every other event (including clicks on other emails) is
// acknowledged and ignored. Needs RESEND_WEBHOOK_SECRET, the signing secret
// shown when the webhook is created in Resend.
export async function POST(req: Request) {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (!secret) {
        return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
    }

    const payload = await req.text();
    let event;
    try {
        event = resend.webhooks.verify({
            payload,
            headers: {
                id: req.headers.get('svix-id') ?? '',
                timestamp: req.headers.get('svix-timestamp') ?? '',
                signature: req.headers.get('svix-signature') ?? '',
            },
            webhookSecret: secret,
        });
    } catch {
        return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }

    if (event.type !== 'email.clicked') return NextResponse.json({ ok: true });

    const { template_id: templateId, subject, to } = event.data;
    const isReengagement =
        (templateId && REENGAGEMENT_TEMPLATE_IDS.includes(templateId)) ||
        REENGAGEMENT_SUBJECTS.includes(subject);
    const email = to?.[0];
    if (!isReengagement || !email) return NextResponse.json({ ok: true });

    try {
        await resend.contacts.update({
            email: email.trim().toLowerCase(),
            properties: { reengaged: 'true', marketing_suppressed: 'false' },
        });
        const outcome = await enrollInSolutionSequence(email, { createIfMissing: false });
        // A failed enrollment should be retried by Resend.
        if (outcome === 'error') {
            return NextResponse.json({ error: 'Enrollment failed.' }, { status: 500 });
        }
    } catch (e) {
        console.error('Resend click webhook failed:', e);
        return NextResponse.json({ error: 'Webhook failed.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
