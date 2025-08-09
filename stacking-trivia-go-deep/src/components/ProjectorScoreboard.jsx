import { useState, useEffect } from 'react'

const ProjectorScoreboard = ({ 
  teams = [], 
  currentRound = 'Game',
  gamePhase = 'playing', // playing, round-complete, final-results
  lastAction = null,
  performanceScores = {},
  darkMode = false 
}) => {
  const [displayMode, setDisplayMode] = useState('scores') // scores, leaderboard, celebration
  const [animationClass, setAnimationClass] = useState('')

  // Calculate total scores including performance finale
  const calculateTotalScore = (team) => {
    const gameScore = team.score || 0
    const performanceScore = performanceScores[team.id] || 0
    return gameScore + (performanceScore * 10) // Performance finale worth 10x multiplier
  }

  // Sort teams by total score for leaderboard
  const sortedTeams = [...teams].sort((a, b) => calculateTotalScore(b) - calculateTotalScore(a))

  useEffect(() => {
    if (lastAction) {
      setAnimationClass('animate-pulse-slow')
      const timer = setTimeout(() => setAnimationClass(''), 2000)
      return () => clearTimeout(timer)
    }
  }, [lastAction])

  const ScoreCard = ({ team, rank = null, showPerformance = false }) => (
    <div className={`p-6 rounded-sm shadow-2xl transition-all duration-500 ${animationClass} bg-amber-100/80 border-2 border-amber-300`}>
      <div className="flex justify-between items-center">
        <div>
          {rank && (
            <div className="text-4xl font-bold mb-2 text-amber-700">
              #{rank}
            </div>
          )}
          <h3 className="text-3xl font-bold mb-2">{team.name}</h3>
          {showPerformance && performanceScores[team.id] && (
            <div className="text-lg text-amber-600">
              Performance: {performanceScores[team.id]}/30
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-6xl font-bold text-amber-700">
            {calculateTotalScore(team)}
          </div>
          <div className="text-lg text-amber-600">points</div>
        </div>
      </div>
    </div>
  )

  if (displayMode === 'celebration' && gamePhase === 'final-results') {
    const winner = sortedTeams[0]
    
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300 bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900" style={{ fontFamily: 'Baskerville, serif' }}>
        <div className="text-center">
          <h1 className="text-8xl font-bold mb-4 animate-pulse text-amber-800 drop-shadow-lg">
            {winner.name}
          </h1>
          <h2 className="text-5xl mb-8">GOES THE DEEPEST!</h2>
          <div className="text-4xl font-bold">
            Final Score: {calculateTotalScore(winner)}
          </div>
          
          <div className="mt-12">
            <button
              onClick={() => setDisplayMode('leaderboard')}
              className="px-8 py-4 text-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-sm sepia filter"
            >
              Show Final Standings
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (displayMode === 'leaderboard') {
    return (
      <div className="min-h-screen transition-colors duration-300 p-8 bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900" style={{ fontFamily: 'Baskerville, serif' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4 text-amber-800 drop-shadow-lg">FINAL LEADERBOARD</h1>
            <p className="text-2xl text-amber-600">
              {gamePhase === 'final-results' ? 'Complete Results' : `Current Standings - ${currentRound}`}
            </p>
          </div>

          <div className="space-y-6">
            {sortedTeams.map((team, index) => (
              <ScoreCard 
                key={team.id} 
                team={team} 
                rank={index + 1}
                showPerformance={gamePhase === 'final-results'}
              />
            ))}
          </div>

          <div className="flex justify-center mt-12 space-x-4">
            <button
              onClick={() => setDisplayMode('scores')}
              className="px-6 py-3 text-xl rounded-sm bg-amber-200/60 hover:bg-amber-300/60 text-amber-900"
            >
              Show Scores
            </button>
            {gamePhase === 'final-results' && (
              <button
                onClick={() => setDisplayMode('celebration')}
                className="px-6 py-3 text-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-sm sepia filter"
              >
                Victory Celebration
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default scores view
  return (
    <div className="min-h-screen transition-colors duration-300 p-8 bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900" style={{ fontFamily: 'Baskerville, serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-amber-800 drop-shadow-lg">DEEPSTACK SCOREBOARD</h1>
          <div className="flex justify-center items-center space-x-8 text-2xl">
            <span className="text-amber-600">Current Round:</span>
            <span className="font-bold text-amber-800">{currentRound}</span>
          </div>
        </div>

        {/* Last Action Display */}
        {lastAction && (
          <div className={`text-center mb-8 p-4 rounded-sm bg-amber-200/60 ${animationClass}`}>
            <p className="text-2xl font-semibold">{lastAction}</p>
          </div>
        )}

        {/* Team Scores Grid */}
        <div className={`grid gap-8 mb-12 ${
          teams.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
          teams.length <= 4 ? 'grid-cols-2 md:grid-cols-2' :
          'grid-cols-2 md:grid-cols-3'
        }`}>
          {teams.map((team) => (
            <ScoreCard key={team.id} team={team} />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 text-center text-amber-700">
          <div className="p-4 rounded-sm bg-amber-100/80 shadow-lg border border-amber-300">
            <div className="text-3xl font-bold">
              {Math.max(...teams.map(t => calculateTotalScore(t)))}
            </div>
            <div className="text-lg">High Score</div>
          </div>
          <div className="p-4 rounded-sm bg-amber-100/80 shadow-lg border border-amber-300">
            <div className="text-3xl font-bold">
              {Math.round(teams.reduce((sum, t) => sum + calculateTotalScore(t), 0) / teams.length)}
            </div>
            <div className="text-lg">Average</div>
          </div>
          <div className="p-4 rounded-sm bg-amber-100/80 shadow-lg border border-amber-300">
            <div className="text-3xl font-bold">{teams.length}</div>
            <div className="text-lg">Teams</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center mt-12 space-x-4">
          <button
            onClick={() => setDisplayMode('leaderboard')}
            className="px-6 py-3 text-xl rounded-sm transition-all bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white sepia filter"
          >
            Show Leaderboard
          </button>
          
          {gamePhase === 'final-results' && (
            <button
              onClick={() => setDisplayMode('celebration')}
              className="px-6 py-3 text-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-sm transition-all sepia filter"
            >
              Winner Celebration
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-amber-600">
          <p>Projector-optimized display • Large text • High contrast</p>
        </div>
      </div>
    </div>
  )
}

export default ProjectorScoreboard
