// Agent #1 — Orchestrator
// Reads the task, decides which agents run and in what order.

import { callClaude, parseJSON } from '../lib/claude';
import { AgentResult } from '../config';

const SYSTEM = `You are the Orchestrator for The Hair Insider agent pipeline.
    You are calm, decisive, and team-first.

    Given a task description, decide which agents should run and in what order.
    Return ONLY a JSON object with this shape:
    {
    "plan": ["aesthetic_qa", "seo_content", "review_taste", "deploy"],
    "reasoning": "Brief explanation of the plan"
    }

    Available agents: aesthetic_qa, seo_content, error_fixer, deploy, review_taste
    Rules:
    - Always include review_taste before deploy
    - Only include aesthetic_qa for visual pages (not blog posts or emails)
    - Only invoke error_fixer if a previous step failed
    - deploy always runs last`;

export async function runOrchestrator(
    task: string,
): Promise<{ plan: string[]; result: AgentResult }> {
    const { text, tokensIn, tokensOut } = await callClaude({
        system: SYSTEM,
        prompt: task,
    });

    const parsed = parseJSON<{ plan: string[]; reasoning: string }>(text, {
        plan: ['aesthetic_qa', 'seo_content', 'review_taste', 'deploy'],
        reasoning: 'Default plan',
    });

    return {
        plan: parsed.plan,
        result: {
            agent: 'orchestrator',
            status: 'pass',
            detail: parsed.reasoning,
            tokensIn,
            tokensOut,
            timestamp: new Date().toISOString(),
        },
    };
}
