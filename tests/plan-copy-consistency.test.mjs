import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ROUTINE_OFFER } from '../app/hair-growth-edit/lib/routineOffer.ts';
import { RoutineCheckoutSummary } from '../app/hair-growth-edit/components/RoutineCheckoutSummary.tsx';
import { RoutineInclusions } from '../app/hair-growth-edit/components/RoutineInclusions.tsx';
import { GuideRefundNote } from '../app/hair-growth-edit/components/GuideNotes.tsx';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = p => readFileSync(path.join(root, p), 'utf8');

test('checkout keeps only the three approved benefits, reassurance, Terms and short disclaimer', () => {
  const markup = renderToStaticMarkup(React.createElement(RoutineCheckoutSummary, { availability: null }));
  assert.match(markup, /Your 30-Day Length Retention Plan/);
  for (const line of [
    'Your 30-day calendar, built from your answers',
    'Your shelf: the 3 products to start with, and what to skip',
    'Check-ins so you can see it working',
  ]) assert.ok(markup.includes(line));
  assert.equal((markup.match(/<li /g) || []).length, 3);
  assert.match(markup, /Instant access · One-time payment · 7-day refund/);
  assert.equal((markup.match(/7-day refund/g) || []).length, 1);
  assert.match(markup, /Products sold separately\. Educational guidance, not medical advice\./);
  assert.match(markup, /href="\/terms"/);
  assert.doesNotMatch(markup, /Stop buying|Your quiz answers become|mapped out|whole shelf|Included in your routine|three phases|1:1 consultation/);
});

test('checkout prices and spots use live availability without inventing a loading price or closed discount', () => {
  const offer = { claimed: 17, limit: 100, active: true, unitAmount: 5100, regularAmount: 7300, currency: 'usd' };
  const render = availability => renderToStaticMarkup(React.createElement(RoutineCheckoutSummary, { availability }));
  assert.match(render(offer), /\$51/);
  assert.match(render(offer), /<s [^>]*>\$73<\/s>/);
  assert.match(render(offer), /Founding price · 83 spots left/);
  const closed = render({ ...offer, active:false, claimed:100, unitAmount:7300 });
  assert.match(closed, /\$73/);
  assert.doesNotMatch(closed, /<s |Founding price ·/);
  assert.match(closed, /Regular pricing now applies/);
  assert.doesNotMatch(render(null), /\$\d|spots left/);
  assert.match(render({ ...offer, claimed:101 }), /Founding price · 0 spots left/);
});

test('shared inclusions match the six approved plan labels in order', () => {
  assert.deepEqual(ROUTINE_OFFER.inclusions, [
    '30-day calendar', 'Your shelf', 'First wash', 'What not to combine', 'Progress check-ins', 'Troubleshooting',
  ]);
  const markup = renderToStaticMarkup(React.createElement(RoutineInclusions));
  assert.ok(markup.includes(ROUTINE_OFFER.inclusions.join(' · ')));
});

test('guide notes retain the refund window without promising personal adjustments', () => {
  const markup = renderToStaticMarkup(React.createElement(GuideRefundNote, { location:'test' }));
  assert.match(markup, /7-day refund window for first-time purchases/);
  assert.match(markup, /href="\/terms"/);
  assert.doesNotMatch(markup, /adjust|fit promise|receipt/i);
  assert.ok(!('fitPromise' in ROUTINE_OFFER));
  assert.ok(!('fitPromiseShort' in ROUTINE_OFFER));
});

test('runtime copy has no old weekly-only description or personal adjustment promises anywhere', () => {
  function visit(dir) {
    for (const entry of readdirSync(path.join(root, dir), { withFileTypes:true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (/\.(ts|tsx|js|jsx|mdx?)$/.test(file)) {
        const text = source(file).replace(/\s+/g,' ');
        assert.doesNotMatch(text, /weekly wash cadence|weekly plan with phased milestones|no[t]?\s+a?\s*day-by-day to-do list/i, file);
        assert.doesNotMatch(text, /fitPromise|Seven-day fit promise|reply to your receipt.{0,160}adjust|we[’']ll adjust (?:it|your routine)/i, file);
      }
    }
  }
  visit('app'); visit('lib');
});
