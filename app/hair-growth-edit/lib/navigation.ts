export type AppView = 'home' | 'quiz' | 'results' | 'progress';

export function resolveProgressReturnView(
  priorView: Exclude<AppView, 'progress'>,
  assessmentComplete: boolean,
): Exclude<AppView, 'progress'> {
  if (priorView !== 'results') return priorView;
  return assessmentComplete ? 'results' : 'quiz';
}
