import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const apiKey = process.env.MAILCHIMP_API_KEY!;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID!;
    const prefix = process.env.MAILCHIMP_SERVER_PREFIX!;

    const emailHash = crypto
        .createHash('md5')
        .update(email.trim().toLowerCase())
        .digest('hex');

    // PUT upserts: creates new members as subscribed, leaves existing members' status unchanged
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
        console.error('Mailchimp subscribe failed:', text);
        return NextResponse.json({ error: 'Mailchimp error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
