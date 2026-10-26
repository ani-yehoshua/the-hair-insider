// What a visitor is offered right now. The server works this out from Stripe
// (see lib/pricing/growthEditFounder.ts) and the page just displays it, so
// nothing about the price or the spot count is hardcoded here.
export interface FoundingAvailability {
    claimed: number; // founder-price purchases so far
    limit: number; // founder-price spots in total
    active: boolean; // the founder price is on offer right now
    unitAmount: number; // what a buyer pays right now, in cents
    regularAmount: number; // the regular price, in cents
    currency: "usd";
}

export function parseFoundingAvailability(
    value: unknown,
): FoundingAvailability {
    const data = value as FoundingAvailability | null;
    if (
        !data ||
        data.currency !== "usd" ||
        typeof data.active !== "boolean" ||
        ![data.claimed, data.limit, data.unitAmount, data.regularAmount].every(
            (n) => Number.isInteger(n) && n >= 0,
        )
    ) {
        throw new Error("Invalid offer");
    }
    return data;
}

// Every founder spot has been taken, so the regular price applies.
export function isFoundingClosed(offer: FoundingAvailability) {
    return offer.limit > 0 && offer.claimed >= offer.limit;
}

function formatCents(
    cents: number,
    currency: FoundingAvailability["currency"],
) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
}

export function formatFoundingPrice(offer: FoundingAvailability) {
    return formatCents(offer.unitAmount, offer.currency);
}

export function formatRegularPrice(offer: FoundingAvailability) {
    return formatCents(offer.regularAmount, offer.currency);
}

export function foundingReason(offer: FoundingAvailability) {
    return `Founding price · First ${offer.limit} purchases`;
}
