import { describe, it, expect } from 'vitest'
import {
  createHostNight,
  hostNightReducer,
  getStandings,
  getRoundPoints,
  pickBalancedRounds,
  getStageChoices,
} from '../hostNight'

const play = (state, ...actions) => actions.reduce(hostNightReducer, state)

const setupNight = (overrides = {}) => {
  let state = play(
    createHostNight(),
    { type: 'ADD_TEAM', name: 'Quizzly Bears', id: 'a' },
    { type: 'ADD_TEAM', name: 'Les Quizerables', id: 'b' },
    { type: 'ADD_TEAM', name: 'Trivia Newton John', id: 'c' },
    { type: 'SET_ROUNDS', rounds: ['queso-wars', 'van-gogh'] },
  )
  state = { ...state, settings: { ...state.settings, ...overrides } }
  return play(state, { type: 'START' })
}

const scoreLevel = (state, correctIds) =>
  play(state, { type: 'REVEAL' }, ...correctIds.map((teamId) => ({ type: 'TOGGLE_MARK', teamId })), { type: 'SCORE_LEVEL' })

describe('hostNightReducer', () => {
  it('rejects blank and duplicate team names', () => {
    const state = play(
      createHostNight(),
      { type: 'ADD_TEAM', name: '  ' },
      { type: 'ADD_TEAM', name: 'Quizzly Bears' },
      { type: 'ADD_TEAM', name: 'quizzly bears' },
    )
    expect(state.teams.map((t) => t.name)).toEqual(['Quizzly Bears'])
  })

  it('awards doubling level points to the teams the host marks', () => {
    let state = setupNight()
    state = scoreLevel(state, ['a', 'b'])
    state = scoreLevel(state, ['a'])
    expect(state.scores).toEqual({ a: 30, b: 10, c: 0 })
    expect(state.level).toBe(2)
  })

  it('with the dive rule, a miss sits a team out for the rest of the round', () => {
    let state = setupNight()
    state = scoreLevel(state, ['a', 'b'])
    expect(state.inDive).toEqual(['a', 'b'])

    // Team c is out: marking it is ignored
    state = play(state, { type: 'REVEAL' }, { type: 'TOGGLE_MARK', teamId: 'c' })
    expect(state.marked).toEqual([])
  })

  it('ends the round early when every team has dropped out', () => {
    let state = setupNight()
    state = scoreLevel(state, ['a'])
    state = scoreLevel(state, [])
    expect(state.phase).toBe('roundSummary')
    expect(getRoundPoints(state, 0)).toEqual({ a: 10, b: 0, c: 0 })
  })

  it('without the dive rule, every team answers every level', () => {
    let state = setupNight({ diveRule: false })
    state = scoreLevel(state, [])
    state = scoreLevel(state, ['c'])
    expect(state.phase).toBe('question')
    expect(state.scores.c).toBe(20)
  })

  it('moves to the round summary after level 5, then to the next round, then the final', () => {
    let state = setupNight()
    for (let i = 0; i < 5; i++) state = scoreLevel(state, ['a'])
    expect(state.phase).toBe('roundSummary')
    expect(state.scores.a).toBe(310)

    state = play(state, { type: 'NEXT_ROUND' })
    expect(state).toMatchObject({ phase: 'question', roundIndex: 1, level: 0, inDive: ['a', 'b', 'c'] })

    state = scoreLevel(state, [])
    state = play(state, { type: 'NEXT_ROUND' })
    expect(state.phase).toBe('final')
  })

  it('undo reverses a mis-scored level', () => {
    let state = setupNight()
    state = scoreLevel(state, ['a', 'b'])
    state = play(state, { type: 'UNDO' })
    expect(state.phase).toBe('reveal')
    expect(state.scores).toEqual({ a: 0, b: 0, c: 0 })
    expect(state.inDive).toEqual(['a', 'b', 'c'])
  })

  it('ranks ties at the same place', () => {
    let state = setupNight({ diveRule: false })
    state = scoreLevel(state, ['a', 'b'])
    expect(getStandings(state).map((s) => [s.name, s.place])).toEqual([
      ['Quizzly Bears', 1],
      ['Les Quizerables', 1],
      ['Trivia Newton John', 3],
    ])
  })

  it('keeps teams and venue for a new night but resets scores', () => {
    let state = play(setupNight(), { type: 'SET_VENUE', venue: 'The Rusty Anchor' })
    state = scoreLevel(state, ['a'])
    state = play(state, { type: 'NEW_NIGHT' })
    expect(state).toMatchObject({ phase: 'setup', venue: 'The Rusty Anchor', rounds: [] })
    expect(state.teams).toHaveLength(3)
    expect(state.scores).toEqual({ a: 0, b: 0, c: 0 })
  })
})

describe('getStageChoices', () => {
  it('shows the same order every time for a question, with the answer included', () => {
    const q = { question: 'Who bought it?', answer: 'Anna Boch', choices: ['Theo van Gogh', 'Paul Gauguin', 'Dr. Paul Gachet'] }
    const first = getStageChoices(q)
    expect(getStageChoices(q)).toEqual(first)
    expect([...first].sort()).toEqual(['Anna Boch', 'Dr. Paul Gachet', 'Paul Gauguin', 'Theo van Gogh'])
  })
})

describe('pickBalancedRounds', () => {
  const categories = {
    categories: {
      arts: { stacks: ['van-gogh', 'mozart'] },
      sports: { stacks: ['serena', 'ali'] },
      kids: { stacks: ['dinosaurs'] },
    },
  }

  it('spreads rounds across categories and skips kids by default', () => {
    const picks = pickBalancedRounds(categories, ['van-gogh', 'mozart', 'serena', 'ali', 'dinosaurs'], { count: 2, random: () => 0 })
    expect(picks).toHaveLength(2)
    expect(picks).not.toContain('dinosaurs')
    expect(new Set(picks.map((k) => (['van-gogh', 'mozart'].includes(k) ? 'arts' : 'sports'))).size).toBe(2)
  })

  it('skips stacks the host has already run', () => {
    const picks = pickBalancedRounds(categories, ['van-gogh', 'mozart', 'serena', 'ali'], { count: 2, exclude: ['van-gogh', 'serena'], random: () => 0 })
    expect(picks.sort()).toEqual(['ali', 'mozart'])
  })
})
