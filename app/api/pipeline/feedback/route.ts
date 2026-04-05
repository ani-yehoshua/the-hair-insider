import { createClient } from '@supabase/supabase-js';

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

    const { runId, feedback, approved } = await req.json();

    if (!runId || !feedback) {
        return Response.json(
            { error: 'runId and feedback are required' },
            { status: 400 },
        );
    }

    const { data: run } = await supabase
        .from('agent_pipeline_runs')
        .select('name')
        .eq('run_id', runId)
        .single();

    await supabase.from('lauren_feedback').insert({
        run_id: runId,
        content: run?.name ?? runId,
        feedback,
        approved: Boolean(approved),
    });

    if (!approved) {
        await supabase
            .from('agent_pipeline_runs')
            .update({ status: 'fail' })
            .eq('run_id', runId);
    }

    return Response.json({ ok: true });
}
