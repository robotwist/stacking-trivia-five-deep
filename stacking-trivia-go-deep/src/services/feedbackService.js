// Feedback submission service

export const submitFeedback = async ({ stackTitle, rating, category, message, difficultyTag }) => {
  try {
    const token = localStorage.getItem('trivia_token')
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ stackTitle, rating, category, message, difficultyTag })
    })
    if (!res.ok) throw new Error('Feedback submit failed')
    return { ok: true }
  } catch (e) {
    // Fallback: store locally for later sync
    try {
      const pending = JSON.parse(localStorage.getItem('pending_feedback') || '[]')
      pending.push({ stackTitle, rating, category, message, difficultyTag, createdAt: Date.now() })
      localStorage.setItem('pending_feedback', JSON.stringify(pending))
    } catch {}
    return { ok: false, error: e.message }
  }
}


