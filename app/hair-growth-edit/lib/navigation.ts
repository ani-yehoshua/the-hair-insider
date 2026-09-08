export type AppView = 'home' | 'quiz' | 'email' | 'results' | 'progress';

export function canViewResults(
  answers: Record<string, number>,
  requiredQuestionIds: string[],
  emailUnlocked: boolean,
): boolean {
  return emailUnlocked && requiredQuestionIds.every(questionId => answers[questionId] !== undefined);
}

export function resolveProgressReturnView(
  priorView: Exclude<AppView, 'progress'>,
  assessmentComplete: boolean,
  resultsAllowed: boolean,
): Exclude<AppView, 'progress'> {
  if (priorView !== 'results') return priorView;
  if (resultsAllowed) return 'results';
  return assessmentComplete ? 'email' : 'quiz';
}