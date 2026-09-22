import { useState } from "react";
import { ProductResult } from "../lib/scoring";
import type { RoutineStep } from "../data/recommendations";
import { ArrowRight, Check } from "lucide-react";
import { CheckoutSheet } from "./CheckoutSheet";

const GROWTH_EDIT_SLUG = "hair-growth-edit";

interface ResultsProps {
    primaryCause: string;
    observations: string[];
    product1: ProductResult | null;
    product2: ProductResult | null;
    behaviorToStop: string;
    hasSevereRedFlag: boolean;
    hasMinorRedFlag: boolean;
    shouldShampooTwice: boolean;
    paidRoutine: RoutineStep[];
    supportingNeeds: string[];
    unlocked: boolean;
    signedIn: boolean;
    onRequireAuth: () => void;
    onReset: () => void;
    onOpenGuide: () => void;
}

export function Results({
    primaryCause,
    observations,
    product1,
    product2,
    behaviorToStop,
    hasSevereRedFlag,
    hasMinorRedFlag,
    shouldShampooTwice,
    paidRoutine,
    supportingNeeds,
    unlocked,
    signedIn,
    onRequireAuth,
    onReset,
    onOpenGuide,
}: ResultsProps) {
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [purchaseComplete, setPurchaseComplete] = useState(false);

    const handleCheckoutComplete = () => {
        setCheckoutOpen(false);
        setPurchaseComplete(true);
    };

    const getFoundationInstructions = (product: ProductResult) => {
        const matchingStep = paidRoutine.find(
            (step) => step.product.id === product.id,
        );
        if (matchingStep)
            return `${matchingStep.timing}. ${matchingStep.instruction}`;
        return "Use according to the product directions, starting with a small amount and adjusting only after observing how your hair responds.";
    };

    const disclaimer = hasSevereRedFlag
        ? "Your answers include a change best assessed by a dermatologist, GP, or qualified trichology professional. The gentle product suggestions below can support your hair in the meantime, but they are not a diagnosis or substitute for professional care."
        : hasMinorRedFlag
          ? "This assessment is educational guidance, not a medical diagnosis. Since you noted some scalp or hair changes, we advise professional review if they are persistent or worsening."
          : "This assessment is educational guidance, not a medical diagnosis. The recommendations below reflect the strongest patterns in your answers.";

    return (
        <div
            className="mx-auto w-full max-w-4xl px-5 pb-32 pt-12 md:px-8 md:pt-20 slide-up"
            data-testid="section-results"
        >
            {!signedIn && (
                <div className="mb-12 flex flex-col items-center gap-4 rounded-2xl border border-foreground/15 bg-sage/25 px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
                    <p className="text-sm leading-relaxed text-foreground/80">
                        These results are not saved yet. Sign in to keep them
                        and come back to this page anytime.
                    </p>
                    <button
                        type="button"
                        onClick={onRequireAuth}
                        className="inline-flex shrink-0 items-center justify-center gap-2 bg-foreground px-6 py-3 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 pill-cta"
                    >
                        Sign In
                    </button>
                </div>
            )}

            <div className="mb-16 text-center">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
                    Your Initial Read
                </span>
                <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
                    The Assessment
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-foreground/80 md:text-base">
                    {disclaimer}
                </p>
            </div>

            <div className="space-y-12">
                {/* Root Cause */}
                <div className="border-t border-foreground/15 pt-10">
                    <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                        01 / Primary Pattern
                    </span>
                    <h2 className="mt-3 font-serif text-2xl text-foreground">
                        {primaryCause.charAt(0).toUpperCase() +
                            primaryCause.slice(1)}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">
                        Your strongest pattern points to{" "}
                        <strong>{primaryCause}</strong>, supported by the
                        presence of {observations[0]} and {observations[1]}.
                        {hasSevereRedFlag &&
                            " Because of the change you noted, use the recommendations below as gentle interim support while arranging a professional consultation."}
                    </p>
                </div>

                {supportingNeeds.length > 0 && (
                    <div className="border-t border-foreground/15 pt-10">
                        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                            How your answers shaped the routine
                        </span>
                        <div className="mt-6 grid gap-3">
                            {supportingNeeds.map((need) => (
                                <p
                                    key={need}
                                    className="rounded-xl bg-sage/35 px-5 py-4 text-sm leading-relaxed text-foreground/80"
                                >
                                    {need}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Behavior Edit */}
                <div className="border-t border-foreground/15 pt-10">
                    <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                        02 / Immediate Edit
                    </span>
                    <h2 className="mt-3 font-serif text-2xl text-foreground">
                        A behavior to stop
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">
                        For now, stop <strong>{behaviorToStop}</strong>. It most
                        directly reinforces the symptoms you are experiencing.
                        Restoring health requires removing the source of the
                        stress first.
                    </p>
                </div>

                {/* Foundation / top-priority products */}
                {product1 && product2 && (
                    <div className="border-t border-foreground/15 pt-10">
                        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                            {hasSevereRedFlag
                                ? "03 / Gentle Support for Now"
                                : "03 / Foundation Steps"}
                        </span>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/70">
                            {hasSevereRedFlag
                                ? "These conservative recommendations can support gentle cleansing and handling in the meantime. Stop using anything that causes irritation, and bring your assessment notes to your professional appointment."
                                : "These two recommendations address part of your pattern. The complete guide shows where they belong, what supports them, what to avoid combining, and how often each step should be used."}
                        </p>
                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            {[product1, product2].map((prod) => (
                                <div
                                    key={prod.id}
                                    className="panel-outline rounded-2xl bg-paper px-6 py-8"
                                >
                                    <div className="mb-6 flex h-56 items-center justify-center overflow-hidden rounded-xl bg-white/70 p-4">
                                        <img
                                            src={prod.image}
                                            alt={`${prod.name} by ${prod.brand}`}
                                            className="h-full w-full object-contain"
                                            loading="lazy"
                                        />
                                    </div>
                                    <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                        {prod.category}
                                    </span>
                                    <h3 className="mt-2 font-serif text-xl text-foreground">
                                        {prod.name}
                                    </h3>
                                    <p className="mt-1 text-xs font-medium text-foreground/60">
                                        {prod.brand}
                                    </p>
                                    <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                                        <strong>Why to use:</strong>{" "}
                                        {prod.reason}
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                                        <strong>How to use:</strong>{" "}
                                        {getFoundationInstructions(prod)}
                                    </p>
                                    <a
                                        href={prod.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-6 inline-flex items-center justify-center gap-2 bg-sage px-6 py-3 text-[0.7rem] font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 pill-cta"
                                    >
                                        View Details
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Purchased guide */}
            {!hasSevereRedFlag && unlocked && (
                <div className="mt-24 rounded-2xl border border-foreground/15 bg-paper-dark px-6 py-12 text-center md:px-12 md:py-16">
                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/55">
                        Your Complete Growth Plan
                    </span>
                    <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
                        The Growth Edit Is Ready
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-foreground/80 md:text-base">
                        Open your personalized action plan, buying priorities,
                        complete routine, progress checkpoints, and
                        troubleshooting guidance.
                    </p>
                    <button
                        type="button"
                        onClick={onOpenGuide}
                        className="mt-10 inline-flex w-full items-center justify-center gap-3 bg-foreground px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 sm:w-auto pill-cta"
                    >
                        Open The Growth Edit <ArrowRight size={14} />
                    </button>
                </div>
            )}

            {/* Paid complete guide */}
            {!hasSevereRedFlag && !unlocked && (
                <div className="mt-24 rounded-2xl border border-foreground/15 bg-paper-dark px-6 py-12 text-center md:px-12 md:py-16">
                    {purchaseComplete ? (
                        <>
                            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/55">
                                You&apos;re All Set
                            </span>
                            <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
                                Thanks For Your Purchase
                            </h2>
                            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-foreground/80 md:text-base">
                                Sign in with the same email you just paid with
                                to unlock your full plan on this page.
                            </p>
                            <div className="mt-10">
                                <button
                                    type="button"
                                    onClick={onRequireAuth}
                                    className="inline-flex w-full items-center justify-center gap-3 bg-sage px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto pill-cta"
                                >
                                    Sign In <ArrowRight size={14} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/55">
                                Your Complete Growth Plan
                            </span>
                            <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
                                Unlock The Growth Edit
                            </h2>
                            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-foreground/80 md:text-base">
                                Get your personalized Top 3 buying priorities,
                                complete product routine, wash-day schedule, and
                                clear instructions for using every
                                recommendation.
                            </p>
                            <p className="mt-5 font-serif text-3xl text-foreground">
                                $59
                            </p>
                            <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                One-time purchase
                            </p>
                            <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-foreground/60">
                                The $59 purchase includes your personalized
                                digital guide only. Recommended physical
                                products are not included and are sold
                                separately.
                            </p>

                            <div className="mx-auto mt-10 max-w-md space-y-3 text-left">
                                {[
                                    "Complete ordered product routine",
                                    "Why, Benefit, How, and Timing for every step",
                                    "Personalized weekly schedule and first 30-day action plan",
                                    "Progress checkpoints and troubleshooting guidance",
                                    "Saved product organization",
                                    "Daily length-retention tip",
                                    "Guidance on where to spend first, what to skip, and what not to combine",
                                    shouldShampooTwice
                                        ? "Your personalized double-cleanse instructions"
                                        : "Your single-pass gentle cleanse instructions",
                                ].map((feature, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3"
                                    >
                                        <Check
                                            className="mt-0.5 shrink-0 text-foreground/60"
                                            size={16}
                                        />
                                        <span className="text-sm text-foreground/80">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setCheckoutOpen(true)}
                                    className="inline-flex w-full items-center justify-center gap-3 bg-sage px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto pill-cta"
                                >
                                    Unlock The Growth Edit — $59
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Softened, disclaimer-forward offer for severe cases: still buyable,
          but the copy leads with "this won't fix it, see a professional"
          rather than the standard upsell framing. */}
            {hasSevereRedFlag && !unlocked && (
                <div className="mt-24 rounded-2xl border border-foreground/25 bg-paper px-6 py-12 text-center md:px-12 md:py-16">
                    {purchaseComplete ? (
                        <>
                            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/55">
                                You&apos;re All Set
                            </span>
                            <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
                                Thanks For Your Purchase
                            </h2>
                            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-foreground/80 md:text-base">
                                Sign in with the same email you just paid with
                                to view your gentle support guide. And please do
                                not delay seeing a dermatologist, GP, or
                                qualified trichology professional.
                            </p>
                            <div className="mt-10">
                                <button
                                    type="button"
                                    onClick={onRequireAuth}
                                    className="inline-flex w-full items-center justify-center gap-3 border border-foreground/30 px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/5 sm:w-auto pill-cta"
                                >
                                    Sign In
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/55">
                                Please Read Before Purchasing
                            </span>
                            <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
                                These Products Are Not A Treatment
                            </h2>
                            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-foreground/80 md:text-base">
                                Based on what you shared, please see a
                                dermatologist, GP, or qualified trichology
                                professional.{" "}
                                <strong>
                                    No product routine, including this one, will
                                    resolve the underlying change you noted.
                                </strong>{" "}
                                If you would still like gentle, conservative
                                product guidance to use alongside professional
                                care, it is available below.
                            </p>
                            <p className="mt-5 font-serif text-2xl text-foreground">
                                $59
                            </p>
                            <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                One-time purchase · Not a substitute for medical
                                care
                            </p>

                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setCheckoutOpen(true)}
                                    className="inline-flex w-full items-center justify-center gap-3 border border-foreground/30 px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/5 sm:w-auto pill-cta"
                                >
                                    Get Gentle Support Guide — $59
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="mt-20 text-center">
                <button
                    onClick={onReset}
                    className="text-[0.7rem] font-medium uppercase tracking-widest text-foreground/60 transition-colors hover:text-foreground"
                >
                    Retake Assessment
                </button>
            </div>

            <CheckoutSheet
                open={checkoutOpen}
                courseSlug={GROWTH_EDIT_SLUG}
                onClose={() => setCheckoutOpen(false)}
                onComplete={handleCheckoutComplete}
            />
        </div>
    );
}
