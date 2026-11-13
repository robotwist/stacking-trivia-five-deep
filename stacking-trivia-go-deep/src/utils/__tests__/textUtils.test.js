import { describe, it, expect } from 'vitest'
import { checkAnswerMatch, normalizeAnswer, calculateSimilarity } from '../textUtils'

describe('normalizeAnswer', () => {
  it('strips articles and punctuation', () => {
    expect(normalizeAnswer('The Red Vineyard')).toBe('red vineyard')
  })

  it('normalizes number words', () => {
    expect(normalizeAnswer('four hundred francs')).toBe('400 francs')
  })
})

describe('checkAnswerMatch', () => {
  const vanGoghAnswers = ['vincent van gogh', 'van gogh', 'vincent']

  it('accepts exact match', () => {
    expect(checkAnswerMatch('Vincent van Gogh', vanGoghAnswers)).toBe(true)
  })

  it('accepts common misspellings for long names', () => {
    expect(checkAnswerMatch('vangogh', ['vincent van gogh', 'vangogh'])).toBe(true)
  })

  it('accepts anna boch with typo', () => {
    expect(checkAnswerMatch('anna boch', ['anna boch', 'boch'])).toBe(true)
  })

  it('accepts red vinyard typo', () => {
    expect(checkAnswerMatch('red vinyard', ['the red vineyard', 'red vineyard', 'red vinyard'])).toBe(true)
  })

  it('accepts numeric variants', () => {
    expect(checkAnswerMatch('400', ['400 francs', '400', 'four hundred francs'])).toBe(true)
    expect(checkAnswerMatch('four hundred francs', ['400 francs', '400', 'four hundred francs'])).toBe(true)
  })

  it('rejects clearly wrong answers', () => {
    expect(checkAnswerMatch('picasso', vanGoghAnswers)).toBe(false)
  })

  it('requires near-exact match for very short answers', () => {
    expect(checkAnswerMatch('on', ['one', '1'])).toBe(false)
    expect(checkAnswerMatch('one', ['one', '1'])).toBe(true)
  })

  it('rejects single letters that happen to appear in a short answer', () => {
    expect(checkAnswerMatch('a', ['arles'])).toBe(false)
    expect(checkAnswerMatch('r', ['rotel', 'rotel tomatoes'])).toBe(false)
  })

  it('ignores accents in either direction', () => {
    expect(checkAnswerMatch('Yucatan', ['yucatán'])).toBe(true)
    expect(checkAnswerMatch('Félix Rey', ['felix rey'])).toBe(true)
  })

  it('accepts the answer inside a short natural phrase', () => {
    expect(checkAnswerMatch('only one painting', ['one'])).toBe(true)
    expect(checkAnswerMatch('it was the red vineyard', ['red vineyard'])).toBe(true)
  })

  it('forgives swapped adjacent letters', () => {
    expect(checkAnswerMatch('aristotel', ['aristotle'])).toBe(true)
    expect(checkAnswerMatch('bucephlaus', ['bucephalus'])).toBe(true)
  })

  it('still rejects a different name of similar length', () => {
    expect(checkAnswerMatch('socrates', ['aristotle'])).toBe(false)
    expect(checkAnswerMatch('herodotus', ['aristotle'])).toBe(false)
  })

  it('rejects shotgun lists of guesses', () => {
    expect(checkAnswerMatch('monet manet degas renoir cezanne arles', ['arles'])).toBe(false)
  })
})

describe('calculateSimilarity', () => {
  it('returns high similarity for minor typos', () => {
    expect(calculateSimilarity('anna boch', 'anna boch')).toBe(1)
    expect(calculateSimilarity('anna boch', 'anna bock')).toBeGreaterThan(0.85)
  })
})
