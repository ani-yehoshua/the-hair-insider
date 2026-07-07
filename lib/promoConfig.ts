// Set a product's value to an active Stripe promotion code (e.g. "GROWTH10")
// to show a live countdown banner for it. Leave empty to hide it — the
// banner renders nothing until the code exists and is active in Stripe.
export const PRODUCT_PROMO_CODES: Record<string, string> = {
    'hair-growth-edit': 'GROWTH10',
};
