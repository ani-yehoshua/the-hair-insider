import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Run from the installed repository root: node scripts/check-growth-edit-routine.mjs
// An optional root argument also permits checking the prepared port locally.
const root = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const require = createRequire(path.join(process.cwd(), 'package.json'));
const ts = require('typescript');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const app = path.join(root, 'app/hair-growth-edit');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  cache.set(file, module.exports);
  const localRequire = id => {
    if (!id.startsWith('.')) return require(id);
    const candidate = path.resolve(path.dirname(file), id);
    const found = [candidate, candidate + '.ts', candidate + '.tsx'].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
    assert.ok(found, `Missing dependency ${id} in ${file}`);
    return load(found);
  };
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    reportDiagnostics: true,
  });
  assert.ok(!output.diagnostics.some(d => d.category === ts.DiagnosticCategory.Error), `Syntax error in ${file}`);
  new Function('require', 'module', 'exports', output.outputText)(localRequire, module, module.exports);
  cache.set(file, module.exports);
  return module.exports;
}
const { QUESTIONS } = load(path.join(app, 'data/questions.ts'));
const { calculateResults } = load(path.join(app, 'lib/scoring.ts'));
const { hasCompleteRoutineAnswers } = load(path.join(app, 'lib/assessmentCompleteness.ts'));
const { buildPaidRoutine, selectFoundationRecommendations } = load(path.join(app, 'data/recommendations.ts'));
const { GuideView } = load(path.join(app, 'components/GuideView.tsx'));
const { RoutineCheckoutSummary } = load(path.join(app, 'components/RoutineCheckoutSummary.tsx'));
const { ROUTINE_OFFER } = load(path.join(app, 'lib/routineOffer.ts'));
const { getRoutineSnapshot } = load(path.join(app, 'lib/guideSummary.ts'));
const ids = QUESTIONS.map(q => q.id);
assert.equal(QUESTIONS[QUESTIONS.findIndex(q => q.id === 'proteinResponse') + 1].id, 'repairTreatmentResponse');
assert.ok(QUESTIONS.find(q => q.id === 'repairTreatmentResponse').options.every(o => !Object.keys(o.scores).length));
const legacy = Object.fromEntries(ids.filter(id => id !== 'repairTreatmentResponse').map(id => [id, 0]));
assert.equal(hasCompleteRoutineAnswers(legacy, ids), false);
assert.equal(hasCompleteRoutineAnswers(legacy, ids, true), true);
assert.equal(hasCompleteRoutineAnswers({ ...legacy, repairTreatmentResponse: 3 }, ids), true);
const missingOriginal = { ...legacy };
delete missingOriginal.scalp;
assert.equal(hasCompleteRoutineAnswers(missingOriginal, ids, true), false);
assert.equal(hasCompleteRoutineAnswers({}, ids, true), false);

let combinations = 0;
for (const diameter of [0, 1, 2]) for (const proteinResponse of [0, 1, 2, 3]) for (const repairTreatmentResponse of [undefined, 0, 1, 2, 3]) {
  const result = calculateResults({ ...legacy, diameter, proteinResponse, repairTreatmentResponse, dryFeel: 0 });
  const ids = result.paidRoutine.map(s => s.product.id);
  if (proteinResponse === 1 || repairTreatmentResponse === 2) {
    assert.ok(!ids.includes('nounouMask') && !ids.includes('nourishingHairBuildingPak'));
  } else if (proteinResponse === 0) {
    assert.ok(ids.includes(repairTreatmentResponse === 0 ? 'nourishingHairBuildingPak' : 'nounouMask'));
  }
  for (const product of [result.product1, result.product2, result.product3]) assert.ok(ids.includes(product.id));
  combinations++;
}
const profile = {
  diagnosis: 'P', secondaryDiagnosis: null, texture: 'medium', density: 'medium',
  pattern: 'straight', stylePreference: 'blowout', colour: 'natural',
  dryScalp: false, oilyScalp: false, buildup: true, moistureNeed: false,
  strengthNeed: true, heatChemicalDamage: true, mechanicalTension: false,
  breakage: true, shedding: false, proteinSensitive: false, proteinPositive: true,
  repairTreatmentResponse: 'comfortable', easilyWeighedDown: false,
  washFrequency: 'severalWeekly', lowConsistency: false, irritatedScalp: false,
};
let renders = 0;
for (const washFrequency of ['daily', 'severalWeekly', 'weekly', 'lessWeekly']) for (const response of ['comfortable', 'heavy', 'stiff', 'unknown']) {
  const current = { ...profile, washFrequency, repairTreatmentResponse: response };
  const paidRoutine = buildPaidRoutine(current);
  const [firstRecommendation, secondRecommendation] = selectFoundationRecommendations(current, paidRoutine);
  const html = renderToStaticMarkup(createElement(GuideView, {
    paidRoutine, firstRecommendation, secondRecommendation, washFrequency,
    shouldShampooTwice: true, primaryCause: 'compromised internal strength',
    behaviorToStop: 'stacking treatments', observations: ['your repair-treatment response'],
    supportingNeeds: [], stylePreference: 'blowout', reportedDensityChange: false, hasSevereRedFlag: false,
  }));
  assert.ok(html.includes(ROUTINE_OFFER.useSkipHeading));
  assert.ok(html.includes(ROUTINE_OFFER.layeringHeading));
  assert.equal(html.split(ROUTINE_OFFER.progressHeading).length - 1, 2);
  assert.ok(html.includes('snapshot-fit-promise') && html.includes('wash-plan-fit-promise'));
  assert.ok(html.includes('scalp-serum-optional-note'));
  assert.equal((html.match(/data-testid="routine-step-/g) || []).length, paidRoutine.length);
  assert.ok(getRoutineSnapshot(washFrequency, paidRoutine).length < 7);
  renders++;
}
const checkout = renderToStaticMarkup(createElement(RoutineCheckoutSummary, { price: '$49' }));
assert.ok(/One-time.*\$49/.test(checkout));
assert.ok(checkout.includes(ROUTINE_OFFER.inclusions.join(' · ')));
const loading = renderToStaticMarkup(createElement(RoutineCheckoutSummary, { price: null }));
assert.ok(!loading.includes('inclusions-price'));
const client = fs.readFileSync(path.join(app, 'GrowthEditClient.tsx'), 'utf8');
assert.ok(client.includes('hasCompleteRoutineAnswers('));
for (const prop of ['reportedDensityChange', 'firstRecommendation', 'secondRecommendation', 'hasSevereRedFlag']) assert.ok(client.includes(prop + '='));
console.log(`Passed ${combinations} recommendation combinations, ${renders} paid-guide renders, legacy-access guards, promise matching, and live-price summary checks.`);
