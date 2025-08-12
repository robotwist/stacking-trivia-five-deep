// User-related client service helpers

const getAuthToken = () => localStorage.getItem('trivia_token') || localStorage.getItem('authToken')

const makeAuthed = async (url, options = {}) => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const persistUserAchievements = async (newAchievements) => {
  return makeAuthed('/api/user/achievements', {
    method: 'POST',
    body: JSON.stringify({ newAchievements })
  })
}

export default { persistUserAchievements }


