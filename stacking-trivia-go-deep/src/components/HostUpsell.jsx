import React, { useState } from 'react'

const HostUpsell = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const startCheckout = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/billing/create-checkout-session', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        setError(data.error)
      }
    } catch (e) {
      setError('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-amber-300 dark:border-amber-600 p-6">
        <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-3" style={{ fontFamily: 'Baskervville, serif' }}>Become a Host</h1>
        <p className="text-amber-700 dark:text-amber-300 mb-4">Run unforgettable trivia nights with multi-team scoring, projector modes, and curated deep-dive stacks.</p>
        <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 mb-4">
          <li>Unlimited hosted nights</li>
          <li>Premium stack collections</li>
          <li>Multi-device player join (coming soon)</li>
        </ul>
        {error && <div className="mb-3 text-red-600 dark:text-red-400 text-sm">{error}</div>}
        <button
          onClick={startCheckout}
          disabled={loading}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
        >
          {loading ? 'Starting…' : 'Start Free Trial'}
        </button>
      </div>
    </div>
  )
}

export default HostUpsell


