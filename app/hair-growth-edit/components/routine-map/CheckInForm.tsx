import { useState } from 'react';
import { Camera, Check } from 'lucide-react';
import type { CheckIn, MapContext, Ratings } from '../../lib/routineMapTypes';
import { RATING_ENDPOINTS, RATING_LABELS } from '../../lib/routineMapTypes';
import { getCheckInAdvice } from '../../lib/routineProgress';
import type { CheckInSlot } from './mapUtils';
import { formatDate } from './mapUtils';

const KEYS = Object.keys(RATING_LABELS) as (keyof Ratings)[];
const MAX_NOTE = 1000;

interface Props {
  slot: CheckInSlot;
  day: number;
  date: string;
  context: MapContext;
  existing?: CheckIn;
  baseline?: CheckIn;
  locked: string | null;
  disabled: boolean;
  onSave: (key: string, checkIn: CheckIn) => Promise<boolean>;
}

export function CheckInForm({ slot, day, date, context, existing, baseline, locked, disabled, onSave }: Props) {
  const [ratings, setRatings] = useState<Partial<Ratings>>(existing?.ratings ?? {});
  const [note, setNote] = useState(existing?.note ?? '');
  const [irritated, setIrritated] = useState(existing?.irritated ?? false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [editing, setEditing] = useState(!existing);
  const idBase = `ci-${slot.key}`;
  const complete = KEYS.every(k => typeof ratings[k] === 'number');
  const advice = existing ? getCheckInAdvice(context, existing, baseline) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete || disabled || locked) return;
    setStatus('saving');
    const checkIn: CheckIn = {
      day,
      kind: slot.kind,
      ratings: ratings as Ratings,
      note: note.slice(0, MAX_NOTE),
      irritated,
      recordedAt: new Date().toISOString(),
    };
    const ok = await onSave(slot.key, checkIn);
    if (ok) { setStatus('saved'); setEditing(false); } else setStatus('failed');
  };

  return (
    <section className="rm-panel p-5 md:p-7" aria-labelledby={`${idBase}-h`} data-testid={`checkin-${slot.key}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 id={`${idBase}-h`} className="rm-serif text-2xl">{slot.label}</h4>
        <span className="rm-kicker">For {formatDate(date)}</span>
      </div>
      <p className="rm-small mt-2">{slot.description}</p>

      {existing && !editing ? (
        <div className="mt-5">
          <p className="inline-flex items-center gap-2 text-sm" role="status">
            <Check size={15} /> {status === 'saved' ? 'Saved to your map just now.' : `Saved ${new Date(existing.recordedAt).toLocaleDateString()}.`}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
            {KEYS.map(k => (
              <div key={k}>
                <dt className="rm-kicker">{RATING_LABELS[k]}</dt>
                <dd className="rm-serif text-2xl">{existing.ratings[k]}<span className="rm-small"> / 5</span></dd>
              </div>
            ))}
          </dl>
          {existing.irritated && <p className="rm-small mt-3"><strong>New burning or irritation noted.</strong></p>}
          {existing.note && <p className="rm-small mt-3 italic">“{existing.note}”</p>}
          {advice && (
            <div className="rm-panel-sage mt-5 p-5">
              <p className="rm-kicker">What to do next</p>
              <p className="rm-serif mt-2 text-xl">{advice.title}</p>
              <p className="rm-small mt-2">{advice.action}</p>
              <p className="rm-small mt-2"><strong>Next check:</strong> {advice.nextCheck}</p>
            </div>
          )}
          <button type="button" className="rm-btn rm-btn-line mt-5" disabled={disabled || !!locked} onClick={() => { setEditing(true); setStatus('idle'); }}>
            Revise this check-in
          </button>
        </div>
      ) : (
        <form className="mt-5 space-y-6" onSubmit={submit}>
          {locked && <p className="rm-small" role="note">{locked}</p>}
          <p className="rm-small">Tap 1–5 for each. <strong>Higher is always better.</strong> Under a minute.</p>
          {KEYS.map(k => (
            <fieldset key={k} disabled={disabled || !!locked}>
              <legend className="text-sm font-medium">{RATING_LABELS[k]}</legend>
              <div className="rm-scale mt-2" role="radiogroup" aria-label={`${RATING_LABELS[k]}, 1 ${RATING_ENDPOINTS[k][0]} to 5 ${RATING_ENDPOINTS[k][1]}`}>
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n}>
                    <input
                      type="radio" id={`${idBase}-${k}-${n}`} name={`${idBase}-${k}`} value={n}
                      checked={ratings[k] === n}
                      onChange={() => setRatings(r => ({ ...r, [k]: n }))}
                    />
                    <label htmlFor={`${idBase}-${k}-${n}`}>
                      {n}<span className="sr-only">{n === 1 ? ` – ${RATING_ENDPOINTS[k][0]}` : n === 5 ? ` – ${RATING_ENDPOINTS[k][1]}` : ''}</span>
                    </label>
                  </span>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[0.68rem] text-foreground/55" aria-hidden="true">
                <span>1 · {RATING_ENDPOINTS[k][0]}</span><span>{RATING_ENDPOINTS[k][1]} · 5</span>
              </div>
            </fieldset>
          ))}
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-foreground" checked={irritated} onChange={e => setIrritated(e.target.checked)} disabled={disabled || !!locked} />
            <span>I noticed new burning, stinging or irritation on my scalp.</span>
          </label>
          <div>
            <label htmlFor={`${idBase}-note`} className="text-sm font-medium">Note <span className="font-light text-foreground/55">(optional)</span></label>
            <textarea id={`${idBase}-note`} className="rm-textarea mt-2" rows={3} maxLength={MAX_NOTE} value={note}
              onChange={e => setNote(e.target.value.slice(0, MAX_NOTE))} disabled={disabled || !!locked}
              placeholder="Anything worth remembering—product amount, how detangling went." />
            <p className="mt-1 text-right text-[0.68rem] text-foreground/55">{note.length} / {MAX_NOTE}</p>
          </div>
          {(slot.kind === 'baseline' || slot.kind === 'phase' || slot.kind === 'summary') && (
            <p className="rm-small flex gap-2"><Camera size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              Photo reminder: take one on your own phone, same spot and same light each time. Nothing is uploaded or stored here.</p>
          )}
          {irritated && (
            <p className="rm-panel-blush rm-small p-4" role="note">Pause the newest product and rinse. If burning, rash or irritation worsens or persists, stop it and seek professional care. For severe swelling or difficulty breathing, get urgent care.</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="rm-btn rm-btn-ink" disabled={!complete || disabled || !!locked || status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Save check-in'}
            </button>
            {existing && <button type="button" className="rm-btn rm-btn-line" onClick={() => setEditing(false)}>Cancel</button>}
            {!complete && <span className="rm-small">Choose all four ratings to save.</span>}
          </div>
          {status === 'failed' && <p className="text-sm" role="alert">That didn’t save. Your answers are still here—try again in a moment.</p>}
        </form>
      )}
    </section>
  );
}
