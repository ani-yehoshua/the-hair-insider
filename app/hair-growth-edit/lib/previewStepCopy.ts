// Benefit-first preview headings; the original product title and instructions remain visible on expansion.
export function getPreviewStepHeading(title: string): string {
  if (title.startsWith('Cleanse with ')) return 'A clean scalp, without scrubbing your ends.';
  if (title.startsWith('First use: ')) return 'Care for fragile lengths, with a clear pause before the next treatment.';
  if (title.startsWith('Treat your lengths with ')) return 'Extra care for your lengths, with timing made clear.';
  if (title.startsWith('Condition with ')) return 'Softer-feeling lengths that are easier to detangle.';
  if (title === 'Remove excess water without rubbing') return 'Less rubbing, less friction on wet lengths.';
  if (title.startsWith('Apply ') && title.endsWith(' to your scalp')) return 'Scalp care where it belongs, without extra layers on your lengths.';
  if (title.startsWith('Apply ')) return 'More manageable lengths after the rinse.';
  if (title.startsWith('Protect before heat with ')) return 'Less avoidable heat stress when you style.';
  if (title.startsWith('Style with ')) return 'Support for your usual style, without extra product layers.';
  if (title === 'Dry gently, then finish' || title === 'Let your hair dry, then finish') return 'A gentler finish, without unnecessary layers.';
  return title;
}
