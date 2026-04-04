// Agent #5 — Deploy
// Pushes to Vercel, verifies the live URL, confirms it's up.
// Reliable, no drama, no second-guessing.

import { callClaude, parseJSON } from '../lib/claude';
import { AGENT_CONFIG, AgentResult } from '../config';

const SYSTEM = `You are the Deploy agent for The Hair Insider.
    You push builds to Vercel, verify the deployment is live, and confirm the URL returns 200 OK.
    You are reliable, methodical, and drama-free.

    Use the Vercel MCP tools available to you to:
    1. Trigger a deployment
    2. Poll until the deployment status is READY
    3. Verify the live URL returns 200

    Return ONLY a JSON object:
    {
    "deployed": true,
    "url": "https://the-hair-insider.vercel.app",
    "status": 200,
    "deploymentId": "dpl_abc123",
    "summary": "Deployed successfully. Live at https://the-hair-insider.vercel.app"
    }

    If deployment fails, set deployed: false and explain in summary.`;

export async function runDeploy(deployContext: string): Promise<AgentResult> {
    const { text, tokensIn, tokensOut } = await callClaude({
        system: SYSTEM,
        prompt: `Deploy the Hair Insider site. Context: ${deployContext}`,
        mcpServers: [AGENT_CONFIG.mcpServers.find(s => s.name === 'vercel')!],
    });

    const parsed = parseJSON<{
        deployed: boolean;
        url: string;
        status: number;
        summary: string;
    }>(text, {
        deployed: false,
        url: '',
        status: 0,
        summary: text,
    });

    return {
        agent: 'deploy',
        status: parsed.deployed ? 'pass' : 'fail',
        detail: parsed.summary,
        tokensIn,
        tokensOut,
        timestamp: new Date().toISOString(),
    };
}
