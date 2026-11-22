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
      'https://stacking-trivia-five-deep.netlify.app/s/queso-wars?category=actually'
    )
    expect(buildPlayUrl('serena-williams')).toBe(
      'https://stacking-trivia-five-deep.netlify.app/s/serena-williams'
    )
  })

  it('getSiteOrigin prefers window.location', () => {
    expect(getSiteOrigin()).toBe('https://stacking-trivia-five-deep.netlify.app')
  })

  it('round-trips a challenge through the play link', () => {
    const link = buildChallengeUrl('queso-wars', 'actually', { score: 150, code: 'gggyr', name: 'Rob' })
    vi.stubGlobal('window', { location: { origin: 'https://stacking-trivia-five-deep.netlify.app', href: link } })
    expect(link).toBe('https://stacking-trivia-five-deep.netlify.app/s/queso-wars?category=actually&vs=150&r=gggyr&n=Rob')
    expect(parsePlayParams()).toEqual({
      stack: undefined,
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
