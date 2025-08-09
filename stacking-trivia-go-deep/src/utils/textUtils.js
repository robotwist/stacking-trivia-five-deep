/**
 * Text processing utilities for answer matching
 */

/**
 * Normalize text for answer comparison
 * @param {string} text - The text to normalize
 * @returns {string} - Normalized text
 */
export const normalizeAnswer = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Check if user answer matches any accepted answer
 * @param {string} userAnswer - The user's input
 * @param {Array<string>} acceptedAnswers - Array of accepted answers
 * @returns {boolean} - Whether the answer is correct
 */
export const checkAnswerMatch = (userAnswer, acceptedAnswers) => {
  if (!userAnswer || !acceptedAnswers) return false
  
  const normalizedUser = normalizeAnswer(userAnswer)
  
  return acceptedAnswers.some(accepted => {
    const normalizedAccepted = normalizeAnswer(accepted)
    
    // Exact match
    if (normalizedUser === normalizedAccepted) return true
    
    // Partial match for longer answers (75% threshold)
    if (normalizedAccepted.length > 10) {
      const similarity = calculateSimilarity(normalizedUser, normalizedAccepted)
      return similarity >= 0.75
    }
    
    // Contains match for short answers
    if (normalizedAccepted.length <= 10) {
      return normalizedUser.includes(normalizedAccepted) || 
             normalizedAccepted.includes(normalizedUser)
    }
    
    return false
  })
}

/**
 * Calculate string similarity using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity ratio (0-1)
 */
export const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}
