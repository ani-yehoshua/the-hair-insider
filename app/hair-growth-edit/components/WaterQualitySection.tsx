export function WaterQualitySection() {
  return (
    <section className="mt-6 border-t border-foreground/15 pt-6" aria-labelledby="water-quality-heading" data-testid="water-quality-section">
      <h4 id="water-quality-heading" className="font-serif text-xl">How water can affect your hair</h4>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">
        Hard-water minerals can leave hair feeling coated, dull, or harder to detangle. Chlorine may also contribute to a dry feel. Water can be part of the picture, but those signs alone do not mean it is the cause.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">
        A shower filter is optional. Some reduce chlorine, but a standard shower filter does not soften hard water. Check what the model removes before buying—you do not need one to follow this guide.
      </p>
    </section>
  );
}
