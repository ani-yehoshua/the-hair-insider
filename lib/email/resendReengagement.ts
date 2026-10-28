import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export type ReengagementOutcome =
    | 'started'
    | 'unsubscribed'
    | 'purchased'
    | 'already-in-sequence'
    | 'error';

// The three emails of the Re-engagement automation. A click on any of them
// means the contact wants to stay (see /api/webhooks/resend).
export const REENGAGEMENT_TEMPLATE_IDS = [
    '6d3bbb54-994c-47d6-a47e-b309340685fb',
    'ada28f44-7dab-4a1c-9e07-94315d287990',
    'bbc28afa-b8d1-4883-a476-6af82031bd89',
];
export const REENGAGEMENT_SUBJECTS = [
    'Do you still want to hear from us?',
    'Still want to stay on the list?',
    'Last note before we tidy up our list',
];

/**
 * Starts the Re-engagement automation for an existing contact by sending its
 * trigger event. Anyone who has unsubscribed, bought, or is already in the
 * Solution Sequence is left alone.
 */
export async function startReengagement(email: string): Promise<ReengagementOutcome> {
    const normalized = email.trim().toLowerCase();

    const { data: contact, error } = await resend.contacts.get({ email: normalized });
    if (error || !contact) {
        console.error('Resend contact lookup failed:', error);
        return 'error';
    }
    if (contact.unsubscribed) return 'unsubscribed';
    if (contact.properties?.growth_edit_purchased?.value === 'true') return 'purchased';
    if (contact.properties?.solution_sequence_started?.value === 'true') return 'already-in-sequence';

    const res = await fetch('https://api.resend.com/events/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: 'reengagement-started', email: normalized }),
    });
    if (!res.ok) {
        console.error('Resend reengagement-started event failed:', res.status, await res.text());
        return 'error';
    }
    return 'started';
}
