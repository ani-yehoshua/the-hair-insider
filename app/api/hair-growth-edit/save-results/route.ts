import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { QUESTIONS } from '@/app/hair-growth-edit/data/questions';
import { calculateResults } from '@/app/hair-growth-edit/lib/scoring';
import { firstMissingQuestionIndex } from '@/app/hair-growth-edit/lib/assessmentCompleteness';
import {
    RESULTS_EMAIL_SUBJECT,
    buildResultsEmail,
} from '@/lib/email/growthEditResultsEmail';
import { enrollInSolutionSequence } from '@/lib/email/resendSolution';

export const runtime = 'nodejs';

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);
const resend = new Resend(process.env.RESEND_API_KEY!);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// One results email per address per hour, so the form can't be used to
// repeatedly email someone else's inbox.
const RESEND_COOLDOWN_MS = 60 * 60 * 1000;
const QUESTION_IDS = QUESTIONS.map((question) => question.id);

type Answers = Record<string, number>;

function parseAnswers(value: unknown): Answers | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const answers: Answers = {};
    for (const [key, answer] of Object.entries(value)) {
        if (!QUESTION_IDS.includes(key)) continue;
        if (!Number.isInteger(answer) || (answer as number) < 0 || (answer as number) > 20) return null;
        answers[key] = answer as number;
    }
    return firstMissingQuestionIndex(answers, QUESTION_IDS) === -1 ? answers : null;
}

// Saves a finished assessment against an email so the visitor can reopen it
// from a link, and starts the Growth Edit follow-up emails. "results" also
// emails the visitor their summary; "checkout" (the email asked for before
// payment) only records it.
export async function POST(req: Request) {
    let body: { email?: unknown; answers?: unknown; source?: unknown };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const answers = parseAnswers(body.answers);
    if (!answers) {
        return NextResponse.json({ error: 'Missing or incomplete answers.' }, { status: 400 });
    }
    const source = body.source === 'checkout' ? 'checkout' : 'results';

    const { data: existing, error: lookupError } = await admin
        .from('saved_growth_edit_results')
        .select('token, results_email_sent_at')
        .eq('email', email)
        .maybeSingle();
    if (lookupError) {
        return NextResponse.json({ error: 'Could not save your results.' }, { status: 500 });
    }

    let token = existing?.token as string | undefined;
    if (token) {
        await admin
            .from('saved_growth_edit_results')
            .update({ answers, updated_at: new Date().toISOString() })
            .eq('email', email);
    } else {
        token = randomBytes(24).toString('base64url');
        const { error: insertError } = await admin
            .from('saved_growth_edit_results')
            .insert({ email, token, answers });
        if (insertError) {
            return NextResponse.json({ error: 'Could not save your results.' }, { status: 500 });
        }
    }

    const results = calculateResults(answers);

    let emailed = false;
    const lastSent = existing?.results_email_sent_at
        ? new Date(existing.results_email_sent_at as string).getTime()
        : 0;
    if (source === 'results' && Date.now() - lastSent > RESEND_COOLDOWN_MS) {
        const { html, text } = buildResultsEmail(
            {
                primaryCause: results.primaryCause,
                behaviorToStop: results.behaviorToStop,
                hasSevereRedFlag: results.hasSevereRedFlag,
                products: [results.product1, results.product2]
                    .filter((product): product is NonNullable<typeof product> => Boolean(product))
                    .map((product) => ({ name: product.name, brand: product.brand, link: product.link })),
            },
            token,
        );
        const { error: sendError } = await resend.emails.send({
            from: 'The Hair Insider <hello@the-hair-insider.com>',
            to: email,
            replyTo: 'thehairinsidersociety@gmail.com',
            subject: RESULTS_EMAIL_SUBJECT,
            html,
            text,
        });
        if (sendError) {
            console.error('Results email failed:', sendError);
            return NextResponse.json({ error: 'We saved your results but could not send the email. Please try again.' }, { status: 502 });
        }
        emailed = true;
        await admin
            .from('saved_growth_edit_results')
            .update({ results_email_sent_at: new Date().toISOString() })
            .eq('email', email);
    }

    // Someone whose answers flag a change needing professional care gets their
    // results but not the sales emails.
    if (!results.hasSevereRedFlag) {
        try {
            await enrollInSolutionSequence(email);
        } catch (e) {
            console.error('Solution sequence enrollment failed:', e);
        }
    }

    return NextResponse.json({ ok: true, emailed });
}
