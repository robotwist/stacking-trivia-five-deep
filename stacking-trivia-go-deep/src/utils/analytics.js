/**
 * Privacy-light product analytics, sent straight to PostHog's batch API (no SDK).
 *
 * Off unless VITE_POSTHOG_KEY is set. Players are an anonymous random id; we never send
 * names, emails, answers typed, or URL query strings (challenge links carry names).
 *
 * What it answers: which stacks people finish, share, and replay; which levels they miss;
 * whether they come back tomorrow; whether hosts finish their nights.
 */

const DEFAULT_HOST = 'https://us.i.posthog.com'
const ANON_ID_KEY = 'deepstack_anon_id'
const FLUSH_INTERVAL_MS = 5000
const MAX_QUEUE = 200

const config = {
  key: import.meta.env?.VITE_POSTHOG_KEY || '',
  host: (import.meta.env?.VITE_POSTHOG_HOST || DEFAULT_HOST).replace(/\/$/, ''),
}

let queue = []
let flushTimer = null
let listenersAttached = false

const isEnabled = () => {
  if (!config.key || typeof window === 'undefined') return false
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return false
  return true
}

const getAnonymousId = () => {
  try {
    let id = localStorage.getItem(ANON_ID_KEY)
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(ANON_ID_KEY, id)
    }
    return id
  } catch {
    return 'anon-no-storage'
  }
}

const baseProperties = () => ({
  $process_person_profile: false,
  $current_url: `${window.location.origin}${window.location.pathname}`,
  $pathname: window.location.pathname,
  installed: window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true,
  screen: window.innerWidth < 640 ? 'phone' : window.innerWidth < 1100 ? 'tablet' : 'desktop',
})

export const flush = () => {
  if (!queue.length || !isEnabled()) return
  const batch = queue
  queue = []
  try {
    fetch(`${config.host}/batch/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: config.key, batch }),
      keepalive: true,
    }).catch(() => { /* analytics must never break the game */ })
  } catch { /* ignore */ }
}

const attachListeners = () => {
  if (listenersAttached) return
  listenersAttached = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
  window.addEventListener('pagehide', flush)
}

/**
 * @param {string} event  "object verb" style, e.g. "stack finished"
 * @param {Record<string, string | number | boolean | null | undefined>} [properties]
 */
export const track = (event, properties = {}) => {
  if (!isEnabled()) return
  attachListeners()
  queue.push({
    event,
    timestamp: new Date().toISOString(),
    properties: { distinct_id: getAnonymousId(), ...baseProperties(), ...properties },
  })
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE)
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null
      flush()
    }, FLUSH_INTERVAL_MS)
  }
}

/** Test hook: reconfigure without rebuilding. */
export const __setAnalyticsConfig = (next) => {
  Object.assign(config, next)
  queue = []
}
