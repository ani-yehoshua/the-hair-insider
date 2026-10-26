import type { ReactNode } from "react";
import { ROUTINE_OFFER, ROUTINE_SALES_COPY } from "../lib/routineOffer";
import { FoundingProgress } from "./FoundingProgress";
import {
    formatFoundingPrice,
    formatRegularPrice,
    foundingReason,
    isFoundingClosed,
    type FoundingAvailability,
} from "../lib/foundingOffer";

interface RoutineSalesCardProps {
    availability: FoundingAvailability | null;
    checkoutAction: ReactNode;
}

export function RoutineSalesCard({
    availability,
    checkoutAction,
}: RoutineSalesCardProps) {
    const closed = availability ? isFoundingClosed(availability) : false;
    // The spot bar only appears while the founder price is on offer, or
    // after it has sold out. Before then it's just the regular price.
    const showFounding = !!availability && (availability.active || closed);

    return (
        <section
            className="mt-5 rounded-2xl border border-foreground/15 bg-blue px-5 py-7 md:px-8 md:py-8"
            aria-labelledby="growth-edit-offer-heading"
            data-testid="routine-sales-card"
        >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/70">
                    {ROUTINE_SALES_COPY.brand}
                </p>
            </div>
            <div className="mt-5 md:grid md:grid-cols-[1.15fr_1fr] md:gap-10">
                <div>
                    <h2
                        id="growth-edit-offer-heading"
                        className="max-w-lg font-serif text-3xl leading-tight text-foreground md:text-4xl"
                    >
                        {ROUTINE_SALES_COPY.headline}
                    </h2>
                    <p
                        className="mt-4 text-base leading-relaxed text-foreground/85"
                        data-testid="cta-benefit"
                    >
                        {ROUTINE_SALES_COPY.description}
                    </p>
                    <p className="mt-3 text-sm text-foreground/70">
                        {ROUTINE_SALES_COPY.planScope}
                    </p>
                </div>
                <div className="mt-6 md:mt-0 md:pt-1">
                    <div data-testid="launch-pricing">
                        {availability ? (
                            <>
                                <p className="flex items-baseline gap-3">
                                    <span className="sr-only">
                                        {availability.active
                                            ? "Founding price:"
                                            : "Price:"}
                                    </span>
                                    <span className="font-serif text-4xl text-foreground">
                                        {formatFoundingPrice(availability)}
                                    </span>
                                    {availability.active && (
                                        <>
                                            <span className="sr-only">
                                                Regular price:
                                            </span>
                                            <s className="text-base text-foreground/55">
                                                {formatRegularPrice(
                                                    availability,
                                                )}
                                            </s>
                                        </>
                                    )}
                                </p>
                                <p className="mt-1 text-xs text-foreground/75">
                                    One-time purchase
                                </p>
                                {availability.active && (
                                    <p className="mt-2 text-xs leading-relaxed text-foreground/65">
                                        {foundingReason(availability)}
                                    </p>
                                )}
                                {closed && (
                                    <p className="mt-2 text-xs leading-relaxed text-foreground/65">
                                        Regular pricing
                                    </p>
                                )}
                            </>
                        ) : (
                            <p
                                className="text-sm text-foreground/70"
                                role="status"
                            >
                                Loading price…
                            </p>
                        )}
                    </div>
                    {showFounding && availability && (
                        <FoundingProgress availability={availability} />
                    )}
                    <div className="mt-4">{checkoutAction}</div>
                    <p
                        className="mt-2 text-center text-xs text-foreground/75"
                        data-testid="cta-reassurance"
                    >
                        Instant access
                    </p>
                    <details
                        className="mt-4 text-xs leading-relaxed text-foreground/65"
                        data-testid="routine-fit-promise"
                    >
                        <summary className="cursor-pointer">
                            7-day personalization promise
                        </summary>
                        <p className="mt-2">{ROUTINE_OFFER.fitPromise}</p>
                    </details>
                </div>
            </div>
            <p className="mt-5 border-t border-foreground/10 pt-3 text-xs leading-relaxed text-foreground/60">
                Quiz-based guidance, not a medical diagnosis or 1:1
                consultation. Hair products sold separately.
            </p>
        </section>
    );
}
