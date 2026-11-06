"use client";

import { useState } from 'react';
import type { RoutineStep } from '../data/recommendations';
import { getWashDayPlan } from '../lib/washDays';
import { BasedOnAnswers, GuideFitNote } from './GuideNotes';

export function WashDayPlan({ routine, hasSevereRedFlag = false }: { routine: RoutineStep[]; hasSevereRedFlag?: boolean }) {
  const plan = getWashDayPlan(routine, hasSevereRedFlag);
  const [washType, setWashType] = useState<'regular' | 'treatment'>('regular');
  const selectedType = plan.mask ? washType : 'regular';
  const toning = hasSevereRedFlag ? undefined : routine.find(step => step.product.category === 'Optional toning shampoo');
  return (
    <section className="mt-10 rounded-2xl border border-foreground/15 bg-blue/30 p-5 md:p-8" data-testid="wash-day-plan">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">Your wash-day plan</p>
      <h2 className="mt-3 font-serif text-3xl text-foreground">Regular wash or treatment wash?</h2>
      <BasedOnAnswers className="mt-3" />
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/80">You don’t need to use everything at every wash. Here’s the difference, using the products in your routine.</p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Choose your wash type">
        <button type="button" aria-pressed={selectedType === 'regular'} onClick={() => setWashType('regular')} className={`rounded-full border border-foreground/20 px-4 py-2 text-sm ${selectedType === 'regular' ? 'bg-foreground text-background' : 'bg-background text-foreground'}`}>Regular wash</button>
        {plan.mask && <button type="button" aria-pressed={selectedType === 'treatment'} onClick={() => setWashType('treatment')} className={`rounded-full border border-foreground/20 px-4 py-2 text-sm ${selectedType === 'treatment' ? 'bg-foreground text-background' : 'bg-background text-foreground'}`}>Treatment wash</button>}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-foreground/70">Choose treatment only when your mask is due. This selector shows the route; it doesn’t track your wash dates or change your treatment timing.</p>
      <div className="mt-5">
        <div hidden={selectedType !== 'regular'} className="rounded-2xl border border-foreground/15 bg-background/60 p-5" data-testid="regular-wash">
          <h3 className="font-serif text-xl">Regular wash — stick with conditioner</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">{plan.mask ? 'Use this route when your mask isn’t due, or when you’re pausing treatments to see how your hair feels.' : 'Keep your wash simple. You do not have a mask step to add here.'}</p>
          {plan.regular.length > 0 && <p className="mt-4 text-sm font-medium leading-relaxed text-foreground">{plan.regular.join(' → ')}</p>}
          <p className="mt-3 text-sm leading-relaxed text-foreground/75">Rinse out your shampoo and conditioner before applying leave-in to your lengths. Leave the mask out on this wash.</p>
        </div>
        <div hidden={selectedType !== 'treatment'} className="rounded-2xl border border-foreground/15 bg-background/60 p-5" data-testid="treatment-wash">
          <h3 className="font-serif text-xl">Treatment wash — use your scheduled mask</h3>
          {plan.mask ? <>
            <p className="mt-2 text-sm leading-relaxed text-foreground/75"><strong className="font-medium text-foreground">{plan.mask.product.name}:</strong> {plan.mask.timing}.</p>
            <p className="mt-4 text-sm font-medium leading-relaxed text-foreground">{plan.treatment.join(' → ')}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">{plan.followsWithConditioner ? 'Hair Building Pak goes after shampoo. Rinse it out, then follow with your regular conditioner. This treatment does not replace conditioner.' : 'Your mask replaces regular conditioner on this wash. Use one or the other, not both.'} Rinse thoroughly before leave-in, and follow the time on your product label.</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">{plan.startsOnFirstWash ? 'Start with the treatment on your first wash, following the step-by-step instructions below.' : 'For your first wash, follow the step-by-step instructions below.'} {plan.everyWash ? 'Your current mask timing is every wash day. After that first wash, each scheduled wash is a treatment wash; use the regular route if you pause the mask.' : 'After your first wash, use the regular-wash route until the next treatment is due.'}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">Don’t add another mask or protein treatment to the same wash. If your hair feels stiff, rough, or worse afterward, pause the treatment rather than repeating it.</p>
          </> : <p className="mt-2 text-sm leading-relaxed text-foreground/75">{hasSevereRedFlag ? 'We’re not adding a mask or intensive treatment while the change you reported needs professional assessment. Keep care gentle and follow that advice first.' : 'No mask is included in your current routine. Follow the regular-wash steps rather than adding a treatment that was not recommended.'}</p>}
        </div>
      </div>
      {toning && <aside className="mt-5 border-t border-foreground/15 pt-5" data-testid="toning-wash">
        <h3 className="font-serif text-xl">Your second shampoo is optional—not another step</h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80"><strong>{toning.product.name}:</strong> {toning.timing}.</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">{toning.instruction}</p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/65">Toning changes color; it doesn’t replace conditioning or repair care. Being blonde is not a reason to use it at every wash.</p>
      </aside>}
      {plan.scrub && <p className="mt-5 text-sm leading-relaxed text-foreground/75"><strong className="font-medium text-foreground">A separate clarifying wash:</strong> {plan.scrub.product.name} — {plan.scrub.timing}. Use it instead of shampoo, followed by your regular conditioner and leave-in. Save the mask for a different wash. You don’t need to fit clarifying and a mask into the same wash.</p>}
      <p className="mt-5 border-t border-foreground/10 pt-4 text-xs leading-relaxed text-foreground/70">Count wash days, not calendar days, when the timing says “every few washes.” Scalp care and styling still follow their own product directions; heat protection stays part of every heat-styling session. Product-label directions take priority over this quiz-based starting plan.</p>
      <GuideFitNote location="wash-plan" />
    </section>
  );
}
