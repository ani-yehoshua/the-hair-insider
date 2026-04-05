// Main pipeline runner for The Hair Insider agent team

import { v4 as uuidv4 } from 'uuid';
import { runOrchestrator } from './agents/orchestrator';
import { runAestheticQA } from './agents/aesthetic-qa';
import { runSEOContent } from './agents/seo-content';
import { runErrorFixer } from './agents/error-fixer';
import { runReviewTaste } from './agents/review-taste';
import { runDeploy } from './agents/deploy';
import {
    logPipelineStart,
    logAgentStep,
    updatePipelineStatus,
} from './lib/logger';
import { PipelineRun, AgentResult } from './config';

export type PipelineInput = {
    name: string; // e.g. "home-page-v3"
    content: string; // HTML or text content to review
    deployContext?: string;
};

export async function runPipeline(input: PipelineInput): Promise<PipelineRun> {
    const runId = uuidv4();
    const steps: AgentResult[] = [];

    const run: PipelineRun = {
        runId,
        name: input.name,
        status: 'running',
        steps,
        createdAt: new Date().toISOString(),
    };

    await logPipelineStart(run);

    try {
        // Step 1: Orchestrator decides the plan
        const { plan, result: orchResult } = await runOrchestrator(
            `Task: Review and deploy "${input.name}". Content provided.`,
        );
        steps.push(orchResult);
        await logAgentStep(runId, orchResult);

        // Step 2: Run agents in the order the Orchestrator decided
        for (const agentName of plan) {
            let result: AgentResult;

            if (agentName === 'aesthetic_qa') {
                result = await runAestheticQA(input.content);
            } else if (agentName === 'seo_content') {
                result = await runSEOContent(input.content);
            } else if (agentName === 'error_fixer') {
                const lastFail = steps.filter(s => s.status === 'fail').pop();
                result = await runErrorFixer(
                    lastFail?.detail ?? 'Unknown error',
                );
            } else if (agentName === 'review_taste') {
                const tasteResult = await runReviewTaste(input.content);
                steps.push(tasteResult);
                await logAgentStep(runId, tasteResult);

                if (!tasteResult.autoApprove) {
                    // Below threshold — pause and wait for Lauren
                    await updatePipelineStatus(runId, 'review');
                    return { ...run, status: 'review', steps };
                }
                continue;
            } else if (agentName === 'deploy') {
                result = await runDeploy(input.deployContext ?? input.name);
                if (result.status === 'fail') {
                    // Deploy failed — run error fixer then retry
                    const fixResult = await runErrorFixer(result.detail);
                    steps.push(result);
                    steps.push(fixResult);
                    await logAgentStep(runId, result);
                    await logAgentStep(runId, fixResult);

                    if (fixResult.status === 'pass') {
                        result = await runDeploy(
                            input.deployContext ?? input.name,
                        );
                    } else {
                        await updatePipelineStatus(runId, 'fail');
                        return { ...run, status: 'fail', steps };
                    }
                }
            } else {
                continue;
            }

            steps.push(result);
            await logAgentStep(runId, result);

            if (result.status === 'fail' && agentName !== 'deploy') {
                await updatePipelineStatus(runId, 'fail');
                return { ...run, status: 'fail', steps };
            }
        }

        await updatePipelineStatus(runId, 'pass');
        return { ...run, status: 'pass', steps };
    } catch (err) {
        console.error('[pipeline] Uncaught error, marking run as failed:', err);
        await updatePipelineStatus(runId, 'fail').catch(() => {});
        return { ...run, status: 'fail', steps };
    }
}
