export type AppView = 'home' | 'quiz' | 'results' | 'guide';

export function resolveGuideReturnView(
  priorView: Exclude<AppView, 'guide'>,
  assessmentComplete: boolean,
): Exclude<AppView, 'guide'> {
  if (priorView !== 'results') return priorView;
  return assessmentComplete ? 'results' : 'quiz';
}
