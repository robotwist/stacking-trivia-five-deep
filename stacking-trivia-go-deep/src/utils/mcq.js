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

// Enhanced semantic analysis for better distractor generation
const analyzeSemanticType = (answer) => {
  const normalized = normalize(answer).toLowerCase()
  
  // Detect answer types for better distractor matching
  if (isLikelyYear(normalized)) return 'year'
  if (isNumberLike(normalized)) return 'number'
  if (isProperNounish(normalized)) return 'proper_noun'
  if (normalized.includes('the ') || normalized.includes('a ') || normalized.includes('an ')) return 'phrase'
  if (normalized.split(' ').length > 3) return 'sentence'
  if (normalized.length <= 3) return 'short'
  
  return 'word'
}

// Enhanced similarity scoring with semantic proximity
const enhancedSimilarityScore = (correct, candidate, questionContext = '') => {
  if (!candidate) return -Infinity
  const c = normalize(correct)
  const d = normalize(candidate)
  if (!c || !d) return -Infinity
  if (c.toLowerCase() === d.toLowerCase()) return -Infinity

  let score = 0
  
  // Base similarity (existing logic)
  if (wordCount(c) === wordCount(d)) score += 20
  score += Math.max(0, 15 - Math.abs(c.length - d.length))
  if (c[0]?.toLowerCase() === d[0]?.toLowerCase()) score += 10
  
  // Enhanced semantic proximity scoring
  const cType = analyzeSemanticType(c)
  const dType = analyzeSemanticType(d)
  
  // Type matching bonus
  if (cType === dType) score += 25
  
  // Semantic category matching
  if (areSemanticallyRelated(c, d)) score += 30
  
  // Common misconception bonus
  if (isCommonMisconception(c, d)) score += 35
  
  // Partial knowledge detection
  if (isPartialKnowledge(c, d)) score += 20
  
  // Cognitive level matching
  if (hasSimilarCognitiveLevel(c, d)) score += 15
  
  // Levenshtein distance (existing logic)
  const lev = levenshteinDistance(c, d)
  const closeness = Math.max(0, 12 - lev)
  score += closeness
  if (lev <= 1) score -= 30
  
  return score
}

// Check if answers are semantically related
const areSemanticallyRelated = (answer1, answer2) => {
  const a1 = normalize(answer1).toLowerCase()
  const a2 = normalize(answer2).toLowerCase()
  
  // Same category/field indicators
  const categoryIndicators = [
    ['painting', 'painter', 'artist', 'artwork', 'canvas'],
    ['movie', 'film', 'director', 'actor', 'cinema'],
    ['song', 'music', 'singer', 'band', 'album'],
    ['book', 'author', 'novel', 'writer', 'literature'],
    ['scientist', 'discovery', 'theory', 'research', 'experiment'],
    ['athlete', 'sport', 'team', 'championship', 'record']
  ]
  
  for (const category of categoryIndicators) {
    const a1InCategory = category.some(term => a1.includes(term))
    const a2InCategory = category.some(term => a2.includes(term))
    if (a1InCategory && a2InCategory) return true
  }
  
  return false
}

// Detect common misconceptions
const isCommonMisconception = (correct, candidate) => {
  const c = normalize(correct).toLowerCase()
  const d = normalize(candidate).toLowerCase()
  
  // Common misconception patterns
  const misconceptions = [
    // Historical misconceptions
    ['columbus discovered america', 'columbus was first to america'],
    ['einstein failed math', 'einstein was bad at math'],
    ['napoleon was short', 'napoleon was very short'],
    
    // Scientific misconceptions
    ['humans use 10% of brain', 'humans only use 10% of brain'],
    ['lightning never strikes twice', 'lightning cannot strike twice'],
    ['bats are blind', 'bats cannot see'],
    
    // Artistic misconceptions
    ['van gogh cut off ear', 'van gogh cut off entire ear'],
    ['mona lisa smile', 'mona lisa is smiling'],
    ['picasso cubism', 'picasso invented cubism']
  ]
  
  for (const [truth, misconception] of misconceptions) {
    if ((c.includes(truth) && d.includes(misconception)) ||
        (d.includes(truth) && c.includes(misconception))) {
      return true
    }
  }
  
  return false
}

// Detect partial knowledge answers
const isPartialKnowledge = (correct, candidate) => {
  const c = normalize(correct).toLowerCase()
  const d = normalize(candidate).toLowerCase()
  
  // Check if candidate is a subset or generalization of correct
  const cWords = c.split(' ').filter(Boolean)
  const dWords = d.split(' ').filter(Boolean)
  
  // If candidate has fewer words but shares key terms
  if (dWords.length < cWords.length && dWords.length > 0) {
    const sharedWords = dWords.filter(word => cWords.includes(word))
    if (sharedWords.length >= Math.min(2, dWords.length)) {
      return true
    }
  }
  
  // Check for generalization patterns
  const generalizations = [
    ['starry night', 'van gogh painting'],
    ['mona lisa', 'da vinci painting'],
    ['beethoven symphony', 'classical music'],
    ['shakespeare play', 'english literature']
  ]
  
  for (const [specific, general] of generalizations) {
    if ((c.includes(specific) && d.includes(general)) ||
        (d.includes(specific) && c.includes(general))) {
      return true
    }
  }
  
  return false
}

// Check cognitive level similarity
const hasSimilarCognitiveLevel = (answer1, answer2) => {
  const a1 = normalize(answer1).toLowerCase()
  const a2 = normalize(answer2).toLowerCase()
  
  // Simple heuristics for cognitive levels
  const levels = {
    basic: ['what', 'who', 'when', 'where'],
    comprehension: ['describe', 'explain', 'summarize'],
    application: ['how', 'apply', 'use'],
    analysis: ['compare', 'contrast', 'analyze'],
    synthesis: ['create', 'design', 'develop'],
    evaluation: ['evaluate', 'judge', 'assess']
  }
  
  // For now, use word count and complexity as proxy
  const a1Complexity = a1.split(' ').length + (a1.includes(',') ? 2 : 0)
  const a2Complexity = a2.split(' ').length + (a2.includes(',') ? 2 : 0)
  
  return Math.abs(a1Complexity - a2Complexity) <= 2
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

// Enhanced plausibility filtering with semantic considerations
const filterPlausible = (correct, candidates, required = 3, questionContext = '') => {
  const c = normalize(correct)
  const cLen = c.length
  const cWords = wordCount(c)
  const cType = analyzeSemanticType(c)

  // Stage 1: Strict semantic matching
  let filtered = candidates.filter(d => {
    const dNorm = normalize(d)
    if (!dNorm) return false
    if (dNorm.toLowerCase() === c.toLowerCase()) return false
    
    const dType = analyzeSemanticType(d)
    const dWords = wordCount(d)
    
    // Type matching is crucial
    if (cType !== dType) return false
    
    // Similar complexity
    const lenTol = cLen <= 10 ? 2 : Math.ceil(cLen * 0.3)
    const lengthClose = Math.abs(cLen - dNorm.length) <= lenTol
    
    // Word count matching for phrases/sentences
    const wordsClose = cWords > 1 ? Math.abs(cWords - dWords) <= 1 : true
    
    return lengthClose && wordsClose
  })

  if (filtered.length >= required) return filtered

  // Stage 2: Relax type matching, keep semantic proximity
  filtered = candidates.filter(d => {
    const dNorm = normalize(d)
    if (!dNorm) return false
    if (dNorm.toLowerCase() === c.toLowerCase()) return false
    
    // Must be semantically related
    return areSemanticallyRelated(c, d) || isCommonMisconception(c, d) || isPartialKnowledge(c, d)
  })
  
  if (filtered.length >= required) return filtered

  // Stage 3: Fallback to basic similarity
  filtered = candidates.filter(d => {
    const dNorm = normalize(d)
    if (!dNorm) return false
    if (dNorm.toLowerCase() === c.toLowerCase()) return false
    
    const dLen = dNorm.length
    const lenTol = cLen <= 10 ? 3 : Math.ceil(cLen * 0.4)
    return Math.abs(cLen - dLen) <= lenTol
  })
  
  return filtered
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

  // Enhanced numeric distractor generation
  let numericCandidates = []
  if (isLikelyYear(correct)) {
    const base = Number(correct)
    // More varied year distractors
    const candidates = [
      base - 1, base + 1, 
      base - 5, base + 5, 
      base - 10, base + 10,
      base - 25, base + 25,
      base - 50, base + 50
    ]
    numericCandidates = candidates.map(String)
  } else if (isNumberLike(correct)) {
    numericCandidates = generateNumericDistractors(correct, Math.max(5, numOptions * 2))
  }

  // Enhanced ranking with semantic proximity
  uniquePool = uniqueCaseInsensitive([...numericCandidates, ...uniquePool])
  let ranked = uniquePool
    .map(v => ({ 
      v, 
      s: enhancedSimilarityScore(correct, v, question.question_text || question.q || '')
    }))
    .sort((a, b) => b.s - a.s)
    .map(x => x.v)

  // Apply enhanced plausibility filtering
  ranked = filterPlausible(correct, ranked, numOptions - 1, question.question_text || question.q || '')

  const distractors = []
  for (const v of ranked) {
    if (distractors.length >= numOptions - 1) break
    if (v.toLowerCase() === correct.toLowerCase()) continue
    // Avoid duplicates by case-insensitive compare
    if (distractors.some(d => d.toLowerCase() === v.toLowerCase())) continue
    distractors.push(v)
  }

  // Enhanced fallback generation
  while (distractors.length < numOptions - 1) {
    const correctType = analyzeSemanticType(correct)
    let fallbackOption = ''
    
    switch (correctType) {
      case 'year':
        const base = Number(correct) || 1900
        fallbackOption = String(base + Math.floor(Math.random() * 100) - 50)
        break
      case 'number':
        const num = Number(correct) || 10
        fallbackOption = String(num + Math.floor(Math.random() * 20) - 10)
        break
      case 'proper_noun':
        fallbackOption = `Related ${correct.split(' ')[0]}`
        break
      default:
        fallbackOption = `Option ${String.fromCharCode(65 + distractors.length)}`
    }
    
    if (fallbackOption.toLowerCase() !== correct.toLowerCase()) {
      distractors.push(fallbackOption)
    }
  }

  const options = shuffleArray([correct, ...distractors.slice(0, numOptions - 1)])
  return options
}


