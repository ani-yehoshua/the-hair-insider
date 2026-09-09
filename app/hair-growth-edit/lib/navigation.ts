export type AppView = 'home' | 'quiz' | 'auth' | 'results' | 'progress';

export function canViewResults(
  answers: Record<string, number>,
  requiredQuestionIds: string[],
  signedIn: boolean,
): boolean {
  return signedIn && requiredQuestionIds.every(questionId => answers[questionId] !== undefined);
}

export function resolveProgressReturnView(
  priorView: Exclude<AppView, 'progress'>,
  assessmentComplete: boolean,
  resultsAllowed: boolean,
): Exclude<AppView, 'progress'> {
  if (priorView !== 'results') return priorView;
  if (resultsAllowed) return 'results';
  return assessmentComplete ? 'auth' : 'quiz';
}
