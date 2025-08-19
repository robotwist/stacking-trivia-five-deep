import { shuffleArray } from './arrayUtils'

const normalize = (value) => (value || '').toString().trim()

const getPrimaryAnswer = (question) => {
  if (Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.length > 0) {
    return normalize(question.acceptedAnswers[0])
  }
  if (Array.isArray(question.a) && question.a.length > 0) {
    return normalize(question.a[0])
  }
  return normalize(question.answer)
}

const collectCandidateDistractors = (stackData, excludeIndex, includeDeeper = true) => {
  const candidates = []
  const pushIfValid = (ans) => {
    const v = normalize(ans)
    if (v) candidates.push(v)
  }
  ;(stackData.questions || []).forEach((q, idx) => {
    if (idx === excludeIndex) return
    if (Array.isArray(q.acceptedAnswers)) q.acceptedAnswers.forEach(pushIfValid)
    else if (Array.isArray(q.a)) q.a.forEach(pushIfValid)
    else pushIfValid(q.answer)
  })
  if (includeDeeper && stackData.deeperMode && Array.isArray(stackData.deeperMode.questions)) {
    stackData.deeperMode.questions.forEach((q) => {
      if (Array.isArray(q.acceptedAnswers)) q.acceptedAnswers.forEach(pushIfValid)
      else if (Array.isArray(q.a)) q.a.forEach(pushIfValid)
      else pushIfValid(q.answer)
    })
  }
  return candidates
}

const uniqueCaseInsensitive = (values) => {
  const seen = new Set()
  const out = []
  for (const v of values) {
    const k = v.toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      out.push(v)
    }
  }
  return out
}

const generateNumericDistractors = (correct, count) => {
  const num = Number(correct)
  if (Number.isNaN(num)) return []
  const out = new Set()
  let delta = 1
  while (out.size < count) {
    out.add(String(num + delta))
    if (out.size >= count) break
    out.add(String(num - delta))
    delta += 1
  }
  return Array.from(out)
}

export const generateMultipleChoiceOptions = (stackData, questionIndex, numOptions = 4) => {
  const question = stackData.questions?.[questionIndex]
  if (!question) return []
  const correct = getPrimaryAnswer(question)
  if (!correct) return []

  // Start with provided options if present
  if (Array.isArray(question.multiple_choice_options) && question.multiple_choice_options.length >= numOptions) {
    const options = uniqueCaseInsensitive(question.multiple_choice_options)
    // ensure correct present; if not, replace last
    if (!options.map(o => o.toLowerCase()).includes(correct.toLowerCase())) {
      options[numOptions - 1] = correct
    }
    return shuffleArray(options.slice(0, numOptions))
  }

  // Build distractor pool from other answers in the stack
  const pool = collectCandidateDistractors(stackData, questionIndex)
    .filter(v => v && v.toLowerCase() !== correct.toLowerCase())
  const uniquePool = uniqueCaseInsensitive(pool)

  const distractors = []
  // Numeric fallback if pool is too small
  if (uniquePool.length < numOptions - 1) {
    distractors.push(...generateNumericDistractors(correct, numOptions - 1))
  }
  // Add from pool until we have enough
  for (const v of shuffleArray(uniquePool)) {
    if (distractors.length >= numOptions - 1) break
    if (v.toLowerCase() === correct.toLowerCase()) continue
    distractors.push(v)
  }
  // Ensure we have enough distractors (final fallback)
  while (distractors.length < numOptions - 1) {
    const filler = `Option ${String.fromCharCode(65 + distractors.length)}`
    if (filler.toLowerCase() !== correct.toLowerCase()) distractors.push(filler)
  }

  const options = shuffleArray([correct, ...distractors.slice(0, numOptions - 1)])
  return options
}


