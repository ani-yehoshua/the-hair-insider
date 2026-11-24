import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QUESTIONS } from '../app/hair-growth-edit/data/questions.ts';
import { PRODUCTS } from '../app/hair-growth-edit/data/recommendations.ts';
import { calculateResults } from '../app/hair-growth-edit/lib/scoring.ts';
import { getProfessionalCareContext } from '../app/hair-growth-edit/lib/professionalCare.ts';
import { buildRoutineCalendar, getPlanKey, OPTIONAL_PRODUCT_IDS } from '../app/hair-growth-edit/lib/routineCalendar.ts';
import { getShelfGroups, getUseWhatYouOwnNotes, START_HERE_NOTE } from '../app/hair-growth-edit/lib/shelfPriorities.ts';
import { makePublicResults } from '../app/hair-growth-edit/lib/publicResults.ts';
import { getProductGuidance } from '../app/hair-growth-edit/lib/productGuidance.ts';
import { getShelfPersonalization } from '../app/hair-growth-edit/lib/shelfPersonalization.ts';
import { ShelfView } from '../app/hair-growth-edit/components/routine-map/ShelfView.tsx';
import { DayDetail } from '../app/hair-growth-edit/components/routine-map/DayDetail.tsx';
import { PersonalizedRoutineTeaser } from '../app/hair-growth-edit/components/PersonalizedRoutineTeaser.tsx';

const base = () => Object.fromEntries(QUESTIONS.map(q => {
  const i = Math.max(0, q.options.findIndex(o => Object.values(o.scores).every(x => x === 0)));
  return [q.id, q.options[i].value ?? i];
}));
function context(answers) {
  const r = calculateResults(answers);
  return getProfessionalCareContext({
    routine: r.paidRoutine, answers, focus: r.primaryCause, observations: r.observations,
    habit: r.behaviorToStop, washFrequency: r.washFrequency, stylePreference: r.stylePreference,
    shouldShampooTwice: r.shouldShampooTwice, reportedDensityChange: answers.density === 3,
    hasSevereRedFlag: r.hasSevereRedFlag,
  });
}
const ids = steps => steps.map(s => s.product.id);
const step = id => ({ order: 1, product: PRODUCTS[id], timing: 'Scheduled only', instruction: 'Follow the label.' });

test('each answer keeps shampoo, conditioner and one existing treatment first; public slots match without paid data', () => {
  for (const q of QUESTIONS) for (const [i, option] of q.options.entries()) {
    for (const frequency of [10,11,12,13,14,15,0,1,2,3]) {
      const answers = { ...base(), [q.id]: option.value ?? i, shampooFrequency: frequency };
      const c = context(answers), before = JSON.stringify(c);
      const calendar = buildRoutineCalendar(c, '2026-11-18'), key = getPlanKey(c);
      const groups = getShelfGroups(c), first = groups.startHere;
      assert.equal(first.length, 3);
      assert.match(first[0].product.category, /cleanse|shampoo/i);
      assert.match(first[1].product.category, /conditioner/i);
      assert.ok(first.every(s => !OPTIONAL_PRODUCT_IDS.has(s.product.id)));
      assert.ok(first.every(s => c.routine.includes(s)));
      assert.equal(new Set(ids([...first,...groups.addAsYouRunOut])).size, c.routine.length);
      if (c.hasSevereRedFlag) {
        assert.equal(first[2].product.id, 'oiMilk');
        assert.ok(groups.fallbackNote);
        assert.equal(groups.addAsYouRunOut.length, 0);
      } else {
        assert.ok(['oiMask','nounouMask','nourishingHairBuildingPak'].includes(first[2].product.id));
        const teaser = makePublicResults(answers).teaser;
        assert.equal(teaser.shelf.filter(s => s.startHere).length, 3);
        assert.deepEqual(teaser.shelf.slice(0,3).map(s => s.category), first.map(s => s.product.category));
        assert.ok(teaser.shelf.slice(3).every(s => !s.startHere));
        assert.ok(teaser.shelf.every(s => !s.startHere || !s.optional));
        for (const [index, startingStep] of first.entries()) {
          const reason = teaser.shelf[index].reason;
          assert.match(reason, /^Your starting (cleanse|conditioner|treatment|care step):/);
          assert.doesNotMatch(reason, /not an extra need|general softening option/i);
          assert.equal(reason, getProductGuidance(startingStep, c).why);
        }
        for (const row of teaser.shelf) assert.deepEqual(
          Object.keys(row).sort(), ['answerChosen','category','optional','reason','startHere']);
      }
      assert.equal(JSON.stringify(c), before);
      assert.equal(getPlanKey(c), key);
      assert.deepEqual(buildRoutineCalendar(c, '2026-11-18'), calendar);
    }
  }
});

test('default starting moisture treatment stays positive without claiming an answer-confirmed need', () => {
  const c = { ...context(base()), focus:'product buildup',
    answers:{ ...base(), proteinResponse:2, repairTreatmentResponse:0 } };
  const pick = getShelfPersonalization(step('oiMask'), c, true);
  assert.equal(pick.reason, 'Your starting treatment: a gentle moisture mask to keep your lengths soft while the rest of your routine settles in.');
  assert.equal(pick.answerChosen, false);
  assert.equal(pick.optional, false);
  const sensitive = getShelfPersonalization(step('oiMask'), {
    ...c, answers:{...c.answers,proteinResponse:1},
  }, true);
  assert.match(sensitive.reason, /repair treatments have left your lengths hard or rough/);
});

test('when both masks exist the focus and protein tolerance select one, leaving the other for later', () => {
  const original = context(base());
  const routine = [step('dedeShampoo'),step('dedeConditioner'),step('oiMask'),step('nounouMask'),step('oiMilk'),step('jolieFilteredShowerhead')];
  const strength = { ...original, routine, focus: 'breakage', answers: { ...original.answers, proteinResponse: 0, repairTreatmentResponse: 0 } };
  assert.equal(getShelfGroups(strength).startHere[2].product.id, 'nounouMask');
  assert.ok(ids(getShelfGroups(strength).addAsYouRunOut).includes('oiMask'));
  const moisture = { ...strength, focus: 'high-porosity moisture loss' };
  assert.equal(getShelfGroups(moisture).startHere[2].product.id, 'oiMask');
  assert.equal(getShelfGroups({ ...strength, answers: { ...strength.answers, proteinResponse: 1 } }).startHere[2].product.id, 'oiMask');
  assert.equal(getShelfGroups({ ...strength, answers: { ...strength.answers, repairTreatmentResponse: 2 } }).startHere[2].product.id, 'oiMask');
});

test('a mask-free plan uses an existing care step, never an optional extra or newly recommended mask', () => {
  const c = context(base());
  const noMask = { ...c, routine: [step('dedeShampoo'),step('dedeConditioner'),step('oiMilk'),step('oiOil')] };
  const groups = getShelfGroups(noMask);
  assert.deepEqual(ids(groups.startHere), ['dedeShampoo','dedeConditioner','oiMilk']);
  assert.match(groups.fallbackNote, /doesn’t call for a protein or moisture mask/);
  assert.deepEqual(ids(groups.addAsYouRunOut), ['oiOil']);
});

test('paid shelf renders priorities first with kind copy, later products and safe named-step alternatives', () => {
  const c = context(base()), groups = getShelfGroups(c);
  const markup = renderToStaticMarkup(React.createElement(ShelfView, { context: c }));
  assert.ok(markup.indexOf('Start here') < markup.indexOf('Start with what you own'));
  assert.match(markup, /Add as you run out/);
  assert.ok(START_HERE_NOTE.includes('what’s already in your bathroom'));
  assert.match(markup, /You don’t need to buy the whole shelf at once/);
  assert.ok(markup.indexOf(`map-shelf-${groups.startHere[2].product.id}`) < markup.indexOf('Add as you run out'));
  const day = buildRoutineCalendar(c,'2026-11-18')[0];
  const detail = renderToStaticMarkup(React.createElement(DayDetail, {
    day, today:'2026-11-18', context:c, progress:null, canSave:false,
    onToggleComplete:async()=>true, onSaveCheckIn:async()=>true,
  }));
  assert.match(detail, /No shampoo from your shelf yet\? Use the one you have for now/);
  assert.match(detail, /No leave-in from your shelf yet\? Use the one you have for now/);
  const proteinContext = { ...c, routine:[step('nourishingHairBuildingPak'), step('meluShield')] };
  assert.match(getUseWhatYouOwnNotes(proteinContext, PRODUCTS.nourishingHairBuildingPak.name)[0], /regular conditioner.*skip this treatment/);
  assert.match(getUseWhatYouOwnNotes(proteinContext, PRODUCTS.nourishingHairBuildingPak.name)[0], /Don’t borrow this timing/);
  assert.match(getUseWhatYouOwnNotes(proteinContext, PRODUCTS.meluShield.name)[0], /skip the heat/);
});

test('free shelf preview renders the same three category badges without product identifiers', () => {
  const previous = globalThis.window;
  globalThis.window = { location: { search:'?teaser-tab=shelf' } };
  try {
    const teaser = makePublicResults(base()).teaser;
    const markup = renderToStaticMarkup(React.createElement(PersonalizedRoutineTeaser,{teaser}));
    assert.match(markup, /Add as you run out/);
    assert.equal((markup.match(/>Start here<\/span>/g) || []).length, 3);
    for (const p of Object.values(PRODUCTS)) {
      assert.ok(!markup.includes(p.name)); assert.ok(!markup.includes(p.brand));
      assert.ok(!markup.includes(p.image)); assert.ok(!markup.includes(p.link));
    }
  } finally { globalThis.window = previous; }
});
