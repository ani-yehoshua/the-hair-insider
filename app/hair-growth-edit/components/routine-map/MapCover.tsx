import { useState } from 'react';
import type { RoutineProgress } from '../../lib/routineMapTypes';
import { MAP_TITLE } from '../../lib/routineMapTypes';
import { localDate } from '../../lib/routineCalendar';
import { formatDate, hasAnyLogs } from './mapUtils';
import { PROFESSIONAL_CARE_DISCLAIMER } from '../../lib/professionalCareCopy';

interface CoverProps {
  firstName: string;
  focus: string;
  startDate: string;
  mode: 'preview' | 'account';
  hasSevereRedFlag?: boolean;
}

export function MapCover({ firstName, focus, startDate, mode, hasSevereRedFlag }: CoverProps) {
  return (
    <header className="pt-10 md:pt-16" data-testid="routine-map-cover">
      {mode === 'preview' && (
        <p className="rm-panel-blue rm-small mb-8 inline-block px-4 py-2" role="note" data-testid="preview-mode-note">
          Isolated preview account — not a signed-in customer. Entries here are for review only.
        </p>
      )}
      <p className="rm-kicker rm-reveal">The Growth Edit · Private</p>
      <h1 className="rm-serif rm-cover-title rm-reveal rm-reveal-2 mt-5">{MAP_TITLE}</h1>
      <div className="rm-hairline mt-8 max-w-xs" />
      <dl className="rm-reveal rm-reveal-3 mt-8 grid gap-6 sm:grid-cols-3">
        <div>
          <dt className="rm-kicker">Prepared for</dt>
          <dd className="rm-serif rm-cover-name mt-1 text-3xl">{firstName || 'you'}</dd>
        </div>
        <div>
          <dt className="rm-kicker">Starting focus</dt>
          <dd className="rm-serif mt-1 text-xl leading-snug">{focus}</dd>
        </div>
        <div>
          <dt className="rm-kicker">Begins</dt>
          <dd className="rm-serif mt-1 text-xl">{formatDate(startDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</dd>
        </div>
      </dl>
      <p className="rm-small mt-5">This is quiz-based guidance, not an in-person assessment. Adjust as you notice how your hair and scalp feel.</p>
      {hasSevereRedFlag && <p className="rm-small mt-4">{PROFESSIONAL_CARE_DISCLAIMER}</p>}
    </header>
  );
}

interface SetupProps {
  progress: RoutineProgress | null;
  defaultName: string;
  disabled: boolean;
  onSubmit: (firstName: string, startDate: string) => Promise<boolean>;
  onCancel?: () => void;
}

export function MapSetup({ progress, defaultName, disabled, onSubmit, onCancel }: SetupProps) {
  const [name, setName] = useState(progress?.firstName || defaultName);
  const [start, setStart] = useState(progress?.startDate || localDate());
  const [state, setState] = useState<'idle' | 'saving' | 'failed'>('idle');
  const dateLocked = hasAnyLogs(progress);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('saving');
    const ok = await onSubmit(name.trim(), start);
    setState(ok ? 'idle' : 'failed');
  };

  return (
    <form onSubmit={submit} className="rm-panel mt-10 p-6 md:p-10" aria-labelledby="rm-setup-h" data-testid="routine-map-setup">
      <p className="rm-kicker">{progress ? 'Your details' : 'Before we begin'}</p>
      <h2 id="rm-setup-h" className="rm-serif mt-2 text-3xl">{progress ? 'Adjust your map' : 'Set your first day'}</h2>
      <p className="rm-body mt-2 max-w-xl">Choose the day you’ll start. If that day has already passed, you can fill in earlier days—each entry stays dated.</p>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="rm-first-name" className="rm-kicker">First name</label>
          <input id="rm-first-name" className="rm-input mt-1" value={name} maxLength={60} autoComplete="given-name" onChange={e => setName(e.target.value)} disabled={disabled} />
        </div>
        <div>
          <label htmlFor="rm-start" className="rm-kicker">Start date</label>
          <input id="rm-start" type="date" className="rm-input mt-1" value={start} onChange={e => setStart(e.target.value)} disabled={disabled || dateLocked} required />
          {dateLocked && <p className="rm-small mt-2">Your start date is fixed once you’ve logged a day, so nothing you recorded gets moved.</p>}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="submit" className="rm-btn rm-btn-ink" disabled={disabled || state === 'saving' || !start}>
          {state === 'saving' ? 'Saving…' : progress ? 'Save details' : 'Begin my map'}
        </button>
        {onCancel && <button type="button" className="rm-btn rm-btn-line" onClick={onCancel}>Close</button>}
      </div>
      {state === 'failed' && <p className="mt-4 text-sm" role="alert">That didn’t save. Your details are still here—please try again.</p>}
    </form>
  );
}

export function FounderNote({ hasSevereRedFlag = false }: { hasSevereRedFlag?: boolean }) {
  return (
    <section className="rm-panel-tint mt-14 p-6 md:p-10" aria-labelledby="rm-founder-h" data-testid="founder-note">
      <p className="rm-kicker">A note from the founder</p>
      <h2 id="rm-founder-h" className="rm-serif mt-3 text-3xl md:text-4xl">Why it looks like your hair isn’t growing</h2>
      <div className="rm-body mt-5 max-w-2xl space-y-4">
        <p>I always wanted long hair. Then cosmetology school—constant practice, heat and processing—left mine damaged. My hair is fine but dense, and for years it stalled at mid-back.</p>
        <p>What I eventually understood: your roots can keep growing while your ends quietly break. When length snaps off as fast as it arrives, it looks like nothing is happening.</p>
        <p>What changed things wasn’t a bigger haul. It was learning how to use what I had, in what order, and how to read what my hair was telling me. Layering matters. And switching products every week makes it impossible to know what is working—so this month, we keep things steady.</p>
        <p>{hasSevereRedFlag ? 'Please don’t wait out the month to get answers about shedding or a scalp concern. Professional advice comes first, even if it changes these steps. Use gentle care only while it feels comfortable; pause a suspected product for a reaction.' : 'Give the routine the full 30 days before swapping products just because you’re impatient—not to wait out a reaction.'} Stop the suspected product early for burning, rash, worsening irritation or persistent stiffness, and get professional help for concerning shedding, pain or sores. Severe swelling or breathing difficulty needs urgent care.</p>
      </div>
    </section>
  );
}
