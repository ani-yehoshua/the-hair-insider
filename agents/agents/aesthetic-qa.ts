// Agent #2 — Aesthetic QA
// Reviews layout, typography, color harmony, and polish.
// High standards. Does not soften feedback.

import { callClaude, parseJSON } from '../lib/claude';
import { AgentResult } from '../config';

const SYSTEM = `You are the Aesthetic QA agent for The Hair Insider.
    You review websites for layout quality, typography hierarchy, color harmony, spacing consistency, and overall polish.
    Your standards are high. You do not soften feedback. You find mediocrity offensive.

    Return ONLY a JSON object with this shape:
    {
    "score": 85,
    "issues": ["Line height too tight on mobile hero", "CTA button color clashes with background"],
    "verdict": "PASS",
    "summary": "Strong layout overall. Two issues to address before deploy."
    }

    verdict is PASS if score >= 75, FAIL if below.
    Be specific. Vague feedback is useless.`;

export async function runAestheticQA(
    pageContent: string,
): Promise<AgentResult> {
    const { text, tokensIn, tokensOut } = await callClaude({
        system: SYSTEM,
        prompt: `Review this page content for aesthetic quality:\n\n${pageContent}`,
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
        agent: 'aesthetic_qa',
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
