import type { MapContext, RoutineProgress } from '../../lib/routineMapTypes';
import { RATING_LABELS } from '../../lib/routineMapTypes';
import { compareRatings, getCheckInAdvice, getProgressStats } from '../../lib/routineProgress';
import { addDays } from '../../lib/routineCalendar';
import { formatDate } from './mapUtils';

interface Props {
  context: MapContext;
  progress: RoutineProgress | null;
  today: string;
  onOpenDay: (day: number) => void;
}

const CHANGE_COPY = { improved: 'Improved', same: 'About the same', lower: 'Lower' } as const;

export function ProgressView({ context, progress, today, onOpenDay }: Props) {
  if (!progress) {
    return (
      <section className="rm-panel p-8 text-center" data-testid="progress-empty">
        <p className="rm-serif text-2xl">Nothing recorded yet</p>
        <p className="rm-small mx-auto mt-2 max-w-sm">Once your map is set up, completions and check-ins you save will gather here.</p>
      </section>
    );
  }
  const stats = getProgressStats(progress, today);
  const comparison = compareRatings(progress);
  const summary = progress.checkIns['summary-30'];
  const baseline = progress.checkIns.baseline;
  const advice = summary ? getCheckInAdvice(context, summary, baseline) ?? {
    title: comparison.some(c => c.change === 'improved') ? 'Keep the steps that agree with your hair' : 'Review one thing before changing products',
    action: comparison.some(c => c.change === 'improved')
      ? `Keep your regular wash rhythm and treatment spacing. Your focus is still ${context.focus}; an improvement in comfort is useful feedback, not proof of faster growth.`
      : `Your ratings have not shown a clear change yet. Revisit the application order, product amounts and your habit change for ${context.focus}. Do not automatically buy another treatment.`,
    nextCheck: 'Compare after your next few washes. Persistent scalp symptoms, concerning shedding or worsening breakage warrant professional guidance.',
  } : null;
  const entries = Object.entries(progress.checkIns).sort((a, b) => a[1].day - b[1].day);

  return (
    <section aria-labelledby="rm-prog-h" data-testid="routine-map-progress">
      <p className="rm-kicker">What you’ve saved</p>
      <h2 id="rm-prog-h" className="rm-serif mt-2 text-3xl md:text-4xl">Progress</h2>
      <dl className="mt-8 grid grid-cols-3 gap-4">
        <div><dt className="rm-kicker">Days complete</dt><dd className="rm-serif mt-1 text-4xl">{stats.completed}<span className="rm-small"> / 30</span></dd></div>
        <div><dt className="rm-kicker">Streak</dt><dd className="rm-serif mt-1 text-4xl">{stats.streak}<span className="rm-small"> days</span></dd></div>
        <div><dt className="rm-kicker">Today</dt><dd className="rm-serif mt-1 text-4xl">{stats.currentDay > 0 ? `Day ${stats.currentDay}` : '—'}</dd></div>
      </dl>
      <div className="rm-meter mt-6" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(stats.percent)} aria-label="Days completed">
        <span style={{ transform: `scaleX(${Math.min(1, stats.percent / 100)})` }} />
      </div>

      <div className="mt-12">
        <h3 className="rm-serif text-2xl">Day 30 against your starting point</h3>
        {comparison.length === 0 ? (
          <p className="rm-small mt-2 max-w-xl">This appears once you’ve saved both your Day 1 starting point and your Day 30 summary{baseline ? '' : '—begin with Day 1'}. The summary opens on {formatDate(addDays(progress.startDate, 29))}.</p>
        ) : (
          <>
            <ul className="mt-5 divide-y divide-foreground/10 border-y border-foreground/10" data-testid="rating-comparison">
              {comparison.map(c => (
                <li key={c.key} className="flex items-center justify-between gap-4 py-4">
                  <span className="text-sm">{c.label}</span>
                  <span className="rm-small tabular-nums">{c.baseline} → {c.current}</span>
                  <span className="text-[0.68rem] uppercase tracking-[0.16em]">{CHANGE_COPY[c.change]}{c.delta !== 0 ? ` (${c.delta > 0 ? '+' : ''}${c.delta})` : ''}</span>
                </li>
              ))}
            </ul>
            <p className="rm-small mt-3">Higher is better on every scale. These are your own comfort and handling ratings—not a measure of new growth.</p>
            {advice && (
              <div className="rm-panel-sage mt-6 p-6">
                <p className="rm-kicker">Your next step</p>
                <p className="rm-serif mt-2 text-2xl">{advice.title}</p>
                <p className="rm-body mt-2">{advice.action}</p>
                <p className="rm-small mt-2"><strong>Next check:</strong> {advice.nextCheck}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-12">
        <h3 className="rm-serif text-2xl">Your check-ins</h3>
        {entries.length === 0 ? (
          <p className="rm-small mt-2">None yet. Your first is the Day 1 starting point.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {entries.map(([key, ci]) => (
              <li key={key}>
                <button type="button" onClick={() => onOpenDay(ci.day)} className="rm-panel rm-focus flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left">
                  <span className="text-sm font-medium">Day {ci.day} · {ci.kind === 'baseline' ? 'Starting point' : ci.kind === 'summary' ? 'Summary' : ci.kind === 'phase' ? 'Phase end' : 'After wash'}</span>
                  <span className="rm-small">{(Object.keys(RATING_LABELS) as (keyof typeof RATING_LABELS)[]).map(k => ci.ratings[k]).join(' · ')}{ci.irritated ? ' · irritation noted' : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
