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

    if (!apiKey || !audienceId || !prefix) {
        console.error('Mailchimp env vars missing:', {
            apiKey: !!apiKey,
            audienceId: !!audienceId,
            prefix: !!prefix,
        });
        return NextResponse.json({ ok: true });
    }

    const emailHash = crypto
        .createHash('md5')
        .update(email.trim().toLowerCase())
        .digest('hex');

    // Mailchimp requires Basic auth for API key authentication (not Bearer)
    const basicAuth = Buffer.from(`anystring:${apiKey}`).toString('base64');

    const normalized = email.trim().toLowerCase();
    const baseUrl = `https://${prefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${emailHash}`;
    const headers = { Authorization: `Basic ${basicAuth}`, 'Content-Type': 'application/json' };

    const res = await fetch(baseUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ email_address: normalized, status_if_new: 'subscribed' }),
    });

    if (!res.ok) {
        const text = await res.text();
        const json = (() => { try { return JSON.parse(text); } catch { return null; } })();
        console.error('MC_STATUS:', res.status);
        console.error('MC_TITLE:', json?.title ?? 'unknown');
        console.error('MC_DETAIL:', json?.detail ?? text.slice(0, 200));
        return NextResponse.json({ ok: true });
    }

    await fetch(`${baseUrl}/tags`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tags: [{ name: 'lead-magnet', status: 'active' }] }),
    });

    return NextResponse.json({ ok: true });
}
