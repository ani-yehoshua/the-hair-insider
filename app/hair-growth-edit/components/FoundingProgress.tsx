import {
    isFoundingClosed,
    type FoundingAvailability,
} from "../lib/foundingOffer";

export function FoundingProgress({
    availability,
}: {
    availability: FoundingAvailability;
}) {
    const closed = isFoundingClosed(availability);
    const remaining = Math.max(0, availability.limit - availability.claimed);
    const percent = Math.min(
        100,
        (availability.claimed / availability.limit) * 100,
    );

    return (
        <div className="mt-4" data-testid="founding-progress">
            <p
                className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-foreground/80"
                aria-live="polite"
            >
                <span>
                    {availability.claimed} of {availability.limit} founding
                    spots claimed
                </span>
                <span className="font-medium">
                    {closed
                        ? "Founding price closed"
                        : `${remaining} remaining`}
                </span>
            </p>
            <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10"
                role="progressbar"
                aria-label="Purchased founding-price spots"
                aria-valuemin={0}
                aria-valuemax={availability.limit}
                aria-valuenow={availability.claimed}
                aria-valuetext={`${availability.claimed} of ${availability.limit} purchased`}
            >
                <div
                    className="h-full rounded-full bg-foreground/65 transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
