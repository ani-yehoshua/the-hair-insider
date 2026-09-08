import { ProductResult } from '../lib/scoring';
import type { RoutineStep } from '../data/recommendations';
import { ArrowRight, Check } from 'lucide-react';

// Paste your Stripe Payment Link here when it is ready.
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/00wbJ2aP1g7E5LEcyD4c802';

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
  onReset: () => void;
  onOpenProgress: () => void;
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
  onReset,
  onOpenProgress,
}: ResultsProps) {
  const getFoundationInstructions = (product: ProductResult) => {
    const matchingStep = paidRoutine.find((step) => step.product.id === product.id);
    if (matchingStep) return `${matchingStep.timing}. ${matchingStep.instruction}`;
    return 'Use according to the product directions, starting with a small amount and adjusting only after observing how your hair responds.';
  };
  
  const disclaimer = hasSevereRedFlag
    ? "Your answers include a change best assessed by a dermatologist, GP, or qualified trichology professional. This quiz cannot diagnose it. Please seek professional care."
    : hasMinorRedFlag
    ? "This assessment is educational guidance, not a medical diagnosis. Since you noted some scalp or hair changes, we advise professional review if they are persistent or worsening."
    : "This assessment is educational guidance, not a medical diagnosis. The recommendations below reflect the strongest patterns in your answers.";

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-32 pt-12 md:px-8 md:pt-20 slide-up" data-testid="section-results">
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
            {primaryCause.charAt(0).toUpperCase() + primaryCause.slice(1)}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">
            Your strongest pattern points to <strong>{primaryCause}</strong>, supported by the presence of {observations[0]} and {observations[1]}. 
            {hasSevereRedFlag && " Because of the severe symptoms you noted, prioritize a professional consultation before adopting new routines."}
          </p>
        </div>

        {supportingNeeds.length > 0 && !hasSevereRedFlag && (
          <div className="border-t border-foreground/15 pt-10">
            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
              How your answers shaped the routine
            </span>
            <div className="mt-6 grid gap-3">
              {supportingNeeds.map((need) => (
                <p key={need} className="rounded-xl bg-sage/35 px-5 py-4 text-sm leading-relaxed text-foreground/80">
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
            For now, stop <strong>{behaviorToStop}</strong>. It most directly reinforces the symptoms you are experiencing. Restoring health requires removing the source of the stress first.
          </p>
        </div>

        {/* Free showcase products */}
        {!hasSevereRedFlag && product1 && product2 && <div className="border-t border-foreground/15 pt-10">
          <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
            03 / Foundation Steps
          </span>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/70">
            These two products are your starting point. The complete guide prioritizes the third essential and shows how to build the rest of your routine.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[product1, product2].map((prod) => (
              <div key={prod.id} className="panel-outline rounded-2xl bg-paper px-6 py-8">
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
                <h3 className="mt-2 font-serif text-xl text-foreground">{prod.name}</h3>
                <p className="mt-1 text-xs font-medium text-foreground/60">{prod.brand}</p>
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                  <strong>Why to use:</strong> {prod.reason}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                  <strong>How to use:</strong> {getFoundationInstructions(prod)}
                </p>
                <a 
                  href={prod.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-widest text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  View Details
                </a>
              </div>
            ))}
          </div>
        </div>}
        {hasSevereRedFlag && (
          <div className="border-t border-foreground/15 pt-10">
            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">03 / Referral First</span>
            <h2 className="mt-3 font-serif text-2xl text-foreground">Pause product changes for now</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">
              Your answers need professional assessment before a new product routine. No products are being recommended from this result.
            </p>
          </div>
        )}
      </div>

      {/* Paid complete guide */}
      {!hasSevereRedFlag && <div className="mt-24 rounded-2xl border border-foreground/15 bg-paper-dark px-6 py-12 text-center md:px-12 md:py-16">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/55">
          Your Complete Growth Plan
        </span>
        <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
          Unlock The Growth Edit
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-foreground/80 md:text-base">
          Get your personalized Top 3 buying priorities, complete product routine, wash-day schedule, and clear instructions for using every recommendation.
        </p>
        <p className="mt-5 font-serif text-3xl text-foreground">$59</p>
        <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
          One-time purchase
        </p>

        <div className="mx-auto mt-10 max-w-md space-y-3 text-left">
          {[
            "Your top 3 buying priorities, then the remaining routine",
            "Usage timing and schedule tailoring",
            "Saved products, daily hair tips, and sale alerts",
            "Private progress journal and photos",
            shouldShampooTwice 
              ? "Includes why almost everyone should shampoo twice (and how to do it)"
              : "Includes your single-pass gentle cleanse instructions"
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <Check className="mt-0.5 shrink-0 text-foreground/60" size={16} />
              <span className="text-sm text-foreground/80">{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {STRIPE_PAYMENT_LINK ? (
            <a
              href={STRIPE_PAYMENT_LINK}
              className="inline-flex w-full items-center justify-center gap-3 bg-sage px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-foreground transition-opacity hover:opacity-90 sm:w-auto pill-cta"
            >
              Unlock The Growth Edit — $59
              <ArrowRight size={14} />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-3 bg-sage px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-foreground opacity-60 sm:w-auto pill-cta"
              title="Add the Stripe Payment Link in Results.tsx"
            >
              Unlock The Growth Edit — $59
              <ArrowRight size={14} />
            </button>
          )}
          <button
            onClick={onOpenProgress}
            className="inline-flex w-full items-center justify-center gap-3 border border-foreground/20 px-8 py-4 text-[0.7rem] font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-foreground/5 sm:w-auto pill-cta"
          >
            View Progress Preview
          </button>
        </div>
      </div>}

      <div className="mt-20 text-center">
        <button
          onClick={onReset}
          className="text-[0.7rem] font-medium uppercase tracking-widest text-foreground/60 transition-colors hover:text-foreground"
        >
          Retake Assessment
        </button>
      </div>
    </div>
  );
}
