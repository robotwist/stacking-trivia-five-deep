/**
 * Normalize stack JSON to the gold-standard schema.
 * Converts legacy q/a format and fills defaults.
 */

const LEVEL_LABELS = {
  1: 'Recognition',
  2: 'Context',
  3: 'Specific',
  4: 'Insider',
  5: 'Expert',
}

const NUMBER_WORDS = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
  6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  100: 'hundred', 400: 'four hundred', 1000: 'thousand',
}

/** @param {string} text */
export const normalizeAnswerText = (text) => {
  if (!text) return ''
  return String(text).toLowerCase().trim()
}

/**
 * Build default acceptedAnswers from canonical answer.
 * @param {string} answer
 * @param {string[]} existing
 */
export const expandAcceptedAnswers = (answer, existing = []) => {
  const canonical = String(answer || '').trim()
  if (!canonical) return existing

  const variants = new Set(
    [canonical, ...existing]
      .map((a) => String(a).trim())
      .filter(Boolean)
  )

  const lower = canonical.toLowerCase()
  variants.add(lower)

  // Strip leading articles for matching
  const withoutArticle = lower.replace(/^(the|a|an)\s+/, '')
  if (withoutArticle !== lower) variants.add(withoutArticle)

  // Numeric variants
  const numMatch = canonical.match(/^(\d+)\s*(.*)$/i)
  if (numMatch) {
    const num = parseInt(numMatch[1], 10)
    const suffix = numMatch[2] || ''
    variants.add(String(num))
    if (NUMBER_WORDS[num]) {
      variants.add(NUMBER_WORDS[num])
      if (suffix) variants.add(`${NUMBER_WORDS[num]} ${suffix}`.trim())
    }
  }

  const wordNum = Object.entries(NUMBER_WORDS).find(([, w]) => lower.startsWith(w))
  if (wordNum) {
    variants.add(wordNum[0])
  }

  // Guarantee enough variants for typo-tolerant matching
  if (variants.size < 3) {
    variants.add(lower.replace(/\s+/g, ''))
    variants.add(lower.replace(/-/g, ' '))
    const words = lower.split(' ')
    if (words.length > 1) variants.add(words[words.length - 1])
  }

  return [...variants]
}

/**
 * @param {object} rawQuestion
 * @param {number} index
 */
export const normalizeQuestion = (rawQuestion, index) => {
  const level = rawQuestion.level ?? index + 1
  const question = rawQuestion.question || rawQuestion.q || ''
  const legacyAccepted = Array.isArray(rawQuestion.acceptedAnswers)
    ? rawQuestion.acceptedAnswers
    : Array.isArray(rawQuestion.a)
      ? rawQuestion.a
      : []
  const rawAnswer = rawQuestion.answer ?? (Array.isArray(rawQuestion.a) ? rawQuestion.a[0] : rawQuestion.a)
  const answer = (rawAnswer && String(rawAnswer).trim()) || legacyAccepted[0] || ''

  const acceptedAnswers = expandAcceptedAnswers(answer, legacyAccepted)

  const normalized = {
    level,
    question,
    answer: String(answer).trim(),
    acceptedAnswers,
  }

  if (rawQuestion.hint) normalized.hint = rawQuestion.hint
  if (rawQuestion.explanation) normalized.explanation = rawQuestion.explanation
  if (rawQuestion.id) normalized.id = rawQuestion.id
  if (rawQuestion.points) normalized.points = rawQuestion.points
  if (rawQuestion.sources) normalized.sources = rawQuestion.sources
  if (rawQuestion.deeperContext) normalized.deeperContext = rawQuestion.deeperContext

  return normalized
}

/**
 * @param {object} rawStack
 * @returns {object}
 */
export const normalizeStack = (rawStack) => {
  if (!rawStack || !Array.isArray(rawStack.questions)) {
    return rawStack
  }

  const questions = rawStack.questions.map((q, i) => normalizeQuestion(q, i))

  const stack = {
    title: rawStack.title || rawStack.name || 'Untitled Stack',
    description: rawStack.description || '',
    questions,
  }

  if (rawStack.image) stack.image = rawStack.image
  if (rawStack.imageHint) stack.imageHint = rawStack.imageHint
  if (rawStack.photoFirst) stack.photoFirst = rawStack.photoFirst
  if (rawStack.category) stack.category = rawStack.category
  if (rawStack.deeperMode) stack.deeperMode = rawStack.deeperMode

  return stack
}

/** @param {number} level */
export const getLevelLabel = (level) => LEVEL_LABELS[level] || `Level ${level}`

export default normalizeStack
