import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import crypto from 'crypto';

async function subscribeToMailchimp(email: string) {
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    const prefix = process.env.MAILCHIMP_SERVER_PREFIX;
    if (!apiKey || !audienceId || !prefix) return;

    const emailHash = crypto
        .createHash('md5')
        .update(email.trim().toLowerCase())
        .digest('hex');

    const res = await fetch(
        `https://${prefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${emailHash}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email_address: email.trim().toLowerCase(),
                status_if_new: 'subscribed',
            }),
        },
    );

    if (!res.ok) {
        const text = await res.text();
        console.error('Mailchimp subscribe failed in callback:', text);
    }
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

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
            // Same-device confirmation — subscribe to Mailchimp now that we have the session
            subscribeToMailchimp(data.session.user.email).catch(e =>
                console.error('Mailchimp callback error:', e),
            );
        }
    }

    return NextResponse.redirect(new URL('/auth/confirmed', url.origin));
}
