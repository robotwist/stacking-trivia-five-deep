/**
 * Game scoring utilities
 */

const MAIN_LADDER = [10, 20, 40, 80, 160]
const DEEPER_MODE_BONUS = 50

/**
 * Calculate score for a question based on depth
 * @param {number} depth - Current question depth (0-based)
 * @param {boolean} isDeepMode - Whether in deeper mode
 * @returns {number} - Points for this question
 */
export const calculateQuestionScore = (depth, isDeepMode = false) => {
  const baseScore = MAIN_LADDER[depth] || 160
  return isDeepMode ? baseScore + DEEPER_MODE_BONUS : baseScore
}

/**
 * Points for one Deeper Mode question. An authored `bonus` is the score;
 * questions without one use the depth ladder plus the flat deeper-mode bonus.
 * @param {{ bonus?: number }} question
 * @param {number} index - 0-based position in the bonus round
 * @returns {number}
 */
export const pointsForDeeperQuestion = (question, index = 0) => {
  const bonus = Number(question?.bonus)
  if (Number.isFinite(bonus) && bonus > 0) return bonus
  return calculateQuestionScore(index, true)
}

/**
 * Using the four-choices lifeline halves a level's points (10 → 5, 160 → 80).
 * @param {number} points
 * @returns {number}
 */
export const applyChoicesPenalty = (points) => Math.ceil(points / 2)

/**
 * Deeper-mode questions to add into the ceiling.
 * An array is scored question by question. A positive count stands in for
 * that many questions that use the flat deeper-mode formula.
 * @param {Array<{ bonus?: number }>|number|boolean} deeperQuestions
 * @returns {Array<object>}
 */
const deeperQuestionList = (deeperQuestions) => {
  if (Array.isArray(deeperQuestions)) return deeperQuestions
  if (typeof deeperQuestions === 'number' && Number.isFinite(deeperQuestions) && deeperQuestions > 0) {
    return Array.from({ length: deeperQuestions }, () => ({}))
  }
  return []
}

/**
 * Highest score a run can post.
 * The main dive always ceilings at the full five-level ladder (310), including
 * stacks with fewer questions. Pass the bonus questions actually in the round
 * so the ceiling matches what those questions award — not one bonus per main level.
 * @param {number} questionCount - Main questions in the stack (does not shrink the 310 ceiling)
 * @param {Array<{ bonus?: number }>|number} [deeperQuestions] - Bonus round, or a count of formula questions
 * @returns {number}
 */
export const calculateMaxScore = (questionCount = MAIN_LADDER.length, deeperQuestions = []) => {
  // A shorter stack still publishes the five-level ceiling. questionCount stays in the
  // signature because every caller passes the stack length.
  const baseMax = MAIN_LADDER.reduce((sum, points) => sum + points, 0)
  if (questionCount == null) return baseMax
  const deeperMax = deeperQuestionList(deeperQuestions)
    .reduce((sum, question, index) => sum + pointsForDeeperQuestion(question, index), 0)
  return baseMax + deeperMax
}

/**
 * Get score multiplier based on crowd energy (for bar mode)
 * @param {number} crowdEnergy - Energy level (1-5)
 * @returns {number} - Score multiplier
 */
export const getCrowdMultiplier = (crowdEnergy) => {
  const multipliers = {
    1: 0.8,
    2: 0.9,
    3: 1.0,
    4: 1.1,
    5: 1.2
  }
  return multipliers[crowdEnergy] || 1.0
}

/**
 * Format score for display
 * @param {number} score - Raw score
 * @returns {string} - Formatted score string
 */
export const formatScore = (score) => {
  return score.toLocaleString()
}
