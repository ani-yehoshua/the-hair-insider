import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length)
        : null;

    if (!token) {
        return NextResponse.json(
            { error: 'Not authenticated.' },
            { status: 401 },
        );
    }

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) {
        return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }
    const userId = userData.user.id;

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Missing file.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
            { error: 'Unsupported image type.' },
            { status: 400 },
        );
    }
    if (file.size > MAX_BYTES) {
        return NextResponse.json(
            { error: 'Image must be under 5MB.' },
            { status: 400 },
        );
    }

    const ext = file.type.split('/')[1];
    const path = `avatars/${userId}-${Date.now()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: upErr } = await admin.storage
        .from('hair-insider-bucket')
        .upload(path, bytes, { contentType: file.type, upsert: true });

    if (upErr) {
        return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const { data: publicUrlData } = admin.storage
        .from('hair-insider-bucket')
        .getPublicUrl(path);
    const avatarUrl = publicUrlData.publicUrl;

    const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
        user_metadata: { avatar_url: avatarUrl },
    });
    if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ avatarUrl });
}
