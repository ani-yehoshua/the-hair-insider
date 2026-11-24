import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('homepage Growth Edit uses an editable length-retention header and one free-results description', () => {
  const home = source('app/HomeClient.tsx');
  const workbook = home.slice(home.indexOf('function WorkbookCard'), home.indexOf('export default function HomeClient'));
  assert.match(workbook, /course\.slug === "hair-growth-edit" \? \([\s\S]*Your 30-day plan to keep the length you grow\.[\s\S]*\) : course\.cover_image_url/);
  const description = "Start free with your starting focus, a habit to reconsider, and a preview of your calendar and shelf. Unlock your 30-day plan when you're ready.";
  assert.equal(home.split(description).length - 1, 1);
  const card = home.slice(home.indexOf('{growthEditCourse && ('), home.indexOf('{bundleCourse && ('));
  assert.match(card, /detailNote=""/);
  assert.match(workbook, /\{detailNote && <p/);
  assert.doesNotMatch(home, /exact products that grow your hair|Product-neutral|no new products\s+required/i);
  assert.ok(home.includes('Build a simple, repeatable routine, starting with what you already own.'));
  assert.ok(home.includes('Education-first &middot; Built by a licensed stylist'));
});

test('shelf placeholders are generic visible bottle shapes with theme-compatible colors, not paid media', () => {
  const component = source('app/hair-growth-edit/components/PersonalizedRoutineTeaser.tsx');
  const css = source('app/hair-growth-edit/components/PersonalizedRoutineTeaser.css');
  const placeholder = component.slice(component.indexOf('<div className="prt-product-tile"'), component.indexOf('</li>', component.indexOf('<div className="prt-product-tile"')));
  assert.match(placeholder, /prt-product-cap/);
  assert.match(placeholder, /prt-product-bottle/);
  assert.match(placeholder, /Unlocks with your plan/);
  assert.doesNotMatch(placeholder, /<img|src=|href=|product\./);
  const shapeStyles = css.slice(css.indexOf('.prt-product-tile'), css.indexOf('@media'));
  assert.match(shapeStyles, /min-width: 88px/);
  assert.match(shapeStyles, /height: 108px/);
  assert.match(shapeStyles, /filter: blur\(3px\)/);
  assert.match(shapeStyles, /color-mix\(in srgb, var\(--foreground\)/);
  assert.doesNotMatch(shapeStyles, /hsl\(var\(/);
});
