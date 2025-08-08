import { useState, useEffect } from 'react'

export default function HostMode({ onStartGame, onExitHost }) {
  const [teams, setTeams] = useState([])
  const [newTeamName, setNewTeamName] = useState('')
  const [gameState, setGameState] = useState('setup') // setup, playing, finished
  const [currentRound, setCurrentRound] = useState(1)
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setDarkMode(document.documentElement.classList.contains('dark'))
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  const addTeam = () => {
    if (newTeamName.trim() && teams.length < 6) {
      const newTeam = {
        id: Date.now(),
        name: newTeamName.trim(),
        score: 0,
        stacksCompleted: [],
        currentStack: null
      }
      setTeams([...teams, newTeam])
      setNewTeamName('')
    }
  }

  const removeTeam = (teamId) => {
    setTeams(teams.filter(team => team.id !== teamId))
  }

  const updateTeamScore = (teamId, newScore) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, score: newScore } : team
    ))
  }

  const startGame = () => {
    if (teams.length >= 2) {
      setGameState('playing')
      // Notify parent component to switch to game mode
      onStartGame({ teams, gameState: 'playing' })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTeam()
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              🎯 Host Mode
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Set up teams for DeepStack: Trivia That Dares to Matter
            </p>
          </div>
          <button
            onClick={onExitHost}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md'
            }`}
          >
            Exit Host Mode
          </button>
        </div>

        {/* Team Setup Section */}
        <div className={`p-8 rounded-2xl mb-8 ${
          darkMode 
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50' 
            : 'bg-white/70 backdrop-blur-sm shadow-lg border border-white/50'
        }`}>
          <h2 className="text-2xl font-bold mb-6">Team Setup</h2>
          
          {/* Add Team Input */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter team name..."
              className={`flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 focus:border-purple-400 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 focus:border-purple-500 text-gray-900 placeholder-gray-500'
              }`}
              disabled={teams.length >= 6}
            />
            <button
              onClick={addTeam}
              disabled={!newTeamName.trim() || teams.length >= 6}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed"
            >
              Add Team
            </button>
          </div>

          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {teams.length}/6 teams • Need at least 2 teams to start
          </p>

          {/* Teams List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team, index) => (
              <div
                key={team.id}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  darkMode 
                    ? 'bg-gray-700/50 border border-gray-600/50' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{team.name}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Team #{index + 1}
                    </p>
                  </div>
                  <button
                    onClick={() => removeTeam(team.id)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      darkMode 
                        ? 'hover:bg-red-900/30 text-red-400' 
                        : 'hover:bg-red-100 text-red-600'
                    }`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="text-center">
          <button
            onClick={startGame}
            disabled={teams.length < 2}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:cursor-not-allowed"
          >
            🚀 Start DeepStack Game
          </button>
          
          {teams.length < 2 && (
            <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add at least 2 teams to begin
            </p>
          )}
        </div>

        {/* Game Rules Preview */}
        <div className={`mt-12 p-6 rounded-2xl ${
          darkMode 
            ? 'bg-gray-800/30 border border-gray-700/30' 
            : 'bg-white/50 border border-gray-200'
        }`}>
          <h3 className="text-xl font-bold mb-4">🎪 Game Format Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Round 1:</strong> Opening Image Round
              <br />All teams collaborate on visual prompt
            </div>
            <div>
              <strong>Round 2:</strong> Individual Stacks
              <br />Teams choose expertise areas
            </div>
            <div>
              <strong>Round 3:</strong> Performance Finale
              <br />Creative synthesis with props/music
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
