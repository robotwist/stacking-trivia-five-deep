import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import HostStage from './HostStage'
import {
  getStageChoices,
  createHostNight,
  hostNightReducer,
  levelPoints,
  loadSavedHostNight,
  saveHostNight,
  pickBalancedRounds,
  MAX_ROUNDS,
  MAX_TEAMS,
} from '../../utils/hostNight'
import { HOST_CHANNEL, toPublicNight } from './hostChannel'
import { celebratePerfectScore } from '../../utils/celebrations'
import { track } from '../../utils/analytics'

const RAN_STACKS_KEY = 'deepstack_host_ran_stacks'

const readRanStacks = () => {
  try {
    return JSON.parse(localStorage.getItem(RAN_STACKS_KEY)) || []
  } catch {
    return []
  }
}

const rememberRanStacks = (keys) => {
  try {
    const merged = [...new Set([...readRanStacks(), ...keys])].slice(-200)
    localStorage.setItem(RAN_STACKS_KEY, JSON.stringify(merged))
  } catch { /* best-effort */ }
}

const isTyping = (target) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)

const Toggle = ({ checked, onChange, label, description }) => (
  <label className="flex items-start gap-3 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 accent-amber-500" />
    <span>
      <span className="block font-semibold text-gray-100">{label}</span>
      <span className="block text-sm text-gray-400">{description}</span>
    </span>
  </label>
)

export default function HostNight({ gameStacks, categoriesConfig, availableStackKeys, onExit, onHostPass }) {
  const saved = useMemo(() => loadSavedHostNight(), [])
  const [night, dispatch] = useReducer(hostNightReducer, saved?.phase === 'setup' ? saved : null, (initial) => initial || createHostNight())
  const [resumeOffer, setResumeOffer] = useState(() => (saved && saved.phase !== 'setup' ? saved : null))
  const [teamName, setTeamName] = useState('')
  const [screenConnected, setScreenConnected] = useState(false)
  const [peekAnswer, setPeekAnswer] = useState(false)
  const channelRef = useRef(null)
  const nightRef = useRef(night)

  useEffect(() => {
    nightRef.current = night
    if (!resumeOffer) saveHostNight(night)
    channelRef.current?.postMessage({ type: 'state', night: toPublicNight(night) })
  }, [night, resumeOffer])

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined
    const channel = new BroadcastChannel(HOST_CHANNEL)
    channelRef.current = channel
    channel.onmessage = (event) => {
      if (event.data?.type === 'hello') {
        setScreenConnected(true)
        channel.postMessage({ type: 'state', night: toPublicNight(nightRef.current) })
      } else if (event.data?.type === 'bye') {
        setScreenConnected(false)
      }
    }
    channel.postMessage({ type: 'host-ready' })
    return () => channel.close()
  }, [])

  useEffect(() => {
    if (night.phase !== 'final') return
    celebratePerfectScore()
    track('host night finished', {
      teams: night.teams.length,
      rounds_planned: night.rounds.length,
      rounds_played: new Set(night.log.map((e) => e.roundIndex)).size,
    })
    // Fire once when the night ends
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [night.phase])

  const eligibleTeams = night.settings.diveRule ? night.teams.filter((t) => night.inDive.includes(t.id)) : night.teams

  // Keyboard: Space/Enter advance, 1-9 mark teams, A marks all, U or Backspace undoes
  useEffect(() => {
    const onKey = (e) => {
      if (isTyping(e.target) || resumeOffer) return
      const { phase } = nightRef.current
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (phase === 'question') dispatch({ type: 'REVEAL' })
        else if (phase === 'reveal') dispatch({ type: 'SCORE_LEVEL' })
        else if (phase === 'roundSummary') dispatch({ type: 'NEXT_ROUND' })
      } else if (phase === 'reveal' && /^[1-9]$/.test(e.key)) {
        const team = eligibleTeams[Number(e.key) - 1]
        if (team) dispatch({ type: 'TOGGLE_MARK', teamId: team.id })
      } else if (phase === 'reveal' && e.key.toLowerCase() === 'a') {
        dispatch({ type: 'MARK_ALL' })
      } else if (e.key.toLowerCase() === 'u' || e.key === 'Backspace') {
        if (phase !== 'setup') dispatch({ type: 'UNDO' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [eligibleTeams, resumeOffer])

  const openScreen = () => {
    window.open('/screen', 'deepstack-tv', 'popup,width=1280,height=720')
  }

  const autoPick = (count) => {
    dispatch({
      type: 'SET_ROUNDS',
      rounds: pickBalancedRounds(categoriesConfig, availableStackKeys, { count, exclude: readRanStacks() }),
    })
  }

  const addRound = (key) => {
    if (!key || night.rounds.includes(key) || night.rounds.length >= MAX_ROUNDS) return
    dispatch({ type: 'SET_ROUNDS', rounds: [...night.rounds, key] })
  }

  const removeRound = (key) => dispatch({ type: 'SET_ROUNDS', rounds: night.rounds.filter((k) => k !== key) })

  const moveRound = (index, delta) => {
    const rounds = [...night.rounds]
    const target = index + delta
    if (target < 0 || target >= rounds.length) return
    ;[rounds[index], rounds[target]] = [rounds[target], rounds[index]]
    dispatch({ type: 'SET_ROUNDS', rounds })
  }

  const addTeam = () => {
    dispatch({ type: 'ADD_TEAM', name: teamName })
    setTeamName('')
  }

  const addTables = (count) => {
    for (let i = 1; i <= count; i++) dispatch({ type: 'ADD_TEAM', name: `Table ${night.teams.length + i}` })
  }

  const start = () => {
    rememberRanStacks(night.rounds)
    track('host night started', {
      teams: night.teams.length,
      rounds: night.rounds.length,
      dive_rule: night.settings.diveRule,
      show_choices: night.settings.showChoices,
      tv_screen: screenConnected,
      has_venue: !!night.venue,
    })
    dispatch({ type: 'START' })
  }

  if (resumeOffer) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border-2 border-amber-500/60 bg-gray-900 p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Resume tonight's game?</h1>
          <p className="text-gray-300 mb-6">
            {resumeOffer.venue ? `${resumeOffer.venue}: ` : ''}
            {resumeOffer.teams.length} teams, round {resumeOffer.roundIndex + 1} of {resumeOffer.rounds.length}. Scores were saved automatically.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'LOAD', state: resumeOffer })
                setResumeOffer(null)
              }}
              className="py-3 rounded-lg bg-amber-500 text-gray-900 font-bold"
            >
              Resume where we left off
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'LOAD', state: hostNightReducer(resumeOffer, { type: 'NEW_NIGHT' }) })
                setResumeOffer(null)
              }}
              className="py-3 rounded-lg border border-gray-600 text-gray-200"
            >
              Start a new night with the same teams
            </button>
          </div>
        </div>
      </div>
    )
  }

  const answerKeyVisible = (screenConnected || peekAnswer) && night.phase === 'question'
  const categoriesWithStacks = Object.entries(categoriesConfig.categories)
    .map(([key, c]) => [key, c, c.stacks.filter((k) => availableStackKeys.includes(k) && !night.rounds.includes(k))])
    .filter(([, , stacks]) => stacks.length)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="print:hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="font-bold text-amber-400" style={{ fontFamily: 'Baskervville, serif' }}>Host Night</span>
            <button
              type="button"
              onClick={onHostPass}
              className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
            >
              Founding host · free during beta · Host Pass →
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={openScreen} className="px-3 py-2 rounded-md text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700">
              {screenConnected ? '📺 TV screen connected' : '📺 Open TV screen'}
            </button>
            {night.phase !== 'setup' && (
              <button type="button" onClick={() => dispatch({ type: 'UNDO' })} disabled={!night.undo.length} className="px-3 py-2 rounded-md text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-40">
                ↶ Undo
              </button>
            )}
            {night.phase !== 'setup' && night.phase !== 'final' && (
              <button type="button" onClick={() => window.confirm('End the night and show final results?') && dispatch({ type: 'END_NIGHT' })} className="px-3 py-2 rounded-md text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700">
                End night
              </button>
            )}
            <button type="button" onClick={onExit} className="px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white">
              Exit
            </button>
          </div>
        </header>

        {night.phase === 'setup' ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 grid lg:grid-cols-2 gap-8">
            <section className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Baskervville, serif' }}>Set up tonight's trivia</h1>
                <p className="text-gray-400">Plug your laptop into the TV, add teams, pick the stories, and go. Teams answer on paper or out loud; you tap who got it right.</p>
              </div>

              <div>
                <label htmlFor="venue" className="block text-sm font-semibold text-gray-300 mb-1">Venue or event name (shown on the TV)</label>
                <input
                  id="venue"
                  value={night.venue}
                  onChange={(e) => dispatch({ type: 'SET_VENUE', venue: e.target.value })}
                  placeholder="The Rusty Anchor"
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="team-name" className="block text-sm font-semibold text-gray-300 mb-1">
                  Teams ({night.teams.length}/{MAX_TEAMS})
                </label>
                <div className="flex gap-2">
                  <input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTeam()}
                    placeholder="Team name, then Enter"
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-amber-500 outline-none"
                  />
                  <button type="button" onClick={addTeam} className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700">Add</button>
                </div>
                <div className="flex gap-2 mt-2 text-sm">
                  <span className="text-gray-500">Quick add:</span>
                  {[4, 6, 8].map((n) => (
                    <button key={n} type="button" onClick={() => addTables(n)} className="text-amber-300 hover:underline">{n} tables</button>
                  ))}
                </div>
                {night.teams.length > 0 && (
                  <ul className="flex flex-wrap gap-2 mt-3">
                    {night.teams.map((t) => (
                      <li key={t.id} className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full bg-gray-800 border border-gray-700">
                        {t.name}
                        <button type="button" aria-label={`Remove ${t.name}`} onClick={() => dispatch({ type: 'REMOVE_TEAM', id: t.id })} className="w-6 h-6 rounded-full hover:bg-gray-700 text-gray-400">×</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-4 rounded-lg border border-gray-800 p-4">
                <Toggle
                  checked={night.settings.diveRule}
                  onChange={(value) => dispatch({ type: 'SET_SETTING', key: 'diveRule', value })}
                  label="Dive rule"
                  description="Miss a level and your team sits out the rest of that story. Big late swings, the way DeepStack is meant to play."
                />
                <Toggle
                  checked={night.settings.showChoices}
                  onChange={(value) => dispatch({ type: 'SET_SETTING', key: 'showChoices', value })}
                  label="Show four choices on the TV"
                  description="Easier, faster rounds for casual crowds, families, and classrooms."
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold">Rounds ({night.rounds.length}/{MAX_ROUNDS})</h2>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-500">Pick for me:</span>
                  {[3, 4, 6].map((n) => (
                    <button key={n} type="button" onClick={() => autoPick(n)} className="text-amber-300 hover:underline">{n} rounds</button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-400">Each round is one five-question story worth up to {[0, 1, 2, 3, 4].reduce((s, l) => s + levelPoints(l), 0)} points. About 8 minutes per round.</p>

              {night.rounds.length > 0 ? (
                <ol className="space-y-2">
                  {night.rounds.map((key, index) => (
                    <li key={key} className="flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
                      <span className="font-mono text-amber-400 w-6">{index + 1}</span>
                      <span className="flex-1">
                        <span className="block font-semibold">{gameStacks[key]?.title}</span>
                        <span className="block text-xs text-gray-500">{gameStacks[key]?.description}</span>
                      </span>
                      <button type="button" aria-label="Move up" onClick={() => moveRound(index, -1)} className="px-2 text-gray-400 hover:text-white">↑</button>
                      <button type="button" aria-label="Move down" onClick={() => moveRound(index, 1)} className="px-2 text-gray-400 hover:text-white">↓</button>
                      <button type="button" aria-label={`Remove ${gameStacks[key]?.title}`} onClick={() => removeRound(key)} className="px-2 text-gray-400 hover:text-red-400">×</button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="p-4 rounded-lg border border-dashed border-gray-700 text-gray-400">No rounds yet. Tap “Pick for me” or add stories below.</p>
              )}

              <label htmlFor="add-round" className="sr-only">Add a round</label>
              <select
                id="add-round"
                value=""
                onChange={(e) => addRound(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
              >
                <option value="">+ Add a specific story…</option>
                {categoriesWithStacks.map(([key, category, stacks]) => (
                  <optgroup key={key} label={category.title}>
                    {stacks.map((k) => <option key={k} value={k}>{gameStacks[k].title}</option>)}
                  </optgroup>
                ))}
              </select>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={start}
                  disabled={night.teams.length < 1 || night.rounds.length < 1}
                  className="flex-1 px-6 py-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-900 text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Start trivia night
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={!night.rounds.length}
                  className="px-4 py-4 rounded-lg border border-gray-700 text-gray-200 disabled:opacity-40"
                >
                  Print answer key
                </button>
              </div>
              {(night.teams.length < 1 || night.rounds.length < 1) && (
                <p className="text-sm text-gray-500">Add at least one team and one round to start.</p>
              )}
            </section>
          </div>
        ) : (
          <>
            <HostStage night={night} gameStacks={gameStacks} showAnswerKey={answerKeyVisible} />

            <div className="sticky bottom-0 border-t border-gray-800 bg-gray-950/95 backdrop-blur px-4 sm:px-8 py-4">
              {night.phase === 'question' && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button type="button" onClick={() => dispatch({ type: 'REVEAL' })} className="px-8 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-900 text-lg font-bold">
                    Reveal answer <kbd className="ml-2 text-xs opacity-70">Space</kbd>
                  </button>
                  {!screenConnected && (
                    <button
                      type="button"
                      onPointerDown={() => setPeekAnswer(true)}
                      onPointerUp={() => setPeekAnswer(false)}
                      onPointerLeave={() => setPeekAnswer(false)}
                      className="px-4 py-3 rounded-lg border border-gray-700 text-gray-300 text-sm"
                    >
                      Hold to peek at answer
                    </button>
                  )}
                </div>
              )}

              {night.phase === 'reveal' && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-400">
                    Who got it? Tap teams (or press 1–9, A for all), then score. Worth {levelPoints(night.level)} points.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {eligibleTeams.map((team, i) => {
                      const marked = night.marked.includes(team.id)
                      return (
                        <button
                          key={team.id}
                          type="button"
                          aria-pressed={marked}
                          onClick={() => dispatch({ type: 'TOGGLE_MARK', teamId: team.id })}
                          className={`px-4 py-2 rounded-full border-2 font-semibold ${
                            marked ? 'bg-green-600 border-green-400 text-white' : 'bg-gray-900 border-gray-700 text-gray-200 hover:border-gray-500'
                          }`}
                        >
                          {i < 9 && <span className="mr-2 font-mono text-xs opacity-60">{i + 1}</span>}
                          {marked ? '✓ ' : ''}{team.name}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => dispatch({ type: 'MARK_ALL' })} className="px-4 py-2 rounded-lg border border-gray-700 text-sm">
                      {night.marked.length === eligibleTeams.length ? 'Clear all' : 'Everyone got it'}
                    </button>
                    <button type="button" onClick={() => dispatch({ type: 'SCORE_LEVEL' })} className="px-8 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-900 text-lg font-bold">
                      {night.marked.length
                        ? `Award ${levelPoints(night.level)} to ${night.marked.length} team${night.marked.length === 1 ? '' : 's'}`
                        : 'Nobody got it'}
                      <kbd className="ml-2 text-xs opacity-70">Enter</kbd>
                    </button>
                  </div>
                </div>
              )}

              {night.phase === 'roundSummary' && (
                <div className="flex justify-center">
                  <button type="button" onClick={() => dispatch({ type: 'NEXT_ROUND' })} className="px-8 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-900 text-lg font-bold">
                    {night.roundIndex + 1 >= night.rounds.length ? 'Show final results' : `Start round ${night.roundIndex + 2}`}
                    <kbd className="ml-2 text-xs opacity-70">Space</kbd>
                  </button>
                </div>
              )}

              {night.phase === 'final' && (
                <div className="flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => dispatch({ type: 'NEW_NIGHT' })} className="px-6 py-3 rounded-lg bg-amber-500 text-gray-900 font-bold">
                    New night, same teams
                  </button>
                  <button type="button" onClick={onExit} className="px-6 py-3 rounded-lg border border-gray-700">
                    Exit
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Printed answer key for the host's clipboard */}
      <section className="hidden print:block text-black bg-white p-8">
        <h1 className="text-2xl font-bold mb-1">{night.venue || 'Deeply Trivial'} — Answer key</h1>
        <p className="mb-6 text-sm">Points per level: 10 · 20 · 40 · 80 · 160</p>
        {night.rounds.map((key, index) => {
          const roundStack = gameStacks[key]
          return (
            <div key={key} className="mb-6 break-inside-avoid">
              <h2 className="text-lg font-bold border-b border-black mb-2">Round {index + 1}: {roundStack?.title}</h2>
              <ol className="list-decimal pl-6 space-y-2">
                {roundStack?.questions.map((q) => (
                  <li key={q.question}>
                    <span>{q.question}</span>
                    <br />
                    <strong>{q.answer}</strong>
                    {night.settings.showChoices && q.choices && (
                      <span className="text-sm"> — choices shown: {getStageChoices(q).join(' / ')}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
      </section>
    </div>
  )
}
