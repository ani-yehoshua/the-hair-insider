import { QUESTIONS, getSelectedOption } from '../data/questions.ts';
import { washFrequencyAssumption } from './washFrequency.ts';
import { PRODUCTS } from '../data/recommendations.ts';
import { calculateResults } from './scoring.ts';
import { buildRoutineCalendar, getMapPhases } from './routineCalendar.ts';
import { getShelfPersonalization } from './shelfPersonalization.ts';
import { getShelfGroups } from './shelfPriorities.ts';
import { getGentleInterimRoutine } from './professionalCare.ts';
import { getFreeResultsExplanation } from './resultsSalesContent.ts';
import type { MapContext } from './routineMapTypes';
import type { RoutineTeaser } from './routineTeaserTypes';

const hiddenNames = [...new Set([
  ...Object.values(PRODUCTS).flatMap(p => [p.name, p.brand]),
  'Hair Building Pak', 'NOUNOU', 'OI Milk', 'Nourishing Vegetarian Miracle', 'Vegetarian Miracle',
])].sort((a, b) => b.length - a.length);
/** Defence in depth: public reasons/explanations must not reveal catalog names. */
export function publicText(text: string): string {
  return hiddenNames.reduce((value, name) => value.replace(
    new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
    'your selected product',
  ), text);
}

export function validateAnswers(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  return Object.keys(answers).length === QUESTIONS.length && QUESTIONS.every(q => {
    const index = answers[q.id];
    return Number.isInteger(index) && typeof index === 'number' && index >= 0 && !!getSelectedOption(q, index);
  });
}

export function makePublicResults(answers: Record<string, number>) {
  const result = calculateResults(answers);
  const context: MapContext = {
    defaultProductIds: calculateResults({}).paidRoutine.map(s => s.product.id),
    routine: result.paidRoutine, answers, focus: result.primaryCause,
    observations: result.observations, habit: result.behaviorToStop,
    washFrequency: result.washFrequency, stylePreference: result.stylePreference,
    shouldShampooTwice: result.shouldShampooTwice, reportedDensityChange: answers.density === 3,
    hasSevereRedFlag: result.hasSevereRedFlag,
  };
  const days = buildRoutineCalendar(context, '2026-01-01');
  const phases = getMapPhases(context);
  const shelfGroups = getShelfGroups(context);
  const startingIds = new Set(shelfGroups.startHere.map(s => s.product.id));
  const shelf = [...shelfGroups.startHere, ...shelfGroups.addAsYouRunOut].map(step => {
    const pick = getShelfPersonalization(step, context);
    return {
      category: publicText(step.product.category),
      reason: publicText(pick.reason),
      optional: pick.optional,
      answerChosen: pick.answerChosen,
      startHere: startingIds.has(step.product.id),
    };
  });
  const teaser: RoutineTeaser = {
    washCount: days.filter(d => d.kind !== 'rest').length,
    productCount: result.paidRoutine.length,
    chosenProductCount: shelf.filter(s => !s.optional && s.answerChosen).length,
    sharedProductCount: shelf.filter(s => !s.optional && !s.answerChosen).length,
    optionalProductCount: shelf.filter(s => s.optional).length,
    phases: phases.map(({ number, name, from, to }) => ({ number, name, from, to })),
    days: days.map(({ day, phase, kind }) => ({ day, phase, kind })),
    shelf,
  };
  // Preserve the existing professional-care results, including its gentle interim option.
  const interim: typeof result.paidRoutine = [];
  // Explicit allowlist. Never serialize/spread the full calculated result.
  return {
    primaryCause: result.primaryCause,
    observations: result.observations.map(publicText),
    behaviorToStop: result.behaviorToStop,
    hasSevereRedFlag: result.hasSevereRedFlag,
    hasMinorRedFlag: result.hasMinorRedFlag,
    shouldShampooTwice: result.shouldShampooTwice,
    washFrequency: result.washFrequency,
    washFrequencyAssumption: washFrequencyAssumption(answers.shampooFrequency),
    stylePreference: result.stylePreference,
    supportingNeeds: result.hasSevereRedFlag ? result.supportingNeeds : result.supportingNeeds.map(n => publicText(getFreeResultsExplanation(n))),
    product1: interim[0]?.product ?? null,
    product2: null,
    paidRoutine: interim,
    teaser: result.hasSevereRedFlag ? null : teaser,
  };
}
export type PublicResults = ReturnType<typeof makePublicResults>;
