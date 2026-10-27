# Growth Edit: clearer purchase decision and practical follow-through

## Delivered

- Results explains the difference between free starting recommendations and a paid routine with order, timing, treatment spacing and adjustments.
- A three-step excerpt comes from the exact same first-wash builder used inside the purchased routine. It is not a fabricated example or another product offer.
- Severe warning signs still take precedence over selling the routine.
- The price decision explicitly says buyers do not need the whole shelf; physical products are separate.
- Checkout mirrors the solution-led headline, explanation, scope, instant-access reassurance and shelf clarification.
- Inside the routine, “Decide your next step” groups selected products by their actual role, explains avoiding duplicate purchases, and offers five after-wash choices.
- The helper names only products present in the routine, recommends one change at a time, and prioritizes stopping suspected irritants and professional care when needed.
- The helper's selected response is session-only. No symptoms are persisted or sent to analytics.
- The original recommended-product first-wash instructions remain direct. The ownership bridge is separate and does not substitute arbitrary masks or scalp treatments.

## Purchase-path audit

Read-only checks on 2026-10-27:

- The public assessment route responded with HTTP 200.
- The live founding-offer endpoint responded with HTTP 200 after canonical-domain redirect, reporting 4 claimed of 100, USD 49 founding price and USD 69 regular price.
- Current production source already uses Vercel Analytics, embedded Stripe checkout, a pre-payment email step, quote verification and existing purchase/access recovery.
- This change preserves the email step, price source, checkout request body, pricing APIs, payment/webhook processing, entitlement handling and account recovery.
- Historical analytics and payment-error dashboards were not accessible through the GitHub connection. These checks do **not** establish the reason for low conversion or prove a successful payment.

No checkout session or payment was created as part of the audit.

## Added events using existing Vercel Analytics

| Event | Meaning |
| --- | --- |
| `growth_offer_viewed` | At least 25% of a priced offer became visible; once per card mount. |
| `growth_purchase_clicked` | A visitor clicked the purchase action with an available quote. |
| `growth_preview_opened` | The visitor expanded the real first-wash excerpt. |
| `growth_checkout_opened` | The checkout sheet opened. |
| `growth_checkout_session_created` | The checkout API returned a client secret, not proof that payment UI loaded or money settled. |
| `growth_checkout_failed` | Checkout creation failed; records HTTP status only, with 0 for no usable response. |
| `growth_checkout_closed` | A visitor explicitly closed checkout; records email/payment stage and whether an error was shown. |
| `growth_checkout_reported_complete` | Stripe's client completion callback fired, not independently verified paid revenue. |

Existing `quiz_completed`, `results_viewed`, `checkout_opened`, `checkout_email_captured`, `checkout_completed` and `guide_viewed` events are preserved. Use the new, consistently prefixed events together rather than adding old and new event counts.

New event payloads exclude answers, symptoms, email addresses, session identifiers and raw error messages. Analytics failures cannot block new purchase actions or completion handling.

Compare the same reporting period and traffic source. Event counts are not necessarily unique people. Offer visibility is not the same as a results pageview. Explicit close events cannot capture every tab close. Repeated opens or device changes can create multiple events.

Use confirmed successful payments in Stripe/the existing webhook-backed purchase records for paid conversion and revenue, not a client completion event. Establish a baseline before attributing revenue changes to this copy.

## Verification and release

From a workspace containing TypeScript, React and react-dom:

    node scripts/check-growth-edit-conversion.mjs /absolute/path/to/repository

The isolated check covers 32 actual first-wash excerpts and full guide renders, 160 decision combinations, severe-flag suppression, sales/checkout message match, telemetry failure isolation and component syntax. The prototype's tests and typecheck also pass.

The previous routine-check script in the older staging directory expects an obsolete checkout-summary prop (`price`). It is not compatible with current main's `availability` prop; its old price assertion is not used as a validation of this release. The new check above exercises the current interface at both founding and regular pricing.

This is not a full production Next build, live payment test, analytics delivery test or claim of improved conversion. Before merging/publishing, run the real project build and a Stripe test-mode checkout through email, payment, completion and routine access. Confirm events in the existing Vercel dashboard after deployment. Do not change prices or enable other launch features as part of this release.
