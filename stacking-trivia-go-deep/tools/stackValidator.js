/**
 * Stack validation gates for CI and stackLint CLI.
 */

import { normalizeStack, normalizeQuestion, normalizeAnswerText } from '../src/utils/normalizeStack.js'
import { StackDepthAnalyzer } from './depthAnalyzer.js'

const depthAnalyzer = new StackDepthAnalyzer()

const BREADTH_WARNINGS = [
  'different', 'another', 'also', 'switching to', 'moving on',
  'in contrast', 'meanwhile', 'separately', 'unrelated',
]

const MAX_ANSWER_LENGTH = 50
const MIN_ACCEPTED_ANSWERS = 3
const REQUIRED_QUESTION_COUNT = 5
const MIN_LEAK_TOKEN_LENGTH = 4

/**
 * Promo copy shown before play — must not contain answers.
 * @returns {string}
 */
const getPromoText = (stack) => {
  const parts = [
    stack.description,
    stack.imageHint,
    stack.deeperMode?.description,
    stack.deeperMode?.title,
  ]
  return parts.filter(Boolean).join(' ').toLowerCase()
}

/**
 * @param {string} promoText
 * @param {string} answer
 * @param {number} questionNum
 * @param {string} field
 * @param {string[]} errors
 */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const promoContainsAnswer = (promoText, normalizedAnswer) => {
  if (normalizedAnswer.length < MIN_LEAK_TOKEN_LENGTH) return false
  // Multi-word answers: substring match on normalized promo
  if (normalizedAnswer.includes(' ')) {
    return promoText.includes(normalizedAnswer)
  }
  // Single tokens: whole-word match to avoid partial false positives
  const re = new RegExp(`\\b${escapeRegex(normalizedAnswer)}\\b`, 'i')
  return re.test(promoText)
}

const checkPromoLeakage = (promoText, answer, questionNum, field, errors) => {
  const normalized = normalizeAnswerText(answer)
  if (!promoContainsAnswer(promoText, normalized)) return

  errors.push(`Q${questionNum}: answer "${answer}" appears in ${field}`)
}

/**
 * @param {object[]} questions
 * @param {object} opts
 */
const validateQuestions = (questions, opts) => {
  const {
    errors,
    warnings,
    promoText,
    label,
    requireFive = false,
    checkNarrative = false,
  } = opts

  if (!Array.isArray(questions) || questions.length === 0) return

  if (requireFive && questions.length !== REQUIRED_QUESTION_COUNT) {
    errors.push(`${label}: expected ${REQUIRED_QUESTION_COUNT} questions, got ${questions.length}`)
  }

  if (requireFive) {
    const levels = questions.map((q) => q.level)
    const expectedLevels = [1, 2, 3, 4, 5]
    if (JSON.stringify(levels) !== JSON.stringify(expectedLevels)) {
      errors.push(`${label}: levels must be 1–5 in order, got [${levels.join(', ')}]`)
    }
  }

  questions.forEach((q, index) => {
    const n = index + 1
    const tag = `${label} Q${n}`
    const questionText = (q.question || q.q || '').toLowerCase()
    const answer = q.answer || ''

    if (!questionText.trim()) errors.push(`${tag}: missing question text`)
    if (!answer.trim()) errors.push(`${tag}: missing canonical answer`)

    const accepted = q.acceptedAnswers || []

    if (answer.length > MAX_ANSWER_LENGTH) {
      errors.push(`${tag}: answer too long (${answer.length} chars, max ${MAX_ANSWER_LENGTH})`)
    }

    if (accepted.length < MIN_ACCEPTED_ANSWERS) {
      errors.push(`${tag}: need at least ${MIN_ACCEPTED_ANSWERS} acceptedAnswers, got ${accepted.length}`)
    }

    const answerLower = normalizeAnswerText(answer)
    if (answerLower.length > 2 && questionText.includes(answerLower)) {
      errors.push(`${tag}: answer "${answer}" appears in question text`)
    }

    ;[answer, ...accepted].forEach((a) => {
      if (!a) return
      checkPromoLeakage(promoText, a, n, `${label} description or imageHint`, errors)
    })

    BREADTH_WARNINGS.forEach((phrase) => {
      if (questionText.includes(phrase)) {
        warnings.push(`${tag}: breadth indicator "${phrase}"`)
      }
    })

    if (checkNarrative && index > 0) {
      const prev = questions[index - 1]
      const prevAnswer = normalizeAnswerText(prev.answer)
      const tokens = prevAnswer.split(/\s+/).filter((w) => w.length > 3)
      const hasLink = tokens.some((t) => questionText.includes(t))
      if (!hasLink && tokens.length > 0) {
        warnings.push(`${tag}: may not reference prior answer "${prev.answer}"`)
      }
    }
  })
}

/**
 * @param {object} stack - normalized stack
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateStack(stack) {
  const errors = []
  const warnings = []

  if (!stack?.title) errors.push('Missing title')
  if (!Array.isArray(stack.questions)) {
    errors.push('Missing questions array')
    return { valid: false, errors, warnings }
  }

  const promoText = getPromoText(stack)

  validateQuestions(stack.questions, {
    errors,
    warnings,
    promoText,
    label: 'Main',
    requireFive: true,
    checkNarrative: true,
  })

  const deeperQs = stack.deeperMode?.questions
  if (Array.isArray(deeperQs) && deeperQs.length > 0) {
    const normalizedDeeper = deeperQs.map((q, i) => normalizeQuestion(q, i))
    validateQuestions(normalizedDeeper, {
      errors,
      warnings,
      promoText,
      label: 'DeeperMode',
      requireFive: false,
      checkNarrative: false,
    })
  }

  // Depth quality heuristics (warnings only)
  try {
    const depthAnalysis = depthAnalyzer.analyzeStack(stack)
    if (depthAnalysis.depthScore < 1.5) {
      warnings.push('Stack depth score is low—questions may feel disconnected')
    }
    if (depthAnalysis.breadthWarnings > 0) {
      warnings.push(`${depthAnalysis.breadthWarnings} question(s) have breadth-warning phrases`)
    }
    depthAnalysis.recommendations
      .filter((r) => r.type === 'CRITICAL')
      .forEach((r) => warnings.push(r.message))
  } catch {
    // ignore analyzer errors for malformed stacks
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * @param {object} rawStack
 */
export function validateRawStack(rawStack) {
  return validateStack(normalizeStack(rawStack))
}

export default validateStack
