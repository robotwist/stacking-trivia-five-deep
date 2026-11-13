/**
 * Host Night: a host runs trivia for a room from one laptop (optionally with a TV screen).
 * Teams answer on paper or out loud; the host marks who got each level right.
 *
 * Each round is one five-level stack. With the dive rule on, a team that misses a level
 * sits out the rest of that round, so late levels (80, 160 pts) decide the night.
 */
import { calculateQuestionScore } from './scoreUtils'

export const HOST_NIGHT_STORAGE_KEY = 'deepstack_host_night_v1'
export const MAX_TEAMS = 24
export const MAX_ROUNDS = 10
const MAX_UNDO = 20

export const createHostNight = () => ({
  version: 1,
  venue: '',
  teams: [],
  rounds: [],
  settings: { diveRule: true, showChoices: false },
  phase: 'setup', // setup | question | reveal | roundSummary | final
  roundIndex: 0,
  level: 0,
  scores: {},
  inDive: [],
  marked: [],
  log: [],
  undo: [],
})

let idCounter = 0
const newTeamId = () => `t${Date.now().toString(36)}${(idCounter++).toString(36)}`

/** Points a level is worth; rounds stay on the familiar 10 → 160 ladder. */
export const levelPoints = (level) => calculateQuestionScore(level, false)

const snapshot = (state) => ({
  phase: state.phase,
  roundIndex: state.roundIndex,
  level: state.level,
  scores: state.scores,
  inDive: state.inDive,
  marked: state.marked,
  log: state.log,
})

const withUndo = (state, next) => ({ ...next, undo: [...state.undo, snapshot(state)].slice(-MAX_UNDO) })

const startRound = (state, roundIndex) => ({
  ...state,
  phase: 'question',
  roundIndex,
  level: 0,
  inDive: state.teams.map((t) => t.id),
  marked: [],
})

/**
 * @param {ReturnType<typeof createHostNight>} state
 * @param {{ type: string, [key: string]: any }} action
 */
export function hostNightReducer(state, action) {
  switch (action.type) {
    case 'SET_VENUE':
      return { ...state, venue: String(action.venue || '').slice(0, 60) }

    case 'ADD_TEAM': {
      const name = String(action.name || '').trim().slice(0, 40)
      if (!name || state.teams.length >= MAX_TEAMS) return state
      if (state.teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) return state
      const team = { id: action.id || newTeamId(), name }
      return { ...state, teams: [...state.teams, team], scores: { ...state.scores, [team.id]: 0 } }
    }

    case 'REMOVE_TEAM': {
      if (state.phase !== 'setup') return state
      const { [action.id]: _removed, ...scores } = state.scores
      return { ...state, teams: state.teams.filter((t) => t.id !== action.id), scores }
    }

    case 'SET_ROUNDS':
      return { ...state, rounds: action.rounds.slice(0, MAX_ROUNDS) }

    case 'SET_SETTING':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } }

    case 'START': {
      if (state.teams.length < 1 || state.rounds.length < 1) return state
      const scores = Object.fromEntries(state.teams.map((t) => [t.id, 0]))
      return startRound({ ...state, scores, log: [], undo: [] }, 0)
    }

    case 'REVEAL':
      if (state.phase !== 'question') return state
      return withUndo(state, { ...state, phase: 'reveal', marked: [] })

    case 'TOGGLE_MARK': {
      if (state.phase !== 'reveal') return state
      const eligible = state.settings.diveRule ? state.inDive : state.teams.map((t) => t.id)
      if (!eligible.includes(action.teamId)) return state
      const marked = state.marked.includes(action.teamId)
        ? state.marked.filter((id) => id !== action.teamId)
        : [...state.marked, action.teamId]
      return { ...state, marked }
    }

    case 'MARK_ALL': {
      if (state.phase !== 'reveal') return state
      const eligible = state.settings.diveRule ? state.inDive : state.teams.map((t) => t.id)
      return { ...state, marked: state.marked.length === eligible.length ? [] : [...eligible] }
    }

    case 'SCORE_LEVEL': {
      if (state.phase !== 'reveal') return state
      const points = levelPoints(state.level)
      const scores = { ...state.scores }
      state.marked.forEach((id) => { scores[id] = (scores[id] || 0) + points })
      const inDive = state.settings.diveRule ? state.inDive.filter((id) => state.marked.includes(id)) : state.inDive
      const dropped = state.settings.diveRule ? state.inDive.filter((id) => !state.marked.includes(id)) : []
      const log = [...state.log, {
        roundIndex: state.roundIndex,
        level: state.level,
        points,
        correct: [...state.marked],
        dropped,
      }]
      const lastLevel = state.level >= 4
      const roundOver = lastLevel || (state.settings.diveRule && inDive.length === 0)
      const next = roundOver
        ? { ...state, scores, inDive, log, marked: [], phase: 'roundSummary' }
        : { ...state, scores, inDive, log, marked: [], phase: 'question', level: state.level + 1 }
      return withUndo(state, next)
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'roundSummary') return state
      if (state.roundIndex + 1 >= state.rounds.length) return withUndo(state, { ...state, phase: 'final' })
      return withUndo(state, startRound(state, state.roundIndex + 1))
    }

    case 'END_NIGHT':
      if (state.phase === 'setup') return state
      return withUndo(state, { ...state, phase: 'final' })

    case 'UNDO': {
      const previous = state.undo[state.undo.length - 1]
      if (!previous) return state
      return { ...state, ...previous, undo: state.undo.slice(0, -1) }
    }

    case 'NEW_NIGHT':
      // Same room, same teams, fresh scores and a new set of rounds
      return { ...createHostNight(), venue: state.venue, teams: state.teams, settings: state.settings,
        scores: Object.fromEntries(state.teams.map((t) => [t.id, 0])) }

    case 'LOAD':
      return action.state

    default:
      return state
  }
}

/** Teams sorted by score, with shared places for ties ("1, 2, 2, 4"). */
export const getStandings = (state) => {
  const sorted = [...state.teams].sort((a, b) => (state.scores[b.id] || 0) - (state.scores[a.id] || 0))
  let place = 0
  let lastScore = null
  return sorted.map((team, index) => {
    const score = state.scores[team.id] || 0
    if (score !== lastScore) {
      place = index + 1
      lastScore = score
    }
    return { ...team, score, place }
  })
}

/** Points each team earned in one round, for the round summary. */
export const getRoundPoints = (state, roundIndex) => {
  const totals = Object.fromEntries(state.teams.map((t) => [t.id, 0]))
  state.log
    .filter((entry) => entry.roundIndex === roundIndex)
    .forEach((entry) => entry.correct.forEach((id) => { totals[id] = (totals[id] || 0) + entry.points }))
  return totals
}

/**
 * Pick a varied night: one stack per category where possible, skipping kids stacks unless asked,
 * and skipping stacks this host has already run.
 */
export const pickBalancedRounds = (categoriesConfig, availableKeys, { count = 4, includeKids = false, exclude = [], random = Math.random } = {}) => {
  const shuffle = (list) => {
    const copy = [...list]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }
  const categories = shuffle(Object.entries(categoriesConfig.categories)
    .filter(([key]) => includeKids || key !== 'kids'))
  const picks = []
  for (const [, category] of categories) {
    if (picks.length >= count) break
    const options = shuffle(category.stacks.filter((k) => availableKeys.includes(k) && !exclude.includes(k) && !picks.includes(k)))
    if (options.length) picks.push(options[0])
  }
  if (picks.length < count) {
    const rest = shuffle(availableKeys.filter((k) => !picks.includes(k) && !exclude.includes(k)))
    picks.push(...rest.slice(0, count - picks.length))
  }
  return picks.slice(0, count)
}

/** Shuffle seeded by the question text, so the host laptop and the TV show the same order. */
const seededShuffle = (items, seed) => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const next = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    return h / 4294967296
  }
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const getStageChoices = (question) =>
  question?.choices?.length ? seededShuffle([question.answer, ...question.choices], question.question) : []

export const loadSavedHostNight = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(HOST_NIGHT_STORAGE_KEY))
    if (saved && saved.version === 1 && Array.isArray(saved.teams)) return saved
  } catch { /* fall through */ }
  return null
}

export const saveHostNight = (state) => {
  try {
    localStorage.setItem(HOST_NIGHT_STORAGE_KEY, JSON.stringify(state))
  } catch { /* storage full: the night continues in memory */ }
}
