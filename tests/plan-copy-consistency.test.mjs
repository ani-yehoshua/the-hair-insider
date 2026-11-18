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

test('checkout accurately describes the daily calendar, phases and check-ins with the existing disclaimer', () => {
  const markup = renderToStaticMarkup(React.createElement(RoutineCheckoutSummary, { availability: null }));
  assert.ok(markup.includes(ROUTINE_OFFER.calendarDescription));
  assert.match(markup, /day-by-day 30-day calendar built from your answers/);
  assert.match(markup, /three phases and progress check-ins/);
  assert.match(markup, /not a medical diagnosis or 1:1 consultation/);
  assert.match(markup, /One-time purchase; products are sold separately/);
  assert.equal((markup.match(/7-day refund window for first-time purchases/g) || []).length, 1);
  assert.match(markup, /href="\/terms"/);
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
