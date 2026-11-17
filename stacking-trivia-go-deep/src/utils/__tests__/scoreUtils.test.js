import { describe, it, expect } from 'vitest'
import { 
  calculateQuestionScore, 
  pointsForDeeperQuestion,
  calculateMaxScore, 
  getCrowdMultiplier,
  formatScore 
} from '../scoreUtils'

describe('Score Utilities', () => {
  describe('calculateQuestionScore', () => {
    it('should return correct base scores for each depth', () => {
      expect(calculateQuestionScore(0)).toBe(10)
      expect(calculateQuestionScore(1)).toBe(20)
      expect(calculateQuestionScore(2)).toBe(40)
      expect(calculateQuestionScore(3)).toBe(80)
      expect(calculateQuestionScore(4)).toBe(160)
    })

    it('should return 160 for depths beyond 4', () => {
      expect(calculateQuestionScore(5)).toBe(160)
      expect(calculateQuestionScore(10)).toBe(160)
    })

    it('should add deeper mode bonus correctly', () => {
      expect(calculateQuestionScore(0, true)).toBe(60) // 10 + 50
      expect(calculateQuestionScore(1, true)).toBe(70) // 20 + 50
      expect(calculateQuestionScore(2, true)).toBe(90) // 40 + 50
      expect(calculateQuestionScore(3, true)).toBe(130) // 80 + 50
      expect(calculateQuestionScore(4, true)).toBe(210) // 160 + 50
    })
  })

  describe('pointsForDeeperQuestion', () => {
    it('uses the authored bonus when the question has one', () => {
      expect(pointsForDeeperQuestion({ bonus: 150 }, 0)).toBe(150)
      expect(pointsForDeeperQuestion({ bonus: 200 }, 1)).toBe(200)
    })

    it('falls back to the depth formula when bonus is missing', () => {
      expect(pointsForDeeperQuestion({}, 0)).toBe(60)
      expect(pointsForDeeperQuestion({ bonus: 0 }, 1)).toBe(70)
    })
  })

  describe('calculateMaxScore', () => {
    it('should calculate correct max score for standard 5 questions', () => {
      expect(calculateMaxScore(5, false)).toBe(310) // 10+20+40+80+160
    })

    it('adds the flat deeper-mode formula once per bonus question, not once per main level', () => {
      expect(calculateMaxScore(5, 2)).toBe(440) // 310 + 60 + 70
      expect(calculateMaxScore(5, [{}, {}])).toBe(440)
    })

    it('adds authored bonuses instead of the flat formula', () => {
      expect(calculateMaxScore(5, [{ bonus: 150 }, { bonus: 200 }])).toBe(660)
    })

    it('should handle different question counts', () => {
      expect(calculateMaxScore(3, false)).toBe(310) // Still uses base max
      expect(calculateMaxScore(3, 2)).toBe(440) // ceiling stays 310, plus two bonus questions
    })

    it('should use default values when not provided', () => {
      expect(calculateMaxScore()).toBe(310) // Default 5 questions, no deep mode
    })
  })

  describe('getCrowdMultiplier', () => {
    it('should return correct multipliers for each energy level', () => {
      expect(getCrowdMultiplier(1)).toBe(0.8)
      expect(getCrowdMultiplier(2)).toBe(0.9)
      expect(getCrowdMultiplier(3)).toBe(1.0)
      expect(getCrowdMultiplier(4)).toBe(1.1)
      expect(getCrowdMultiplier(5)).toBe(1.2)
    })

    it('should return 1.0 for invalid energy levels', () => {
      expect(getCrowdMultiplier(0)).toBe(1.0)
      expect(getCrowdMultiplier(6)).toBe(1.0)
      expect(getCrowdMultiplier(-1)).toBe(1.0)
    })
  })

  describe('formatScore', () => {
    it('should format scores with commas', () => {
      expect(formatScore(1234)).toBe('1,234')
      expect(formatScore(1234567)).toBe('1,234,567')
    })

    it('should handle small scores', () => {
      expect(formatScore(0)).toBe('0')
      expect(formatScore(42)).toBe('42')
      expect(formatScore(999)).toBe('999')
    })

    it('should handle edge cases', () => {
      expect(formatScore(1000)).toBe('1,000')
      expect(formatScore(1000000)).toBe('1,000,000')
    })
  })
})
