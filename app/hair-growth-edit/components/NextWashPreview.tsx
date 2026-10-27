import type { FirstWashPlan } from '../lib/firstWash';
import { getPreviewStepHeading } from '../lib/previewStepCopy';
import { trackGrowthEvent } from '../lib/conversionAnalytics';

const EXCERPT_LENGTH = 3;

// A small, real excerpt of the customer's own first wash (same getFirstWashPlan output as the paid guide).
export function NextWashPreview({ plan }: { plan: FirstWashPlan }) {
  const excerpt = plan.steps.filter(step => step.title !== 'Start with warm water').slice(0, EXCERPT_LENGTH);
  const keratinInExcerpt = plan.keratin && excerpt.some(step => step.title.includes(plan.keratin!.name));
  return (
    <div className="mt-6 rounded-xl border border-foreground/15 bg-paper/70 px-4 py-4 md:px-5" data-testid="next-wash-preview">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-foreground/60">Your first wash · excerpt</p>
      <h3 className="mt-1 font-serif text-lg text-foreground">A look inside your routine</h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/80">Know what goes first, how to use it, and when to rinse—without piecing together advice from every bottle.</p>
      <ol className="mt-3 space-y-1 text-sm leading-relaxed text-foreground/85">
        {excerpt.map((step, i) => (
          <li key={step.title}><span className="text-foreground/50">{i + 1}.</span> {getPreviewStepHeading(step.title)}</li>
        ))}
      </ol>
      <details className="mt-3 text-sm" onToggle={event => {
        if (event.currentTarget.open) trackGrowthEvent('growth_preview_opened');
      }}>
        <summary className="cursor-pointer text-xs font-medium uppercase tracking-widest text-foreground/70 underline decoration-foreground/25 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground/50">Read these steps</summary>
        <ol className="mt-4 list-decimal space-y-3 pl-5 marker:text-foreground/50">
          {excerpt.map(step => (
            <li key={step.title} className="pl-1">
              <p className="font-medium text-foreground">{getPreviewStepHeading(step.title)}</p>
              {getPreviewStepHeading(step.title) !== step.title && <p className="mt-1 text-xs text-foreground/65">{step.title}</p>}
              <p className="mt-1 leading-relaxed text-foreground/75">{step.detail}</p>
            </li>
          ))}
        </ol>
        {keratinInExcerpt && plan.keratin && (
          <p className="mt-3 text-xs leading-relaxed text-foreground/70"><strong className="font-medium">{plan.keratin.name}:</strong> {plan.keratin.timing}. {plan.keratin.explanation}</p>
        )}
      </details>
    </div>
  );
}
