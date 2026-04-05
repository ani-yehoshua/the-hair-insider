// Agent #6 — Review & Taste
// Scores output against Lauren's taste profile.
// Learns from every piece of feedback. Gets smarter every day.

import { callClaude, parseJSON } from '../lib/claude';
import { AGENT_CONFIG, AgentResult } from '../config';
import { createClient } from '@supabase/supabase-js';

async function getLaurenFeedbackHistory(): Promise<string> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
    );
    const { data } = await supabase
        .from('lauren_feedback')
        .select('content, feedback, approved')
        .order('created_at', { ascending: false })
        .limit(20);

    if (!data || data.length === 0) return 'No feedback history yet.';
    return data
        .map(
            f =>
                `Content: ${f.content}\nFeedback: ${f.feedback}\nApproved: ${f.approved}`,
        )
        .join('\n---\n');
}

async function fetchPageContent(url: string): Promise<string> {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'HairInsiderAgent/1.0' },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok)
            return `Could not fetch page (status ${res.status}). URL: ${url}`;
        const html = await res.text();
        const clean = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 8000);
        return clean;
    } catch (err) {
        return `Could not fetch page: ${err instanceof Error ? err.message : String(err)}. URL: ${url}`;
    }
}

const SYSTEM = (feedbackHistory: string) =>
    `You are the Review & Taste agent for The Hair Insider.
    You review content against Lauren's personal taste profile.
    You score everything on tone, visual impression, brand fit, and quality.

    Lauren's taste profile:
    - Warm, confident, and professional tone
    - Clean, editorial aesthetic — not cluttered
    - Hair education content should feel authoritative but approachable
    - She hates corporate jargon and overly salesy copy
    - She loves specificity — vague claims feel cheap to her

    Lauren's recent feedback history (learn from this):
    ${feedbackHistory}

    Return ONLY a JSON object:
    {
    "score": 88,
    "verdict": "PASS",
    "autoApprove": true,
    "notes": "Strong on tone and specificity. Visual impression is clean.",
    "flags": []
    }

    autoApprove: true if score >= ${AGENT_CONFIG.autoApproveThreshold} AND you are confident Lauren would approve.
    verdict: PASS if score >= 75, FAIL if below.
    
    If you could not fetch the page content, score it 50 and set autoApprove to false with a note explaining why.`;

export async function runReviewTaste(
    content: string,
): Promise<AgentResult & { autoApprove: boolean }> {
    const feedbackHistory = await getLaurenFeedbackHistory();
    const isUrl =
        content.startsWith('http://') || content.startsWith('https://');
    const reviewContent = isUrl ? await fetchPageContent(content) : content;
    const { text, tokensIn, tokensOut } = await callClaude({
        system: SYSTEM(feedbackHistory),
        prompt: `Review this content against Lauren's taste profile:\n\n${reviewContent}`,
    });

    const parsed = parseJSON<{
        score: number;
        verdict: string;
        autoApprove: boolean;
        notes: string;
        flags: string[];
    }>(text, {
        score: 0,
        verdict: 'FAIL',
        autoApprove: false,
        notes: text,
        flags: ['Parse error'],
    });

    return {
        agent: 'review_taste',
        status: parsed.verdict === 'PASS' ? 'pass' : 'fail',
        score: parsed.score,
        detail: `Score ${parsed.score}/100. ${parsed.notes}${
            parsed.flags.length > 0 ? ' Flags: ' + parsed.flags.join('; ') : ''
        }`,
        tokensIn,
        tokensOut,
        timestamp: new Date().toISOString(),
        autoApprove: parsed.autoApprove,
    };
}
