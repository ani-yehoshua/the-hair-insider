export const AGENT_CONFIG = {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 1000,
    autoApproveThreshold: 85, // Agent #6 scores above this = auto-deploy
    mcpServers: [
        {
            type: 'url',
            url: 'https://api.githubcopilot.com/mcp/',
            name: 'github',
        },
        { type: 'url', url: 'https://mcp.vercel.com', name: 'vercel' },
        { type: 'url', url: 'https://mcp.supabase.com/mcp', name: 'supabase' },
        { type: 'url', url: 'https://mcp.stripe.com', name: 'stripe' },
        { type: 'url', url: 'https://gmail.mcp.claude.com/mcp', name: 'gmail' },
    ],
};

export type AgentResult = {
    agent: string;
    status: 'pass' | 'fail' | 'skip';
    score?: number;
    detail: string;
    tokensIn: number;
    tokensOut: number;
    timestamp: string;
};

export type PipelineRun = {
    runId: string;
    name: string;
    status: 'pass' | 'fail' | 'review' | 'running';
    steps: AgentResult[];
    createdAt: string;
};
