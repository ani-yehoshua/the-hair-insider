import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { QUIZ_QUESTIONS } from '@/lib/quiz/questions';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function getUserFromToken(token: string) {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
}

function buildQuizSummary(answers: Record<string, string | string[]>): string {
    const lines: string[] = [];
    for (const q of QUIZ_QUESTIONS) {
        const ans = answers[q.id];
        if (!ans) continue;
        const values = Array.isArray(ans) ? ans : [ans];
        const labels = values.map(v => {
            const opt = q.options.find(o => o.value === v);
            return opt?.label ?? v;
        });
        lines.push(`${q.question}\nAnswer: ${labels.join(', ')}`);
    }
    return lines.join('\n\n');
}

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return NextResponse.json(
            { error: 'Not authenticated.' },
            { status: 401 },
        );
    }

    const user = await getUserFromToken(token);
    if (!user) {
        return NextResponse.json(
            { error: 'Invalid session.' },
            { status: 401 },
        );
    }

    const body = await req.json();
    const answers = body.answers as Record<string, string | string[]>;
    if (!answers || typeof answers !== 'object') {
        return NextResponse.json(
            { error: 'Missing answers.' },
            { status: 400 },
        );
    }

    const admin = createSupabaseAdminClient();

    // Fetch complete products for AI context
    const { data: products, error: productsErr } = await admin
        .from('product_catalog')
        .select(
            'id, title, merchant, shopmy_url, destination_url, collection_name',
        )
        .eq('is_complete', true)
        .order('title');

    if (productsErr) {
        return NextResponse.json(
            { error: productsErr.message },
            { status: 500 },
        );
    }

    const productList = (products ?? [])
        .map(
            p =>
                `ID: ${p.id}\nName: ${p.title}\nBrand/Retailer: ${p.merchant}\nCollection: ${p.collection_name ?? 'N/A'}\nDestination: ${p.destination_url}\nShopMy Link: ${p.shopmy_url}`,
        )
        .join('\n\n---\n\n');

    const quizSummary = buildQuizSummary(answers);

    const systemPrompt = `You are a professional hair care advisor for The Hair Insider, an education-first hair care platform founded by Lauren Jackson, a licensed cosmetologist.

Your task is to analyze a user's hair quiz results and recommend specific products from Lauren's curated ShopMy catalog.

Return ONLY valid JSON in this exact format. No markdown, no preamble:
{
  "summary": "2-3 paragraph personalized hair profile summary written directly to the user. Be warm, specific, and educational. Explain what their hair type means, what their main challenges are, and what to focus on.",
  "recommendations": [
    {
      "product_id": "<uuid from catalog>",
      "reason": "1-2 sentence explanation of why this product suits their specific hair profile"
    }
  ]
}

Rules:
- Recommend 6-10 products that genuinely match their hair profile
- Prioritize products that address their stated concerns and goals
- Include a mix of product types (shampoo, conditioner, treatment, styling) where appropriate
- Only recommend products from the provided catalog; use the exact ID
- Do not recommend products that conflict with their hair type (e.g. volumizing products for thick hair)
- Be specific in reasons; reference their actual answers`;

    const userMessage = `Here are the user's hair quiz answers:

${quizSummary}

Here is Lauren's complete product catalog:

${productList}

Please analyze the quiz results and recommend the most suitable products from this catalog.`;

    // Call Claude API
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
        }),
    });

    if (!claudeRes.ok) {
        const errText = await claudeRes.text();
        console.error('Claude API error:', errText);
        return NextResponse.json(
            { error: 'AI analysis failed.' },
            { status: 500 },
        );
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content?.[0]?.text ?? '';

    let parsed: {
        summary: string;
        recommendations: { product_id: string; reason: string }[];
    };
    try {
        const clean = rawText.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(clean);
    } catch {
        console.error('Failed to parse Claude response:', rawText);
        return NextResponse.json(
            { error: 'Failed to parse AI response.' },
            { status: 500 },
        );
    }

    // Validate recommended product IDs exist in catalog
    const validIds = new Set((products ?? []).map(p => p.id));
    const validRecommendations = parsed.recommendations.filter(r =>
        validIds.has(r.product_id),
    );

    // Save to hair_profiles; shift current to previous
    const { data: existing } = await admin
        .from('hair_profiles')
        .select('answers, ai_summary, recommended_product_ids')
        .eq('user_id', user.id)
        .maybeSingle();

    const profileData = {
        user_id: user.id,
        answers,
        ai_summary: parsed.summary,
        recommended_product_ids: validRecommendations,
        prev_answers: existing?.answers ?? null,
        prev_ai_summary: existing?.ai_summary ?? null,
        prev_recommended_product_ids: existing?.recommended_product_ids ?? null,
        updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await admin
        .from('hair_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

    if (upsertErr) {
        console.error('Profile upsert error:', upsertErr);
        return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
