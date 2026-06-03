import { NextRequest, NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';

export const runtime = 'nodejs';

// GET /api/admin/og-image?url=<encoded-url>
export async function GET(req: NextRequest) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok)
        return NextResponse.json({ error: auth.error }, { status: auth.status });

    const url = req.nextUrl.searchParams.get('url');
    if (!url) return NextResponse.json({ imageUrl: null });

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (compatible; TheHairInsiderBot/1.0)',
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return NextResponse.json({ imageUrl: null });

        const html = await res.text();

        // og:image
        const ogMatch = html.match(
            /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
        ) ?? html.match(
            /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
        );

        if (ogMatch?.[1]) return NextResponse.json({ imageUrl: ogMatch[1] });

        // fallback: twitter:image
        const twitterMatch = html.match(
            /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
        ) ?? html.match(
            /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
        );

        return NextResponse.json({ imageUrl: twitterMatch?.[1] ?? null });
    } catch {
        return NextResponse.json({ imageUrl: null });
    }
}
