import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../app/hair-growth-edit/data/questions.ts';
import { PRODUCTS } from '../app/hair-growth-edit/data/recommendations.ts';
import { calculateResults } from '../app/hair-growth-edit/lib/scoring.ts';
import { makePublicResults } from '../app/hair-growth-edit/lib/publicResults.ts';
import { buildResultsEmail } from '../lib/email/growthEditResultsEmail.ts';

// Every catalog product and brand name, longest first. None may appear in the free results email.
const hidden = [...new Set([
  ...Object.values(PRODUCTS).flatMap(p => [p.name, p.brand]),
  'Hair Building Pak', 'NOUNOU', 'Davines', 'Moroccanoil', 'Bio Ionic',
])].filter(name => name.length > 2);

const answersFor = (pick) => Object.fromEntries(QUESTIONS.map(q => {
  const i = Math.max(0, q.options.findIndex(o => Object.values(o.scores).every(x => x === 0)));
  return [q.id, pick ? pick(q, q.options[i].value ?? i) : (q.options[i].value ?? i)];
}));

const build = (answers) => {
  const result = calculateResults(answers);
  return buildResultsEmail({
    primaryCause: result.primaryCause,
    behaviorToStop: result.behaviorToStop,
    hasSevereRedFlag: result.hasSevereRedFlag,
    teaser: makePublicResults(answers).teaser,
  }, 'test-token-0123456789abcdef');
};

test('results email shows the shelf by category with the results page placeholder logic', () => {
  const { html, text } = build(answersFor());
  assert.match(html, /Your shelf, by category/);
  assert.match(html, /Unlocks with your plan/);
  assert.match(html, /Specific picks are revealed in your full plan/);
  assert.match(text, /Your shelf, by category/);
  assert.match(text, /Specific picks are revealed in your full plan/);
  assert.match(html, /wash days over 30 days/);
  assert.match(html, /products? chosen for you/);
});

test('results email never names a product or brand, across answer variations', () => {
  const variations = [
    answersFor(),
    answersFor((q, v) => (q.id === 'blondeToning' ? 0 : v)),
    answersFor((q, v) => (q.id === 'blondeToning' ? 1 : v)),
    answersFor((q, v) => (q.id === 'proteinResponse' ? 0 : v)),
    answersFor((q, v) => (q.id === 'dryFeel' ? 3 : v)),
  ];
  for (const answers of variations) {
    const { html, text } = build(answers);
    for (const name of hidden) {
      const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      assert.ok(!pattern.test(html), `HTML contains "${name}"`);
      assert.ok(!pattern.test(text), `Text contains "${name}"`);
    }
    assert.ok(!/shopmy|itsa10haircare|sephora|ulta/i.test(html), 'HTML contains a retailer link');
  }
});

test('professional-care results get the note and no shelf', () => {
  const answers = answersFor();
  const result = calculateResults(answers);
  const { html } = buildResultsEmail({
    primaryCause: result.primaryCause,
    behaviorToStop: result.behaviorToStop,
    hasSevereRedFlag: true,
    teaser: makePublicResults(answers).teaser,
  }, 'test-token-0123456789abcdef');
  assert.match(html, /dermatologist, GP, or qualified trichology professional/);
  assert.doesNotMatch(html, /Your shelf, by category/);
});
