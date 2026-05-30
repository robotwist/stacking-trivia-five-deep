const DEFAULT_SITE_URL = 'https://stacking-trivia-five-deep.netlify.app'

export const getSiteOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL
}

export const parsePlayParams = () => {
  try {
    const url = new URL(window.location.href)
    const stack = url.searchParams.get('stack') || undefined
    const category = url.searchParams.get('category') || undefined
    return { stack, category }
  } catch {
    return {}
  }
}

/** Shareable /play URL for bar hosts and post-game invites */
export const buildPlayUrl = (stackKey: string, categoryKey?: string) => {
  const origin = getSiteOrigin()
  const params = new URLSearchParams({ stack: stackKey })
  if (categoryKey) params.set('category', categoryKey)
  return `${origin}/play?${params.toString()}`
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
