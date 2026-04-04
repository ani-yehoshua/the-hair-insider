import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
        .from('product_catalog')
        .select(
            'id, title, merchant, shopmy_url, destination_url, collection_name, collection_url, is_complete',
        )
        .order('is_complete', { ascending: true })
        .order('title', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data ?? [] });
}
