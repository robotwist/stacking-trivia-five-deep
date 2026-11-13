import { getStandings, getRoundPoints, levelPoints, getStageChoices } from '../../utils/hostNight'
import { getLevelLabel } from '../../utils/normalizeStack'

const LETTERS = ['A', 'B', 'C', 'D']

const Ladder = ({ level }) => (
  <ol className="flex gap-2" aria-label="Level points">
    {[0, 1, 2, 3, 4].map((i) => (
      <li
        key={i}
        className={`px-2 sm:px-3 py-1 rounded-full text-sm sm:text-base font-mono ${
          i === level ? 'bg-amber-400 text-gray-900 font-bold'
            : i < level ? 'bg-amber-900/60 text-amber-300'
              : 'bg-gray-800 text-gray-500'
        }`}
      >
        {levelPoints(i)}
      </li>
    ))}
  </ol>
)

const Standings = ({ night, highlightRound = null, limit = 12 }) => {
  const standings = getStandings(night).slice(0, limit)
  const roundPoints = highlightRound !== null ? getRoundPoints(night, highlightRound) : null
  return (
    <ol className="w-full max-w-3xl mx-auto space-y-2">
      {standings.map((team) => (
        <li
          key={team.id}
          className={`flex items-center justify-between px-5 py-3 rounded-lg text-xl sm:text-2xl ${
            team.place === 1 ? 'bg-amber-500/25 border-2 border-amber-400' : 'bg-gray-800/80 border border-gray-700'
          }`}
        >
          <span className="flex items-center gap-4">
            <span className="w-10 text-right font-mono text-amber-300">{team.place}</span>
            <span className="font-semibold">{team.name}</span>
          </span>
          <span className="flex items-baseline gap-3">
            {roundPoints && roundPoints[team.id] > 0 && (
              <span className="text-base text-green-400">+{roundPoints[team.id]}</span>
            )}
            <span className="font-bold tabular-nums">{team.score}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

/**
 * The big-screen view of a Host Night. `showAnswerKey` is only ever true on the host's own
 * laptop when a separate TV window is connected.
 */
export default function HostStage({ night, gameStacks, showAnswerKey = false }) {
  const stackKey = night.rounds[night.roundIndex]
  const stack = stackKey ? gameStacks[stackKey] : null
  const question = stack?.questions[night.level]
  const venue = night.venue || 'Deeply Trivial'
  const teamName = (id) => night.teams.find((t) => t.id === id)?.name || ''

  if (night.phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-8 py-12 px-6 min-h-[70vh]">
        <p className="uppercase tracking-[0.3em] text-amber-400 text-sm sm:text-base">Tonight at</p>
        <h1 className="text-5xl sm:text-7xl font-bold text-amber-100" style={{ fontFamily: 'Baskervville, serif' }}>{venue}</h1>
        <p className="text-2xl sm:text-3xl text-gray-300 max-w-3xl">
          Five questions. One story. Points double every level—and if your team misses, you sit out the rest of the story.
        </p>
        {night.teams.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-3 max-w-4xl">
            {night.teams.map((t) => (
              <li key={t.id} className="px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-xl">{t.name}</li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  if (night.phase === 'final') {
    const standings = getStandings(night)
    const winners = standings.filter((s) => s.place === 1)
    return (
      <div className="flex flex-col items-center text-center gap-8 py-10 px-6">
        <p className="uppercase tracking-[0.3em] text-amber-400">{venue} · Final results</p>
        <h1 className="text-5xl sm:text-7xl font-bold text-amber-200" style={{ fontFamily: 'Baskervville, serif' }}>
          {winners.length > 1 ? 'A tie at the top!' : `${winners[0]?.name || 'Nobody'} wins!`}
        </h1>
        <Standings night={night} />
      </div>
    )
  }

  if (night.phase === 'roundSummary') {
    const lastEntry = night.log[night.log.length - 1]
    return (
      <div className="flex flex-col items-center text-center gap-6 py-10 px-6">
        <p className="uppercase tracking-[0.3em] text-amber-400">
          Round {night.roundIndex + 1} of {night.rounds.length} complete
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-amber-100" style={{ fontFamily: 'Baskervville, serif' }}>{stack?.title}</h1>
        {lastEntry && night.settings.diveRule && lastEntry.correct.length > 0 && night.level >= 4 && (
          <p className="text-2xl text-green-300">
            Went all the way down: {lastEntry.correct.map(teamName).join(', ')}
          </p>
        )}
        <Standings night={night} highlightRound={night.roundIndex} />
      </div>
    )
  }

  if (!question) return null

  const choices = night.settings.showChoices ? getStageChoices(question) : []
  const revealed = night.phase === 'reveal'
  const diving = night.settings.diveRule ? night.inDive : night.teams.map((t) => t.id)
  const sittingOut = night.teams.filter((t) => !diving.includes(t.id))

  return (
    <div className="flex flex-col gap-6 sm:gap-8 py-6 sm:py-10 px-4 sm:px-10 min-h-[70vh]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="uppercase tracking-[0.25em] text-amber-400 text-sm">
            {venue} · Round {night.roundIndex + 1} of {night.rounds.length}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-amber-100" style={{ fontFamily: 'Baskervville, serif' }}>{stack.title}</h2>
        </div>
        <Ladder level={night.level} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center gap-8">
        <p className="text-lg sm:text-2xl text-amber-300">
          Level {night.level + 1} · {getLevelLabel(night.level + 1)} · {levelPoints(night.level)} points
        </p>
        <h1
          className={`font-bold text-white leading-tight max-w-5xl ${revealed ? 'text-2xl sm:text-4xl opacity-80' : 'text-3xl sm:text-5xl lg:text-6xl'}`}
          style={{ fontFamily: 'Baskervville, serif' }}
        >
          {question.question}
        </h1>

        {choices.length > 0 && (
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
            {choices.map((choice, i) => {
              const isAnswer = revealed && choice === question.answer
              return (
                <li
                  key={choice}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-xl sm:text-3xl text-left border-2 ${
                    isAnswer ? 'bg-green-700/40 border-green-400 text-green-50'
                      : revealed ? 'bg-gray-900 border-gray-800 text-gray-500'
                        : 'bg-gray-800/80 border-gray-700 text-gray-100'
                  }`}
                >
                  <span className="font-mono text-amber-400">{LETTERS[i]}</span>
                  <span>{choice}</span>
                </li>
              )
            })}
          </ol>
        )}

        {revealed && (
          <div className="max-w-4xl">
            <p className="text-4xl sm:text-6xl font-bold text-amber-300" style={{ fontFamily: 'Baskervville, serif' }}>{question.answer}</p>
            {question.explanation && (
              <p className="mt-4 text-xl sm:text-2xl italic text-gray-200 leading-relaxed">{question.explanation}</p>
            )}
          </div>
        )}

        {showAnswerKey && !revealed && (
          <p className="text-base text-amber-200/80 border border-dashed border-amber-700 rounded px-3 py-1">
            Answer key (only on your screen): <strong>{question.answer}</strong>
          </p>
        )}
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-3 text-lg">
        <span className="text-gray-400">{night.settings.diveRule ? 'Still diving:' : 'Playing:'}</span>
        {diving.map((id) => (
          <span key={id} className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-100">{teamName(id)}</span>
        ))}
        {sittingOut.length > 0 && (
          <span className="text-gray-600 line-through">{sittingOut.map((t) => t.name).join(', ')}</span>
        )}
      </footer>
    </div>
  )
}
