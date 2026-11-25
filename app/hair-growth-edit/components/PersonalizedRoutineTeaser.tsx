import { useState } from 'react';
import type { RoutineTeaser } from '../lib/routineTeaserTypes';
import './PersonalizedRoutineTeaser.css';

const KIND_LABEL = { regular: 'Wash day', treatment: 'Treatment wash day', rest: 'Rest day' } as const;

const SAMPLE = [
  { label: 'Day 1', scalp: 2, detangling: 2, note: '“My ends felt tangled after rinsing.”' },
  { label: 'Day 30', scalp: 3, detangling: 4, note: '“Detangling felt easier this wash.”' },
];

export function PersonalizedRoutineTeaser({ teaser }: { teaser: RoutineTeaser }) {
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [tab, setTab] = useState<'calendar' | 'shelf' | 'progress'>(() => {
    const requested = new URLSearchParams(window.location.search).get('teaser-tab');
    return requested === 'shelf' || requested === 'progress' ? requested : 'calendar';
  });
  const { washCount, chosenProductCount, sharedProductCount, optionalProductCount, phases, days, shelf } = teaser;
  const phaseName = (n: number) => phases.find((p) => p.number === n)?.name ?? `Phase ${n}`;
  const selected = days.find((d) => d.day === openDay);

  return (
    <section className="mt-10 border-t border-foreground/15 pt-10" aria-labelledby="prt-heading" data-testid="section-routine-teaser">
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-foreground/55">A preview of your 30-day plan</span>
      <h2 id="prt-heading" className="prt-reveal mt-3 font-serif text-3xl leading-tight text-foreground md:text-4xl">
        Shaped around your answers
      </h2>
      <p className="prt-reveal mt-4 max-w-2xl rounded-xl bg-sage/35 px-5 py-4 text-sm leading-relaxed text-foreground/85" style={{ animationDelay: '80ms' }} data-testid="text-teaser-summary">
        Your plan: {washCount} wash days over 30 days · {phases.length} phases
        <span className="mt-1 block">
          {chosenProductCount} {chosenProductCount === 1 ? 'product' : 'products'} chosen for you
          {sharedProductCount > 0 && <> · {sharedProductCount} shared care {sharedProductCount === 1 ? 'option' : 'options'}</>}
          {optionalProductCount > 0 && <> · {optionalProductCount} optional {optionalProductCount === 1 ? 'extra' : 'extras'}</>}
        </span>
      </p>

      <div className="mt-6 flex gap-6 border-b border-foreground/15" aria-label="Explore your plan preview">
        {(['calendar', 'shelf', 'progress'] as const).map(value => (
          <button key={value} type="button" aria-pressed={tab === value} aria-controls="routine-teaser-panel"
            onClick={() => setTab(value)}
            className={`border-b pb-3 text-sm transition-colors ${tab === value ? 'border-foreground text-foreground' : 'border-transparent text-foreground/55 hover:text-foreground'}`}>
            {{ calendar: 'Calendar', shelf: 'My shelf', progress: 'Progress' }[value]}
          </button>
        ))}
      </div>
      <div id="routine-teaser-panel">
      {tab === 'calendar' && <>
      {/* Phases */}
      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {phases.map((p) => (
          <li key={p.number} className="border-l border-foreground/20 pl-4" data-testid={`text-phase-${p.number}`}>
            <span className="font-support text-xs italic text-foreground/55">Phase {p.number} · Days {p.from}–{p.to}</span>
            <p className="mt-1 font-serif text-xl text-foreground">{p.name}</p>
          </li>
        ))}
      </ol>

      {/* Calendar */}
      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-foreground/70" aria-label="Calendar legend">
          {(['regular', 'treatment', 'rest'] as const).map((k) => (
            <span key={k} className="inline-flex items-center gap-2"><span className={`prt-dot prt-dot--${k}`} aria-hidden />{KIND_LABEL[k]}</span>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-10" role="group" aria-label="Your 30-day calendar">
          {days.map((d) => (
            <button
              key={d.day}
              type="button"
              aria-pressed={openDay === d.day}
              aria-label={`Day ${d.day}, ${KIND_LABEL[d.kind]}, ${phaseName(d.phase)}`}
              onClick={() => setOpenDay(openDay === d.day ? null : d.day)}
              className={`prt-day flex flex-col items-center gap-1.5 rounded-lg py-2.5 ${d.phase % 2 === 0 ? 'bg-blue/40' : ''}`}
              data-testid={`button-day-${d.day}`}
            >
              <span className="text-[0.7rem] tabular-nums text-foreground/65">{d.day}</span>
              <span className={`prt-dot prt-dot--${d.kind}`} aria-hidden />
            </button>
          ))}
        </div>
        <div aria-live="polite">
          {selected && (
            <p key={selected.day} className="prt-note mt-4 max-w-xl text-sm leading-relaxed text-foreground/80" data-testid="text-day-message">
              <span className="font-serif text-lg italic text-foreground">Day {selected.day}</span> — {KIND_LABEL[selected.kind].toLowerCase()} in {phaseName(selected.phase)}. The steps for this day unlock with your full plan.
            </p>
          )}
        </div>
      </div>
      </>}

      {/* Shelf */}
      {tab === 'shelf' && <div className="mt-7">
        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">Your shelf, by category</span>
        <ul className="mt-4 divide-y divide-foreground/10">
          {shelf.map((s, i) => (
            <li key={`${s.category}-${i}`} className="py-5" data-testid={`row-shelf-${i}`}>
              {i === 0 && <h3 className="mb-5 font-serif text-2xl text-foreground">Start here</h3>}
              {!s.startHere && i > 0 && shelf[i - 1].startHere &&
                <h3 className="mb-5 font-serif text-2xl text-foreground">Add as you run out</h3>}
              <div className="grid grid-cols-[1fr_5.5rem] items-center gap-4 sm:grid-cols-[1fr_7rem] sm:gap-6">
              <div>
              <p className="font-serif text-xl text-foreground">
                {s.category}
                {s.startHere && <span className="ml-2 align-middle text-[0.6rem] font-medium uppercase tracking-widest text-foreground/65">Start here</span>}
                {s.optional && <span className="ml-2 align-middle text-[0.6rem] font-medium uppercase tracking-widest text-foreground/50">Optional</span>}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75">{s.reason}</p>
              </div>
              <div className="text-center">
                <div className="prt-product-tile" aria-hidden="true">
                  <div className="prt-product-cap" />
                  <div className="prt-product-bottle"><span /></div>
                </div>
                <p className="mt-2 text-[0.65rem] leading-snug text-foreground/65">Unlocks with your plan</p>
              </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-foreground/55">Specific picks are revealed in your full plan.</p>
      </div>}

      {/* Illustrative comparison */}
      {tab === 'progress' && <div className="mt-7">
        <h3 className="mb-2 font-serif text-xl">Small check-ins. A clearer picture.</h3>
        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">Illustrative example · not a predicted result</span>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {SAMPLE.map((s) => (
            <figure key={s.label} className="border-t border-foreground/20 pt-4">
              <figcaption className="font-support text-sm italic text-foreground/60">Example · {s.label}</figcaption>
              <dl className="mt-3 space-y-2 text-sm text-foreground/75">
                <div className="flex justify-between gap-4"><dt>Scalp comfort</dt><dd>{s.scalp}/5</dd></div>
                <div className="flex justify-between gap-4"><dt>Ease of detangling</dt><dd>{s.detangling}/5</dd></div>
              </dl>
              <p className="mt-3 font-serif text-lg leading-snug text-foreground/85">{s.note}</p>
            </figure>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-foreground/55">Example entries only, not customer results or a forecast. Ratings run from 1 (struggling) to 5 (more comfortable or easier). Your log starts with your own baseline.</p>
      </div>}
      </div>

      <a href="#routine-purchase-card" className="mt-10 inline-flex items-center gap-2 border-b border-foreground/40 pb-1 text-sm text-foreground transition-colors hover:border-foreground" data-testid="link-unlock-plan">
        Unlock your full plan <span aria-hidden>↓</span>
      </a>
    </section>
  );
}
