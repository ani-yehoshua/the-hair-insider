// Base Claude API call wrapper used by all agents

import { AGENT_CONFIG } from '../config';

export async function callClaude({
    system,
    prompt,
    mcpServers = [],
}: {
    system: string;
    prompt: string;
    mcpServers?: { type: string; url: string; name: string }[];
}): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: AGENT_CONFIG.model,
            max_tokens: AGENT_CONFIG.maxTokens,
            system,
            messages: [{ role: 'user', content: prompt }],
            ...(mcpServers.length > 0 && { mcp_servers: mcpServers }),
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    const text = data.content
        .filter((b: { type: string }) => b.type === 'text')
        .map((b: { text: string }) => b.text)
        .join('');

    return {
        text,
        tokensIn: data.usage?.input_tokens ?? 0,
        tokensOut: data.usage?.output_tokens ?? 0,
    };
}

export function parseJSON<T>(text: string, fallback: T): T {
    try {
        const clean = text.replace(/```json|```/g, '').trim();
        return JSON.parse(clean) as T;
    } catch {
        return fallback;
    }
}
