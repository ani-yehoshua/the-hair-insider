import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(path.join(process.cwd(), 'package.json'));
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(process.argv[2] || process.cwd());
const app = path.join(root, 'app/hair-growth-edit');
const cache = new Map();
const events = [];
let failTelemetry = false;
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const localRequire = id => {
    if (id === '@vercel/analytics') return { track: (...args) => {
      if (failTelemetry) throw new Error('Telemetry unavailable');
      events.push(args);
    }};
    if (!id.startsWith('.')) return require(id);
    const base = path.resolve(path.dirname(file), id);
    const found = [base, `${base}.ts`, `${base}.tsx`].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    assert.ok(found, `Missing dependency ${id}`);
    return load(found);
  };
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  assert.equal(output.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, `Syntax error: ${file}`);
  new Function('require', 'module', 'exports', output.outputText)(localRequire, module, module.exports);
  return module.exports;
}
const { PRODUCTS } = load(path.join(app, 'data/recommendations.ts'));
const { getFirstWashPlan } = load(path.join(app, 'lib/firstWash.ts'));
const { getRoutineDecision } = load(path.join(app, 'lib/routineDecisions.ts'));
const { NextWashPreview } = load(path.join(app, 'components/NextWashPreview.tsx'));
const { RoutineDecisionSupport } = load(path.join(app, 'components/RoutineDecisionSupport.tsx'));
const { RoutineSalesCard } = load(path.join(app, 'components/RoutineSalesCard.tsx'));
const { RoutineCheckoutSummary } = load(path.join(app, 'components/RoutineCheckoutSummary.tsx'));
const { GuideView } = load(path.join(app, 'components/GuideView.tsx'));
const { ROUTINE_SALES_COPY } = load(path.join(app, 'lib/routineOffer.ts'));
const step = product => ({ product, order: 1, timing: 'Follow plan', instruction: 'Follow label' });
let previews = 0;
for (const frequency of ['daily', 'severalWeekly', 'weekly', 'lessWeekly']) {
  for (const mask of [null, 'nounouMask', 'nourishingHairBuildingPak', 'oiMask']) {
    for (const style of ['natural', 'blowout']) {
      const selected = [PRODUCTS.momoShampoo, PRODUCTS.oiConditioner, PRODUCTS.oiMilk];
      if (mask) selected.splice(2, 0, PRODUCTS[mask]);
      assert.ok(selected.every(Boolean), 'Fixture must not silently drop an unknown product.');
      const routine = selected.map(step);
      const plan = getFirstWashPlan(routine, frequency, false, style);
      const html = renderToStaticMarkup(React.createElement(NextWashPreview, { plan }));
      assert.match(html, /A look inside your routine/);
      assert.match(html, /excerpt/);
      assert.match(html, /Read these steps/);
      for (const s of plan.steps.filter(s => s.title !== 'Start with warm water').slice(0, 3)) assert.ok(html.includes(s.title), `Missing actual step: ${s.title}`);
      if (mask !== 'nourishingHairBuildingPak') assert.doesNotMatch(html, /Hair Building Pak|K-Pak/i);
      if (mask === 'nourishingHairBuildingPak') assert.ok(html.includes(plan.keratin.explanation));
      for (const outcome of ['comfortable', 'coated', 'dry', 'stiff', 'irritated']) {
        const decision = getRoutineDecision(routine, outcome);
        assert.ok(decision.title && decision.action && decision.nextCheck);
        if (mask !== 'nourishingHairBuildingPak') assert.doesNotMatch(JSON.stringify(decision), /Hair Building Pak|K-Pak/i);
      }
      const guide = renderToStaticMarkup(React.createElement(GuideView, {
        onBack() {}, paidRoutine: routine, shouldShampooTwice: false,
        primaryCause: 'dryness / low flexibility', behaviorToStop: 'stacking products',
        observations: [], supportingNeeds: [], washFrequency: frequency,
        stylePreference: style, reportedDensityChange: false,
        firstRecommendation: PRODUCTS.momoShampoo, secondRecommendation: PRODUCTS.oiConditioner,
        hasSevereRedFlag: false,
      }));
      assert.match(guide, /routine-decision-support/);
      assert.match(guide, /Use what you own, by role/);
      assert.match(guide, /After this wash/);
      previews++;
    }
  }
}
assert.equal(renderToStaticMarkup(React.createElement(RoutineDecisionSupport, { routine: [], hasSevereRedFlag: true })), '');
const support = renderToStaticMarkup(React.createElement(RoutineDecisionSupport, { routine: [step(PRODUCTS.nounouMask)], hasSevereRedFlag: false }));
assert.match(support, /Use what you own, by role/);
assert.match(support, /After this wash/);
assert.match(support, /aria-pressed="false"/);
for (const availability of [
  { active: true, claimed: 4, limit: 100, unitAmount: 4900, regularAmount: 6900, currency: 'usd' },
  { active: false, claimed: 100, limit: 100, unitAmount: 6900, regularAmount: 6900, currency: 'usd' },
]) {
  const sales = renderToStaticMarkup(React.createElement(RoutineSalesCard, { availability, primaryCause: 'product buildup', checkoutAction: React.createElement('button', null, ROUTINE_SALES_COPY.cta) }));
  const checkout = renderToStaticMarkup(React.createElement(RoutineCheckoutSummary, { availability }));
  assert.ok(sales.includes(ROUTINE_SALES_COPY.headline));
  assert.ok(checkout.includes(ROUTINE_SALES_COPY.headline));
  assert.match(sales, /don’t need to buy the whole shelf/);
  assert.match(checkout, /don’t need to buy the whole shelf/);
}
const { trackGrowthEvent } = load(path.join(app, 'lib/conversionAnalytics.ts'));
trackGrowthEvent('growth_offer_viewed'); // SSR: no-op.
assert.equal(events.length, 0);
globalThis.window = {};
trackGrowthEvent('growth_purchase_clicked', { unit_amount: 4900 });
assert.deepEqual(events.at(-1), ['growth_purchase_clicked', { unit_amount: 4900 }]);
failTelemetry = true;
assert.doesNotThrow(() => trackGrowthEvent('growth_checkout_reported_complete'));
delete globalThis.window;

for (const file of fs.readdirSync(path.join(app, 'components'))) {
  if (!file.endsWith('.tsx')) continue;
  const parsed = ts.transpileModule(fs.readFileSync(path.join(app, 'components', file), 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.equal(parsed.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, `Syntax error: ${file}`);
}
console.log(`PASS: ${previews} real first-wash excerpts and full guide renders, 160 next-wash decisions, severe-flag suppression, matching sales/checkout promises, telemetry isolation, component syntax.`);
console.log('Not a full Next build, browser checkout test, payment confirmation, or analytics delivery test.');
