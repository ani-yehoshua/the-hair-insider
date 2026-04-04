// Logs every agent run step to Supabase for the ops dashboard

import { createClient } from '@supabase/supabase-js';
import { AgentResult, PipelineRun } from '../config';

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
    );
}

export async function logPipelineStart(run: Omit<PipelineRun, 'steps'>) {
    const supabase = getSupabase();
    await supabase.from('agent_pipeline_runs').insert({
        run_id: run.runId,
        name: run.name,
        status: run.status,
        created_at: run.createdAt,
    });
}

export async function logAgentStep(runId: string, step: AgentResult) {
    const supabase = getSupabase();
    await supabase.from('agent_run_steps').insert({
        run_id: runId,
        agent: step.agent,
        status: step.status,
        score: step.score ?? null,
        detail: step.detail,
        tokens_in: step.tokensIn,
        tokens_out: step.tokensOut,
        timestamp: step.timestamp,
    });
}

export async function updatePipelineStatus(
    runId: string,
    status: PipelineRun['status'],
) {
    const supabase = getSupabase();
    await supabase
        .from('agent_pipeline_runs')
        .update({ status })
        .eq('run_id', runId);
}

export async function getRunHistory(limit = 20): Promise<PipelineRun[]> {
    const supabase = getSupabase();
    const { data } = await supabase
        .from('agent_pipeline_runs')
        .select('*, agent_run_steps(*)')
        .order('created_at', { ascending: false })
        .limit(limit);
    return data ?? [];
}
