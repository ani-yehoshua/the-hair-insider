import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  FOUNDING_AMOUNT, FOUNDING_LIMIT, REGULAR_AMOUNT, parseFoundingAvailability,
  type FoundingAvailability,
} from '@/app/hair-growth-edit/lib/foundingOffer';

export class FoundingOfferError extends Error {
  constructor(message: string, public status = 503, public code = 'OFFER_UNAVAILABLE') { super(message); }
}

async function rpc(admin: SupabaseClient, name: string, args?: Record<string, unknown>) {
  const { data, error } = await admin.rpc(name, args);
  if (error) throw new FoundingOfferError('Pricing is temporarily unavailable. Please try again shortly.');
  return data;
}

async function settle(admin: SupabaseClient, reservationId: string, sessionId: string | null, outcome: 'paid' | 'available') {
  return rpc(admin, 'settle_growth_edit_founding_slot', {
    p_reservation_id: reservationId, p_session_id: sessionId, p_outcome: outcome,
  });
}

const priceCache = new Map<string, { expires: number; founding: string; regular: string }>();
async function prices(stripe: Stripe, configuredPriceId: string) {
  const cached = priceCache.get(configuredPriceId);
  if (cached && cached.expires > Date.now()) return cached;
  const configured = await stripe.prices.retrieve(configuredPriceId);
  const product = typeof configured.product === 'string' ? configured.product : configured.product.id;
  let founding: string | undefined;
  let regular: string | undefined;
  for await (const price of stripe.prices.list({ product, active: true, type: 'one_time', limit: 100 })) {
    if (price.currency !== 'usd' || price.tax_behavior !== configured.tax_behavior) continue;
    if (price.unit_amount === FOUNDING_AMOUNT) founding ??= price.id;
    if (price.unit_amount === REGULAR_AMOUNT) regular ??= price.id;
  }
  if (!founding || !regular) {
    throw new FoundingOfferError('Pricing is not ready yet. Please try again later.');
  }
  const value = { founding, regular, expires: Date.now() + 60_000 };
  priceCache.set(configuredPriceId, value);
  return value;
}

// Expiry is confirmed with Stripe, not inferred from a browser timer.
// Async payment methods retain the reservation until success/failure is confirmed.
export async function reconcileFoundingHolds(admin: SupabaseClient, stripe: Stripe) {
  const { data, error } = await admin.from('growth_edit_founding_slots')
    .select('reservation_id, checkout_session_id, held_at')
    .eq('state', 'held').lt('held_at', new Date(Date.now() - 35 * 60_000).toISOString()).limit(100);
  if (error) throw new FoundingOfferError('Pricing is temporarily unavailable.');
  for (const hold of data ?? []) {
    if (!hold.checkout_session_id) {
      // No secret/URL was returned until the session was attached. Failed create requests cannot be purchased.
      if (Date.parse(hold.held_at) < Date.now() - 45 * 60_000) {
        await settle(admin, hold.reservation_id, null, 'available');
      }
      continue;
    }
    const session = await stripe.checkout.sessions.retrieve(hold.checkout_session_id);
    if (session.payment_status === 'paid') await confirmFoundingPayment(admin, session);
    else if (session.status === 'expired') await settle(admin, hold.reservation_id, session.id, 'available');
  }
}

export async function getFoundingAvailability(admin: SupabaseClient, stripe: Stripe, configuredPriceId: string): Promise<FoundingAvailability> {
  const initial = await rpc(admin, 'growth_edit_founding_status');
  if (initial?.enabled !== true) throw new FoundingOfferError('Pricing is temporarily unavailable.');
  await prices(stripe, configuredPriceId); // Both prices must exist before admitting any discounted checkout.
  await reconcileFoundingHolds(admin, stripe);
  const state = await rpc(admin, 'growth_edit_founding_status');
  return parseFoundingAvailability({
    claimed: state.claimed, reserved: state.reserved, available: state.available,
    limit: FOUNDING_LIMIT, currency: 'usd',
    unitAmount: state.claimed === FOUNDING_LIMIT ? REGULAR_AMOUNT : FOUNDING_AMOUNT,
  });
}

export async function createGrowthEditCheckout(
  admin: SupabaseClient, stripe: Stripe, configuredPriceId: string,
  expectedUnitAmount: unknown, params: Stripe.Checkout.SessionCreateParams,
) {
  if (expectedUnitAmount !== FOUNDING_AMOUNT && expectedUnitAmount !== REGULAR_AMOUNT) {
    throw new FoundingOfferError('Please refresh the price before checking out.', 409, 'PRICE_CHANGED');
  }
  const catalog = await prices(stripe, configuredPriceId);
  await reconcileFoundingHolds(admin, stripe);
  const allocation = await rpc(admin, 'reserve_growth_edit_founding_slot');
  if (allocation?.state === 'busy') {
    throw new FoundingOfferError('The remaining founding spots are currently in checkout. Please try again shortly.', 409, 'SPOTS_RESERVED');
  }
  if (allocation?.state !== 'held' && allocation?.state !== 'regular') throw new FoundingOfferError('Pricing is temporarily unavailable.');
  const reservationId: string | undefined = allocation.reservationId;
  const unitAmount = allocation.state === 'regular' ? REGULAR_AMOUNT : FOUNDING_AMOUNT;
  if (unitAmount !== expectedUnitAmount) {
    if (reservationId) await settle(admin, reservationId, null, 'available');
    throw new FoundingOfferError('The price has changed. Close checkout and refresh the page to review the current price before purchasing.', 409, 'PRICE_CHANGED');
  }
  let session: Stripe.Checkout.Session | undefined;
  try {
    session = await stripe.checkout.sessions.create({
      ...params,
      line_items: [{ price: allocation.state === 'regular' ? catalog.regular : catalog.founding, quantity: 1 }],
      ...(reservationId ? { expires_at: Math.floor(Date.now() / 1000) + 31 * 60 } : {}),
      metadata: {
        ...(typeof params.metadata === 'object' && params.metadata ? params.metadata : {}),
        ...(reservationId ? { growth_edit_founding_reservation: reservationId } : {}),
      },
    }, reservationId ? { idempotencyKey: `growth-edit-founding-${reservationId}` } : undefined);
    if (reservationId) {
      const attached = await rpc(admin, 'attach_growth_edit_founding_session', {
        p_reservation_id: reservationId, p_session_id: session.id,
      });
      if (attached !== true) throw new FoundingOfferError('Could not reserve this checkout. Please try again.');
    }
    return session;
  } catch (error) {
    if (session && reservationId) {
      // Never release a still-payable session. Unknown network failures keep the hold for reconciliation.
      try {
        await stripe.checkout.sessions.expire(session.id);
        await settle(admin, reservationId, session.id, 'available');
      } catch { /* Reconciliation verifies Stripe before releasing this spot. */ }
    }
    throw error;
  }
}

async function confirmFoundingPayment(admin: SupabaseClient, session: Stripe.Checkout.Session) {
  const reservationId = session.metadata?.growth_edit_founding_reservation;
  if (!reservationId || session.payment_status !== 'paid') return;
  if (session.amount_subtotal !== FOUNDING_AMOUNT || session.currency !== 'usd') {
    throw new FoundingOfferError('Founding payment amount did not match the reservation.');
  }
  if (await settle(admin, reservationId, session.id, 'paid') !== true) {
    throw new FoundingOfferError('Could not confirm the founding reservation.');
  }
}

// Call only after the existing Stripe signature verification succeeds.
export async function handleFoundingEvent(admin: SupabaseClient, event: Stripe.Event) {
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded',
    'checkout.session.expired', 'checkout.session.async_payment_failed'].includes(event.type)) return;
  const session = event.data.object as Stripe.Checkout.Session;
  const reservationId = session.metadata?.growth_edit_founding_reservation;
  if (!reservationId) return; // Includes the four imported sales and all other products.
  if (session.payment_status === 'paid') await confirmFoundingPayment(admin, session);
  else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    await settle(admin, reservationId, session.id, 'available');
  }
}
