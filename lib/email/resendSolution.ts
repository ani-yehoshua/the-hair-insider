import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

const SEQUENCE_STARTED_PROPERTY = 'solution_sequence_started';

/**
 * Starts the 5-day "Solution Sequence" (Growth Edit sales emails) for someone
 * who has just completed the assessment. Each contact enters once: the marker
 * property stops a retaken quiz or a resent confirmation from starting a second
 * run, and anyone who has unsubscribed is never re-subscribed or emailed.
 * Buyers are filtered out inside the automation itself.
 */
export async function enrollInSolutionSequence(email: string) {
    const normalized = email.trim().toLowerCase();

    try {
        await resend.contacts.create({ email: normalized, unsubscribed: false });
    } catch {
        // Already exists; the lookup below tells us whether to proceed.
    }

    const { data: contact, error } = await resend.contacts.get({ email: normalized });
    if (error || !contact) {
        console.error('Resend contact lookup failed:', error);
        return;
    }
    if (contact.unsubscribed || contact.properties?.[SEQUENCE_STARTED_PROPERTY]?.value === 'true') {
        return;
    }

    // Mark first so concurrent requests can't both start the sequence.
    const { error: updateError } = await resend.contacts.update({
        email: normalized,
        properties: { [SEQUENCE_STARTED_PROPERTY]: 'true' },
    });
    if (updateError) {
        console.error('Resend sequence marker update failed:', updateError);
        return;
    }

    const res = await fetch('https://api.resend.com/events/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event: 'growth-edit-assessment-completed',
            email: normalized,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('Resend growth-edit-assessment-completed event failed:', res.status, text);
    }
}
