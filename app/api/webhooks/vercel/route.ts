import { runPipeline } from '@/agents/pipeline';
import { waitUntil } from '@vercel/functions';
import crypto from 'crypto';

function verifySignature(
    body: string,
    signature: string,
    secret: string,
): boolean {
    const bodyBuffer = Buffer.from(body, 'utf-8');
    const digest = crypto
        .createHmac('sha1', secret)
        .update(bodyBuffer)
        .digest('hex');
    if (!signature || signature.length !== digest.length) return false;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('x-vercel-signature') ?? '';
    const secret = process.env.VERCEL_WEBHOOK_SECRET ?? '';

    if (secret && signature && !verifySignature(body, signature, secret)) {
        return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let payload: {
        type: string;
        payload: {
            deployment: {
                name: string;
                url: string;
                meta?: { githubCommitMessage?: string };
            };
        };
    };

    try {
        payload = JSON.parse(body);
        console.log('[webhook] Received event:', payload.type);
    } catch {
        return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (payload.type !== 'deployment.succeeded') {
        return Response.json({ skipped: true, type: payload.type });
    }

    const { deployment } = payload.payload;
    const deployUrl = `https://${deployment.url}`;
    const commitMessage =
        deployment.meta?.githubCommitMessage ?? 'No commit message';

    console.log('[webhook] Kicking off pipeline for:', deployment.name);

    // waitUntil keeps the function alive until the pipeline completes
    waitUntil(
        runPipeline({
            name: deployment.name,
            content: deployUrl,
            deployContext: `Commit: ${commitMessage}. Live URL: ${deployUrl}`,
        }).catch(err => console.error('[pipeline] Error:', err.message)),
    );

    return Response.json({ received: true });
}
