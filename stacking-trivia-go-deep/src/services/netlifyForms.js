/**
 * Submit to a Netlify Form declared in index.html. Submissions land in the Netlify dashboard
 * (Forms tab) and can email the owner. No backend or sign-in needed.
 *
 * @param {string} formName
 * @param {Record<string, string | number | undefined | null>} fields
 * @returns {Promise<boolean>} true only when Netlify accepted the submission
 */
export const submitNetlifyForm = async (formName, fields) => {
  const body = new URLSearchParams({ 'form-name': formName })
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.append(key, String(value))
  })
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    return res.ok
  } catch {
    return false
  }
}

const PENDING_KEY = 'pending_form_submissions'

/** Keep anything that couldn't be sent (offline, local dev) and retry on the next submission. */
export const submitWithRetry = async (formName, fields) => {
  let pending = []
  try {
    pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]')
  } catch { /* ignore corrupt queue */ }

  const queue = [...pending, { formName, fields }]
  const stillPending = []
  for (const item of queue) {
    if (!(await submitNetlifyForm(item.formName, item.fields))) stillPending.push(item)
  }
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(stillPending.slice(-50)))
  } catch { /* best-effort */ }

  return !stillPending.some((item) => item.formName === formName && item.fields === fields)
}
