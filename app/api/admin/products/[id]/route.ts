import { NextRequest, NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    const { id } = await params;
    const body = await req.json();

    const allowed = ['title', 'merchant', 'destination_url', 'image_url'];
    const patch: Record<string, string> = {};
    for (const key of allowed) {
        if (body[key] !== undefined) {
            patch[key] = String(body[key]).trim();
        }
    }

    if (Object.keys(patch).length === 0) {
        return NextResponse.json(
            { error: 'Nothing to update.' },
            { status: 400 },
        );
    }

    patch.updated_at = new Date().toISOString();

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
        .from('product_catalog')
        .update(patch)
        .eq('id', id)
        .select(
            'id, title, merchant, shopmy_url, destination_url, collection_name, collection_url, image_url, is_complete',
        )
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
}
