/**
 * New assessments must answer every question. An entitled buyer with an older
 * saved assessment can still open their routine without the new repair-mask
 * follow-up; scoring treats that missing response as unknown. All original
 * questions and the separate paid-access checks remain required.
 */
export function hasCompleteRoutineAnswers(
  answers: Record<string, number>,
  questionIds: readonly string[],
  hasPaidAccess = false,
): boolean {
  return questionIds.every(id =>
    answers[id] !== undefined || (hasPaidAccess && id === 'repairTreatmentResponse'),
  );
}
