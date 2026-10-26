import type { FoundingAvailability } from '../lib/foundingOffer';

export function FoundingProgress({ availability }: { availability: FoundingAvailability }) {
  const soldOut = availability.claimed === availability.limit;
  const remaining = availability.limit - availability.claimed;
  return (
    <div className="mt-4" data-testid="founding-progress">
      <p className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-foreground/80" aria-live="polite">
        <span>{availability.claimed} of {availability.limit} founding spots claimed</span>
        <span className="font-medium">{soldOut ? 'Founding price closed' : `${remaining} remaining`}</span>
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10" role="progressbar"
        aria-label="Purchased founding-price spots" aria-valuemin={0} aria-valuemax={availability.limit}
        aria-valuenow={availability.claimed} aria-valuetext={`${availability.claimed} of ${availability.limit} purchased`}>
        <div className="h-full rounded-full bg-foreground/65 transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${availability.claimed / availability.limit * 100}%` }} />
      </div>
      {!soldOut && availability.available === 0 && (
        <p className="mt-2 text-xs leading-relaxed text-foreground/70">The remaining founding spots are currently in checkout. Please try again shortly.</p>
      )}
    </div>
  );
}
