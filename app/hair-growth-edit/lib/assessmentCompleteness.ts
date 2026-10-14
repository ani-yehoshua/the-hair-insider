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
    return questionIds.every(
        (id) =>
            answers[id] !== undefined ||
            (hasPaidAccess && id === "repairTreatmentResponse"),
    );
}

/**
 * Index of the first question a returning visitor hasn't answered (for example
 * the follow-up added after they first took the assessment), or -1 when every
 * required question is answered. Lets them resume at that question with their
 * earlier answers prefilled instead of starting over.
 */
export function firstMissingQuestionIndex(
    answers: Record<string, number>,
    questionIds: readonly string[],
    hasPaidAccess = false,
): number {
    return questionIds.findIndex(
        (id) =>
            answers[id] === undefined &&
            !(hasPaidAccess && id === "repairTreatmentResponse"),
    );
}
