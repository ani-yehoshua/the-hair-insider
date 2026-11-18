# Growth Edit: 30-Day Length Retention Plan relaunch

This is an **unmerged review branch** of the actual Next.js application, not a
preview-only prototype. No live database changes, purchases, publishing or
deployment are part of preparing this change.

## What changed

### Follow-up prepared after the original review was merged

- The paid shelf now starts with **Start here**: the person's existing plan
  shampoo, conditioner, and one moisture/strength mask, using the plan's
  selected products rather than adding any new recommendations. If both masks
  are present, the starting focus and reported protein tolerance prioritize one.
  Everything else appears under **Add as you run out**; optional items stay optional.
- A warm, guilt-free note says to keep using suitable products already owned
  and replace them as they run out. Named calendar steps include gentle
  category-specific alternatives. Unknown protein/repair products do **not**
  inherit the recommended product's dose, timing or treatment spacing.
- Mask-free fallback: the current professional-care plan deliberately contains
  only gentle shampoo, conditioner and leave-in. Its third starting item is
  the existing leave-in, explicitly explained as care, **not** a new mask or
  treatment for shedding. No intensive product is added to satisfy a list.
- The free shelf teaser marks those same three categories as **Start here**,
  without sending product names, identifiers, brands, images, links or steps.
- This follow-up does not change recommendation selection, calendar scheduling,
  account progress keys, medical guidance, Stripe, prices, promotions or checkout.
  It introduces no database migration.

- The offer is now **Your 30-Day Length Retention Plan**, under The Growth Edit,
  with **Get my 30-day plan** as the results-page purchase button.
- Free results retain starting focus, observations, answer explanations, the
  habit to reconsider, founder media/story and medical disclaimers. A protected
  server boundary returns calendar/category/progress teasers instead of product
  names, brands, images, shopping links or real first-wash instructions.
  This applies to anonymous and signed-in non-buyers, including professional-care
  results. Gentle, generic interim advice remains; named interim products are paid.
- The purchase card lists all six approved inclusions and retains the existing
  live price, founding availability, instant-access wording, separate-product
  note, disclaimers and refund window. The duplicate adjustment promise was
  removed from this card. Order-summary naming is updated; checkout behavior,
  Stripe endpoints, prices and promotions are unchanged.
- Buyers receive the editorial 30-day calendar, three phases, exact product
  steps, core-then-optional shelf with honest reasons and response guidance,
  length-retention explanation, troubleshooting, milestones and interactive log.
- Day 1 baseline, wash/phase check-ins, notes, completed days and Day 30 comparison
  use the buyer's existing Supabase account. Photos stay on their own phone:
  no upload field, photo storage or new media service.
- Professional-care buyers can open the complete map after payment/sign-in.
  Their results and guide retain prominent, kind professional-care guidance.
  Their protected response contains only gentle interim products; no intensive
  scalp, protein, repair, toning or styling treatment is introduced.
- The six distinct wash answers drive free results and paid calendars.
  Original live question scores/referral thresholds are retained.
- Moisture Reset's Day 7 continuation now opens `/hair-growth-edit`; its card
  and the homepage match the current free/paid offer. Free-results email copy
  also stops sending the previously free product recommendations.

## Database migration — deliberately not applied

Review **supabase/migrations/202611180001_growth_edit_routine_progress.sql**.
It creates only `public.growth_edit_routine_progress`, its constraints, owner/
active-entitlement RLS policy and revision/history validation trigger. It does
not change assessments, courses, entitlements, Stripe, prices or existing rows.

### Josh: before merging or deploying

1. Confirm the target is the existing Supabase project/schema used by this app.
   Check `courses.slug = hair-growth-edit`, published status, and active
   `entitlements` ownership match the current production access rules.
2. Run the reviewed SQL file in a **non-production Supabase project's SQL editor**
   first. It is one transaction. Do not run it from application startup or a build.
   It is a one-time migration; do not repeatedly paste it after it has succeeded.
3. Complete the two-account staging checks below with the real app configuration.
4. Only after approval, apply the same reviewed migration to the intended live
   Supabase project **before the code is deployed**. Nothing in this branch
   applies it automatically. No production SQL was executed while preparing it.
5. Review the Next.js / eslint-config-next update within major version 16:
   the dependency firewall rejected the old pinned Next.js 16.1.6 package.
   The app retains its existing React, Supabase and payment integrations.
6. Check the normal Vercel build environment already has the app's existing
   Supabase, Stripe and Resend configuration. No new provider credential is
   introduced by this feature. Never put real credentials into test commands.

### Staging: access and progress checklist

- Finish the quiz as a guest. Inspect the plan POST response and initially loaded
  browser modules: no real product catalog, named recommendation, image, link or
  first-wash instruction should be disclosed. A forged client `unlocked` flag
  must not grant data.
- Repeat as a signed-in non-buyer. Verify the same redaction and existing checkout
  events/price display. Checkout/payment behavior is not part of this change.
- With paid account A, open the plan, save setup and Day 1 ratings/note, mark Day 1
  complete, reload, then open a second device/browser signed into A. Confirm the
  saved values and start date restore. No preview storage or localStorage log
  should be used.
- With paid account B on the same assessment/key, confirm A's log is invisible.
  Requests attempting A's user_id must not read or mutate A's rows. Log out or
  switch accounts: previously loaded buyer state must clear.
- Open two tabs as A; save in one, then attempt a stale save in the other.
  The stale save must show an error and retain its draft, not overwrite history.
  Reload the saved log before retrying. Start date locks after logging begins.
- Revoke a test account's entitlement in staging: progress reads/writes must be
  denied. Restore it for remaining tests. Existing records must not be deleted.
- Trigger a severe flag using an independently high-risk scalp answer. Do not
  change production scores to force it: the original sudden-shedding answer
  remains RF=2. Before purchase, professional advice stays first and buying
  optional. With an active test entitlement, refresh/sign in: the full plan
  opens with the professional note at the top and gentle interim steps only.
- Verify wash counts 30/15/10/7/5/3 for the six new choices and matching rest/
  treatment days. Check an old paid assessment missing the newer optional
  repair/toning questions still opens without inventing answers.
- Check a phone viewport, each navigation tab, first-wash steps, optional labels,
  baseline and phase check-ins, worsening-rating help, and Day 30 comparison.
  Use a separate test account/date setup for past-day entries; never edit real
  buyer records to test the calendar.

## Wash-answer compatibility

The question ID stays `shampooFrequency`. New stable values 10–15 correspond to
the six answers in order. Old values are not new option positions:

| Old answer | Plan interval |
| --- | --- |
| 0, daily or every other day | Every other day, disclosed assumption |
| 1, 2–3 times weekly | Every third day, disclosed assumption |
| 2, weekly | Seven days |
| 3, less than weekly | Fourteen-day disclosed starting interval |

The 4–5-day choice alternates four/five-day gaps. Less-than-weekly remains a range;
the UI explicitly explains the fourteen-day assumption. Existing legacy progress
key inputs are preserved and saved observations are not deleted or relabeled.
Missed washes do not automatically reschedule the calendar; follow completed-wash
treatment spacing and never double up to catch up.

## Running checks

Use the existing npm workflow: `npm ci`, `npm run typecheck`, `npm test`,
`npm run build`. `npm test` runs the new behavior/privacy checks **and all three
existing Growth Edit check scripts**. Native PostgreSQL tools (`initdb`,
`pg_ctl`, `psql`) are needed for the RLS test. That test creates and destroys its
own temporary, loopback-only PostgreSQL cluster. It never reads DATABASE_URL,
connects to Supabase, or migrates a shared database.

The tests cover account-store restoration/concurrency plus real PostgreSQL RLS.
They do not substitute for the real two-account staging browser checks above.
No live Supabase or payment credentials were available in this workspace, so
provider-backed end-to-end sign-in/purchase/cross-device verification must be
performed in staging before release.

The successful local production build used clearly noncredential build-only
placeholders for provider configuration, not live keys or live API calls.
Dependency-lock generation reported 17 audit findings (12 high, 5 moderate).
These are disclosed for review; no broad `audit fix`, forced major upgrades or
unrelated payment dependency changes were made.

The review branch is explicitly disabled in `vercel.json`'s
`git.deploymentEnabled` map to prevent a push/PR from auto-deploying it. Other
branches retain Vercel's normal default behavior; **merging main can deploy**.
Do not merge until the migration and staging checks are approved.

## After the approved release

Verify a guest, an existing buyer, an older assessment and a professional-care
buyer. Check logs and the existing analytics events without sending quiz answers
or progress notes into analytics. If rolling back application code, retain the
progress table and saved buyer logs; do not drop it to undo a UI release.
