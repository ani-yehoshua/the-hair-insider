import { ROUTINE_OFFER, ROUTINE_SALES_COPY } from '../lib/routineOffer';
import { RoutineInclusions } from './RoutineInclusions';

export function RoutineCheckoutSummary({ price, compareAtPrice = '$69' }: { price: string | null; compareAtPrice?: string }) {
  const regularPrice = price === compareAtPrice;
  return (
    <section className="mb-5 border-b border-foreground/15 pb-5" aria-label="Order summary" data-testid="routine-checkout-summary">
      <p className="pr-8 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">{ROUTINE_SALES_COPY.brand} · Your personalized routine</p>
      <h2 className="mt-2 font-serif text-2xl text-foreground">{ROUTINE_SALES_COPY.headline}</h2>
      {price && (
        <div className="mt-3">
          <p className="flex items-baseline gap-2">
            {!regularPrice && <><span className="sr-only">Regular price:</span><s className="text-sm text-foreground/60">{compareAtPrice}</s></>}
            <span className="sr-only">{regularPrice ? 'Regular price:' : 'Founding price:'}</span>
            <span className="font-serif text-3xl text-foreground">{price}</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/75">{regularPrice ? 'The 100 founding-price spots have been purchased. Regular pricing now applies.' : ROUTINE_SALES_COPY.launchReason}</p>
        </div>
      )}
      <p className="mt-3 text-sm leading-relaxed text-foreground/85">{ROUTINE_SALES_COPY.description}</p>
      <p className="mt-2 text-xs text-foreground/75">{ROUTINE_OFFER.reassurance}</p>
      <p className="mt-3 text-xs leading-relaxed text-foreground/75">{ROUTINE_OFFER.fitPromise}</p>
      <p className="mt-3 text-xs leading-relaxed text-foreground/70">{ROUTINE_OFFER.practicalCue}</p>
      <div className="mt-4 border-t border-foreground/10 pt-3" data-testid="routine-contents">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-foreground/60">Included in your routine</p>
        <RoutineInclusions price={price} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-foreground/65">A weekly plan with phased milestones—not a day-by-day to-do list. Educational guidance, not a medical diagnosis or 1:1 consultation. One-time purchase; products are sold separately.</p>
    </section>
  );
}
