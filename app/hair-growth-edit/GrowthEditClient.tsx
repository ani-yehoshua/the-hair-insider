"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { track } from "@vercel/analytics";
import { QUESTIONS } from "./data/questions";
import { calculateResults } from "./lib/scoring";
import { Navbar } from "@/components/site/navbar";
import { Quiz } from "./components/Quiz";
import { Results } from "./components/Results";
import { ResultsGenerating } from "./components/ResultsGenerating";
import { GuideView } from "./components/GuideView";
import { BackToTopButton } from "./components/BackToTopButton";
import { ViewTabs } from "./components/ViewTabs";
import type { AppView } from "./lib/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { supabase } from "@/lib/supabase/client";
import {
    PENDING_ANSWERS_KEY,
    checkGrowthEditEntitlement,
    clearDraftAnswers,
    clearPurchasePendingSignIn,
    loadDraftAnswers,
    loadSavedAssessment,
    saveAssessment,
    saveDraftAnswers,
    type AnswerMap,
} from "./lib/assessmentStore";

export default function GrowthEditClient() {
    const { signedIn, loading: authLoading } = useAuth();
    const [view, setView] = useState<AppView>("home");
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [unlocked, setUnlocked] = useState(false);
    const [bootstrapping, setBootstrapping] = useState(true);
    const [redirectPurchaseComplete, setRedirectPurchaseComplete] =
        useState(false);
    const [price, setPrice] = useState<string | null>(null);
    const didBootstrap = useRef(false);
    const completingQuiz = useRef(false);

    // Reads the live Stripe price so the offer never drifts out of sync with
    // what checkout actually charges -- change the price in Stripe and every
    // button here updates on its own.
    useEffect(() => {
        (async () => {
            const { data: course } = await supabase
                .from("courses")
                .select("stripe_price_id")
                .eq("slug", "hair-growth-edit")
                .maybeSingle();
            if (!course?.stripe_price_id) return;

            const res = await fetch("/api/stripe/price", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId: course.stripe_price_id }),
            });
            if (!res.ok) return;

            const json = await res.json();
            if (json.unitAmount != null) {
                setPrice(
                    new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: (json.currency ?? "usd").toUpperCase(),
                        minimumFractionDigits:
                            json.unitAmount % 100 === 0 ? 0 : 2,
                    }).format(json.unitAmount / 100),
                );
            }
        })();
    }, []);

    useEffect(() => {
        document.title = "The Growth Edit — The Hair Insider";
    }, []);

    // Handles the one path that still leaves the page: a payment method that
    // required a redirect (Klarna, Amazon Pay, etc. -- card completes inline
    // and never hits this). All other quiz/results state is gone after the
    // reload, since the buyer was never signed in at checkout, so this is a
    // dedicated screen rather than trying to route into the normal views.
    // Read via window.location directly (not useSearchParams) so this page
    // can stay statically rendered rather than needing a Suspense boundary.
    useEffect(() => {
        const sessionId = new URLSearchParams(window.location.search).get(
            "checkout_session_id",
        );
        if (!sessionId) return;

        window.history.replaceState(null, "", "/hair-growth-edit");

        (async () => {
            try {
                const res = await fetch(
                    `/api/checkout/embedded/status?session_id=${encodeURIComponent(sessionId)}`,
                );
                const data = (await res.json()) as { status?: string };
                if (data.status === "complete")
                    setRedirectPurchaseComplete(true);
            } catch {
                // Not fatal -- the webhook still grants the entitlement regardless
                // of whether this status check succeeds.
            }
        })();
    }, []);

    // Runs once auth state resolves: recovers a just-completed quiz that was
    // waiting on sign-in, or restores a previously saved assessment so a
    // returning, signed-in visitor lands straight on their results.
    useEffect(() => {
        if (authLoading || didBootstrap.current) return;
        didBootstrap.current = true;

        (async () => {
            if (!signedIn) {
                // A signed-out visitor who already finished the assessment
                // and reloaded lands back on their results, not the quiz.
                const draft = loadDraftAnswers();
                if (
                    draft &&
                    QUESTIONS.every((question) => draft[question.id] !== undefined)
                ) {
                    setAnswers(draft);
                    setView("results");
                }
                setBootstrapping(false);
                return;
            }

            clearPurchasePendingSignIn();

            // Any owner landing here -- from the account library page, a
            // "View My Routine" link, or a post-purchase sign-in -- goes
            // straight to the guide. The severe-flag case has no guide to
            // land on, so it still lands on results.
            const pendingRaw = sessionStorage.getItem(PENDING_ANSWERS_KEY);
            if (pendingRaw) {
                sessionStorage.removeItem(PENDING_ANSWERS_KEY);
                try {
                    const pendingAnswers = JSON.parse(pendingRaw) as AnswerMap;
                    await saveAssessment(pendingAnswers);
                    clearDraftAnswers();
                    setAnswers(pendingAnswers);
                    const entitled = await checkGrowthEditEntitlement();
                    setUnlocked(entitled);
                    setView(
                        entitled &&
                            !calculateResults(pendingAnswers).hasSevereRedFlag
                            ? "guide"
                            : "results",
                    );
                    setBootstrapping(false);
                    return;
                } catch {
                    // fall through to the saved-assessment check below
                }
            }

            const [saved, entitled] = await Promise.all([
                loadSavedAssessment(),
                checkGrowthEditEntitlement(),
            ]);
            setUnlocked(entitled);
            if (saved) {
                setAnswers(saved);
                setView(
                    entitled && !calculateResults(saved).hasSevereRedFlag
                        ? "guide"
                        : "results",
                );
            }
            setBootstrapping(false);
        })();
    }, [authLoading, signedIn]);

    const assessmentComplete = QUESTIONS.every(
        (question) => answers[question.id] !== undefined,
    );

    // Derived, not stored: if `view` claims 'results' but the assessment
    // somehow isn't actually complete, fall back without a setState-in-effect.
    // Results are shown to signed-out visitors too -- signing in is prompted
    // inside the results page itself, not as a wall before it.
    const effectiveView: AppView =
        view === "results" && !assessmentComplete ? "quiz" : view;

    useLayoutEffect(() => {
        if (effectiveView === "guide") {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    }, [effectiveView]);

    const openGuide = () => {
        if (!assessmentComplete || !unlocked) return;
        setView("guide");
    };

    useEffect(() => {
        if (effectiveView === "results") {
            track("results_viewed", { owner: unlocked });
        } else if (effectiveView === "guide") {
            track("guide_viewed");
        }
    }, [effectiveView, unlocked]);

    const handleStart = () => {
        track("quiz_started");
        setStep(0);
        setAnswers({});
        clearDraftAnswers();
        setView("quiz");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleQuizAnswer = (qId: string, optIdx: number) => {
        setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    };

    const handleQuizNext = () => {
        setStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleQuizBack = () => {
        setStep((prev) => Math.max(0, prev - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleQuizComplete = async () => {
        // A ref, not state: a fast double-tap lands before React re-renders,
        // so state would still read "not completing" for the second tap.
        if (completingQuiz.current) return;
        completingQuiz.current = true;

        try {
            track("quiz_completed", { signed_in: signedIn });
            setView("generating");
            window.scrollTo({ top: 0, behavior: "smooth" });
            const minimumDisplay = new Promise<void>((resolve) =>
                window.setTimeout(resolve, 2200),
            );
            try {
                if (signedIn) {
                    await saveAssessment(answers);
                    setUnlocked(await checkGrowthEditEntitlement());
                    clearDraftAnswers();
                } else {
                    saveDraftAnswers(answers);
                }
            } catch (e) {
                // Results are computed from the answers in memory, so a failed
                // save shouldn't strand the visitor on the loading screen.
                console.error("Saving the assessment failed:", e);
            }
            // Keep the transition visible while the assessment is saved, then
            // continue to the free results -- no wall between finishing the
            // assessment and seeing what it found.
            await minimumDisplay;
            setView("results");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            completingQuiz.current = false;
        }
    };

    // Used by the post-purchase "Sign In" buttons on the results page. The
    // bootstrap effect above already sends any signed-in, entitled owner
    // straight to the guide, so this just needs to get them signed in.
    const handleRequireAuth = () => {
        sessionStorage.setItem(PENDING_ANSWERS_KEY, JSON.stringify(answers));
        window.location.href = `/signin?next=${encodeURIComponent("/hair-growth-edit")}`;
    };

    const results = calculateResults(answers);

    if (bootstrapping) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-paper text-foreground/60">
                <p className="text-xs font-medium uppercase tracking-widest">
                    Loading your assessment…
                </p>
            </div>
        );
    }

    if (redirectPurchaseComplete) {
        return (
            <div className="min-h-[100dvh] bg-paper text-foreground">
                <Navbar />
                <main className="mx-auto w-full max-w-2xl px-6 pb-24 pt-16 md:pt-24 slide-up text-center">
                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
                        You&apos;re All Set
                    </span>
                    <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
                        Thanks For Your Purchase
                    </h1>
                    <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/80">
                        Sign in with the same email you just paid with to unlock
                        your full plan.
                    </p>
                    <a
                        href={`/signin?next=${encodeURIComponent("/hair-growth-edit")}`}
                        className="mx-auto mt-10 inline-flex w-full max-w-md items-center justify-center gap-3 bg-foreground px-6 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 pill-cta"
                    >
                        Sign In <ArrowRight size={14} />
                    </a>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-paper text-foreground">
            <Navbar />

            {effectiveView === "home" && (
                <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-12 md:pt-20 slide-up">
                    <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-16">
                        <div className="order-2 md:order-1">
                            <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
                                Hair &amp; Scalp Assessment
                            </span>
                            <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
                                The Growth Edit
                            </h1>
                            <div className="mt-6 h-px w-12 bg-foreground/30" />
                            <p className="mt-6 max-w-md text-sm leading-relaxed text-foreground/80 md:text-base">Answer questions about your hair and routine. Based on what you share, we’ll suggest starting points and products to consider. This is educational guidance, not a diagnosis.</p>

                            <div className="mt-10">
                                <button
                                    onClick={handleStart}
                                    className="inline-flex w-full items-center justify-center gap-4 bg-sage px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto pill-cta"
                                >
                                    Begin Assessment <ArrowRight size={14} />
                                </button>
                            </div>

                            <div className="mt-12 border-t border-foreground/15 pt-6">
                                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                    Before you begin
                                </p>
                                <ul className="mt-3 space-y-1 text-xs text-foreground/70">
                                    <li>
                                        — Answer honestly based on your actual
                                        routine.
                                    </li>
                                    <li>
                                        — The assessment takes approximately 3
                                        minutes.
                                    </li>
                                    <li>
                                        — You will receive immediate
                                        foundational guidance.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="order-1 flex items-center justify-center md:order-2">
                            <div className="panel-outline w-full max-w-[260px] overflow-hidden bg-paper-dark p-2 md:max-w-[340px] rounded-2xl">
                                <img
                                    src="/braided_pony_double_bow.jpeg"
                                    alt="Editorial back view of blonde braided ponytail with ribbon"
                                    className="aspect-[4/5] w-full object-cover rounded-xl grayscale-[0.2] contrast-[0.9]"
                                />
                            </div>
                        </div>
                    </div>
                </main>
            )}

            {effectiveView === "quiz" && (
                <Quiz
                    step={step}
                    answers={answers}
                    onAnswer={handleQuizAnswer}
                    onNext={handleQuizNext}
                    onBack={handleQuizBack}
                    onComplete={handleQuizComplete}
                />
            )}

            {effectiveView === "generating" && <ResultsGenerating />}

            {unlocked &&
                assessmentComplete &&
                !results.hasSevereRedFlag &&
                (effectiveView === "results" || effectiveView === "guide") && (
                    <ViewTabs
                        active={effectiveView}
                        onSelect={(next) =>
                            next === "guide" ? openGuide() : setView("results")
                        }
                    />
                )}

            {effectiveView === "results" && (
                <Results
                    {...results}
                    shampooFrequencyAnswer={
                        QUESTIONS.find(
                            (question) => question.id === "shampooFrequency",
                        )?.options[answers.shampooFrequency]?.label ?? null
                    }
                    unlocked={unlocked}
                    price={price}
                    onRequireAuth={handleRequireAuth}
                    onReset={() => {
                        clearDraftAnswers();
                        setView("home");
                        setAnswers({});
                        setStep(0);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                />
            )}

            {effectiveView === "guide" &&
                unlocked &&
                assessmentComplete &&
                !results.hasSevereRedFlag && (
                    <GuideView
                        paidRoutine={results.paidRoutine}
                        shouldShampooTwice={results.shouldShampooTwice}
                        primaryCause={results.primaryCause}
                        behaviorToStop={results.behaviorToStop}
                        observations={results.observations}
                        supportingNeeds={results.supportingNeeds}
                        washFrequency={results.washFrequency}
                        stylePreference={results.stylePreference}
                    />
                )}

            <footer className="border-t border-foreground/15 bg-paper py-10 px-6">
                <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="text-center md:text-left">
                        <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/80">
                            The Hair Insider
                        </span>
                        <p className="mt-1 font-support text-xs italic text-foreground/60">
                            Learn it. Then live it.
                        </p>
                    </div>
                    <p className="max-w-md text-center text-[0.65rem] uppercase tracking-wide text-foreground/50 md:text-right">
                        The Growth Edit is educational guidance, not medical
                        advice. If experiencing concerning shedding or scalp
                        issues, consult a professional.
                    </p>
                </div>
            </footer>

            <BackToTopButton />
        </div>
    );
}
