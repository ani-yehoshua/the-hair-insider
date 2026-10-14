import { ROUTINE_OFFER } from "../lib/routineOffer";

export function RoutineInclusions({ price }: { price?: string | null }) {
    return (
        <div
            className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
            data-testid="inclusions-value"
        >
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground/85">
                {ROUTINE_OFFER.inclusions.join(" · ")}
            </p>
            {price && (
                <p
                    className="w-fit shrink-0 whitespace-nowrap rounded-full border border-foreground/20 px-3 py-1 text-xs text-foreground/80"
                    data-testid="inclusions-price"
                >
                    One-time{" "}
                    <strong className="font-medium text-foreground">
                        {price}
                    </strong>
                </p>
            )}
        </div>
    );
}
