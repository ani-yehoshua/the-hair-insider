import type Stripe from "stripe";
import type { FoundingAvailability } from "@/app/hair-growth-edit/lib/foundingOffer";

// The Growth Edit's founder price is a Stripe promotion code. Stripe itself
// enforces the cap (the code's max redemptions) and counts the purchases
// (times redeemed), so there is nothing to keep in our own database.
//
//   - Regular price: the course's Stripe price (courses.stripe_price_id).
//   - Founder price: that price minus the promo's coupon, while the promo is
//     active and has spots left.
//
// If the promo is inactive, missing, or used up, this simply returns the
// regular price -- the same answer the page displays and checkout charges.
export const FOUNDER_PROMO_CODE = "FOUNDER20";

export interface GrowthEditOffer extends FoundingAvailability {
    promotionCodeId: string | null; // set only while the founder price applies
}

export async function getGrowthEditOffer(
    stripe: Stripe,
    priceId: string,
): Promise<GrowthEditOffer> {
    const price = await stripe.prices.retrieve(priceId);
    const regularAmount = price.unit_amount ?? 0;

    const offer: GrowthEditOffer = {
        claimed: 0,
        limit: 0,
        active: false,
        unitAmount: regularAmount,
        regularAmount,
        currency: "usd",
        promotionCodeId: null,
    };

    // The promo may be inactive (founder pricing off) -- that's the normal
    // "regular price only" case, not an error. Stripe allows only one active
    // code per name, so an active lookup returns at most one match.
    const active = await stripe.promotionCodes.list({
        code: FOUNDER_PROMO_CODE,
        active: true,
        limit: 1,
    });
    const promo = active.data[0];
    if (!promo || promo.max_redemptions == null) return offer;

    offer.claimed = promo.times_redeemed;
    offer.limit = promo.max_redemptions;
    if (promo.times_redeemed >= promo.max_redemptions) return offer;

    const coupon = promo.promotion.coupon;
    const discount =
        typeof coupon === "string"
            ? await stripe.coupons.retrieve(coupon)
            : coupon;
    if (!discount || !discount.valid) return offer;

    let founderAmount = regularAmount;
    if (discount.amount_off != null) {
        founderAmount = regularAmount - discount.amount_off;
    } else if (discount.percent_off != null) {
        founderAmount = Math.round(
            regularAmount * (1 - discount.percent_off / 100),
        );
    }
    if (founderAmount <= 0 || founderAmount >= regularAmount) return offer;

    offer.active = true;
    offer.unitAmount = founderAmount;
    offer.promotionCodeId = promo.id;
    return offer;
}
