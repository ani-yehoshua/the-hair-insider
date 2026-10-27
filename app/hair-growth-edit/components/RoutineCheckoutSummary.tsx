import { ROUTINE_OFFER, ROUTINE_SALES_COPY } from "../lib/routineOffer";
import {
    formatFoundingPrice,
    formatRegularPrice,
    foundingReason,
    isFoundingClosed,
    type FoundingAvailability,
} from "../lib/foundingOffer";
import { RoutineInclusions } from "./RoutineInclusions";

export function RoutineCheckoutSummary({
    availability,
}: {
    availability: FoundingAvailability | null;
}) {
    const price = availability ? formatFoundingPrice(availability) : null;
    return (
        <section
            className="mb-5 border-b border-foreground/15 pb-5"
            aria-label="Order summary"
            data-testid="routine-checkout-summary"
        >
            <p className="pr-8 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">
                {ROUTINE_SALES_COPY.brand} · Your personalized routine
            </p>
            <h2 className="mt-2 font-serif text-2xl text-foreground">
                {ROUTINE_SALES_COPY.headline}
            </h2>
            <p className="mt-2 text-sm font-medium text-foreground/85">
                {ROUTINE_SALES_COPY.subhead}
            </p>
            {availability && price && (
                <div className="mt-3">
                    <p className="flex items-baseline gap-2">
                        <span className="sr-only">
                            {availability.active ? "Founding price:" : "Price:"}
                        </span>
                        <span className="font-serif text-4xl text-foreground">
                            {price}
                        </span>
                        {availability.active && (
                            <>
                                <span className="sr-only">Regular price:</span>
                                <s className="text-base text-foreground/55">
                                    {formatRegularPrice(availability)}
                                </s>
                            </>
                        )}
                    </p>
                    {availability.active && (
                        <p className="mt-1 text-xs leading-relaxed text-foreground/75">
                            {foundingReason(availability)}
                        </p>
                    )}
                    {isFoundingClosed(availability) && (
                        <p className="mt-1 text-xs leading-relaxed text-foreground/75">
                            The {availability.limit} founding-price spots have
                            been purchased. Regular pricing now applies.
                        </p>
                    )}
                </div>
            )}
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                {ROUTINE_SALES_COPY.problem} {ROUTINE_SALES_COPY.description}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/75">
                {ROUTINE_SALES_COPY.planScope}
            </p>
            <p className="mt-2 text-xs text-foreground/75">
                {ROUTINE_OFFER.reassurance}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-foreground/70">
                {ROUTINE_SALES_COPY.shelfNote}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-foreground/75">
                {ROUTINE_OFFER.fitPromise}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-foreground/70">
                {ROUTINE_OFFER.practicalCue}
            </p>
            <div
                className="mt-4 border-t border-foreground/10 pt-3"
                data-testid="routine-contents"
            >
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-foreground/60">
                    Included in your routine
                </p>
                <RoutineInclusions price={price} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-foreground/65">
                A weekly plan with phased milestones—not a day-by-day to-do
                list. Educational guidance, not a medical diagnosis or 1:1
                consultation. One-time purchase; products are sold separately.
            </p>
        </section>
    );
}
