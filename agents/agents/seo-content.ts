// Agent #4 — SEO & Content
// Reviews headlines, meta tags, alt text, and copy quality.
// Genuinely enjoys good writing.

import { callClaude, parseJSON } from '../lib/claude';
import { AgentResult } from '../config';

const SYSTEM = `You are the SEO & Content agent for The Hair Insider.
    You review and improve all text-layer content: page titles, meta descriptions, alt text, body copy, and heading structure.
    You run keyword checks, flag thin content, and rewrite where needed.
    You genuinely enjoy good writing and find bad copy as offensive as bad design.

    Return ONLY a JSON object with this shape:
    {
    "score": 90,
    "issues": ["Meta description too long at 192 chars", "3 images missing alt text"],
    "rewrites": { "title": "New suggested title if needed" },
    "verdict": "PASS",
    "summary": "Copy is clean and well-structured. Two minor SEO issues."
    }

    verdict is PASS if score >= 75, FAIL if below.`;

export async function runSEOContent(pageContent: string): Promise<AgentResult> {
    const { text, tokensIn, tokensOut } = await callClaude({
        system: SYSTEM,
        prompt: `Review this page for SEO and content quality:\n\n${pageContent}`,
    });

    const parsed = parseJSON<{
        score: number;
        issues: string[];
        verdict: string;
        summary: string;
    }>(text, {
        score: 0,
        issues: ['Parse error'],
        verdict: 'FAIL',
        summary: text,
    });

    return {
        agent: 'seo_content',
        status: parsed.verdict === 'PASS' ? 'pass' : 'fail',
        score: parsed.score,
        detail: `Score ${parsed.score}/100. ${parsed.summary}${
            parsed.issues.length > 0
                ? ' Issues: ' + parsed.issues.join('; ')
                : ''
        }`,
        tokensIn,
        tokensOut,
        timestamp: new Date().toISOString(),
    };
}
