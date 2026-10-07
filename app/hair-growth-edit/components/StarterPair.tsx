import { ArrowUpRight } from 'lucide-react';
import type { RoutineStep } from '../data/recommendations';
import { getFirstPurchaseReason } from '../lib/guideSummary';

export function StarterPair({ steps }: { steps: RoutineStep[] }) {
  if (steps.length !== 2) return null;

  return (
    <section className="mt-20 rounded-3xl border border-foreground/15 bg-sage/20 p-6 md:p-8" aria-labelledby="starter-pair-heading" data-testid="starter-pair">
      <h2 id="starter-pair-heading" className="font-serif text-3xl text-foreground">Starter Pair</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/75">
        These are the two product suggestions from your Results. Start with one, then add the other if you need it. If you already have something that does the same job, use that first.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {steps.map(({ product }) => {
          const isSerum = product.id === 'energizingSuperactive';
          const reason = getFirstPurchaseReason(product);
          return (
            <div key={product.id} className="flex items-start gap-4 rounded-2xl bg-paper p-4 md:p-5" data-testid={`starter-pair-${product.id}`}>
              <img src={product.image} alt={`${product.name} by ${product.brand}`} loading="lazy" className="h-20 w-16 shrink-0 object-contain mix-blend-multiply" />
              <div className="min-w-0">
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/55">
                  {isSerum ? 'Optional scalp serum' : product.category}
                </p>
                <h3 className="mt-2 font-serif text-xl leading-tight">{product.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                  {isSerum
                    ? 'Scalp care matters, but a serum is not required for hair to grow and does not treat the cause of thinning.'
                    : reason ? `${reason.charAt(0).toUpperCase()}${reason.slice(1)}.` : product.reason}
                </p>
                <a href={product.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
                  View on retailer <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
