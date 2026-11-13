import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { submitNetlifyForm, submitWithRetry } from '../netlifyForms'

describe('Netlify form submissions', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  it('posts url-encoded fields with the form name', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    expect(await submitNetlifyForm('host-pass', { email: 'rob@example.com', notes: undefined })).toBe(true)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/')
    expect(init.method).toBe('POST')
    expect(new URLSearchParams(init.body).get('form-name')).toBe('host-pass')
    expect(new URLSearchParams(init.body).get('email')).toBe('rob@example.com')
    expect(new URLSearchParams(init.body).has('notes')).toBe(false)
  })

  it('queues a failed submission and sends it with the next one', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await submitWithRetry('host-pass', { email: 'first@example.com' })).toBe(false)

    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    expect(await submitWithRetry('stack-feedback', { message: 'Typo in level 3' })).toBe(true)

    const sentForms = fetchMock.mock.calls.map(([, init]) => new URLSearchParams(init.body).get('form-name'))
    expect(sentForms).toEqual(['host-pass', 'stack-feedback'])
    expect(JSON.parse(localStorage.getItem('pending_form_submissions'))).toEqual([])
  })

  it('treats a network error as not sent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await submitNetlifyForm('host-pass', { email: 'x@example.com' })).toBe(false)
  })
})
