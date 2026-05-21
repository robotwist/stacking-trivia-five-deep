/**
 * Text processing utilities for answer matching
 */

const ARTICLES = /^(the|a|an)\s+/

const NUMBER_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
}

const WORD_TO_NUMBER = Object.fromEntries(
  Object.entries(NUMBER_WORDS).map(([w, n]) => [w, String(n)])
)

/**
 * Normalize text for answer comparison
 * @param {string} text
 * @returns {string}
 */
export const normalizeAnswer = (text) => {
  if (!text) return ''
  let normalized = String(text).toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  normalized = normalized.replace(ARTICLES, '')

  // Compound number phrases first (e.g. "four hundred" → "400")
  normalized = normalized
    .replace(/\bfour hundred\b/g, '400')
    .replace(/\bthree hundred\b/g, '300')
    .replace(/\btwo hundred\b/g, '200')
    .replace(/\bfive hundred\b/g, '500')

  // Single number words
  Object.entries(WORD_TO_NUMBER).forEach(([word, digit]) => {
    const re = new RegExp(`\\b${word}\\b`, 'g')
    normalized = normalized.replace(re, digit)
  })

  return normalized.trim()
}

/**
 * Similarity threshold by answer length
 * @param {number} len
 */
const getSimilarityThreshold = (len) => {
  if (len <= 6) return 1.0
  if (len <= 15) return 0.85
  return 0.75
}

/**
 * Check if user answer matches any accepted answer
 * @param {string} userAnswer
 * @param {Array<string>} acceptedAnswers
 * @returns {boolean}
 */
export const checkAnswerMatch = (userAnswer, acceptedAnswers) => {
  if (!userAnswer || !acceptedAnswers?.length) return false

  const normalizedUser = normalizeAnswer(userAnswer)
  if (!normalizedUser) return false

  return acceptedAnswers.some((accepted) => {
    const normalizedAccepted = normalizeAnswer(accepted)
    if (!normalizedAccepted) return false

    if (normalizedUser === normalizedAccepted) return true

    const threshold = getSimilarityThreshold(normalizedAccepted.length)
    if (threshold < 1) {
      const similarity = calculateSimilarity(normalizedUser, normalizedAccepted)
      if (similarity >= threshold) return true
    }

    // Short answers: allow substring only when very short
    if (normalizedAccepted.length <= 8) {
      return normalizedUser.includes(normalizedAccepted) ||
        normalizedAccepted.includes(normalizedUser)
    }

    return false
  })
}

/**
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
export const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
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
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}
