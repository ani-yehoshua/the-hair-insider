import { useState } from "react";
import { track } from "@vercel/analytics";
import { ProductResult } from "../lib/scoring";
import type { RoutineStep } from "../data/recommendations";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CheckoutSheet } from "./CheckoutSheet";
import {
    GROWTH_EDIT_COMPARE_AT_PRICE,
    GROWTH_EDIT_PROMO_LABEL,
} from "@/lib/pricing/growthEdit";
import {
    isPurchasePendingSignIn,
    markPurchasePendingSignIn,
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
    paidRoutine,
    supportingNeeds,
    unlocked,
    price,
    onRequireAuth,
    onReset,
}: ResultsProps) {
    const displayPrice = price ?? "$–";
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
          : "This assessment is educational guidance, not a medical diagnosis. The suggestions below are based on what you reported, and may not fit if your answers were incomplete or uncertain.";

    const leadObservation = hasSevereRedFlag
        ? "The change you reported deserves professional evaluation before you alter your routine."
        : (supportingNeeds.find((note) => note.startsWith("You reported")) ??
          (primaryCause === "length protection (no dominant damage pattern)"
              ? "Your answers did not point to one dominant damage pattern, so a gentle, repeatable routine is a reasonable starting point."
              : `You reported ${observations[0] ?? "changes in your current routine"}, so consider starting with the strongest pattern suggested by your answers.`));
    const behaviorWhy = hasSevereRedFlag
        ? "It can add avoidable stress while you arrange professional care."
        : primaryCause === "length protection (no dominant damage pattern)"
          ? "It may add avoidable friction even when your answers show no dominant damage pattern."
          : `It may add to the ${primaryCause} pattern suggested by your answers.`;

    return (
        <div
            className="mx-auto w-full max-w-4xl px-5 pb-32 pt-8 md:px-8 md:pt-12 slide-up"
            data-testid="section-results"
        >
            <div className="mb-10">
                <h1 className="max-w-3xl font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
                    {hasSevereRedFlag
                        ? `Please get this change checked. You shampoo ${shampooFrequencyAnswer?.toLowerCase() ?? "on your schedule"}.`
                        : `You shampoo ${shampooFrequencyAnswer?.toLowerCase() ?? "on your schedule"}; your answers suggest focusing on ${primaryCause === "length protection (no dominant damage pattern)" ? "protecting length" : primaryCause}.`}
                </h1>
                <span className="mt-3 block text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/60">
                    Your Assessment · Your Wash Days
                </span>
                <p className="mt-4 max-w-2xl rounded-xl bg-sage/35 px-5 py-4 text-sm leading-relaxed text-foreground/80">
                    {leadObservation}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80 md:text-base">
                    {hasSevereRedFlag
                        ? "Your answers point to a change that needs professional assessment. Your results and gentle interim suggestions are below."
                        : "Your two free starting products are below. The complete guide puts the rest of your routine in order."}
                </p>
                {(hasSevereRedFlag || hasMinorRedFlag) && (
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">
                        {disclaimer}
                    </p>
                )}
                {!hasSevereRedFlag && !unlocked && (
                    <div className="mt-5 rounded-2xl border border-foreground/15 bg-blue px-5 py-5 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:px-8">
                        {purchaseComplete ? (
                            <>
                                <div>
                                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">
                                        Purchase Complete
                                    </span>
                                    <h2 className="mt-2 font-serif text-2xl text-foreground md:text-3xl">
                                        Your complete guide is ready.
                                    </h2>
                                    <p className="mt-3 text-sm text-foreground/75">
                                        Sign in with the email you used at
                                        checkout to open your guide.
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
                                <div>
                                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">
                                        The Complete Growth Edit
                                    </span>
                                    <h2 className="mt-2 font-serif text-2xl leading-tight text-foreground md:text-3xl">
                                        Your routine, in the right order.
                                    </h2>
                                </div>
                                <div className="mt-5 md:mt-0 md:min-w-64">
                                    <div
                                        className="mb-3 flex items-center justify-center gap-1 text-[0.55rem] font-medium uppercase tracking-wide text-foreground/75"
                                        aria-label="Routine preview: cleanse, care, maintain"
                                    >
                                        <span className="rounded-full border border-foreground/20 px-2 py-1">
                                            01 Cleanse
                                        </span>
                                        <span aria-hidden="true">→</span>
                                        <span className="rounded-full border border-foreground/20 px-2 py-1">
                                            02 Care
                                        </span>
                                        <span aria-hidden="true">→</span>
                                        <span className="rounded-full border border-foreground/20 px-2 py-1">
                                            03 Maintain
                                        </span>
                                    </div>
                                    <p className="mb-2 flex items-baseline justify-center gap-2">
                                        <span className="font-serif text-4xl text-foreground">
                                            {displayPrice}
                                        </span>
                                        {price && (
                                            <span className="text-xl text-destructive line-through">
                                                {GROWTH_EDIT_COMPARE_AT_PRICE}
                                            </span>
                                        )}
                                    </p>
                                    <p className="mb-3 text-center text-[0.65rem] font-semibold uppercase tracking-widest text-foreground/80">
                                        {GROWTH_EDIT_PROMO_LABEL}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={openCheckout}
                                        className="inline-flex w-full items-center justify-center gap-2 bg-foreground px-5 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-background transition-opacity hover:opacity-90 pill-cta"
                                    >
                                        Get my step-by-step routine –{" "}
                                        {displayPrice} <ArrowRight size={14} />
                                    </button>
                                    <p className="mt-2 text-center text-xs text-foreground/75">
                                        Built from your quiz answers.
                                        Educational guidance, not a 1:1 consult.
                                    </p>
                                    <p className="mt-1 text-center text-xs text-foreground/75">
                                        A flexible, step-by-step routine you can
                                        apply each week — what to use, in what
                                        order, and what not to combine.
                                    </p>
                                    <p className="mt-1 text-center text-xs text-foreground/75">
                                        If anything isn’t clear, reply to your
                                        receipt for clarification.
                                    </p>
                                    <p className="mt-1 text-center text-[0.65rem] text-foreground/60">
                                        One-time digital guide. Products sold
                                        separately.
                                    </p>
                                    <p className="mt-2 text-center text-xs text-foreground/65">
                                        Instant access · 7-day refund window for
                                        first-time purchases.{" "}
                                        <a
                                            href="/terms"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline"
                                        >
                                            Terms
                                        </a>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}
                {!hasSevereRedFlag && !hasMinorRedFlag && (
                    <p className="mt-4 text-xs leading-relaxed text-foreground/60">
                        {disclaimer}
                    </p>
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
                                <strong>{primaryCause}</strong> is a suggested
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
                                : "These two options were selected from your answers. The guide adds suggested order, timing, and combinations to avoid."}
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
                                {price && (
                                    <span className="font-sans text-lg text-destructive line-through">
                                        {GROWTH_EDIT_COMPARE_AT_PRICE}
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
                onClose={() => setCheckoutOpen(false)}
                onComplete={handleCheckoutComplete}
            />
        </div>
    );
}
