const DEFAULT_SITE_URL = 'https://stacking-trivia-five-deep.netlify.app'

export const getSiteOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL
}

export type Challenge = { score: number; code?: string; name?: string }

const MAX_NAME_LENGTH = 24

export const parsePlayParams = (): { stack?: string; category?: string; challenge?: Challenge } => {
  try {
    const url = new URL(window.location.href)
    const stack = url.searchParams.get('stack') || undefined
    const category = url.searchParams.get('category') || undefined
    const vs = Number(url.searchParams.get('vs'))
    const code = (url.searchParams.get('r') || '').replace(/[^gyrw]/g, '').slice(0, 10) || undefined
    const name = (url.searchParams.get('n') || '').trim().slice(0, MAX_NAME_LENGTH) || undefined
    const challenge = Number.isFinite(vs) && vs >= 0 && url.searchParams.has('vs')
      ? { score: Math.round(vs), code, name }
      : undefined
    return { stack, category, challenge }
  } catch {
    return {}
  }
}

/** A /play link that also carries the sender's result, so the friend sees what to beat. */
export const buildChallengeUrl = (stackKey: string, categoryKey: string | undefined, challenge: Challenge) => {
  const url = new URL(buildPlayUrl(stackKey, categoryKey))
  url.searchParams.set('vs', String(challenge.score))
  if (challenge.code) url.searchParams.set('r', challenge.code)
  if (challenge.name) url.searchParams.set('n', challenge.name.slice(0, MAX_NAME_LENGTH))
  return url.toString()
}

/**
 * Shareable link to one stack. /s/<key> is a static page with that stack's preview card,
 * so the link looks good in iMessage, WhatsApp, and social feeds.
 */
export const buildPlayUrl = (stackKey: string, categoryKey?: string) => {
  const origin = getSiteOrigin()
  const query = categoryKey ? `?${new URLSearchParams({ category: categoryKey }).toString()}` : ''
  return `${origin}/s/${encodeURIComponent(stackKey)}${query}`
}

export const copyPlayLink = async (
  stackKey: string,
  categoryKey?: string
): Promise<boolean> => {
  const url = buildPlayUrl(stackKey, categoryKey)
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = url
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textArea)
    return ok
  }
}
