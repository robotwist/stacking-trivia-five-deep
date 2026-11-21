import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { track, flush, __setAnalyticsConfig } from '../analytics'

describe('analytics', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    __setAnalyticsConfig({ key: '' })
  })

  it('does nothing without a PostHog key', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    __setAnalyticsConfig({ key: '' })
    track('stack finished', { stack: 'queso-wars' })
    flush()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('batches events with an anonymous id and no query string', () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    __setAnalyticsConfig({ key: 'phc_test', host: 'https://us.i.posthog.com' })

    track('stack started', { stack: 'queso-wars', source: 'daily' })
    track('level answered', { stack: 'queso-wars', level: 1, correct: true })
    vi.advanceTimersByTime(5000)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://us.i.posthog.com/batch/')
    const body = JSON.parse(init.body)
    expect(body.api_key).toBe('phc_test')
    expect(body.batch.map((e) => e.event)).toEqual(['stack started', 'level answered'])

    const props = body.batch[0].properties
    expect(props.distinct_id).toBe(localStorage.getItem('deepstack_anon_id'))
    expect(props.$process_person_profile).toBe(false)
    expect(props.$current_url).not.toContain('?')
  })

  it('never throws if the network fails', () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    __setAnalyticsConfig({ key: 'phc_test' })
    expect(() => {
      track('stack finished')
      flush()
    }).not.toThrow()
  })
})
