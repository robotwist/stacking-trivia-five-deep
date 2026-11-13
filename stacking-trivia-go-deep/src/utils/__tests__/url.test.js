import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildPlayUrl, buildChallengeUrl, getSiteOrigin, parsePlayParams } from '../url'

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

  it('round-trips a challenge through the play link', () => {
    const link = buildChallengeUrl('queso-wars', 'actually', { score: 150, code: 'gggyr', name: 'Rob' })
    vi.stubGlobal('window', { location: { origin: 'https://stacking-trivia-five-deep.netlify.app', href: link } })
    expect(parsePlayParams()).toEqual({
      stack: 'queso-wars',
      category: 'actually',
      challenge: { score: 150, code: 'gggyr', name: 'Rob' },
    })
  })

  it('ignores a malformed challenge', () => {
    vi.stubGlobal('window', {
      location: { href: 'https://x.app/play?stack=queso-wars&vs=lots&r=<script>' },
    })
    expect(parsePlayParams().challenge).toBeUndefined()
  })
})
