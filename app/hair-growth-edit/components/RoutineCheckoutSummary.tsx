import { ROUTINE_OFFER } from "../lib/routineOffer";
import {
    formatFoundingPrice,
    formatRegularPrice,
    isFoundingClosed,
    type FoundingAvailability,
} from "../lib/foundingOffer";

function spotsLeftLine(availability: FoundingAvailability) {
    const left = Math.max(0, availability.limit - availability.claimed);
    return `Founding price · ${left} ${left === 1 ? "spot" : "spots"} left`;
}

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
            <h2 className="pr-8 font-serif text-2xl leading-tight text-foreground">
                {ROUTINE_OFFER.title}
            </h2>
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
                            {spotsLeftLine(availability)}
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
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/85">
                {[
                    "Your 30-day calendar, built from your answers",
                    "Your shelf: the 3 products to start with, and what to skip",
                    "Check-ins so you can see it working",
                ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                        <span aria-hidden="true" className="shrink-0 text-foreground/60">✓</span>
                        <span>{line}</span>
                    </li>
                ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-foreground/75">
                Instant access · One-time payment · 7-day refund for first-time purchases{" "}
                <a href="/terms" target="_blank" rel="noreferrer" className="underline">
                    Terms
                </a>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/65">
                Products sold separately. Educational guidance, not medical advice.
            </p>
        </section>
    );
}
