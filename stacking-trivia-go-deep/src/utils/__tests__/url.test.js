import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildPlayUrl, getSiteOrigin } from '../url'

describe('play deep links', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: { origin: 'https://stacking-trivia-five-deep.netlify.app' },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('buildPlayUrl includes stack and optional category', () => {
    expect(buildPlayUrl('queso-wars', 'actually')).toBe(
      'https://stacking-trivia-five-deep.netlify.app/play?stack=queso-wars&category=actually'
    )
    expect(buildPlayUrl('serena-williams')).toBe(
      'https://stacking-trivia-five-deep.netlify.app/play?stack=serena-williams'
    )
  })

  it('getSiteOrigin prefers window.location', () => {
    expect(getSiteOrigin()).toBe('https://stacking-trivia-five-deep.netlify.app')
  })
})
