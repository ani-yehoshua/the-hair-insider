import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    console.log("callback route hit, code present:", !!code);

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        console.log("exchange result, error:", error?.message ?? null);

        if (error) {
            console.error('Code exchange failed:', error.message);
            return NextResponse.redirect(
                new URL('/signin?error=confirm', url.origin),
            );
        }
    }

    return NextResponse.redirect(new URL('/auth/callback/finalize', url.origin));
}
