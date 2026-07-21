import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

const FOUNDER_SEATS_TOTAL = 100;

export async function GET() {
    const { data: course } = await admin
        .from('courses')
        .select('id')
        .eq('slug', 'hair-growth-edit')
        .maybeSingle();

    if (!course) {
        return NextResponse.json({ claimed: 0, total: FOUNDER_SEATS_TOTAL });
    }

    const { count } = await admin
        .from('entitlements')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', course.id)
        .eq('is_founder', true)
        .eq('status', 'active');

    return NextResponse.json({
        claimed: count ?? 0,
        total: FOUNDER_SEATS_TOTAL,
    });
}
