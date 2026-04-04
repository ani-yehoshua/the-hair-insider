"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { QUIZ_QUESTIONS } from "@/lib/quiz/questions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Answers = Record<string, string | string[]>;

export default function HairQuizClient() {
    const router = useRouter();
    const { signedIn, loading: authLoading } = useAuth();

    const [step, setStep] = React.useState(0);
    const [answers, setAnswers] = React.useState<Answers>({});
    const [submitting, setSubmitting] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);

    const total = QUIZ_QUESTIONS.length;
    const current = QUIZ_QUESTIONS[step];
    const progress = Math.round((step / total) * 100);

    // Auth guard
    React.useEffect(() => {
        if (!authLoading && !signedIn) {
            router.replace(`/signin?next=/hair-type-quiz`);
        }
    }, [authLoading, signedIn, router]);

    function getAnswer(questionId: string): string | string[] {
        return (
            answers[questionId] ??
            (QUIZ_QUESTIONS.find(q => q.id === questionId)?.type === "multi"
                ? []
                : "")
        );
    }

    function selectOption(
        questionId: string,
        value: string,
        type: "single" | "multi",
    ) {
        if (type === "single") {
            setAnswers(prev => ({ ...prev, [questionId]: value }));
        } else {
            const current = getAnswer(questionId) as string[];
            const already = current.includes(value);
            // If selecting 'none', deselect everything else
            if (value === "none") {
                setAnswers(prev => ({
                    ...prev,
                    [questionId]: already ? [] : ["none"],
                }));
            } else {
                const without = current.filter(v => v !== "none");
                setAnswers(prev => ({
                    ...prev,
                    [questionId]: already
                        ? without.filter(v => v !== value)
                        : [...without, value],
                }));
            }
        }
    }

    function isSelected(questionId: string, value: string): boolean {
        const ans = getAnswer(questionId);
        if (Array.isArray(ans)) return ans.includes(value);
        return ans === value;
    }

    function canAdvance(): boolean {
        const ans = getAnswer(current.id);
        if (Array.isArray(ans)) return ans.length > 0;
        return Boolean(ans);
    }

    function next() {
        if (step < total - 1) setStep(s => s + 1);
    }

    function back() {
        if (step > 0) setStep(s => s - 1);
    }

    async function onSubmit() {
        setErr(null);
        setSubmitting(true);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) throw new Error("Not authenticated.");

            const res = await fetch("/api/hair-profile/submit", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ answers }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Submission failed.");

            router.push("/hair-type-quiz/results");
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Something went wrong.");
            setSubmitting(false);
        }
    }

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    if (authLoading || !signedIn) return null;

    const isLast = step === total - 1;

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <main
                ref={pageRef}
                className='mx-auto flex max-w-2xl flex-col items-center px-6 py-14 sm:py-20'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='w-full space-y-6'>
                        {/* Header */}
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between text-secondary'>
                                <Badge variant='secondary'>
                                    Hair Type Quiz
                                </Badge>
                                <span className='text-sm'>
                                    {step + 1} of {total}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
                                <div
                                    className='h-full rounded-full bg-foreground transition-all duration-300'
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Question card */}
                        <Card className='rounded-3xl'>
                            <CardHeader>
                                <CardTitle className='text-xl'>
                                    {current.question}
                                </CardTitle>
                                {current.hint && (
                                    <CardDescription className='text-sm leading-6'>
                                        {current.hint}
                                    </CardDescription>
                                )}
                                {current.type === "multi" && (
                                    <p className='text-xs text-muted-foreground'>
                                        Select all that apply
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className='space-y-2'>
                                {current.options.map(option => {
                                    const selected = isSelected(
                                        current.id,
                                        option.value,
                                    );
                                    return (
                                        <button
                                            key={option.value}
                                            type='button'
                                            onClick={() =>
                                                selectOption(
                                                    current.id,
                                                    option.value,
                                                    current.type,
                                                )
                                            }
                                            className={[
                                                "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                                                selected
                                                    ? "border-foreground bg-muted-foreground text-secondary"
                                                    : "hover:bg-muted/50",
                                            ].join(" ")}>
                                            <p className='text-sm font-medium'>
                                                {option.label}
                                            </p>
                                            {option.description && (
                                                <p
                                                    className={`text-xs mt-0.5 ${selected ? "text-background/70" : "text-muted-foreground"}`}>
                                                    {option.description}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {err && (
                            <p className='text-sm text-destructive'>{err}</p>
                        )}

                        {/* Navigation */}
                        <div className='flex items-center justify-between'>
                            <Button
                                variant='secondary'
                                onClick={back}
                                disabled={step === 0}
                                className='gap-1'>
                                <ChevronLeft className='h-4 w-4' />
                                Back
                            </Button>

                            {isLast ? (
                                <Button
                                    onClick={onSubmit}
                                    disabled={!canAdvance() || submitting}
                                    className='gap-1'>
                                    {submitting
                                        ? "Analyzing your hair…"
                                        : "Get My Results"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={next}
                                    disabled={!canAdvance()}
                                    className='gap-1'>
                                    Next
                                    <ChevronRight className='h-4 w-4' />
                                </Button>
                            )}
                        </div>
                    </div>
                </FadeIn>
            </main>
        </div>
    );
}
