import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        // A failed exchange here is expected on cross-device confirmation (PKCE
        // verifier lives on the initiating browser, not the confirming device).
        // Supabase already confirmed the email before this redirect, so we can
        // proceed regardless.
        if (error) console.error('Code exchange failed:', error.message);
    }

    return NextResponse.redirect(new URL('/auth/confirmed', url.origin));
}
