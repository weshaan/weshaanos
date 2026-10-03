/** Answers file is ordered by frequency (most common first). */
const COMMON_ANSWER_CAP = 900

export function wordleAnswerPool(answers: readonly string[]): readonly string[] {
  if (answers.length <= COMMON_ANSWER_CAP) return answers
  return answers.slice(0, COMMON_ANSWER_CAP)
}
