import { ArrowUpRight } from 'lucide-react';
import type { MapContext } from '../../lib/routineMapTypes';
import { getProductGuidance } from '../../lib/productGuidance';
import { orderShelf } from '../../lib/shelfPersonalization';

export function ShelfView({ context }: { context: MapContext }) {
  const steps = orderShelf(context.routine);
  return (
    <section aria-labelledby="rm-shelf-h" data-testid="routine-map-shelf">
      <p className="rm-kicker">What you’ll reach for</p>
      <h2 id="rm-shelf-h" className="rm-serif mt-2 text-3xl md:text-4xl">My shelf</h2>

      <div className="rm-panel-sage mt-8 p-6 md:p-8" data-testid="start-with-what-you-own">
        <h3 className="rm-serif text-2xl">Start with what you own</h3>
        <div className="rm-body mt-3 space-y-3">
          <p>This isn’t a shopping cart. If a shampoo, conditioner or leave-in you already have suits your hair, keep using it in that role—an equivalent product in the same step, not a duplicate alongside it.</p>
          <p>Follow each label’s directions. We can’t promise that ingredients we haven’t seen will agree with your hair or scalp, so introduce anything new one at a time.</p>
          <p>{context.hasSevereRedFlag ? 'Keep to the gentle roles shown here. No scalp serum, exfoliating scrub or repair mask is part of this interim plan. Ask your professional before introducing scalp actives, and let their advice override this shelf.' : 'Skip a second mask or a second leave-in if you already have one doing that job, and never stack treatments in the same wash.'}</p>
        </div>
      </div>

      <div className="mt-12 space-y-8">
        {steps.map((step, index) => {
          const g = getProductGuidance(step, context);
          const p = step.product;
          return (
            <div key={p.id}>
            {g.optional && (index === 0 || !getProductGuidance(steps[index - 1], context).optional) &&
              <h3 className="rm-kicker mb-5">Optional extras</h3>}
            <article className="rm-panel overflow-hidden" data-testid={`map-shelf-${p.id}`}>
              <div className="grid md:grid-cols-[15rem_1fr]">
                <div className="flex items-center justify-center bg-[hsl(38_34%_96%)] p-6">
                  <img src={p.image} alt={`${p.name} by ${p.brand}`} className="h-40 w-40 object-contain mix-blend-multiply" loading="lazy" />
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rm-kicker">{p.category}</span>
                    {g.optional && <span className="rounded-full border border-foreground/30 px-2.5 py-0.5 text-[0.6rem] uppercase tracking-[0.16em]">Optional — not required to buy</span>}
                  </div>
                  <h3 className="rm-serif mt-2 text-2xl leading-tight">{p.name}</h3>
                  <p className="text-xs text-foreground/60">{p.brand}</p>
                  <p className="rm-kicker mt-4">{g.general ? 'General guidance' : 'Based on your answers'}</p>
                  <p className="rm-body mt-1">{g.why}</p>
                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div><dt className="text-sm font-medium">Where it sits</dt><dd className="rm-small">{g.position}</dd></div>
                    <div><dt className="text-sm font-medium">When and how</dt><dd className="rm-small">{g.optional ? 'Optional. ' : ''}{step.timing}. {p.id === 'jolieFilteredShowerhead' ? 'If you choose a filter, install and replace it according to its label. It is not required before beginning this map.' : step.instruction}</dd></div>
                    <div><dt className="text-sm font-medium">Signs it’s working</dt><dd className="rm-small">{g.working}</dd></div>
                    <div><dt className="text-sm font-medium">By when</dt><dd className="rm-small">{g.byWhen}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-sm font-medium">If it isn’t</dt><dd className="rm-small">{g.ifNot}</dd></div>
                  </dl>
                  <a href={p.link} target="_blank" rel="noreferrer" className="rm-link mt-6 inline-flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.18em]">
                    View on retailer <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
