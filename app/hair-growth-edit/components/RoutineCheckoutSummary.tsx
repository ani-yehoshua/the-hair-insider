import { ROUTINE_OFFER } from '../lib/routineOffer';
import { RoutineInclusions } from './RoutineInclusions';

export function RoutineCheckoutSummary({ price, compareAtPrice = '$69' }: { price: string | null; compareAtPrice?: string }) {
  return (
    <section className="mb-5 border-b border-foreground/15 pb-5" aria-label="Order summary" data-testid="routine-checkout-summary">
      <p className="pr-8 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">{ROUTINE_OFFER.label}</p>
      <h2 className="mt-2 font-serif text-2xl text-foreground">{ROUTINE_OFFER.title}</h2>
      {price && (
        <div className="mt-3">
          <p className="flex items-baseline gap-2">
            <span className="sr-only">Planned regular price:</span>
            <s className="text-sm text-foreground/60">{compareAtPrice}</s>
            <span className="sr-only">Founding launch price:</span>
            <span className="font-serif text-3xl text-foreground">{price}</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/75">{ROUTINE_OFFER.launchReason}</p>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-1 text-[0.55rem] font-medium uppercase tracking-wide text-foreground/75" aria-label="Routine preview: cleanse, care, maintain">
        <span className="rounded-full border border-foreground/20 px-2 py-1">01 Cleanse</span>
        <span aria-hidden="true">→</span>
        <span className="rounded-full border border-foreground/20 px-2 py-1">02 Care</span>
        <span aria-hidden="true">→</span>
        <span className="rounded-full border border-foreground/20 px-2 py-1">03 Maintain</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/85">{ROUTINE_OFFER.value}</p>
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
