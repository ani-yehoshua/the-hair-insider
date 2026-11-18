/** Results-page copy only. Do not reuse this to change checkout or a paid guide. */
export const RESULTS_ROUTINE_MAP = {
  heading: 'Your 30-Day Length Retention Plan',
  subline: 'Built from your answers. Inside:',
  benefits: [
    'A list of product recommendations based on your quiz answers',
    'What to skip, and which combinations to avoid',
    'Exactly what your first wash should look like',
    'How to tell if your routine is working for you',
    "What to stop when something doesn't feel right",
    'The progress you should feel over the next 30 days',
  ],
  cta: 'Get my 30-day plan',
  sections: [
    'Your 30-day calendar',
    'Your personal product shelf',
    'Your progress log',
  ],
} as const;

/** Keep the answer-to-plan explanation free without revealing paid product names or timing. */
export function getFreeResultsExplanation(note: string): string {
  if (note.startsWith('You reported hair feeling hard, rough, or strawlike after a protein or repair treatment,')) {
    return 'You reported hair feeling hard, rough, or strawlike after a protein or repair treatment, so the routine avoids adding another strength treatment for now.';
  }
  if (note.startsWith('You reported stronger, bouncier hair after a protein or keratin treatment,')) {
    return 'You reported stronger, bouncier hair after a protein or keratin treatment, so your response helps shape the strength care in your routine. We also considered what you shared about richer repair masks.';
  }
  return note;
}
