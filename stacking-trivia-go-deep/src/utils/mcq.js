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

const isLikelyYear = (value) => {
  const year = Number(value)
  return Number.isInteger(year) && year >= 1500 && year <= 2100 && /^\d{4}$/.test(String(value))
}

const isNumberLike = (value) => {
  return /^\d+(\.\d+)?$/.test(String(value))
}

const wordCount = (str) => normalize(str).split(/\s+/).filter(Boolean).length

const isProperNounish = (str) => {
  const tokens = normalize(str).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return false
  let capitalized = 0
  for (const t of tokens) {
    if (/^[A-Z][a-z'\-]+$/.test(t)) capitalized += 1
  }
  return capitalized >= Math.max(1, Math.floor(tokens.length * 0.6))
}

const levenshteinDistance = (a, b) => {
  const s = a.toLowerCase()
  const t = b.toLowerCase()
  const m = s.length, n = t.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[m][n]
}

const similarityScore = (correct, candidate) => {
  if (!candidate) return -Infinity
  const c = normalize(correct)
  const d = normalize(candidate)
  if (!c || !d) return -Infinity
  if (c.toLowerCase() === d.toLowerCase()) return -Infinity

  let score = 0
  // Prefer same word count (names, multi-word titles)
  if (wordCount(c) === wordCount(d)) score += 20
  // Prefer similar length
  score += Math.max(0, 15 - Math.abs(c.length - d.length))
  // Prefer same first letter
  if (c[0]?.toLowerCase() === d[0]?.toLowerCase()) score += 10
  // Prefer same last-token initial (surnames)
  const cLast = c.split(/\s+/).pop()
  const dLast = d.split(/\s+/).pop()
  if (cLast && dLast && cLast[0]?.toLowerCase() === dLast[0]?.toLowerCase()) score += 6
  // Prefer same capitalization pattern (proper nouns)
  if (isProperNounish(c) && isProperNounish(d)) score += 10
  // Penalize being too similar (avoid near-duplicates) but reward moderate closeness
  const lev = levenshteinDistance(c, d)
  const closeness = Math.max(0, 12 - lev) // closer gets more up to 12
  score += closeness
  if (lev <= 1) score -= 30 // too close
  return score
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
  let uniquePool = uniqueCaseInsensitive(pool)

  // If the correct looks like a year or number, prioritize numeric variants
  let numericCandidates = []
  if (isLikelyYear(correct)) {
    const base = Number(correct)
    const candidates = [base - 1, base + 1, base - 5, base + 5, base - 10, base + 10]
    numericCandidates = candidates.map(String)
  } else if (isNumberLike(correct)) {
    numericCandidates = generateNumericDistractors(correct, Math.max(3, numOptions))
  }

  // Rank pool by similarity to correct to get plausible distractors
  uniquePool = uniqueCaseInsensitive([...numericCandidates, ...uniquePool])
  const ranked = uniquePool
    .map(v => ({ v, s: similarityScore(correct, v) }))
    .sort((a, b) => b.s - a.s)
    .map(x => x.v)

  const distractors = []
  for (const v of ranked) {
    if (distractors.length >= numOptions - 1) break
    if (v.toLowerCase() === correct.toLowerCase()) continue
    // Avoid duplicates by case-insensitive compare
    if (distractors.some(d => d.toLowerCase() === v.toLowerCase())) continue
    distractors.push(v)
  }

  // Ensure we have enough distractors (final fallback)
  while (distractors.length < numOptions - 1) {
    const label = `Option ${String.fromCharCode(65 + distractors.length)}`
    if (label.toLowerCase() !== correct.toLowerCase()) distractors.push(label)
  }

  const options = shuffleArray([correct, ...distractors.slice(0, numOptions - 1)])
  return options
}


