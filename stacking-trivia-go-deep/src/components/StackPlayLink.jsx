import { useState } from 'react'
import { buildPlayUrl, copyPlayLink } from '../utils/url'

/**
 * Copy a /play deep link for hosts (bar mode, group text, projector setup).
 */
export default function StackPlayLink({ stackKey, categoryKey, className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const ok = await copyPlayLink(stackKey, categoryKey)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={buildPlayUrl(stackKey, categoryKey)}
      className={
        className ||
        'text-xs font-medium text-amber-700 hover:text-amber-900 underline-offset-2 hover:underline'
      }
    >
      {copied ? 'Link copied' : 'Copy play link'}
    </button>
  )
}
