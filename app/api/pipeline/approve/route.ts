import { createClient } from '@supabase/supabase-js';
import { logAgentStep, updatePipelineStatus } from '@/agents/lib/logger';

export async function POST(req: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
    );

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const {
        data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { runId } = await req.json();

    if (!runId) {
        return Response.json({ error: 'runId is required' }, { status: 400 });
    }

    const { data: run } = await supabase
        .from('agent_pipeline_runs')
        .select('*')
        .eq('run_id', runId)
        .single();

    if (!run) {
        return Response.json({ error: 'Run not found' }, { status: 404 });
    }

    if (run.status !== 'review') {
        return Response.json(
            { error: 'Run is not awaiting review' },
            { status: 400 },
        );
    }

    // The site is already live — Lauren is approving the quality review.
    // Log the approval and mark as passed.
    await logAgentStep(runId, {
        agent: 'review_taste',
        status: 'pass',
        detail: 'Manually approved by Lauren.',
        tokensIn: 0,
        tokensOut: 0,
        timestamp: new Date().toISOString(),
    });

    await updatePipelineStatus(runId, 'pass');

    return Response.json({ ok: true, runId });
}
