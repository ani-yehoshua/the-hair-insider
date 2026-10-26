# Growth Edit founding-price launch

## Behavior

- Exactly 100 founding-price purchases, including the owner's four historical sales.
- A small bar shows confirmed purchases, not visits, button clicks, or pending checkouts.
- Confirmed sale 100 closes $49 pricing. New checkouts then cost $69.
- Discounted checkout reserves one of the remaining slots until payment succeeds or Stripe confirms expiry/failure.
- If the last slots are reserved, new buyers wait; they are not charged $69 before sale 100.
- Session replay is idempotent. Refunds do not reopen a historical founding-price slot.
- An outdated $49 screen cannot silently charge $69: checkout rejects a changed price and asks the buyer to review it.
- The public response contains aggregate counts and price only—no customer or Stripe-session data.
- Visitors refresh every 15 seconds, on focus, and on returning to the tab. A failed refresh hides stale pricing.

## Required production cutover — NOT performed by this PR

1. Run the actual Next.js build and the checkout/ledger tests below in a test environment.
2. In the existing Stripe account, confirm active one-time USD $49 and $69 prices on the same Growth Edit product, with the same tax behavior. The course's existing price ID stays intact. This PR does not create or change live Stripe products or prices.
3. Pause access to the old Growth Edit checkout during cutover. Reconcile the number of successful historical Growth Edit purchases with Stripe. The migration imports **four**, based on the owner's report. If additional sales happened before cutover, import those as paid slots too before enabling the launch. Do not reset the four after deployment.
4. Expire outstanding **Growth Edit only** sessions created by the old checkout and disable any old direct Growth Edit Payment Links that bypass the new allocator. Resolve any pending legacy asynchronous payments before activation; an old unpaid session that can still settle must not be left outside the allocation. Leave unrelated products/links unchanged. This prevents old payable $49 sessions from exceeding the cap after cutover.
5. Apply `supabase/migrations/20261026_growth_edit_founding_offer.sql` to the existing Supabase database. It adds two tables and four service-role-only functions; it does not replace or delete the current database. The launch is disabled by default.
6. Ensure the existing signed Stripe webhook receives `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `checkout.session.expired`. Existing account/entitlement/email handlers remain intact.
7. Once prices, historical count, old sessions/links, and webhook events are verified, enable:

   ```sql
   update public.growth_edit_founding_launch set enabled = true where id = true;
   ```

8. Deploy the application and resume the Growth Edit checkout. Confirm the public endpoint reports the reconciled tally and that its price equals the amount displayed in Stripe checkout.

Apply deployment-level rate limiting/bot protection to the unauthenticated checkout-creation endpoint. Reservations expire, but repeated automated requests must not tie up all remaining spots.

No live database migration, Stripe change, merge, charge, or publish has been performed by the PR author.

## Checks before release

- In a test database, reserve concurrently with 99 paid slots; only one reservation may succeed.
- Neither a click nor an unpaid completed session advances the bar.
- A signed paid success increments once. Replaying the same event leaves the count unchanged.
- Expired/failed unpaid sessions release holds. A paid slot never releases, even if an expiry event is replayed.
- A missing webhook is recovered by Stripe-verified hold reconciliation.
- With all remaining spots held, another buyer sees a retry message, not a higher charge.
- With 100 paid slots, a new checkout contains the active $69 price and no founding discount.
- A stale expected amount is rejected before a payable session is returned.
- Test embedded and authenticated checkout, asynchronous payment methods, existing-buyer access, and an older saved assessment.
- Simulate API/DB failure: no fake counts or fallback $49 checkout.
- Apply the migration twice in a test database; paid/reserved slots and launch state must not reset.

The Replit visual preview uses the explicitly labeled-in-code four-sale snapshot; it is not connected to the live Stripe account. The production component must use the server endpoint, never the preview snapshot.
