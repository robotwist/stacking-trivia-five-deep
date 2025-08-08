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
    <div className={`p-6 rounded-2xl shadow-2xl transition-all duration-500 ${animationClass} ${
      darkMode 
        ? 'bg-gray-800 border-2 border-gray-600' 
        : 'bg-white border-2 border-gray-200'
    }`}>
      <div className="flex justify-between items-center">
        <div>
          {rank && (
            <div className="text-4xl font-bold mb-2 text-yellow-500">
              #{rank}
            </div>
          )}
          <h3 className="text-3xl font-bold mb-2">{team.name}</h3>
          {showPerformance && performanceScores[team.id] && (
            <div className="text-lg text-gray-400">
              Performance: {performanceScores[team.id]}/30
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-6xl font-bold text-green-500">
            {calculateTotalScore(team)}
          </div>
          <div className="text-lg text-gray-400">points</div>
        </div>
      </div>
    </div>
  )

  if (displayMode === 'celebration' && gamePhase === 'final-results') {
    const winner = sortedTeams[0]
    
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 text-white' 
          : 'bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 text-gray-900'
      }`}>
        <div className="text-center">
          <div className="text-9xl mb-8 animate-bounce">🏆</div>
          <h1 className="text-8xl font-bold mb-4 animate-pulse">
            {winner.name}
          </h1>
          <h2 className="text-5xl mb-8">GOES THE DEEPEST!</h2>
          <div className="text-4xl font-bold">
            Final Score: {calculateTotalScore(winner)}
          </div>
          
          <div className="mt-12">
            <button
              onClick={() => setDisplayMode('leaderboard')}
              className="px-8 py-4 text-2xl bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
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
      <div className={`min-h-screen transition-colors duration-300 p-8 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4">FINAL LEADERBOARD</h1>
            <p className="text-2xl text-gray-400">
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
              className={`px-6 py-3 text-xl rounded-lg ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Show Scores
            </button>
            {gamePhase === 'final-results' && (
              <button
                onClick={() => setDisplayMode('celebration')}
                className="px-6 py-3 text-xl bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg"
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
    <div className={`min-h-screen transition-colors duration-300 p-8 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">DEEPSTACK SCOREBOARD</h1>
          <div className="flex justify-center items-center space-x-8 text-2xl">
            <span className="text-gray-400">Current Round:</span>
            <span className="font-bold text-blue-500">{currentRound}</span>
          </div>
        </div>

        {/* Last Action Display */}
        {lastAction && (
          <div className={`text-center mb-8 p-4 rounded-xl ${
            darkMode ? 'bg-blue-900' : 'bg-blue-100'
          } ${animationClass}`}>
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
        <div className={`grid grid-cols-3 gap-6 text-center ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-3xl font-bold">
              {Math.max(...teams.map(t => calculateTotalScore(t)))}
            </div>
            <div className="text-lg">High Score</div>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-3xl font-bold">
              {Math.round(teams.reduce((sum, t) => sum + calculateTotalScore(t), 0) / teams.length)}
            </div>
            <div className="text-lg">Average</div>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="text-3xl font-bold">{teams.length}</div>
            <div className="text-lg">Teams</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center mt-12 space-x-4">
          <button
            onClick={() => setDisplayMode('leaderboard')}
            className={`px-6 py-3 text-xl rounded-lg transition-all ${
              darkMode 
                ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Show Leaderboard
          </button>
          
          {gamePhase === 'final-results' && (
            <button
              onClick={() => setDisplayMode('celebration')}
              className="px-6 py-3 text-xl bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-all"
            >
              Winner Celebration
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className={`text-center mt-8 text-sm ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <p>Projector-optimized display • Large text • High contrast</p>
        </div>
      </div>
    </div>
  )
}

export default ProjectorScoreboard
