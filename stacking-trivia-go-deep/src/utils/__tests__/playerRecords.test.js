import { describe, it, expect, beforeEach } from 'vitest'
import {
  recordRun,
  getStackRecord,
  getPlayerSummary,
  getDayStreak,
  pickDailyStack,
  pickSurpriseStack,
  buildResultLadder,
  dateKey,
} from '../playerRecords'

const day = (y, m, d) => new Date(y, m - 1, d, 12)

describe('playerRecords', () => {
  beforeEach(() => localStorage.clear())

  it('keeps the best score and flags a perfect dive', () => {
    expect(recordRun('queso-wars', { score: 70, levelsCleared: 3, totalLevels: 5 }).isNewBest).toBe(true)
    const second = recordRun('queso-wars', { score: 30, levelsCleared: 2, totalLevels: 5 })
    expect(second).toEqual({ isNewBest: false, previousBest: 70 })
    recordRun('queso-wars', { score: 310, levelsCleared: 5, totalLevels: 5 })

    expect(getStackRecord('queso-wars')).toMatchObject({ best: 310, deepest: 5, plays: 3, perfect: true })
  })

  it('summarizes stacks played, perfect stacks, and best totals', () => {
    recordRun('a', { score: 310, levelsCleared: 5, totalLevels: 5 })
    recordRun('b', { score: 30, levelsCleared: 2, totalLevels: 5 })
    expect(getPlayerSummary()).toMatchObject({ stacksPlayed: 2, perfectStacks: 1, totalBest: 340 })
  })

  it('counts consecutive days and tolerates not having played yet today', () => {
    recordRun('a', { score: 10, levelsCleared: 1, totalLevels: 5, date: day(2026, 3, 1) })
    recordRun('a', { score: 10, levelsCleared: 1, totalLevels: 5, date: day(2026, 3, 2) })
    recordRun('a', { score: 10, levelsCleared: 1, totalLevels: 5, date: day(2026, 3, 3) })

    expect(getDayStreak(day(2026, 3, 3))).toBe(3)
    expect(getDayStreak(day(2026, 3, 4))).toBe(3)
    expect(getDayStreak(day(2026, 3, 5))).toBe(0)
  })

  it('crosses month boundaries when counting the streak', () => {
    recordRun('a', { score: 10, levelsCleared: 1, totalLevels: 5, date: day(2026, 2, 28) })
    recordRun('a', { score: 10, levelsCleared: 1, totalLevels: 5, date: day(2026, 3, 1) })
    expect(getDayStreak(day(2026, 3, 1))).toBe(2)
  })

  it('picks the same daily stack for everyone on a given day, regardless of key order', () => {
    const keys = ['van-gogh', 'queso-wars', 'serena-williams', 'tesla']
    const date = day(2026, 11, 12)
    expect(pickDailyStack(keys, date)).toBe(pickDailyStack([...keys].reverse(), date))
    expect(keys).toContain(pickDailyStack(keys, date))
    expect(dateKey(date)).toBe('2026-11-12')
  })

  it('surprises the player with an unplayed stack when one exists', () => {
    recordRun('a', { score: 10, levelsCleared: 1, totalLevels: 5 })
    recordRun('b', { score: 10, levelsCleared: 1, totalLevels: 5 })
    expect(pickSurpriseStack(['a', 'b', 'c'], { random: () => 0 })).toBe('c')
    expect(pickSurpriseStack(['a', 'b'], { exclude: ['a'], random: () => 0 })).toBe('b')
  })

  it('builds a spoiler-free result ladder', () => {
    const answers = [{ correct: true }, { correct: true }, { correct: false }]
    expect(buildResultLadder(answers, 5)).toBe('🟩🟩🟥⬜⬜')
    expect(buildResultLadder([...answers.slice(0, 2), { correct: true, deeper: true }], 2)).toBe('🟩🟩')
  })
})
