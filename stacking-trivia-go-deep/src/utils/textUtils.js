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
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-–—/]/g, ' ')
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

    return containsWholePhrase(normalizedUser, normalizedAccepted) ||
      isSubstantialFragment(normalizedUser, normalizedAccepted)
  })
}

const MAX_EXTRA_WORDS = 3

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** "the red vineyard painting" contains "red vineyard"; shotgun lists of guesses do not count. */
const containsWholePhrase = (user, accepted) => {
  const extraWords = user.split(' ').length - accepted.split(' ').length
  if (extraWords < 0 || extraWords > MAX_EXTRA_WORDS) return false
  return new RegExp(`\\b${escapeRegex(accepted)}\\b`).test(user)
}

/** "boch" for "anna boch" is fine; "a" for "arles" is not. */
const isSubstantialFragment = (user, accepted) => {
  if (user.length < 4 || user.length < Math.ceil(accepted.length * 0.6)) return false
  return new RegExp(`\\b${escapeRegex(user)}\\b`).test(accepted)
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
 * Edit distance where swapping two adjacent letters ("aristotel") costs one edit, not two.
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
const levenshteinDistance = (str1, str2) => {
  const rows = str2.length + 1
  const cols = str1.length + 1
  const d = Array.from({ length: rows }, (_, i) => [i, ...new Array(cols - 1).fill(0)])
  for (let j = 0; j < cols; j++) d[0][j] = j

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = str2[i - 1] === str1[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && str2[i - 1] === str1[j - 2] && str2[i - 2] === str1[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }

  return d[rows - 1][cols - 1]
}
