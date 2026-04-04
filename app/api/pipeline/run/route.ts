import { runPipeline } from '@/agents/pipeline';
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

    const { name, content, deployContext } = await req.json();

    if (!name || !content) {
        return Response.json(
            { error: 'name and content are required' },
            { status: 400 },
        );
    }

    const result = await runPipeline({ name, content, deployContext });

    return Response.json({ runId: result.runId, status: result.status });
}
