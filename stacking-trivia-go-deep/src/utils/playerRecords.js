/**
 * On-device player records: best score per stack, days played, and the daily stack pick.
 * Works for guests and signed-in players alike; nothing here needs the network.
 */

const RECORDS_KEY = 'deepstack_records_v1'
const MAX_DAYS_KEPT = 400

const emptyRecords = () => ({ stacks: {}, days: [] })

const readRecords = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECORDS_KEY))
    if (parsed && typeof parsed === 'object' && parsed.stacks) return parsed
  } catch { /* fall through */ }
  return emptyRecords()
}

const writeRecords = (records) => {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
  } catch { /* storage full or disabled: records are best-effort */ }
}

/** Local calendar day as YYYY-MM-DD, so "today" matches the player's clock. */
export const dateKey = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * @param {string} stackKey
 * @param {{ score: number, levelsCleared: number, totalLevels: number, date?: Date }} run
 * @returns {{ isNewBest: boolean, previousBest: number | null }}
 */
export const recordRun = (stackKey, { score, levelsCleared, totalLevels, date = new Date() }) => {
  const records = readRecords()
  const previous = records.stacks[stackKey]
  const previousBest = previous ? previous.best : null
  const isNewBest = previousBest === null || score > previousBest

  records.stacks[stackKey] = {
    best: Math.max(score, previousBest ?? 0),
    deepest: Math.max(levelsCleared, previous?.deepest ?? 0),
    totalLevels,
    plays: (previous?.plays ?? 0) + 1,
    perfect: (previous?.perfect ?? false) || levelsCleared >= totalLevels,
    lastPlayed: dateKey(date),
  }

  const today = dateKey(date)
  if (!records.days.includes(today)) {
    records.days = [...records.days, today].slice(-MAX_DAYS_KEPT)
  }

  writeRecords(records)
  return { isNewBest, previousBest }
}

export const getStackRecord = (stackKey) => readRecords().stacks[stackKey] || null

export const getAllStackRecords = () => readRecords().stacks

const previousDay = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return dateKey(new Date(y, m - 1, d - 1))
}

/** Consecutive days played, counting today or (if not yet played today) ending yesterday. */
export const getDayStreak = (now = new Date()) => {
  const days = new Set(readRecords().days)
  let cursor = dateKey(now)
  if (!days.has(cursor)) cursor = previousDay(cursor)
  let streak = 0
  while (days.has(cursor)) {
    streak += 1
    cursor = previousDay(cursor)
  }
  return streak
}

export const getPlayerSummary = (now = new Date()) => {
  const stacks = Object.values(readRecords().stacks)
  return {
    stacksPlayed: stacks.length,
    perfectStacks: stacks.filter((s) => s.perfect).length,
    totalBest: stacks.reduce((sum, s) => sum + (s.best || 0), 0),
    dayStreak: getDayStreak(now),
  }
}

const hashString = (value) => {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Everyone gets the same stack on the same day, so "today's stack" is something friends can compare. */
export const pickDailyStack = (stackKeys, date = new Date()) => {
  if (!stackKeys.length) return null
  const sorted = [...stackKeys].sort()
  return sorted[hashString(dateKey(date)) % sorted.length]
}

/** Prefer stacks the player has never tried; fall back to anything but the excluded ones. */
export const pickSurpriseStack = (stackKeys, { exclude = [], random = Math.random } = {}) => {
  const played = getAllStackRecords()
  const candidates = stackKeys.filter((k) => !exclude.includes(k))
  const fresh = candidates.filter((k) => !played[k])
  const pool = fresh.length ? fresh : candidates
  if (!pool.length) return null
  return pool[Math.floor(random() * pool.length)]
}

/**
 * Spoiler-free result grid for sharing, e.g. "🟩🟩🟩🟥⬜".
 * @param {{ correct: boolean, deeper?: boolean }[]} answers
 * @param {number} totalLevels
 */
export const buildResultLadder = (answers, totalLevels) => {
  const main = answers.filter((a) => !a.deeper)
  return Array.from({ length: totalLevels }, (_, i) => {
    const answer = main[i]
    if (!answer) return '⬜'
    return answer.correct ? '🟩' : '🟥'
  }).join('')
}
