import { createClient } from '@supabase/supabase-js';
import { runDeploy } from '@/agents/agents/deploy';
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

    await updatePipelineStatus(runId, 'running');

    // Fire deploy in background so the response returns immediately
    (async () => {
        const deployResult = await runDeploy(
            `Lauren approved run ${runId} — deploying ${run.name}`,
        );
        await logAgentStep(runId, deployResult);
        await updatePipelineStatus(
            runId,
            deployResult.status === 'pass' ? 'pass' : 'fail',
        );
    })().catch(console.error);

    return Response.json({ ok: true, runId });
}
