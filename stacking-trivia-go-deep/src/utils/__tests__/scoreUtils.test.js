import { describe, it, expect } from 'vitest'
import { 
  calculateQuestionScore, 
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

  describe('calculateMaxScore', () => {
    it('should calculate correct max score for standard 5 questions', () => {
      expect(calculateMaxScore(5, false)).toBe(310) // 10+20+40+80+160
    })

    it('should calculate correct max score with deeper mode', () => {
      expect(calculateMaxScore(5, true)).toBe(560) // 310 + (50*5)
    })

    it('should handle different question counts', () => {
      expect(calculateMaxScore(3, false)).toBe(310) // Still uses base max
      expect(calculateMaxScore(3, true)).toBe(460) // 310 + (50*3)
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
