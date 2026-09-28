import type Stripe from 'stripe';
import { GROWTH_EDIT_PRICE_CENTS, GROWTH_EDIT_SLUG } from '@/lib/pricing/growthEdit';

export async function getCourseCheckoutLineItem(
    stripe: Stripe,
    courseSlug: string,
    priceId: string,
): Promise<Stripe.Checkout.SessionCreateParams.LineItem> {
    if (courseSlug !== GROWTH_EDIT_SLUG) {
        return { price: priceId, quantity: 1 };
    }

    // The Growth Edit has a $49 one-time offer. Use the existing Stripe product
    // but not its older catalog Price, which may still reflect a previous price.
    const catalogPrice = await stripe.prices.retrieve(priceId);
    if (catalogPrice.currency !== 'usd' || catalogPrice.type !== 'one_time') {
        throw new Error('The Growth Edit requires a one-time USD Stripe product.');
    }
    const product = typeof catalogPrice.product === 'string'
        ? catalogPrice.product
        : catalogPrice.product.id;
    return {
        price_data: {
            currency: 'usd',
            product,
            unit_amount: GROWTH_EDIT_PRICE_CENTS,
            ...(catalogPrice.tax_behavior !== 'unspecified'
                ? { tax_behavior: catalogPrice.tax_behavior }
                : {}),
        },
        quantity: 1,
    };
}
