interface ScalpSerumSectionProps {
  reportedDensityChange: boolean;
}

export function ScalpSerumSection({ reportedDensityChange }: ScalpSerumSectionProps) {
  return (
    <section className="mt-6 border-t border-foreground/15 pt-6" aria-labelledby="scalp-serum-heading" data-testid="scalp-serum-explanation">
      <h4 id="scalp-serum-heading" className="font-serif text-xl">Scalp care matters. A serum is optional.</h4>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">
        Hair grows from follicles beneath your scalp, so caring for your scalp matters too. Start with gentle washing, avoid products that irritate it, and keep hairstyles from pulling tightly. A serum is an extra you can choose to use, not something everyone needs for hair to grow.
      </p>

      <div className="mt-5 rounded-xl bg-paper-dark p-4">
        <h5 className="text-sm font-medium text-foreground">Why this recommendation is here</h5>
        {reportedDensityChange ? (
          <p className="mt-2 text-sm leading-relaxed text-foreground/80" data-testid="scalp-serum-density-note">
            You selected “Recently more visible” when asked about the scalp showing along your part. That is why we are talking about scalp care here. This serum is a cosmetic product; it does not treat the cause of thinning. If the change is new, ongoing, or sudden, speak with a dermatologist or healthcare professional rather than relying on a serum.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-foreground/80" data-testid="scalp-serum-optional-note">
            We have included this as an option, not because the quiz confirmed thinning. Some people naturally have fewer hairs or more scalp showing; that is different from noticing a recent change. If your scalp feels comfortable and your current routine works for you, you can skip this step.
          </p>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground/80">
        You do not need to buy this serum—or every product listed—to follow the guide. Get comfortable with washing, conditioning, and gentle handling first. A serum does not guarantee new growth or thicker hair, and this suggestion is not a medical diagnosis. If you try it, follow the label, patch test first, and stop if your scalp becomes irritated.
      </p>
    </section>
  );
}
