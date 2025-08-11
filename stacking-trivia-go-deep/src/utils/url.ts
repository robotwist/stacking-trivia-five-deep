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


