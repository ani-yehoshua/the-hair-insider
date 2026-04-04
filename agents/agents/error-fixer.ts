// Agent #3 — Error Fixer
// Monitors logs, diagnoses errors, patches files, verifies syntax, redeploys.
// Low ego, high output. Does not wake Lauren up.

import { callClaude, parseJSON } from '../lib/claude';
import { AGENT_CONFIG, AgentResult } from '../config';

const SYSTEM = `You are the Error Fixer agent for The Hair Insider.
    You diagnose build and runtime errors, patch files, verify the fix is syntactically correct, and trigger a redeploy.
    You are methodical, low ego, and high output. You do not escalate unless you genuinely cannot fix the problem.

    Given an error description, return ONLY a JSON object:
    {
    "diagnosis": "Missing env var NEXT_PUBLIC_BASE_URL in Vercel config",
    "fix": "Add NEXT_PUBLIC_BASE_URL to Vercel environment variables",
    "canAutoFix": true,
    "escalate": false,
    "escalationReason": ""
    }

    canAutoFix: true if the fix can be applied without human intervention.
    escalate: true only if the error is beyond your ability to fix automatically.`;

export async function runErrorFixer(
    errorDescription: string,
): Promise<AgentResult> {
    const { text, tokensIn, tokensOut } = await callClaude({
        system: SYSTEM,
        prompt: `Diagnose and fix this error:\n\n${errorDescription}`,
        mcpServers: [
            AGENT_CONFIG.mcpServers.find(s => s.name === 'github')!,
            AGENT_CONFIG.mcpServers.find(s => s.name === 'vercel')!,
        ],
    });

    const parsed = parseJSON<{
        diagnosis: string;
        fix: string;
        canAutoFix: boolean;
        escalate: boolean;
        escalationReason: string;
    }>(text, {
        diagnosis: 'Unknown error',
        fix: 'Manual review required',
        canAutoFix: false,
        escalate: true,
        escalationReason: 'Could not parse error fixer response',
    });

    return {
        agent: 'error_fixer',
        status: parsed.escalate ? 'fail' : 'pass',
        detail: `Diagnosis: ${parsed.diagnosis}. Fix: ${parsed.fix}.${
            parsed.escalate ? ' ESCALATED: ' + parsed.escalationReason : ''
        }`,
        tokensIn,
        tokensOut,
        timestamp: new Date().toISOString(),
    };
}
