// Feedback and error reports go to the "stack-feedback" Netlify Form, so guests can report too
import { submitWithRetry } from './netlifyForms'

export const submitFeedback = async ({ stackTitle, rating, category, message, difficultyTag }) => {
  const ok = await submitWithRetry('stack-feedback', { stackTitle, rating, category, message, difficultyTag })
  return ok ? { ok: true } : { ok: false, error: 'Saved on this device; will send when online' }
}
