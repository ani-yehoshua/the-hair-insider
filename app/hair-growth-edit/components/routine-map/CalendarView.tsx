import { Check } from 'lucide-react';
import type { MapDay, MapPhase, RoutineProgress } from '../../lib/routineMapTypes';
import { formatDate, getCheckInSlots } from './mapUtils';

interface Props {
  days: MapDay[];
  phases: MapPhase[];
  today: string;
  progress: RoutineProgress | null;
  selected: number;
  onSelect: (day: number) => void;
  scheduleNote: string;
}

export function CalendarView({ days, phases, today, progress, selected, onSelect, scheduleNote }: Props) {
  return (
    <section aria-labelledby="rm-cal-h" data-testid="routine-calendar">
      <p className="rm-kicker">Thirty days, three phases</p>
      <h2 id="rm-cal-h" className="rm-serif mt-2 text-3xl md:text-4xl">Your calendar</h2>
      <p className="rm-small mt-3 max-w-2xl">{scheduleNote} This is a starting rhythm, not a medical schedule. Follow your product labels and scalp comfort; do not add treatments to make up a missed day.</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.7rem] text-foreground/65" aria-hidden="true">
        <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full" style={{ background: 'hsl(var(--blue))' }} />Wash day</span>
        <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full" style={{ background: 'hsl(var(--sage))' }} />Treatment wash</span>
        <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-full border border-foreground/25" />Rest day</span>
        <span className="inline-flex items-center gap-2"><span className="rm-dot" />Check-in</span>
      </div>

      <div className="mt-8 space-y-10">
        {phases.map(phase => (
          <div key={phase.number}>
            <div className="rm-rule flex flex-col gap-1 pt-5 md:flex-row md:items-baseline md:justify-between">
              <h3 className="rm-serif text-2xl">
                <span className="italic text-foreground/50">{phase.number}. </span>{phase.name}
              </h3>
              <span className="rm-kicker">Days {phase.from}–{phase.to}</span>
            </div>
            <p className="rm-small mt-2 max-w-2xl">{phase.focus}</p>
            <p className="rm-small mt-1 max-w-2xl"><strong>Milestone:</strong> {phase.milestone}</p>
            <div className="rm-cal mt-5">
              {days.filter(d => d.phase === phase.number).map(d => {
                const done = progress?.completedDays.includes(d.day);
                const hasCheck = getCheckInSlots(d).length > 0;
                return (
                  <button
                    key={d.day}
                    type="button"
                    className="rm-cell rm-focus"
                    data-kind={d.kind}
                    data-future={d.date > today}
                    data-today={d.date === today}
                    aria-pressed={selected === d.day}
                    aria-label={`Day ${d.day}, ${formatDate(d.date, { weekday: 'long', month: 'long', day: 'numeric' })}, ${d.title}${done ? ', completed' : ''}${d.date === today ? ', today' : ''}`}
                    onClick={() => onSelect(d.day)}
                    data-testid={`calendar-day-${d.day}`}
                  >
                    <span className="flex items-start justify-between">
                      <span className="rm-serif text-lg leading-none md:text-xl">{d.day}</span>
                      {done && <Check size={13} aria-hidden="true" />}
                    </span>
                    <span className="flex items-end justify-between gap-1">
                      <span className="truncate text-[0.58rem] uppercase tracking-wider text-foreground/60">{formatDate(d.date, { month: 'short', day: 'numeric' })}</span>
                      {hasCheck && <span className="rm-dot shrink-0" aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
