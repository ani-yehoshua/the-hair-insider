"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Step = {
    agent: string;
    status: "pass" | "fail" | "skip";
    score?: number;
    detail: string;
    tokens_in: number;
    tokens_out: number;
    timestamp: string;
};

type Run = {
    run_id: string;
    name: string;
    status: "pass" | "fail" | "review" | "running";
    created_at: string;
    agent_run_steps: Step[];
};

const AGENT_LABELS: Record<string, string> = {
    orchestrator: "#1 Orchestrator",
    aesthetic_qa: "#2 Aesthetic QA",
    error_fixer: "#3 Error Fixer",
    seo_content: "#4 SEO & Content",
    deploy: "#5 Deploy",
    review_taste: "#6 Review & Taste",
};

const STATUS_STYLES: Record<string, string> = {
    pass: "bg-green-50 text-green-800",
    fail: "bg-red-50 text-red-800",
    review: "bg-purple-50 text-purple-800",
    running: "bg-amber-50 text-amber-800",
    skip: "bg-gray-100 text-gray-500",
};

const STATUS_DOT: Record<string, string> = {
    pass: "bg-green-500",
    fail: "bg-red-500",
    review: "bg-purple-500",
    running: "bg-amber-400 animate-pulse",
};

const STATUS_LABEL: Record<string, string> = {
    pass: "Deployed",
    fail: "Error fixed",
    review: "Needs review",
    running: "Running",
};

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
}

function timeAgo(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function totalCost(steps: Step[]): string {
    const cost = steps.reduce((acc, s) => {
        return acc + (s.tokens_in * 3 + s.tokens_out * 15) / 1_000_000;
    }, 0);
    return `$${cost.toFixed(4)}`;
}

export default function AgentsDashboard() {
    const [runs, setRuns] = useState<Run[]>([]);
    const [openId, setOpenId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const supabase = getSupabase();
            const { data } = await supabase
                .from("agent_pipeline_runs")
                .select("*, agent_run_steps(*)")
                .order("created_at", { ascending: false })
                .limit(20);
            setRuns(data ?? []);
            setLoading(false);
        }
        load();

        // Live updates — page refreshes automatically when a run changes
        const supabase = getSupabase();
        const channel = supabase
            .channel("agent_runs")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "agent_pipeline_runs",
                },
                () => load(),
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function handleApprove(runId: string) {
        setApproving(runId);
        await fetch("/api/pipeline/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ runId }),
        });
        setApproving(null);
    }

    const todayRuns = runs.filter(r => {
        const run = new Date(r.created_at);
        return run.toDateString() === new Date().toDateString();
    });

    const autoApprovedPct =
        todayRuns.length > 0
            ? Math.round(
                  (todayRuns.filter(r => r.status === "pass").length /
                      todayRuns.length) *
                      100,
              )
            : 0;

    const avgCost =
        todayRuns.length > 0
            ? `$${(
                  todayRuns.reduce((acc, r) => {
                      return (
                          acc +
                          r.agent_run_steps.reduce(
                              (a, s) =>
                                  a +
                                  (s.tokens_in * 3 + s.tokens_out * 15) /
                                      1_000_000,
                              0,
                          )
                      );
                  }, 0) / todayRuns.length
              ).toFixed(4)}`
            : "$0.00";

    const pendingReview = runs.filter(r => r.status === "review");

    return (
        <div className='max-w-4xl mx-auto px-6 py-10'>
            <h1 className='text-2xl font-medium mb-1'>Agent pipeline</h1>
            <p className='text-sm text-gray-500 mb-8'>
                The Hair Insider · live ops
            </p>

            {/* Metrics */}
            <div className='grid grid-cols-4 gap-3 mb-8'>
                {[
                    {
                        label: "Runs today",
                        value: todayRuns.length,
                        sub: `${todayRuns.filter(r => r.status === "pass").length} passed`,
                    },
                    {
                        label: "Avg cost / run",
                        value: avgCost,
                        sub: "Sonnet pricing",
                    },
                    {
                        label: "Auto-approved",
                        value: `${autoApprovedPct}%`,
                        sub: "Agent #6 learning",
                    },
                    {
                        label: "Pending review",
                        value: pendingReview.length,
                        sub:
                            pendingReview.length > 0
                                ? "Needs Lauren"
                                : "All clear",
                    },
                ].map(m => (
                    <div
                        key={m.label}
                        className='bg-gray-50 rounded-xl p-4'>
                        <p className='text-xs text-gray-500 mb-1'>{m.label}</p>
                        <p className='text-2xl font-medium'>{m.value}</p>
                        <p className='text-xs text-gray-400 mt-1'>{m.sub}</p>
                    </div>
                ))}
            </div>

            {/* Pending approval banners */}
            {pendingReview.map(run => (
                <div
                    key={run.run_id}
                    className='bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4 flex items-center gap-4 flex-wrap'>
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-purple-900'>
                            Waiting for approval — {run.name}
                        </p>
                        <p className='text-xs text-purple-600 mt-0.5'>
                            Agent #6 scored below auto-approve threshold ·{" "}
                            {timeAgo(run.created_at)}
                        </p>
                    </div>
                    <button
                        onClick={() => handleApprove(run.run_id)}
                        disabled={approving === run.run_id}
                        className='px-4 py-2 bg-green-700 text-white text-sm rounded-lg font-medium disabled:opacity-50'>
                        {approving === run.run_id
                            ? "Approving…"
                            : "Approve + deploy"}
                    </button>
                    <button
                        onClick={() => setOpenId(run.run_id)}
                        className='px-4 py-2 border border-purple-300 text-purple-800 text-sm rounded-lg'>
                        Review
                    </button>
                </div>
            ))}

            {/* Run list */}
            <p className='text-xs font-medium text-gray-400 uppercase tracking-wider mb-3'>
                Recent runs
            </p>

            {loading && <p className='text-sm text-gray-400'>Loading…</p>}

            <div className='flex flex-col gap-2'>
                {runs.map(run => (
                    <div
                        key={run.run_id}
                        className={`border rounded-xl overflow-hidden transition-all ${
                            openId === run.run_id
                                ? "border-gray-300"
                                : "border-gray-100 hover:border-gray-200"
                        }`}>
                        <button
                            onClick={() =>
                                setOpenId(
                                    openId === run.run_id ? null : run.run_id,
                                )
                            }
                            className='w-full flex items-center gap-3 px-4 py-3 text-left bg-white'>
                            <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[run.status] ?? "bg-gray-300"}`}
                            />
                            <span className='text-sm font-medium flex-1'>
                                {run.name}
                            </span>
                            <span className='text-xs text-gray-400'>
                                {timeAgo(run.created_at)}
                            </span>
                            <span
                                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[run.status]}`}>
                                {STATUS_LABEL[run.status] ?? run.status}
                            </span>
                        </button>

                        {openId === run.run_id && (
                            <div className='border-t border-gray-100 bg-gray-50 px-4 py-3 flex flex-col gap-3'>
                                {run.agent_run_steps
                                    .sort(
                                        (a, b) =>
                                            new Date(a.timestamp).getTime() -
                                            new Date(b.timestamp).getTime(),
                                    )
                                    .map((step, i) => (
                                        <div
                                            key={i}
                                            className='flex items-start gap-3'>
                                            <span
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${
                                                    step.status === "pass"
                                                        ? "bg-green-100 text-green-700"
                                                        : step.status === "fail"
                                                          ? "bg-red-100 text-red-700"
                                                          : "bg-gray-100 text-gray-400"
                                                }`}>
                                                {step.status === "pass"
                                                    ? "✓"
                                                    : step.status === "fail"
                                                      ? "✗"
                                                      : "–"}
                                            </span>
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-sm font-medium'>
                                                    {AGENT_LABELS[step.agent] ??
                                                        step.agent}
                                                    {step.score != null && (
                                                        <span className='ml-2 text-xs font-normal text-gray-400'>
                                                            {step.score}/100
                                                        </span>
                                                    )}
                                                </p>
                                                <p className='text-xs text-gray-500 mt-0.5 leading-relaxed'>
                                                    {step.detail}
                                                </p>
                                                <p className='text-xs text-gray-300 mt-1'>
                                                    {step.tokens_in.toLocaleString()}{" "}
                                                    in ·{" "}
                                                    {step.tokens_out.toLocaleString()}{" "}
                                                    out · {totalCost([step])}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                <div className='pt-2 border-t border-gray-200 flex justify-between text-xs text-gray-400'>
                                    <span>
                                        Run ID: {run.run_id.slice(0, 8)}…
                                    </span>
                                    <span>
                                        Total cost:{" "}
                                        {totalCost(run.agent_run_steps)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
