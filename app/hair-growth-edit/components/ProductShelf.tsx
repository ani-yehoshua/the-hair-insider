import { useMemo } from 'react';
import { ArrowUpRight, Bookmark, BookmarkCheck, Filter, ShoppingBag } from 'lucide-react';
import type { RoutineStep } from '../data/recommendations';
import { groupProductShelf } from '../lib/productShelf';
import { WaterQualitySection } from './WaterQualitySection';
import { ScalpSerumSection } from './ScalpSerumSection';

const WATER_SETUP_REASON = "Water is part of every wash, so it's worth considering your water setup before adding more products to your routine.";
const FILTER_OPTIONAL_NOTE = 'A filter is optional. Check what it actually removes before buying one.';

function getRoutineBenefit(step: RoutineStep): string {
  const { id, category } = step.product;

  if (id === 'jolieFilteredShowerhead') {
    return 'A standard shower filter does not soften hard water. It will not treat hair loss or a scalp condition.';
  }
  if (id === 'energizingSuperactive') {
    return 'This goes on your scalp, not your ends. You can choose to use it, but you do not need a serum for hair to grow.';
  }
  if (id === 'detoxScrub') {
    return 'This helps remove product buildup when your regular shampoo is not enough. Use it occasionally, not at every wash.';
  }
  if (id === 'bioIonicDryer' || id === 'bioIonicFlatIron' || id === 'bioIonicCurlingIron') {
    return 'This is an option for the style you usually wear. Keep the heat as low as you can and avoid going over the same section repeatedly.';
  }

  const normalizedCategory = category.toLowerCase();
  if (normalizedCategory.includes('shampoo') || normalizedCategory.includes('cleanse')) {
    return 'This helps wash away scalp oil and product residue. Your answers helped us choose how light or moisturizing a shampoo to suggest.';
  }
  if (normalizedCategory.includes('leave-in')) {
    return 'This stays in after washing to help keep your hair soft and easier to detangle and style.';
  }
  if (normalizedCategory.includes('conditioner')) {
    return 'This softens your hair and helps tangles slide apart, so you do not have to pull as hard when detangling.';
  }
  if (normalizedCategory.includes('mask') || normalizedCategory.includes('keratin') || normalizedCategory.includes('treatment')) {
    return 'This is an occasional treatment, not an extra step for every wash. Check how often to use it below, and avoid using several treatments that do the same thing.';
  }
  if (normalizedCategory.includes('heat protectant')) {
    return 'Use this before blow-drying or hot tools to help limit heat damage. You still need to keep the temperature down and avoid repeated passes.';
  }
  if (normalizedCategory.includes('styling') || normalizedCategory.includes('curl')) {
    return 'This helps you create your usual style without adding several styling products that do the same job.';
  }
  if (normalizedCategory.includes('oil')) {
    return 'A small amount on your ends can help them feel smoother. Start with less, especially if your hair gets weighed down easily.';
  }

  return `This is the ${normalizedCategory} step. Check the directions below before adding it to your routine.`;
}

interface ProductShelfProps {
  paidRoutine: RoutineStep[];
  savedProducts: string[];
  showSavedOnly: boolean;
  onToggleSaved: () => void;
  onToggleSave: (id: string) => void;
  reportedDensityChange: boolean;
}

export function ProductShelf({
  paidRoutine,
  savedProducts,
  showSavedOnly,
  onToggleSaved,
  onToggleSave,
  reportedDensityChange,
}: ProductShelfProps) {
  const groups = useMemo(() => {
    const filtered = showSavedOnly
      ? paidRoutine.filter(step => savedProducts.includes(step.product.id))
      : paidRoutine;
    return groupProductShelf(filtered);
  }, [paidRoutine, savedProducts, showSavedOnly]);

  return (
    <section className="mt-24 border-t border-foreground/15 pt-16" data-testid="curated-shelf" aria-labelledby="curated-shelf-heading">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
            <ShoppingBag size={14} /> Your product shelf
          </span>
          <h2 id="curated-shelf-heading" className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
            Your curated shelf
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/75 md:text-base">
            Everything THI recommends for your current hair
          </p>
        </div>
        <button
          onClick={onToggleSaved}
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
            showSavedOnly
              ? 'border-foreground bg-foreground text-background'
              : 'border-foreground/20 text-foreground hover:bg-foreground/5'
          }`}
          data-testid="filter-saved-products"
          aria-pressed={showSavedOnly}
        >
          <Filter size={14} />
          {showSavedOnly ? 'Show Full Shelf' : `Saved Products (${savedProducts.length})`}
        </button>
      </div>

      <p className="mt-8 max-w-3xl rounded-2xl bg-sage/25 p-5 text-sm leading-relaxed text-foreground/85 md:p-6" data-testid="shelf-intro">
        You don't need every product at once. Your Growth Edit is your personalized product shelf—not a checklist. Start with what solves your biggest need, then come back to the list whenever you're ready for your next product.
      </p>

      {groups.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-foreground/20 px-6 py-16 text-center text-foreground/60" data-testid="shelf-empty">
          {showSavedOnly ? "You haven't saved any products yet. Use the bookmark on a product to keep it here." : 'No products to show.'}
        </div>
      )}

      <div className="mt-14 space-y-16">
        {groups.map(group => (
          <div key={group.id} data-testid={`shelf-group-${group.id}`}>
            <div className="border-b border-foreground/15 pb-4">
              <h3 className="font-serif text-2xl text-foreground md:text-3xl">
                {group.id === 'water' ? 'Your water setup, optional' : group.title}
              </h3>
              <p className="mt-1 text-sm text-foreground/65">{group.description}</p>
            </div>
            <div className="mt-8 space-y-8">
              {group.steps.map(step => {
                const isSaved = savedProducts.includes(step.product.id);
                const id = step.product.id;
                return (
                  <div
                    key={id}
                    className="group flex flex-col gap-6 rounded-3xl border border-foreground/15 bg-paper p-5 md:flex-row md:gap-8 md:p-8"
                    data-testid={`routine-step-${id}`}
                  >
                    <div className="relative flex w-full shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-white/70 p-6 mix-blend-multiply md:w-64">
                      <button
                        onClick={() => onToggleSave(id)}
                        className="absolute right-4 top-4 z-10 p-2 text-foreground/40 transition-colors hover:text-foreground"
                        title={isSaved ? 'Remove from saved' : 'Save product'}
                        aria-label={isSaved ? 'Remove from saved' : 'Save product'}
                        data-testid={`save-product-${id}`}
                        aria-pressed={isSaved}
                      >
                        {isSaved ? <BookmarkCheck className="text-foreground" size={24} /> : <Bookmark size={24} />}
                      </button>
                      <img
                        src={step.product.image}
                        alt={`${step.product.name} by ${step.product.brand}`}
                        className="h-44 w-44 object-contain transition-transform duration-500 group-hover:scale-105 md:h-48 md:w-48"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-foreground/50">
                          {step.product.category}{id === 'energizingSuperactive' ? ' / Optional' : ''}
                        </span>
                        <span className="inline-block w-fit rounded-full bg-sage/30 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-widest text-foreground/80">
                          {step.timing}
                        </span>
                      </div>

                      <h4 className="font-serif text-2xl leading-tight text-foreground">{step.product.name}</h4>
                      <p className="mt-1 text-xs font-medium text-foreground/60">{step.product.brand}</p>

                      <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <p className="text-sm leading-relaxed text-foreground/80">
                            <strong className="font-medium text-foreground">Why it's on your shelf:</strong>{' '}
                            {id === 'jolieFilteredShowerhead'
                              ? WATER_SETUP_REASON
                              : id === 'energizingSuperactive'
                                ? reportedDensityChange
                                  ? 'You mentioned seeing more scalp along your part. This is an optional way to add scalp care, not a treatment for the reason behind that change.'
                                  : 'This is an optional scalp-care step. Its inclusion does not mean you have thinning hair or need a hair-growth treatment.'
                                : step.product.reason}
                          </p>
                          {id === 'jolieFilteredShowerhead' && (
                            <p className="text-sm leading-relaxed text-foreground/80">{FILTER_OPTIONAL_NOTE}</p>
                          )}
                          <p className="text-sm leading-relaxed text-foreground/80">
                            <strong className="font-medium text-foreground">How to use:</strong> {step.instruction}
                          </p>
                        </div>
                        <div className="rounded-xl bg-paper-dark p-5">
                          <h5 className="font-serif text-lg">Why it may fit your routine</h5>
                          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{getRoutineBenefit(step)}</p>
                        </div>
                      </div>

                      {id === 'jolieFilteredShowerhead' && <WaterQualitySection />}
                      {id === 'energizingSuperactive' && <ScalpSerumSection reportedDensityChange={reportedDensityChange} />}

                      <div className="mt-auto pt-8">
                        <a
                          href={step.product.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-widest text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                        >
                          View on Retailer <ArrowUpRight size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
