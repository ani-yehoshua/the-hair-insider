import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

const TOKEN_RE = /^[A-Za-z0-9_-]{20,64}$/;

// Returns the answers saved behind a results-email link. The token is the
// only credential, which is why it is long and random.
export async function GET(req: Request) {
    const token = new URL(req.url).searchParams.get('token') ?? '';
    if (!TOKEN_RE.test(token)) {
        return NextResponse.json({ error: 'Invalid link.' }, { status: 400 });
    }

    const { data, error } = await admin
        .from('saved_growth_edit_results')
        .select('answers')
        .eq('token', token)
        .maybeSingle();

    if (error || !data) {
        return NextResponse.json({ error: 'Link not found.' }, { status: 404 });
    }

    return NextResponse.json(
        { answers: data.answers },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
