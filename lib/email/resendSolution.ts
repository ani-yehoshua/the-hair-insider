import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

const SEQUENCE_STARTED_PROPERTY = 'solution_sequence_started';

export type SolutionEnrollOutcome =
    | 'enrolled'
    | 'unsubscribed'
    | 'purchased'
    | 'already-started'
    | 'error';

async function sendEnrollEvent(
    email: string,
    event = 'growth-edit-assessment-completed',
    payload?: Record<string, string>,
) {
    const res = await fetch('https://api.resend.com/events/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event,
            email,
            ...(payload ? { payload } : {}),
        }),
    });
    if (!res.ok) {
        const text = await res.text();
        console.error(`Resend ${event} event failed:`, res.status, text);
    }
    return res.ok;
}

/**
 * Starts the 5-day "Solution Sequence" (Growth Edit sales emails) for a
 * contact. Each contact enters once: the marker property stops a retaken quiz,
 * a resent confirmation or the audience backfill from starting a second run,
 * and anyone who has unsubscribed or already bought is never enrolled or
 * re-subscribed.
 *
 * `createIfMissing` is on for visitors who have just finished the assessment
 * and off for the backfill, whose contacts already exist.
 */
export async function enrollInSolutionSequence(
    email: string,
    { createIfMissing = true }: { createIfMissing?: boolean } = {},
): Promise<SolutionEnrollOutcome> {
    const normalized = email.trim().toLowerCase();

    if (createIfMissing) {
        try {
            await resend.contacts.create({ email: normalized, unsubscribed: false });
        } catch {
            // Already exists; the lookup below tells us whether to proceed.
        }
    }

    const { data: contact, error } = await resend.contacts.get({ email: normalized });
    if (error || !contact) {
        console.error('Resend contact lookup failed:', error);
        return 'error';
    }
    if (contact.unsubscribed) return 'unsubscribed';
    if (contact.properties?.growth_edit_purchased?.value === 'true') return 'purchased';
    if (contact.properties?.[SEQUENCE_STARTED_PROPERTY]?.value === 'true') return 'already-started';

    // Mark first so concurrent requests can't both start the sequence.
    const { error: updateError } = await resend.contacts.update({
        email: normalized,
        properties: { [SEQUENCE_STARTED_PROPERTY]: 'true' },
    });
    if (updateError) {
        console.error('Resend sequence marker update failed:', updateError);
        return 'error';
    }

    if (!(await sendEnrollEvent(normalized))) {
        // Undo the marker so a retry can still enroll them.
        await resend.contacts
            .update({ email: normalized, properties: { [SEQUENCE_STARTED_PROPERTY]: 'false' } })
            .catch(() => undefined);
        return 'error';
    }

    return 'enrolled';
}

const PROFESSIONAL_CARE_PROPERTY = 'professional_care_started';

/**
 * Starts the two-email "Professional Care" sequence for someone whose answers
 * point to a change best seen in person. It puts seeing a professional first and
 * adds no sales pressure, so these contacts never enter the sales sequence.
 * Each contact enters once; unsubscribed contacts, buyers and anyone already in
 * the sales sequence are left alone. `resultsLink` lets the emails link back to
 * the visitor's saved results.
 */
export async function enrollInProfessionalCareSequence(
    email: string,
    { resultsLink, createIfMissing = true }: { resultsLink?: string; createIfMissing?: boolean } = {},
): Promise<SolutionEnrollOutcome> {
    const normalized = email.trim().toLowerCase();

    if (createIfMissing) {
        try {
            await resend.contacts.create({ email: normalized, unsubscribed: false });
        } catch {
            // Already exists; the lookup below tells us whether to proceed.
        }
    }

    const { data: contact, error } = await resend.contacts.get({ email: normalized });
    if (error || !contact) {
        console.error('Resend contact lookup failed:', error);
        return 'error';
    }
    if (contact.unsubscribed) return 'unsubscribed';
    if (contact.properties?.growth_edit_purchased?.value === 'true') return 'purchased';
    if (
        contact.properties?.[PROFESSIONAL_CARE_PROPERTY]?.value === 'true' ||
        contact.properties?.[SEQUENCE_STARTED_PROPERTY]?.value === 'true'
    ) {
        return 'already-started';
    }

    const { error: updateError } = await resend.contacts.update({
        email: normalized,
        properties: { [PROFESSIONAL_CARE_PROPERTY]: 'true' },
    });
    if (updateError) {
        console.error('Resend professional-care marker update failed:', updateError);
        return 'error';
    }

    const sent = await sendEnrollEvent(normalized, 'growth-edit-professional-care-started', {
        results_link: resultsLink ?? 'https://the-hair-insider.com/hair-growth-edit',
    });
    if (!sent) {
        await resend.contacts
            .update({ email: normalized, properties: { [PROFESSIONAL_CARE_PROPERTY]: 'false' } })
            .catch(() => undefined);
        return 'error';
    }

    return 'enrolled';
}
