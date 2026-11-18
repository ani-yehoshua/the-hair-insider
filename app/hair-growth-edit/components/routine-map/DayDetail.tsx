import { CheckCircle2, Circle, Moon } from 'lucide-react';
import type { CheckIn, MapContext, MapDay, RoutineProgress } from '../../lib/routineMapTypes';
import { CheckInForm } from './CheckInForm';
import { KIND_LABEL, formatDate, getCheckInSlots } from './mapUtils';
import { getUseWhatYouOwnNotes } from '../../lib/shelfPriorities';

interface Props {
  day: MapDay;
  today: string;
  context: MapContext;
  progress: RoutineProgress | null;
  canSave: boolean;
  onToggleComplete: (day: number) => Promise<boolean>;
  onSaveCheckIn: (key: string, checkIn: CheckIn) => Promise<boolean>;
}

export function DayDetail({ day, today, context, progress, canSave, onToggleComplete, onSaveCheckIn }: Props) {
  const isFuture = day.date > today;
  const isPast = day.date < today;
  const done = progress?.completedDays.includes(day.day) ?? false;
  const baseline = progress?.checkIns.baseline;
  const slots = getCheckInSlots(day);

  return (
    <article className="rm-reveal" aria-labelledby={`day-${day.day}-h`} data-testid={`day-detail-${day.day}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="rm-kicker">Day {day.day} · Phase {day.phase}</span>
        <span className="rm-kicker">{KIND_LABEL[day.kind]}{day.washNumber ? ` ${day.washNumber}` : ''}</span>
        <span className="rm-kicker">{formatDate(day.date, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>
      <h3 id={`day-${day.day}-h`} className="rm-serif mt-3 text-3xl md:text-4xl">{day.title}</h3>
      {day.treatmentName && <p className="rm-small mt-1">Treatment: <strong>{day.treatmentName}</strong></p>}
      <p className="rm-body mt-3 max-w-2xl">{day.note}</p>
      {isPast && <p className="rm-small mt-2">This date has passed—you can still log it. Entries stay dated to {formatDate(day.date)}.</p>}
      {isFuture && <p className="rm-small mt-2">A look ahead. You can log this on {formatDate(day.date)}.</p>}
      {day.optionalAlternative && <details className="rm-panel-blue mt-5 p-5">
        <summary className="rm-small cursor-pointer font-medium">{day.optionalAlternative.title}</summary>
        <p className="rm-small mt-3">{day.optionalAlternative.detail}</p>
        {getUseWhatYouOwnNotes(context, day.optionalAlternative.title).map(note =>
          <p key={note} className="rm-small mt-2 italic text-foreground/65">{note}</p>)}
      </details>}

      {day.steps.length > 0 ? (
        <div className="mt-8">
          <p className="rm-kicker">In this order</p>
          <ol className="rm-steps mt-4 space-y-5">
            {day.steps.map((s, i) => (
              <li key={`${s.title}-${i}`}>
                <p className="text-[0.95rem] font-medium">{s.title}</p>
                <p className="rm-small mt-1">{s.detail}</p>
                {getUseWhatYouOwnNotes(context, `${s.title} ${s.detail}`).map(note =>
                  <p key={note} className="rm-small mt-2 italic text-foreground/65">{note}</p>)}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="rm-panel-blue mt-8 flex gap-4 p-5 md:p-6">
          <Moon size={18} className="mt-1 shrink-0" aria-hidden="true" />
          <p className="rm-small">No wash and nothing new to buy or apply. Gentle handling is the whole task today.</p>
        </div>
      )}

      {day.layers.length > 0 && (
        <div className="rm-panel-tint mt-6 p-5 md:p-6">
          <p className="rm-kicker">{day.kind === 'rest' ? 'Gentle care' : 'Layering, after you rinse'}</p>
          <ul className="mt-3 space-y-3">
            {day.layers.map((l, i) => (
              <li key={`${l.title}-${i}`}>
                <p className="text-sm font-medium">{l.title}</p>
                <p className="rm-small">{l.detail}</p>
                {getUseWhatYouOwnNotes(context, `${l.title} ${l.detail}`).map(note =>
                  <p key={note} className="rm-small mt-2 italic text-foreground/65">{note}</p>)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          className={`rm-btn ${done ? 'rm-btn-line' : 'rm-btn-ink'}`}
          disabled={!canSave || isFuture}
          aria-pressed={done}
          onClick={() => onToggleComplete(day.day)}
          data-testid={`complete-day-${day.day}`}
        >
          {done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
          {done ? 'Completed · undo' : 'Mark day complete'}
        </button>
        {isFuture && <span className="rm-small">Completion opens on the day itself.</span>}
      </div>

      {slots.length > 0 && (
        <div className="mt-10 space-y-5">
          <p className="rm-kicker">Check-in</p>
          {isFuture ? (
            <div className="rm-panel p-5">
              <p className="rm-small">On this day you’ll record: {slots.map(s => s.label.toLowerCase()).join(', ')}. Four quick ratings, an optional note.</p>
            </div>
          ) : (
            slots.map(slot => (
              <CheckInForm
                key={`${slot.key}-${progress?.checkIns[slot.key]?.recordedAt ?? 'new'}`}
                slot={slot}
                day={day.day}
                date={day.date}
                context={context}
                existing={progress?.checkIns[slot.key]}
                baseline={baseline}
                disabled={!canSave}
                locked={slot.kind !== 'baseline' && !baseline ? 'Record your Day 1 starting point first—later check-ins compare against it.' : null}
                onSave={onSaveCheckIn}
              />
            ))
          )}
        </div>
      )}
    </article>
  );
}
