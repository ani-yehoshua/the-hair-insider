// Run in the installed production repository: node scripts/check-growth-edit-founding.mjs
// These are isolated server/component tests, not live Stripe or database tests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
const root = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const require = createRequire(path.join(process.cwd(), 'package.json'));
const ts = require('typescript');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const cache = new Map();
function load(file) {
  for (const suffix of ['', '.ts', '.tsx']) if (fs.existsSync(file + suffix) && fs.statSync(file + suffix).isFile()) { file += suffix; break; }
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const source = fs.readFileSync(file, 'utf8');
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  assert.equal(parsed.parseDiagnostics.length, 0, `Parse error: ${file}`);
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'module', 'exports', js)((id) =>
    id.startsWith('@/') ? load(path.join(root, id.slice(2))) :
      id.startsWith('.') ? load(path.resolve(path.dirname(file), id)) : require(id), module, module.exports);
  return module.exports;
}
const service = load(path.join(root, 'lib/pricing/growthEditFounding.ts'));
const { RoutineSalesCard } = load(path.join(root, 'app/hair-growth-edit/components/RoutineSalesCard.tsx'));
const { RoutineCheckoutSummary } = load(path.join(root, 'app/hair-growth-edit/components/RoutineCheckoutSummary.tsx'));
let checks = 0;
function fixture(paid = 4) {
  const slots = Array.from({ length: 100 }, (_, i) => ({ state: i < paid ? 'paid' : 'available', reservation_id: null, checkout_session_id: null }));
  const sessions = new Map(); const creates = [];
  const admin = {
    from: () => {
      const q = { select: () => q, eq: () => q, lt: () => q, limit: async () => ({ data: [], error: null }) };
      return q;
    },
    rpc: async (name, args = {}) => {
      if (name === 'growth_edit_founding_status') return { data: {
        enabled: true, claimed: slots.filter(s => s.state === 'paid').length,
        reserved: slots.filter(s => s.state === 'held').length,
        available: slots.filter(s => s.state === 'available').length,
      }, error: null };
      if (name === 'reserve_growth_edit_founding_slot') {
        const slot = slots.find(s => s.state === 'available');
        if (!slot) return { data: { state: slots.every(s => s.state === 'paid') ? 'regular' : 'busy' } };
        slot.state = 'held'; slot.reservation_id = randomUUID();
        return { data: { state: 'held', reservationId: slot.reservation_id } };
      }
      const slot = slots.find(s => s.reservation_id === args.p_reservation_id);
      if (!slot) return { data: false };
      if (slot.checkout_session_id && slot.checkout_session_id !== args.p_session_id) return { data: false };
      if (name === 'attach_growth_edit_founding_session') {
        slot.checkout_session_id = args.p_session_id; return { data: true };
      }
      if (name === 'settle_growth_edit_founding_slot') {
        if (slot.state === 'paid') return { data: args.p_outcome === 'paid' };
        if (args.p_outcome === 'paid') {
          slot.state = 'paid'; slot.checkout_session_id = args.p_session_id;
        } else { slot.state = 'available'; slot.reservation_id = null; slot.checkout_session_id = null; }
        return { data: true };
      }
      throw Error(name);
    },
  };
  const stripe = {
    prices: {
      retrieve: async () => ({ product: 'prod_growth', tax_behavior: 'unspecified' }),
      list: async function* () {
        yield { id: 'price_49', unit_amount: 4900, currency: 'usd', tax_behavior: 'unspecified' };
        yield { id: 'price_69', unit_amount: 6900, currency: 'usd', tax_behavior: 'unspecified' };
      },
    },
    checkout: { sessions: {
      create: async (params) => {
        const session = { id: 'cs_' + randomUUID(), client_secret: 'test-only', status: 'open',
          payment_status: 'unpaid', currency: 'usd', amount_subtotal: params.line_items[0].price === 'price_49' ? 4900 : 6900,
          metadata: params.metadata };
        creates.push(params); sessions.set(session.id, session); return session;
      },
      retrieve: async id => sessions.get(id),
      expire: async id => { sessions.get(id).status = 'expired'; },
    } },
  };
  return { admin, stripe, creates, slots };
}
const checkout = f => service.createGrowthEditCheckout(f.admin, f.stripe, 'configured', 4900, { mode: 'payment', metadata: { course_id: 'growth' } });
const event = (type, session) => ({ type, data: { object: session } });
let f = fixture();
let status = await service.getFoundingAvailability(f.admin, f.stripe, 'configured');
assert.equal(status.claimed, 4); assert.equal(status.available, 96); checks++;
let session = await checkout(f);
status = await service.getFoundingAvailability(f.admin, f.stripe, 'configured');
assert.equal(status.claimed, 4); assert.equal(status.reserved, 1); checks++;
await service.handleFoundingEvent(f.admin, event('checkout.session.completed', session));
assert.equal(f.slots.filter(s => s.state === 'paid').length, 4); checks++;
session.payment_status = 'paid';
await service.handleFoundingEvent(f.admin, event('checkout.session.async_payment_succeeded', session));
await service.handleFoundingEvent(f.admin, event('checkout.session.completed', session));
assert.equal(f.slots.filter(s => s.state === 'paid').length, 5); checks++;
session.payment_status = 'unpaid';
await service.handleFoundingEvent(f.admin, event('checkout.session.expired', session));
assert.equal(f.slots.filter(s => s.state === 'paid').length, 5); checks++;
await service.handleFoundingEvent(f.admin, event('checkout.session.completed', { ...session, payment_status: 'paid', metadata: { course_id: 'growth' } }));
assert.equal(f.slots.filter(s => s.state === 'paid').length, 5); checks++;
f = fixture(); session = await checkout(f);
await service.handleFoundingEvent(f.admin, event('checkout.session.expired', session));
assert.equal(f.slots.filter(s => s.state === 'available').length, 96); checks++;
f = fixture(); session = await checkout(f);
await service.handleFoundingEvent(f.admin, event('checkout.session.async_payment_failed', session));
assert.equal(f.slots.filter(s => s.state === 'available').length, 96); checks++;
f = fixture(99);
const attempts = await Promise.allSettled(Array.from({ length: 10 }, () => checkout(f)));
assert.equal(attempts.filter(r => r.status === 'fulfilled').length, 1);
assert.equal(f.creates.length, 1); checks++;
session = attempts.find(r => r.status === 'fulfilled').value;
status = await service.getFoundingAvailability(f.admin, f.stripe, 'configured');
assert.equal(status.unitAmount, 4900); assert.equal(status.claimed, 99); assert.equal(status.available, 0); checks++;
session.payment_status = 'paid';
await service.handleFoundingEvent(f.admin, event('checkout.session.completed', session));
await assert.rejects(() => checkout(f), e => e.code === 'PRICE_CHANGED');
assert.equal(f.creates.length, 1); checks++;
await service.createGrowthEditCheckout(f.admin, f.stripe, 'configured', 6900, { mode: 'payment' });
assert.equal(f.creates.at(-1).line_items[0].price, 'price_69'); checks++;
f = fixture();
await assert.rejects(() => service.createGrowthEditCheckout(f.admin, f.stripe, 'configured', 6900, {}), e => e.code === 'PRICE_CHANGED');
assert.equal(f.slots.filter(s => s.state === 'held').length, 0); checks++;
await assert.rejects(() => service.createGrowthEditCheckout(f.admin, f.stripe, 'configured', undefined, {}), e => e.code === 'PRICE_CHANGED'); checks++;
session = await checkout(f); session.payment_status = 'paid'; session.amount_subtotal = 1;
await assert.rejects(() => service.handleFoundingEvent(f.admin, event('checkout.session.completed', session)));
assert.equal(f.slots.filter(s => s.state === 'paid').length, 4); checks++;
for (const claimed of [4, 99, 100]) {
  const availability = { claimed, reserved: 0, available: 100 - claimed, limit: 100, unitAmount: claimed === 100 ? 6900 : 4900, currency: 'usd' };
  const html = renderToStaticMarkup(createElement(RoutineSalesCard, {
    price: claimed === 100 ? '$69' : '$49', availability, checkoutAction: createElement('button', null, 'Buy'),
  }));
  assert.ok(html.includes(`aria-valuenow="${claimed}"`));
  assert.ok(html.includes(`width:${claimed}%`));
  if (claimed === 100) assert.ok(!html.includes('<s '));
  checks++;
}
const regular = renderToStaticMarkup(createElement(RoutineCheckoutSummary, { price: '$69' }));
assert.ok(!regular.includes('<s ')); checks++;
for (const route of ['app/api/checkout/route.ts', 'app/api/checkout/embedded/route.ts']) {
  const source = fs.readFileSync(path.join(root, route), 'utf8');
  assert.ok(source.includes('createGrowthEditCheckout(admin, stripe, course.stripe_price_id, expectedUnitAmount'));
}
const webhook = fs.readFileSync(path.join(root, 'app/api/webhooks/stripe/route.ts'), 'utf8');
assert.ok(webhook.indexOf('constructEvent(') < webhook.indexOf('await handleFoundingEvent(')); checks++;
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20261026_growth_edit_founding_offer.sql'), 'utf8');
assert.ok(sql.includes('where id for update'));
assert.ok(sql.includes('slot_id between 1 and 100'));
assert.ok(sql.includes("if slot.state = 'paid' then return p_outcome = 'paid'"));
assert.ok(sql.includes('revoke all on function'));
checks++;
console.log(`Passed ${checks} isolated founding-offer checks, including 10 concurrent mocked checkout attempts, paid-event replay, expiry/failure release, 100th-sale pricing, stale-price refusal, and progress rendering. Real PostgreSQL/Stripe integration is still required before release.`);
