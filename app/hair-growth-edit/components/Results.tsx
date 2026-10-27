import { useState } from "react";
import { track } from "@vercel/analytics";
import { ProductResult } from "../lib/scoring";
import type { RoutineStep } from "../data/recommendations";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CheckoutSheet } from "./CheckoutSheet";
import { ROUTINE_SALES_COPY } from "../lib/routineOffer";
import { getSalesFocus, getStartingFocusLabel } from "../lib/salesFocus";
import { getHeatCareCallout } from "../lib/salesPersonalization";
import { RoutineSalesCard } from "./RoutineSalesCard";
import { NextWashPreview } from "./NextWashPreview";
import { getFirstWashPlan } from "../lib/firstWash";
import type { HairProfile } from "../data/recommendations";
import { trackGrowthEvent } from "../lib/conversionAnalytics";
import {
    formatRegularPrice,
    type FoundingAvailability,
} from "../lib/foundingOffer";
import {
    isPurchasePendingSignIn,
    markPurchasePendingSignIn,
    type AnswerMap,
} from "../lib/assessmentStore";

const GROWTH_EDIT_SLUG = "hair-growth-edit";

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
    washFrequency: HairProfile["washFrequency"];
    stylePreference: HairProfile["stylePreference"];
    paidRoutine: RoutineStep[];
    supportingNeeds: string[];
    unlocked: boolean;
    price: string | null;
    availability?: FoundingAvailability | null;
    pricingError?: string | null;
    answers: AnswerMap;
    // The signed-in visitor's email, when there is one; they are never asked again.
    knownEmail?: string | null;
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
    washFrequency,
    stylePreference,
    paidRoutine,
    supportingNeeds,
    unlocked,
    price,
    availability = null,
    pricingError = null,
    answers,
    knownEmail = null,
    onRequireAuth,
    onReset,
}: ResultsProps) {
    const displayPrice = price ?? "$–";
    const previewPlan = hasSevereRedFlag ? null : getFirstWashPlan(paidRoutine, washFrequency, shouldShampooTwice, stylePreference);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [purchaseComplete, setPurchaseComplete] = useState(() =>
        isPurchasePendingSignIn(),
    );

    const openCheckout = () => {
        // No price loaded yet means no offer to buy.
        if (!availability) return;
        trackGrowthEvent("growth_purchase_clicked", { unit_amount: availability.unitAmount });
        try { track("checkout_opened", { severe: hasSevereRedFlag }); } catch { /* Never block checkout on analytics. */ }
        setCheckoutOpen(true);
    };

    const handleCheckoutComplete = () => {
        try { track("checkout_completed"); } catch { /* Preserve purchase access even if analytics fails. */ }
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
          : "This assessment is educational guidance, not a medical diagnosis. The suggestions below are based on what you reported, and may not fit if your answers were incomplete or uncertain.";

    const leadObservation = hasSevereRedFlag
        ? "The change you reported deserves professional evaluation before you alter your routine."
        : ((primaryCause === "heat / chemical stress" ? getHeatCareCallout(answers) : null) ??
          supportingNeeds.find((note) => note.startsWith("You reported")) ??
          (primaryCause === "length protection (no dominant damage pattern)"
              ? "Your answers did not point to one dominant damage pattern, so a gentle, repeatable routine is a reasonable starting point."
              : `Your plan starts with ${getStartingFocusLabel(primaryCause)}. Keep it simple, then adjust.`));
    const behaviorWhy = hasSevereRedFlag
        ? "It can add avoidable stress while you arrange professional care."
        : primaryCause === "length protection (no dominant damage pattern)"
          ? "It may add avoidable friction even when your answers show no dominant damage pattern."
          : `It can work against your starting focus: ${getStartingFocusLabel(primaryCause)}.`;

    return (
        <div
            className="mx-auto w-full max-w-4xl px-5 pb-32 pt-8 md:px-8 md:pt-12 slide-up"
            data-testid="section-results"
        >
            <div className="mb-10">
                <h1 className="max-w-3xl font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
                    {hasSevereRedFlag
                        ? `Please get this change checked. You shampoo ${shampooFrequencyAnswer?.toLowerCase() ?? "on your schedule"}.`
                        : "Finally, a wash day routine built around what your hair actually needs."}
                </h1>
                {!hasSevereRedFlag && (
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground/85" data-testid="results-starting-focus">
                        {getSalesFocus(primaryCause)} Here’s your starting plan.
                    </p>
                )}
                <span className="mt-3 block text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
                    Your Assessment · {shampooFrequencyAnswer ? `You shampoo ${shampooFrequencyAnswer.toLowerCase()}` : "Your Wash Days"}
                </span>
                <p className="mt-4 max-w-2xl rounded-xl bg-sage/35 px-5 py-4 text-sm leading-relaxed text-foreground/80">
                    {leadObservation}
                </p>
                {hasSevereRedFlag && (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80 md:text-base">
                        Your answers point to a change that needs professional assessment. Your results and gentle interim suggestions are below.
                    </p>
                )}
                {hasSevereRedFlag && (
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">
                        {disclaimer}
                    </p>
                )}
                {!hasSevereRedFlag && hasMinorRedFlag && (
                    <p className="mt-3 text-xs leading-relaxed text-foreground/70">
                        Quiz-based guidance. Persistent or worsening scalp or hair changes deserve professional review.
                    </p>
                )}
                {!hasSevereRedFlag && !unlocked && (
                    <div
                        className={
                            purchaseComplete
                                ? "mt-5 rounded-2xl border border-foreground/15 bg-blue px-5 py-5 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:px-8"
                                : ""
                        }
                    >
                        {purchaseComplete ? (
                            <>
                                <div>
                                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">
                                        Purchase Complete
                                    </span>
                                    <h2 className="mt-2 font-serif text-2xl text-foreground md:text-3xl">
                                        Your personalized routine is ready.
                                    </h2>
                                    <p className="mt-3 text-sm text-foreground/75">
                                        Sign in with the email you used at
                                        checkout to open your routine.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onRequireAuth}
                                    className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-foreground px-6 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background md:mt-0 pill-cta"
                                >
                                    Sign In <ArrowRight size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <RoutineSalesCard
                                    availability={availability}
                                    primaryCause={primaryCause}
                                    answers={answers}
                                    preview={previewPlan && <NextWashPreview plan={previewPlan} />}
                                    checkoutAction={
                                        <button
                                            type="button"
                                            onClick={openCheckout}
                                            disabled={!availability}
                                            className="inline-flex w-full items-center justify-center gap-2 bg-foreground px-5 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 pill-cta"
                                        >
                                            {ROUTINE_SALES_COPY.cta}{" "}
                                            <ArrowRight size={14} />
                                        </button>
                                    }
                                />
                                {pricingError && (
                                    <p
                                        className="mt-3 text-sm text-foreground/80"
                                        role="alert"
                                    >
                                        {pricingError}
                                    </p>
                                )}
                                <p className="mt-2 text-center text-xs text-foreground/65">
                                    7-day refund window for first-time
                                    purchases.{" "}
                                    <a
                                        href="/terms"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline"
                                    >
                                        Terms
                                    </a>
                                </p>
                            </>
                        )}
                    </div>
                )}
                {!hasSevereRedFlag && (
                    <p className="mt-4 text-xs leading-relaxed text-foreground/60">
                        {disclaimer}
                    </p>
                )}
            </div>

            <div className="space-y-12">
                {/* Root Cause */}
                <div className="border-t border-foreground/15 pt-10">
                    <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                        01 / Starting Focus
                    </span>
                    <h2 className="mt-3 font-serif text-2xl text-foreground">
                        Your starting focus: {getStartingFocusLabel(primaryCause)}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">
                        {primaryCause ===
                        "length protection (no dominant damage pattern)" ? (
                            <>
                                Your answers did not point to one dominant
                                damage pattern.{" "}
                                <strong>Protecting your lengths</strong> is a
                                suggested starting focus, not a conclusion about
                                your hair’s health.
                            </>
                        ) : (
                            <>
                                Based on what you reported,{" "}
                                <strong>{getStartingFocusLabel(primaryCause)}</strong> is a suggested
                                starting focus, informed by {observations[0]}{" "}
                                and {observations[1]}.
                            </>
                        )}
                        {hasSevereRedFlag &&
                            " Because of the change you noted, use the recommendations below as gentle interim support while arranging a professional consultation."}
                    </p>
                </div>

                {supportingNeeds.some((need) => need !== leadObservation) && (
                    <div className="border-t border-foreground/15 pt-10">
                        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                            How your answers shaped the routine
                        </span>
                        <div className="mt-6 grid gap-3">
                            {supportingNeeds
                                .filter((need) => need !== leadObservation)
                                .map((need) => (
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
                        A habit to reconsider
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">
                        Consider reducing <strong>{behaviorToStop}</strong>.{" "}
                        {behaviorWhy}
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
                                : "Your starting product recommendations are below, selected from your answers. Your full personalized Growth Edit is a separate, one-time purchase; hair products are sold separately."}
                        </p>
                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            {[product1, product2].map((prod) => (
                                <div
                                    key={prod.id}
                                    className="panel-outline rounded-2xl bg-border px-6 py-8"
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
                                    This routine cannot identify or treat the
                                    underlying cause of the change you reported.
                                </strong>{" "}
                                If you would still like gentle, conservative
                                product guidance to use alongside professional
                                care, it is available below.
                            </p>
                            <p className="mt-5 flex items-baseline justify-center gap-2 font-serif text-3xl text-foreground">
                                {displayPrice}
                                {availability?.active && (
                                    <span className="font-sans text-lg text-destructive line-through">
                                        {formatRegularPrice(availability)}
                                    </span>
                                )}
                            </p>
                            <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                                One-time purchase · Not a substitute for medical
                                care
                            </p>

                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => openCheckout()}
                                    disabled={!availability}
                                    className="inline-flex w-full items-center justify-center gap-3 border border-foreground/30 px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/5 sm:w-auto pill-cta"
                                >
                                    Get my step-by-step routine – {displayPrice}
                                </button>
                                <p className="mt-3 text-xs leading-relaxed text-foreground/70">
                                    Built from your quiz answers. Educational
                                    guidance, not a medical diagnosis or 1:1
                                    consult.
                                </p>
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
                availability={availability}
                answers={answers}
                knownEmail={knownEmail}
                onClose={() => setCheckoutOpen(false)}
                onComplete={handleCheckoutComplete}
            />
        </div>
    );
}
