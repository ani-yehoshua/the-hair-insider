"use client";

import * as React from "react";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { supabase } from "@/lib/supabase/client";
import { useAdminGuard } from "@/lib/admin/useAdminGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, string> = {
        pass: "bg-green-400 text-primary",
        fail: "bg-red-400 text-primary",
        review: "bg-yellow-300 text-primary",
        running: "bg-amber-300 text-primary",
        skip: "bg-muted text-muted-foreground",
    };
    return (
        <Badge className={variants[status] ?? "bg-muted text-muted-foreground"}>
            {STATUS_LABEL[status] ?? status}
        </Badge>
    );
}

export default function AgentsDashboard() {
    const { ready } = useAdminGuard();
    const [runs, setRuns] = React.useState<Run[]>([]);
    const [openId, setOpenId] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [approving, setApproving] = React.useState<string | null>(null);
    const [feedbackText, setFeedbackText] = React.useState<
        Record<string, string>
    >({});
    const [feedbackOpen, setFeedbackOpen] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState<string | null>(null);

    const runRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    React.useEffect(() => {
        if (!ready) return;

        async function load() {
            const { data } = await supabase
                .from("agent_pipeline_runs")
                .select("*, agent_run_steps(*)")
                .order("created_at", { ascending: false })
                .limit(20);
            setRuns(data ?? []);
            setLoading(false);
        }

        load();

        const channel = supabase
            .channel("agent_runs")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "agent_pipeline_runs" },
                () => load(),
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [ready]);

    async function getToken() {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token ?? "";
    }

    async function handleApprove(runId: string) {
        setApproving(runId);
        const token = await getToken();
        await fetch("/api/pipeline/approve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ runId }),
        });
        setApproving(null);
    }

    async function handleFeedbackSubmit(runId: string, approved: boolean) {
        const feedback = feedbackText[runId]?.trim();
        if (!feedback) return;
        setSubmitting(runId);
        const token = await getToken();
        await fetch("/api/pipeline/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ runId, feedback, approved }),
        });
        setFeedbackText(prev => ({ ...prev, [runId]: "" }));
        setFeedbackOpen(null);
        setSubmitting(null);
    }

    const todayRuns = runs.filter(
        r =>
            new Date(r.created_at).toDateString() === new Date().toDateString(),
    );

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
                  todayRuns.reduce(
                      (acc, r) =>
                          acc +
                          r.agent_run_steps.reduce(
                              (a, s) =>
                                  a +
                                  (s.tokens_in * 3 + s.tokens_out * 15) /
                                      1_000_000,
                              0,
                          ),
                      0,
                  ) / todayRuns.length
              ).toFixed(4)}`
            : "$0.00";

    const pendingReview = runs.filter(r => r.status === "review");

    if (!ready) return null;

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <div
                ref={pageRef}
                className='mx-auto max-w-6xl px-6 pt-8 pb-16'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
                        <div>
                            <div className='flex items-center gap-3'>
                                <Badge variant='secondary'>Admin</Badge>
                            </div>
                            <h1 className='mt-3 text-3xl font-semibold tracking-tight'>
                                Agent pipeline
                            </h1>
                            <p className='mt-2 text-sm'>
                                Live ops — runs, scores, approvals, and costs.
                            </p>
                        </div>
                    </div>

                    <Separator className='my-8' />

                    {/* Metrics */}
                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8'>
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
                            <Card
                                key={m.label}
                                className='rounded-3xl'>
                                <CardContent className='pt-5'>
                                    <p className='text-xs mb-1'>{m.label}</p>
                                    <p className='text-2xl font-semibold'>
                                        {m.value}
                                    </p>
                                    <p className='text-xs mt-1'>{m.sub}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pending approval banners */}
                    {pendingReview.map(run => (
                        <Card
                            key={run.run_id}
                            className='rounded-3xl mb-4 border-yellow-300 bg-yellow-300/50'>
                            <CardContent className='space-y-4'>
                                <div className='flex items-start justify-between gap-4 flex-wrap'>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-medium'>
                                            Waiting for approval — {run.name}
                                        </p>
                                        <p className='text-xs mt-0.5'>
                                            Agent #6 scored below auto-approve
                                            threshold ·{" "}
                                            {timeAgo(run.created_at)}
                                        </p>
                                    </div>
                                    <div
                                        className={`flex gap-2 ${feedbackOpen === run.run_id ? "flex-col" : "flex-col sm:flex-row"}`}>
                                        <Button
                                            size='sm'
                                            variant='secondary'
                                            onClick={() => {
                                                const targetId =
                                                    openId === run.run_id
                                                        ? null
                                                        : run.run_id;
                                                setOpenId(targetId);
                                                if (targetId) {
                                                    setTimeout(() => {
                                                        runRefs.current[
                                                            targetId
                                                        ]?.scrollIntoView({
                                                            behavior: "smooth",
                                                            block: "start",
                                                        });
                                                    }, 50);
                                                }
                                            }}>
                                            View steps
                                        </Button>
                                        <Button
                                            size='sm'
                                            onClick={() =>
                                                handleApprove(run.run_id)
                                            }
                                            disabled={approving === run.run_id}>
                                            {approving === run.run_id
                                                ? "Approving…"
                                                : "Approve + deploy"}
                                        </Button>
                                        <Button
                                            size='sm'
                                            variant='destructive'
                                            onClick={() =>
                                                setFeedbackOpen(
                                                    feedbackOpen === run.run_id
                                                        ? null
                                                        : run.run_id,
                                                )
                                            }>
                                            {feedbackOpen === run.run_id
                                                ? "Cancel"
                                                : "Decline + feedback"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Decline feedback form */}
                                {feedbackOpen === run.run_id && (
                                    <div className='space-y-3 border-t pt-4'>
                                        <Label className='text-sm font-medium'>
                                            What did you want changed?
                                        </Label>
                                        <p className='text-xs'>
                                            Agent #6 will learn from this for
                                            future runs.
                                        </p>
                                        <Textarea
                                            className='w-full sm:min-h-[120px] text-sm sm:text-md'
                                            placeholder='Enter feedback'
                                            value={
                                                feedbackText[run.run_id] ?? ""
                                            }
                                            onChange={e =>
                                                setFeedbackText(prev => ({
                                                    ...prev,
                                                    [run.run_id]:
                                                        e.target.value,
                                                }))
                                            }
                                            rows={3}
                                        />
                                        <div className='flex gap-2'>
                                            <Button
                                                size='sm'
                                                variant='destructive'
                                                disabled={
                                                    !feedbackText[
                                                        run.run_id
                                                    ]?.trim() ||
                                                    submitting === run.run_id
                                                }
                                                onClick={() =>
                                                    handleFeedbackSubmit(
                                                        run.run_id,
                                                        false,
                                                    )
                                                }>
                                                {submitting === run.run_id
                                                    ? "Saving…"
                                                    : "Decline + save feedback"}
                                            </Button>
                                            <Button
                                                size='sm'
                                                variant='secondary'
                                                disabled={
                                                    !feedbackText[
                                                        run.run_id
                                                    ]?.trim() ||
                                                    submitting === run.run_id
                                                }
                                                onClick={() =>
                                                    handleFeedbackSubmit(
                                                        run.run_id,
                                                        true,
                                                    )
                                                }>
                                                Approve with notes
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Run list */}
                    <h2 className='text-base font-semibold mb-4'>
                        Recent runs
                    </h2>

                    {loading ? (
                        <p className='text-sm'>Loading…</p>
                    ) : runs.length === 0 ? (
                        <Card className='rounded-3xl'>
                            <CardHeader>
                                <CardTitle className='text-base'>
                                    No runs yet
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='text-sm text-muted-foreground'>
                                Runs will appear here once the pipeline is
                                triggered.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className='grid gap-4'>
                            {runs.map(run => (
                                <Card
                                    key={run.run_id}
                                    ref={el => {
                                        runRefs.current[run.run_id] =
                                            el as HTMLDivElement | null;
                                    }}
                                    className='rounded-3xl cursor-pointer'
                                    onClick={() =>
                                        setOpenId(
                                            openId === run.run_id
                                                ? null
                                                : run.run_id,
                                        )
                                    }>
                                    <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
                                        <div className='flex items-center gap-3 min-w-0'>
                                            <span
                                                className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[run.status] ?? "bg-muted"}`}
                                            />
                                            <CardTitle className='text-base truncate'>
                                                {run.name}
                                            </CardTitle>
                                        </div>
                                        <div className='flex items-center gap-3 flex-shrink-0'>
                                            <span className='text-xs'>
                                                {timeAgo(run.created_at)}
                                            </span>
                                            <StatusBadge status={run.status} />
                                        </div>
                                    </CardHeader>

                                    {openId === run.run_id && (
                                        <CardContent className='pt-0'>
                                            <Separator className='mb-4' />
                                            {/* Feedback for completed runs */}
                                            <div
                                                className='mb-4'
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }>
                                                <button
                                                    className='text-xs text-muted-foreground underline underline-offset-2'
                                                    onClick={() =>
                                                        setFeedbackOpen(
                                                            feedbackOpen ===
                                                                run.run_id
                                                                ? null
                                                                : run.run_id,
                                                        )
                                                    }>
                                                    {feedbackOpen === run.run_id
                                                        ? "Cancel feedback"
                                                        : "Leave feedback for Agent #6"}
                                                </button>
                                                {feedbackOpen ===
                                                    run.run_id && (
                                                    <div className='mt-3 space-y-2'>
                                                        <Textarea
                                                            placeholder='What could be improved? Agent #6 will learn from this.'
                                                            value={
                                                                feedbackText[
                                                                    run.run_id
                                                                ] ?? ""
                                                            }
                                                            onChange={e =>
                                                                setFeedbackText(
                                                                    prev => ({
                                                                        ...prev,
                                                                        [run.run_id]:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }),
                                                                )
                                                            }
                                                            rows={2}
                                                        />
                                                        <Button
                                                            size='sm'
                                                            disabled={
                                                                !feedbackText[
                                                                    run.run_id
                                                                ]?.trim() ||
                                                                submitting ===
                                                                    run.run_id
                                                            }
                                                            onClick={() =>
                                                                handleFeedbackSubmit(
                                                                    run.run_id,
                                                                    true,
                                                                )
                                                            }>
                                                            {submitting ===
                                                            run.run_id
                                                                ? "Saving…"
                                                                : "Save feedback"}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className='flex flex-col gap-3'>
                                                {run.agent_run_steps
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(
                                                                a.timestamp,
                                                            ).getTime() -
                                                            new Date(
                                                                b.timestamp,
                                                            ).getTime(),
                                                    )
                                                    .map((step, i) => (
                                                        <div
                                                            key={i}
                                                            className='flex items-start gap-3'>
                                                            <span
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-medium ${
                                                                    step.status ===
                                                                    "pass"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : step.status ===
                                                                            "fail"
                                                                          ? "bg-red-100 text-red-700"
                                                                          : "bg-muted text-muted-foreground"
                                                                }`}>
                                                                {step.status ===
                                                                "pass"
                                                                    ? "✓"
                                                                    : step.status ===
                                                                        "fail"
                                                                      ? "✗"
                                                                      : "–"}
                                                            </span>
                                                            <div className='flex-1 min-w-0'>
                                                                <p className='text-sm font-medium'>
                                                                    {AGENT_LABELS[
                                                                        step
                                                                            .agent
                                                                    ] ??
                                                                        step.agent}
                                                                    {step.score !=
                                                                        null && (
                                                                        <span className='ml-2 text-xs font-normal'>
                                                                            {
                                                                                step.score
                                                                            }
                                                                            /100
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <p className='text-xs mt-0.5 leading-relaxed'>
                                                                    {
                                                                        step.detail
                                                                    }
                                                                </p>
                                                                <p className='text-xs text-muted-foreground mt-1'>
                                                                    {step.tokens_in.toLocaleString()}{" "}
                                                                    in ·{" "}
                                                                    {step.tokens_out.toLocaleString()}{" "}
                                                                    out ·{" "}
                                                                    {totalCost([
                                                                        step,
                                                                    ])}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                <Separator className='mt-1' />
                                                <div className='flex justify-between text-xs'>
                                                    <span>
                                                        Run ID:{" "}
                                                        {run.run_id.slice(0, 8)}
                                                        …
                                                    </span>
                                                    <span>
                                                        Total cost:{" "}
                                                        {totalCost(
                                                            run.agent_run_steps,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </FadeIn>
            </div>
        </div>
    );
}
