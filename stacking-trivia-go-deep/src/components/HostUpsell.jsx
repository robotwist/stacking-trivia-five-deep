import { useState } from 'react'
import { submitWithRetry } from '../services/netlifyForms'

const FREE_NOW = [
  'Host Night: questions on the TV, tap-to-score teams, the dive rule',
  'A separate TV screen, with the answer key on your laptop only',
  'Your venue name on screen, printable answer key',
  'Survives a refresh or a dead laptop battery mid-night',
  'All 45 fact-checked stories, with four-choice mode for casual crowds',
]

const COMING_WITH_PASS = [
  'Fresh stories every week, including a monthly exclusive pack for venues',
  'Custom rounds: write your own stories or local trivia, checked by our tools',
  'Your logo and colors on the TV, and a no-branding option',
  'Season leaderboards that follow your regulars from week to week',
  'Players answer from their phones (no paper, no pens)',
]

const HOST_TYPES = ['Bar or restaurant', 'School or classroom', 'Company or events', 'Library or community group', 'Family and friends']

export default function HostUpsell({ onBack }) {
  const [form, setForm] = useState({ email: '', organization: '', hostType: HOST_TYPES[0], nightsPerMonth: '', notes: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | queued

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email.includes('@')) return
    setStatus('sending')
    const ok = await submitWithRetry('host-pass', form)
    setStatus(ok ? 'sent' : 'queued')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <button type="button" onClick={onBack} className="mb-6 text-sm text-gray-400 hover:text-white">← Back</button>
        )}
        <p className="text-xs uppercase tracking-[0.3em] text-amber-400 mb-2">Host Pass</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Baskervville, serif' }}>
          Run the trivia night people come back for
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mb-10">
          Every round is one story told in five questions, and points double as the story goes deeper. Teams that miss sit out the rest of the story, so the lead changes hands late and nobody checks their phone.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-xl font-bold mb-1">Free for founding hosts</h2>
            <p className="text-sm text-gray-400 mb-4">Everything you need to run a night, today</p>
            <ul className="space-y-2">
              {FREE_NOW.map((item) => <li key={item} className="flex gap-2"><span className="text-green-400">✓</span>{item}</li>)}
            </ul>
          </section>
          <section className="rounded-xl border-2 border-amber-500/60 bg-gradient-to-br from-amber-900/30 to-gray-900 p-6">
            <h2 className="text-xl font-bold mb-1">Coming with Host Pass</h2>
            <p className="text-sm text-gray-400 mb-4">Founding hosts on the list get first access and founding pricing</p>
            <ul className="space-y-2">
              {COMING_WITH_PASS.map((item) => <li key={item} className="flex gap-2"><span className="text-amber-400">★</span>{item}</li>)}
            </ul>
          </section>
        </div>

        <section className="rounded-xl border border-gray-800 bg-gray-900 p-6 max-w-2xl">
          {status === 'sent' || status === 'queued' ? (
            <div role="status">
              <h2 className="text-2xl font-bold mb-2">You're on the founding host list</h2>
              <p className="text-gray-300">
                {status === 'sent'
                  ? "We'll email you before Host Pass opens. In the meantime, run a night and tell us what your crowd thought."
                  : "You're offline, so we saved this on your device and will send it the next time you're connected."}
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <h2 className="text-2xl font-bold">Become a founding host</h2>
              <label className="grid gap-1">
                <span className="text-sm text-gray-300">Email</span>
                <input required type="email" value={form.email} onChange={update('email')} autoComplete="email" className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 focus:border-amber-500 outline-none" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-300">Venue or organization (optional)</span>
                <input value={form.organization} onChange={update('organization')} autoComplete="organization" className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 focus:border-amber-500 outline-none" />
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm text-gray-300">Where do you host?</span>
                  <select value={form.hostType} onChange={update('hostType')} className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700">
                    {HOST_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-sm text-gray-300">Trivia nights per month</span>
                  <input inputMode="numeric" value={form.nightsPerMonth} onChange={update('nightsPerMonth')} placeholder="4" className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 focus:border-amber-500 outline-none" />
                </label>
              </div>
              <label className="grid gap-1">
                <span className="text-sm text-gray-300">What would make this a must-have for you? (optional)</span>
                <textarea value={form.notes} onChange={update('notes')} rows={3} className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 focus:border-amber-500 outline-none" />
              </label>
              <button type="submit" disabled={status === 'sending'} className="py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold disabled:opacity-60">
                {status === 'sending' ? 'Joining…' : 'Join the founding host list'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
