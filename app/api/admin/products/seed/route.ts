import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0]
        .split(',')
        .map(h => h.trim().replace(/^"|"$/g, ''));

    return lines.slice(1).map(line => {
        // Handle quoted fields with commas inside
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
            row[h] = (values[i] ?? '').replace(/^"|"$/g, '').trim();
        });
        return row;
    });
}

export async function POST(req: Request) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    const body = await req.json();
    const csv = String(body.csv ?? '');
    if (!csv) {
        return NextResponse.json({ error: 'Missing csv.' }, { status: 400 });
    }

    const rows = parseCSV(csv);

    let upserted = 0;
    let skipped = 0;

    const products = rows
        .map(row => {
            const shopmy_url = row['Short URL']?.trim();
            if (!shopmy_url) {
                skipped++;
                return null;
            }

            const rawTitle = row['Title']?.trim();
            // Skip "Access Denied" titles from Sephora blocking ShopMy
            const title =
                rawTitle && rawTitle !== 'Access Denied' ? rawTitle : '';

            return {
                title: title || '',
                merchant: row['Affiliate Merchant']?.trim() || '',
                shopmy_url,
                destination_url: row['URL']?.trim() || '',
                collection_name: row['Collection Name']?.trim() || null,
                collection_url: row['Collection URL']?.trim() || null,
            };
        })
        .filter(Boolean) as {
        title: string;
        merchant: string;
        shopmy_url: string;
        destination_url: string;
        collection_name: string | null;
        collection_url: string | null;
    }[];

    if (products.length === 0) {
        return NextResponse.json({ upserted: 0, skipped });
    }

    const admin = createSupabaseAdminClient();

    const { error } = await admin
        .from('product_catalog')
        .upsert(products, { onConflict: 'shopmy_url' });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    upserted = products.length;

    return NextResponse.json({ upserted, skipped });
}
