import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { QUESTIONS, getSelectedOption } from '../app/hair-growth-edit/data/questions.ts';
import { calculateResults } from '../app/hair-growth-edit/lib/scoring.ts';
import { PRODUCTS, getKeratinSchedule } from '../app/hair-growth-edit/data/recommendations.ts';
import { buildRoutineCalendar, getPlanKey } from '../app/hair-growth-edit/lib/routineCalendar.ts';
import { getProfessionalCareContext } from '../app/hair-growth-edit/lib/professionalCare.ts';
import { makePublicResults } from '../app/hair-growth-edit/lib/publicResults.ts';
import { createProgress, isRoutineProgress, compareRatings, getProgressStats } from '../app/hair-growth-edit/lib/routineProgress.ts';
import { createAccountProgressStore } from '../app/hair-growth-edit/lib/supabaseProgressStore.ts';
import { hasCompleteRoutineAnswers } from '../app/hair-growth-edit/lib/assessmentCompleteness.ts';
import { WASH_ANSWER_VALUES, washFrequencyAssumption } from '../app/hair-growth-edit/lib/washFrequency.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = p => readFileSync(path.join(root, p), 'utf8');
const base = () => Object.fromEntries(QUESTIONS.map(q => {
  const i = Math.max(0, q.options.findIndex(o => Object.values(o.scores).every(x => x === 0)));
  return [q.id, q.options[i].value ?? i];
}));
function context(answers) {
  const r = calculateResults(answers);
  return getProfessionalCareContext({ routine: r.paidRoutine, answers, focus: r.primaryCause, observations: r.observations,
    habit: r.behaviorToStop, washFrequency: r.washFrequency, stylePreference: r.stylePreference,
    shouldShampooTwice: r.shouldShampooTwice, reportedDensityChange: answers.density === 3,
    hasSevereRedFlag: r.hasSevereRedFlag, defaultProductIds: calculateResults({}).paidRoutine.map(s => s.product.id) });
}
const start = '2026-11-18';
test('six stable wash answers drive paid calendar and free teaser with exact matching counts', () => {
  assert.deepEqual(QUESTIONS.find(q => q.id === 'shampooFrequency').options.map(o => [o.value, o.label]), [
    [10, 'Every day'], [11, 'Every other day'], [12, 'Every 3rd day'], [13, 'Every 4–5 days'],
    [14, 'Once a week'], [15, 'Less than once a week'],
  ]);
  WASH_ANSWER_VALUES.forEach((value, i) => {
    const answers = { ...base(), shampooFrequency: value }, c = context(answers);
    const days = buildRoutineCalendar(c, start), washes = days.filter(d => d.kind !== 'rest');
    assert.equal(washes.length, [30, 15, 10, 7, 5, 3][i]);
    assert.equal(makePublicResults(answers).teaser.washCount, washes.length);
    assert.ok(washes.every(d => d.steps.length >= 4));
    if (value === 13) assert.deepEqual(washes.map(d => d.day), [1, 5, 10, 14, 19, 23, 28]);
    else {
      const gap = { 10: 1, 11: 2, 12: 3, 14: 7, 15: 14 }[value];
      assert.ok(washes.slice(1).every((d, j) => d.day - washes[j].day === gap));
    }
  });
});
test('legacy wash answers, optional missing follow-ups and progress identifiers remain compatible', () => {
  for (let value = 0; value < 4; value++) {
    const a = { ...base(), shampooFrequency: value }, c = context(a);
    assert.equal(buildRoutineCalendar(c, start).filter(d => d.kind !== 'rest').length, [15, 10, 5, 3][value]);
    const keyInput = JSON.stringify([Object.entries(a).sort(([a],[b]) => a.localeCompare(b)),
      c.routine.map(s => s.product.id), ['daily','severalWeekly','weekly','lessWeekly'][value], c.stylePreference]);
    let hash = 2166136261;
    for (let i = 0; i < keyInput.length; i++) hash = Math.imul(hash ^ keyInput.charCodeAt(i), 16777619) >>> 0;
    assert.equal(getPlanKey(c), `map1-${hash.toString(16).padStart(8, '0')}`);
  }
  assert.ok(washFrequencyAssumption(0));
  assert.ok(washFrequencyAssumption(1));
  const old = base(); delete old.repairTreatmentResponse; delete old.blondeToning;
  assert.equal(hasCompleteRoutineAnswers(old, QUESTIONS.map(q => q.id), true), true);
  assert.equal(hasCompleteRoutineAnswers(old, QUESTIONS.map(q => q.id), false), false);
  assert.ok(buildRoutineCalendar(context(old), start).length === 30);
});
test('no free response includes a product name, brand, image, shopping link or wash instructions, including professional care', () => {
  for (const q of QUESTIONS) for (let index = 0; index < q.options.length; index++) {
    for (const frequency of WASH_ANSWER_VALUES) {
      const a = { ...base(), [q.id]: q.options[index].value ?? index, shampooFrequency: frequency };
      const r = makePublicResults(a), json = JSON.stringify(r).toLowerCase();
      assert.equal(r.product1, null); assert.equal(r.product2, null); assert.deepEqual(r.paidRoutine, []);
      for (const p of Object.values(PRODUCTS)) {
        assert.ok(!json.includes(p.name.toLowerCase()), `Exposed ${p.id} for ${q.id}`);
        assert.ok(!json.includes(p.brand.toLowerCase()), `Exposed brand for ${q.id}`);
        assert.ok(!json.includes(p.link.toLowerCase()));
        assert.ok(!json.includes(p.image.toLowerCase()));
      }
      if (r.teaser) {
        assert.ok(r.teaser.days.every(d => Object.keys(d).sort().join(',') === 'day,kind,phase'));
        assert.equal(r.teaser.productCount, r.teaser.chosenProductCount + r.teaser.sharedProductCount + r.teaser.optionalProductCount);
        assert.ok(r.teaser.shelf.every((s,i,all) => !s.optional || all.slice(i).every(x => x.optional)));
      }
    }
  }
});
test('the free browser entry never statically imports the catalog or scoring engine', () => {
  const seen = new Set();
  function walk(file) {
    if (seen.has(file) || !existsSync(file)) return;
    seen.add(file);
    assert.ok(!/\/(scoring|recommendations|publicResults|shelfPersonalization)\.tsx?$/.test(file), file);
    const js = ts.transpileModule(readFileSync(file,'utf8'), { compilerOptions: {
      module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022,
    }}).outputText;
    const ast = ts.createSourceFile(file, js, ts.ScriptTarget.Latest);
    for (const n of ast.statements) {
      if (!ts.isImportDeclaration(n) || !ts.isStringLiteral(n.moduleSpecifier)) continue;
      const s = n.moduleSpecifier.text;
      const basePath = s.startsWith('.') ? path.resolve(path.dirname(file),s) :
        s.startsWith('@/') ? path.join(root,s.slice(2)) : null;
      if (!basePath) continue;
      const resolved = [basePath,basePath+'.ts',basePath+'.tsx',path.join(basePath,'index.ts')].find(p => /\.[jt]sx?$/.test(p) && existsSync(p));
      if (resolved) walk(resolved);
    }
  }
  walk(path.join(root,'app/hair-growth-edit/GrowthEditClient.tsx'));
  const route = source('app/api/hair-growth-edit/plan/route.ts');
  assert.match(route, /auth\.getUser\(\)/);
  assert.match(route, /eq\('user_id', user.id\)/);
  assert.match(route, /eq\('status', 'active'\)/);
  assert.match(route, /if \(!paid\) return NextResponse.json/);
  assert.match(route, /private, no-store/);
});
test('professional buyers get a complete gentle plan without changing the live referral threshold', () => {
  assert.equal(QUESTIONS.find(q => q.id === 'shedChange').options[2].scores.RF, 2);
  const q = QUESTIONS.find(q => q.options.some(o => (o.scores.RF ?? 0) >= 3));
  for (const value of WASH_ANSWER_VALUES) {
    const c = context({ ...base(), [q.id]: q.options.findIndex(o => (o.scores.RF ?? 0) >= 3), shampooFrequency: value });
    assert.equal(c.hasSevereRedFlag, true);
    const safe = getProfessionalCareContext(c);
    assert.equal(safe.routine.length, 3);
    assert.ok(buildRoutineCalendar(c, start).every(d => d.kind !== 'treatment'));
    assert.ok(safe.routine.every(s => !/Mask|Scrub|Energizing|Superactive|Rebalancing/.test(s.product.name)));
  }
  const parent = source('app/hair-growth-edit/GrowthEditClient.tsx');
  assert.doesNotMatch(parent, /!.*hasSevereRedFlag/);
  assert.match(source('app/hair-growth-edit/components/Results.tsx'), /hasSevereRedFlag && <ProfessionalCareNote/);
  assert.match(source('app/hair-growth-edit/components/routine-map/RoutineMapGuide.tsx'), /ProfessionalCareNote/);
});
test('treatment and optional serum spacing follows completed wash counts without combining scrub and mask', () => {
  for (const value of WASH_ANSWER_VALUES) {
    const c = context({ ...base(), shampooFrequency: value, proteinResponse: 0, repairTreatmentResponse: 0, dryFeel: 0 });
    const days = buildRoutineCalendar(c, start);
    const treatment = days.filter(d => d.treatmentName?.includes('Hair Building Pak'));
    assert.ok(treatment.length);
    const gap = getKeratinSchedule(c.washFrequency).skipWashes + 1;
    assert.ok(treatment.slice(1).every((d,i) => d.washNumber - treatment[i].washNumber >= gap));
    assert.ok(days.filter(d => d.kind === 'regular').every(d => !d.steps.some(s => /Hair Building Pak/.test(s.title))));
    const serum = c.routine.find(s => s.product.id === 'energizingSuperactive');
    if (serum) for (let i = 0; i <= 23; i++) {
      assert.ok(days.slice(i,i+7).filter(d => d.steps.some(s => s.title.includes(serum.product.name))).length <= 3);
    }
  }
});
test('account stores restore across devices, reject account changes and detect concurrent updates', async () => {
  let currentUser = 'buyer-a';
  const rows = new Map();
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: currentUser, user_metadata: { first_name: 'Buyer' } } }, error: null }) },
    from: () => {
      let mode = 'select', value, filters = {};
      const query = {
        select: () => query, eq: (k,v) => { filters[k] = v; return query; },
        insert: v => { mode = 'insert'; value = v; return query; },
        update: v => { mode = 'update'; value = v; return query; },
        maybeSingle: async () => {
          const k = `${filters.user_id ?? value?.user_id}:${filters.plan_key ?? value?.plan_key}`;
          let row = rows.get(k);
          if (mode === 'insert') { if (row) return { data: null, error: { message: 'conflict' } }; row = structuredClone(value); rows.set(k,row); }
          if (mode === 'update') {
            if (!row || row.revision !== filters.revision) return { data: null, error: null };
            row = { ...row, ...structuredClone(value) }; rows.set(k,row);
          }
          return { data: row ? structuredClone(row) : null, error: null };
        },
      };
      return query;
    },
  };
  const key = getPlanKey(context(base())), device1 = createAccountProgressStore(client,key), device2 = createAccountProgressStore(client,key);
  assert.equal((await device1.load()).progress, null);
  const first = await device1.save(createProgress(key,'Buyer'),0);
  assert.equal((await device2.load()).progress.revision,1);
  const second = await device1.save({ ...first, completedDays: [1] },1);
  assert.deepEqual((await device2.load()).progress.completedDays,[1]);
  await assert.rejects(device2.save(first,1), /another tab/);
  currentUser = 'buyer-b';
  await assert.rejects(device1.load(), /account changed/);
  const other = createAccountProgressStore(client,key);
  assert.equal((await other.load()).progress,null);
  assert.ok(isRoutineProgress(second,key));
});
test('new offer and entry pages match, and the card has no second personalization guarantee', () => {
  const offer = source('app/hair-growth-edit/lib/routineOffer.ts');
  assert.match(offer, /title: "Your 30-Day Length Retention Plan"/);
  assert.match(offer, /cta: "Get my 30-day plan"/);
  const card = source('app/hair-growth-edit/components/RoutineSalesCard.tsx');
  assert.match(card, /purchaseBullets\.map/); assert.doesNotMatch(card,/fitPromiseShort|routine-fit-promise/);
  assert.match(source('app/hair-growth-edit/components/Results.tsx'), /7-day refund window/);
  const moisture = source('app/7-day-moisture-reset/FreeGuideClient.tsx'), home = source('app/HomeClient.tsx');
  assert.match(moisture,/You did 7 days\. Get your next 30, built for your hair\./);
  assert.match(moisture,/href='\/hair-growth-edit'[\s\S]{0,160}You did 7 days\. Get your next 30/);
  assert.doesNotMatch(moisture+home,/two matched products|two of your matched products|Top 3 buying priorities/);
  assert.match(moisture,/ROUTINE_OFFER\.purchaseBullets\.map/);
});
