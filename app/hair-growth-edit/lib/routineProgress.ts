import { localDate } from './routineCalendar.ts';
import { getRoutineDecision } from './routineDecisions.ts';
import { RATING_LABELS } from './routineMapTypes.ts';
import type { CheckIn, MapContext, Ratings, RoutineProgress } from './routineMapTypes';

export function createProgress(planKey: string, firstName = '', startDate = localDate()): RoutineProgress {
  return { version: 1, planKey, revision: 0, firstName, startDate, completedDays: [], checkIns: {} };
}
export function getProgressStats(progress: RoutineProgress, today = localDate()) {
  const diff = Math.floor((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${progress.startDate}T12:00:00Z`)) / 86400000) + 1;
  const currentDay = Math.max(0, Math.min(30, diff));
  const days = new Set(progress.completedDays.filter(d => d >= 1 && d <= Math.min(30, diff)));
  let anchor = Math.min(30, diff);
  if (!days.has(anchor)) anchor--;
  let streak = 0;
  while (days.has(anchor) && anchor >= 1) { streak++; anchor--; }
  return { completed: days.size, percent: Math.round(days.size / 30 * 100), streak, currentDay };
}
export function compareRatings(progress: RoutineProgress) {
  const baseline = progress.checkIns.baseline, current = progress.checkIns['summary-30'];
  if (!baseline || !current) return [];
  return (Object.keys(RATING_LABELS) as (keyof Ratings)[]).map(key => {
    const delta = current.ratings[key] - baseline.ratings[key];
    return { key, label: RATING_LABELS[key], baseline: baseline.ratings[key], current: current.ratings[key], delta,
      change: (delta > 0 ? 'improved' : delta < 0 ? 'lower' : 'same') as 'improved' | 'same' | 'lower' };
  });
}
export function getCheckInAdvice(context: MapContext, entry: CheckIn, baseline?: CheckIn) {
  const worse = (key: keyof Ratings) => !!baseline && entry.ratings[key] < baseline.ratings[key];
  if (entry.irritated || entry.ratings.scalp <= 2) return getRoutineDecision(context.routine, 'irritated');
  if (worse('scalp')) return {
    title: 'Your scalp comfort rating is lower',
    action: 'Open Help → Scalp irritated. If there is new burning, a rash or worsening irritation, stop the suspected product and rinse as directed. Do not add another active to settle it.',
    nextCheck: 'If symptoms persist or worsen, seek professional care. Severe swelling or breathing difficulty needs urgent medical help.',
  };
  if (worse('breakage')) return {
    title: 'You noticed more snapped pieces',
    action: 'Open Help → Breakage is unchanged. Review heat, tension and detangling before buying another treatment. Pause a treatment if hair also feels progressively hard, rough or brittle.',
    nextCheck: 'Compare after your next gentle wash. Seek professional guidance for persistent breakage, sudden shedding, scalp pain or patchy loss.',
  };
  if (worse('lengths') || worse('tangling') || entry.ratings.lengths <= 2 || entry.ratings.tangling <= 2) {
    return getRoutineDecision(context.routine, 'dry');
  }
  return null;
}

/** Validate remote data before it can replace a local draft or be rendered. */
export function isRoutineProgress(value: unknown, planKey: string): value is RoutineProgress {
  if (!value || typeof value !== 'object') return false;
  const p = value as RoutineProgress;
  if (Object.keys(p).some(k => !['version', 'planKey', 'revision', 'firstName', 'startDate', 'completedDays', 'checkIns'].includes(k))) return false;
  if (p.version !== 1 || p.planKey !== planKey || !Number.isInteger(p.revision) || p.revision < 0 ||
    typeof p.firstName !== 'string' || p.firstName.length > 60 ||
    typeof p.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.startDate) ||
    !Number.isFinite(Date.parse(`${p.startDate}T12:00:00Z`)) ||
    new Date(`${p.startDate}T12:00:00Z`).toISOString().slice(0, 10) !== p.startDate ||
    !Array.isArray(p.completedDays) || p.completedDays.length > 30 ||
    p.completedDays.some(d => !Number.isInteger(d) || d < 1 || d > 30) ||
    new Set(p.completedDays).size !== p.completedDays.length ||
    !p.checkIns || typeof p.checkIns !== 'object' || Array.isArray(p.checkIns) ||
    Object.keys(p.checkIns).length > 35) return false;
  const keys = Object.keys(p.checkIns);
  for (const key of keys) {
    const e = p.checkIns[key];
    if (!e || !Number.isInteger(e.day) || e.day < 1 || e.day > 30 ||
      typeof e.note !== 'string' || e.note.length > 1000 || typeof e.irritated !== 'boolean' ||
      typeof e.recordedAt !== 'string' || !Number.isFinite(Date.parse(e.recordedAt)) ||
      Object.keys(e).some(k => !['day', 'kind', 'ratings', 'note', 'irritated', 'recordedAt'].includes(k)) ||
      !e.ratings || Object.keys(e.ratings).length !== 4 || Object.keys(RATING_LABELS).some(k => !Number.isInteger(e.ratings[k as keyof Ratings]) ||
        e.ratings[k as keyof Ratings] < 1 || e.ratings[k as keyof Ratings] > 5)) return false;
    const expected = e.kind === 'baseline' ? 'baseline' : `${e.kind}-${e.day}`;
    if (key !== expected || (e.kind === 'baseline' && e.day !== 1) ||
      (e.kind === 'phase' && ![7, 14, 30].includes(e.day)) ||
      (e.kind === 'summary' && e.day !== 30) || !['baseline', 'wash', 'phase', 'summary'].includes(e.kind)) return false;
  }
  return keys.every(k => k === 'baseline' || keys.includes('baseline'));
}
