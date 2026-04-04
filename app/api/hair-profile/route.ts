import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return NextResponse.json(
            { error: 'Not authenticated.' },
            { status: 401 },
        );
    }

    const admin = createSupabaseAdminClient();
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) {
        return NextResponse.json(
            { error: 'Invalid session.' },
            { status: 401 },
        );
    }

    const { data, error } = await admin
        .from('hair_profiles')
        .select(
            'answers, ai_summary, recommended_product_ids, prev_answers, prev_ai_summary, prev_recommended_product_ids, updated_at',
        )
        .eq('user_id', userData.user.id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data ?? null });
}

