import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'package.json'));
const app = path.join(root, 'app/hair-growth-edit');
const cache = new Map();

function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const mod = { exports: {} };
  const localRequire = id => {
    if (!id.startsWith('.')) return require(id);
    const base = path.resolve(path.dirname(file), id);
    const found = [base, base + '.tsx', base + '.ts'].find(candidate => fs.existsSync(candidate));
    assert(found, 'Cannot resolve ' + id);
    return load(found);
  };
  const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  const errors = (result.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, 'Syntax errors in ' + file);
  new Function('require', 'module', 'exports', result.outputText)(localRequire, mod, mod.exports);
  cache.set(file, mod.exports);
  return mod.exports;
}

const { getRoutineSummary, getStarterPair } = load(path.join(app, 'lib/guideSummary.ts'));
const { groupProductShelf } = load(path.join(app, 'lib/productShelf.ts'));
const { buildPaidRoutine, selectFoundationRecommendations } = load(path.join(app, 'data/recommendations.ts'));
const { GuideView } = load(path.join(app, 'components/GuideView.tsx'));
const { ProductShelf } = load(path.join(app, 'components/ProductShelf.tsx'));
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const render = (Component, props) => renderToStaticMarkup(createElement(Component, props));

const base = {
  diagnosis: 'M', secondaryDiagnosis: null, texture: 'medium', density: 'medium',
  pattern: 'straight', stylePreference: 'natural', colour: 'natural', dryScalp: false,
  oilyScalp: false, buildup: false, moistureNeed: true, strengthNeed: false,
  heatChemicalDamage: false, mechanicalTension: false, breakage: false, shedding: false,
  proteinSensitive: false, proteinPositive: false, washFrequency: 'severalWeekly',
  lowConsistency: false, irritatedScalp: false,
};
const frequencies = {
  daily: ['4–7×/week', '3×/week'],
  severalWeekly: ['2–3×/week', '2–3×/week'],
  weekly: ['once/week', 'once/week'],
  lessWeekly: ['less than once/week', 'every 1–2 weeks'],
};
let cases = 0;
for (const diagnosis of ['M', 'HC', 'SH', 'BU', 'BR', 'P', 'SC']) {
  for (const washFrequency of Object.keys(frequencies)) {
    const profile = { ...base, diagnosis, washFrequency };
    const paidRoutine = buildPaidRoutine(profile);
    const [firstRecommendation, secondRecommendation] = selectFoundationRecommendations(profile, paidRoutine);
    const summary = getRoutineSummary(washFrequency, paidRoutine);
    assert(summary.includes('Cleanse ' + frequencies[washFrequency][0]));
    assert(summary.includes('Optional scalp serum ' + frequencies[washFrequency][1]));
    const pair = getStarterPair(paidRoutine, firstRecommendation, secondRecommendation);
    assert.deepEqual(pair.map(step => step.product.id), [firstRecommendation.id, secondRecommendation.id]);
    const props = {
      paidRoutine, firstRecommendation, secondRecommendation, hasSevereRedFlag: false,
      shouldShampooTwice: false, primaryCause: 'your reported needs', behaviorToStop: 'rough detangling',
      observations: [], supportingNeeds: [], washFrequency, stylePreference: profile.stylePreference,
      reportedDensityChange: diagnosis === 'SH',
    };
    const html = render(GuideView, props);
    assert(html.indexOf('routine-at-a-glance') < html.indexOf('first-purchase-priority'));
    assert(html.indexOf('first-purchase-priority') < html.indexOf('<h1'));
    assert(html.indexOf('data-testid="starter-pair"') < html.indexOf('data-testid="curated-shelf"'));
    assert.equal((html.match(/data-testid="starter-pair-[^"]+"/g) ?? []).length, 2);
    assert.equal((html.match(/data-testid="routine-step-/g) ?? []).length, paidRoutine.length);
    assert(!html.includes('Where to spend first'));
    assert(html.includes('personalized product shelf—not a checklist'));
    assert(html.includes('A filter is optional. Check what it actually removes before buying one.'));
    assert(!/Step \d/.test(html));
    if (diagnosis === 'SH') assert(html.includes('does not treat the cause of thinning'));
    const referral = render(GuideView, { ...props, hasSevereRedFlag: true });
    assert(referral.includes('professional-care-priority'));
    assert(!referral.includes('first-purchase-priority'));
    assert(!referral.includes('data-testid="starter-pair"'));
    assert.equal(groupProductShelf(paidRoutine).flatMap(group => group.steps).length, paidRoutine.length);
    cases++;
  }
}

const routine = buildPaidRoutine(base);
const [first, second] = selectFoundationRecommendations(base, routine);
const shelfProps = {
  paidRoutine: routine, savedProducts: [], showSavedOnly: true,
  onToggleSaved() {}, onToggleSave() {}, reportedDensityChange: false,
};
assert(render(ProductShelf, shelfProps).includes('shelf-empty'));
const saved = render(ProductShelf, { ...shelfProps, savedProducts: [first.id, second.id] });
assert.equal((saved.match(/data-testid="routine-step-/g) ?? []).length, 2);
assert(saved.includes('Show Full Shelf'));
assert.deepEqual(getStarterPair(routine, first, first), []);
assert.deepEqual(getStarterPair(routine, first, null), []);
assert.deepEqual(getStarterPair([], first, second), []);
assert(!getRoutineSummary('weekly', []).includes('serum'));
console.log('Passed ' + cases + ' personalized guide renders, cadence checks, Starter Pair checks, referral exceptions, and saved-product states.');
