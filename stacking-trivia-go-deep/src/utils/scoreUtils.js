/**
 * Game scoring utilities
 */

/**
 * Calculate score for a question based on depth
 * @param {number} depth - Current question depth (0-based)
 * @param {boolean} isDeepMode - Whether in deeper mode
 * @returns {number} - Points for this question
 */
export const calculateQuestionScore = (depth, isDeepMode = false) => {
  const baseScores = [10, 20, 40, 80, 160]
  const deeperModeBonus = 50
  
  const baseScore = baseScores[depth] || 160
  return isDeepMode ? baseScore + deeperModeBonus : baseScore
}

/**
 * Calculate total possible score for a stack
 * @param {number} questionCount - Number of questions
 * @param {boolean} hasDeepMode - Whether stack has deeper mode
 * @returns {number} - Maximum possible score
 */
export const calculateMaxScore = (questionCount = 5, hasDeepMode = false) => {
  const baseMax = 10 + 20 + 40 + 80 + 160 // 310
  return hasDeepMode ? baseMax + (50 * questionCount) : baseMax
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
