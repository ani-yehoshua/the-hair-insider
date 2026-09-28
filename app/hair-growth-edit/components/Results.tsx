import { useState } from "react";
import { track } from "@vercel/analytics";
import { ProductResult } from "../lib/scoring";
import type { RoutineStep } from "../data/recommendations";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { CheckoutSheet } from "./CheckoutSheet";
import { GROWTH_EDIT_PRICE_CENTS, GROWTH_EDIT_SLUG } from "@/lib/pricing/growthEdit";
import {
    isPurchasePendingSignIn,
    markPurchasePendingSignIn,
} from "../lib/assessmentStore";

interface ResultsProps {
    primaryCause: string;
    shampooFrequencyAnswer: string | null;
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
    price: string | null;
    onRequireAuth: () => void;
    onReset: () => void;
}

export function Results({
    primaryCause,
    shampooFrequencyAnswer,
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
    price,
    onRequireAuth,
    onReset,
}: ResultsProps) {
    const displayPrice = price ?? `$${GROWTH_EDIT_PRICE_CENTS / 100}`;
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [purchaseComplete, setPurchaseComplete] = useState(() =>
        isPurchasePendingSignIn(),
    );

    const openCheckout = () => {
        track("checkout_opened", { severe: hasSevereRedFlag });
        setCheckoutOpen(true);
    };

    const handleCheckoutComplete = () => {
        track("checkout_completed");
        markPurchasePendingSignIn();
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
            className="mx-auto w-full max-w-4xl px-5 pb-32 pt-8 md:px-8 md:pt-12 slide-up"
            data-testid="section-results"
        >
            <div className="mb-10">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
                    Your Assessment · Your Wash Days
                </span>
                <h1 className="mt-3 max-w-3xl font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
                    You shampoo {shampooFrequencyAnswer?.toLowerCase() ?? "on your schedule"}.
                    <span className="block">{hasSevereRedFlag ? "Please get this change checked." : "Now make each wash count."}</span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80 md:text-base">
                    {hasSevereRedFlag ? (
                        "Your answers point to a change that needs professional assessment. Your results and gentle interim suggestions are below."
                    ) : (
                        <>Your answers point to <strong>{primaryCause}</strong>. Below are your two free starting products; the complete guide puts them in order with the rest of your routine.</>
                    )}
                </p>
                {(hasSevereRedFlag || hasMinorRedFlag) && (
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">{disclaimer}</p>
                )}
                {!hasSevereRedFlag && !unlocked && (
                    <div className="mt-6 rounded-2xl border border-foreground/15 bg-blue px-5 py-6 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:px-8">
                        {purchaseComplete ? (
                            <>
                                <div>
                                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">Purchase Complete</span>
                                    <h2 className="mt-2 font-serif text-2xl text-foreground md:text-3xl">Your complete guide is ready.</h2>
                                    <p className="mt-3 text-sm text-foreground/75">Sign in with the email you used at checkout to open your guide.</p>
                                </div>
                                <button type="button" onClick={onRequireAuth} className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-foreground px-6 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background md:mt-0 pill-cta">
                                    Sign In <ArrowRight size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">The Complete Growth Edit</span>
                                    <h2 className="mt-2 font-serif text-2xl leading-tight text-foreground md:text-3xl">Stop guessing what to buy and when to use it.</h2>
                                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground/75">Your buying order, a routine for your wash days, and a manageable first 30 days. Start with what matters; you do not need to buy everything at once.</p>
                                </div>
                                <div className="mt-5 md:mt-0 md:min-w-56">
                                    <button type="button" onClick={openCheckout} className="inline-flex w-full items-center justify-center gap-2 bg-foreground px-5 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 pill-cta">
                                        Get My Guide — {displayPrice} <ArrowRight size={14} />
                                    </button>
                                    <p className="mt-2 text-center text-xs text-foreground/65">One-time digital guide. Products sold separately.</p>
                                    <p className="mt-2 text-center text-xs text-foreground/65">Instant access · 7-day refund window for first-time purchases. <a href="/terms" target="_blank" rel="noreferrer" className="underline">Terms</a></p>
                                </div>
                            </>
                        )}
                    </div>
                )}
                {!hasSevereRedFlag && !hasMinorRedFlag && (
                    <p className="mt-4 text-xs leading-relaxed text-foreground/60">{disclaimer}</p>
                )}
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
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Short repeat of the buy button for people who read to the end.
                All the detail lives in the offer panel above. The post-purchase
                state is shown there, so this hides once they've paid. */}
            {!hasSevereRedFlag && !unlocked && !purchaseComplete && (
                <div className="mt-24 rounded-2xl border border-foreground/15 bg-paper-dark px-6 py-10 text-center md:px-12">
                    <h2 className="font-serif text-2xl leading-tight tracking-tight text-foreground md:text-3xl">
                        Know What To Do Next
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/80">
                        The complete guide shows where your two foundation products fit, what to add next, and how to use each step in your week.
                    </p>
                    <button
                        type="button"
                        onClick={() => openCheckout()}
                        className="mt-6 inline-flex w-full items-center justify-center gap-3 bg-foreground px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 sm:w-auto pill-cta"
                    >
                        Get My Complete Guide — {displayPrice}
                        <ArrowRight size={14} />
                    </button>
                    <p className="mt-3 text-[0.65rem] uppercase tracking-widest text-foreground/50">
                        Apple Pay · Google Pay · Card
                    </p>
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
                                {displayPrice}
                            </p>
                            <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                One-time purchase · Not a substitute for medical
                                care
                            </p>

                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => openCheckout()}
                                    className="inline-flex w-full items-center justify-center gap-3 border border-foreground/30 px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/5 sm:w-auto pill-cta"
                                >
                                    Get Gentle Support Guide — {displayPrice}
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
