import { useState, useEffect } from 'react'

export default function HostMode({ 
  onStartGame, 
  onExitHost, 
  onEnterGilliamProjector = () => {}, 
  onTriggerTransition = () => {} 
}) {
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Host Mode
            </h1>
            <p className={`text-base sm:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Set up teams for DeepStack: Trivia That Dares to Matter
            </p>
          </div>
          <button
            onClick={onExitHost}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md'
            }`}
          >
            Exit Host Mode
          </button>
        </div>

        {/* Team Setup Section */}
        <div className={`p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 ${
          darkMode 
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50' 
            : 'bg-white/70 backdrop-blur-sm shadow-lg border border-white/50'
        }`}>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Team Setup</h2>
          
          {/* Add Team Input */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter team name..."
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 focus:outline-none transition-all duration-200 text-base ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 focus:border-purple-400 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 focus:border-purple-500 text-gray-900 placeholder-gray-500'
              }`}
              disabled={teams.length >= 6}
            />
            <button
              onClick={addTeam}
              disabled={!newTeamName.trim() || teams.length >= 6}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Add Team
            </button>
          </div>

          <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {teams.length}/6 teams • Need at least 2 teams to start
          </p>

          {/* Teams List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {teams.map((team, index) => (
              <div
                key={team.id}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  darkMode 
                    ? 'bg-gray-700/50 border border-gray-600/50' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{team.name}</h3>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Team #{index + 1}
                    </p>
                  </div>
                  <button
                    onClick={() => removeTeam(team.id)}
                    className={`p-1 sm:p-2 rounded-lg transition-all duration-200 text-sm sm:text-base ${
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
        <div className="text-center mb-6 sm:mb-8">
          <button
            onClick={startGame}
            disabled={teams.length < 2}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:cursor-not-allowed w-full sm:w-auto"
          >
            🚀 Start DeepStack Game
          </button>
          
          {teams.length < 2 && (
            <p className={`mt-3 sm:mt-4 text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add at least 2 teams to begin
            </p>
          )}
        </div>

        {/* Game Rules Preview */}
        <div className={`mt-8 sm:mt-12 p-4 sm:p-6 rounded-xl sm:rounded-2xl ${
          darkMode 
            ? 'bg-gray-800/30 border border-gray-700/30' 
            : 'bg-white/50 border border-gray-200'
        }`}>
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🎪 Game Format Preview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="p-3 rounded-lg bg-opacity-50 bg-purple-100 dark:bg-purple-900">
              <strong>Round 1:</strong> Opening Image Round
              <br />All teams collaborate on visual prompt
            </div>
            <div className="p-3 rounded-lg bg-opacity-50 bg-blue-100 dark:bg-blue-900">
              <strong>Round 2:</strong> Individual Stacks
              <br />Teams choose expertise areas
            </div>
            <div className="p-3 rounded-lg bg-opacity-50 bg-green-100 dark:bg-green-900">
              <strong>Round 3:</strong> Performance Finale
              <br />Creative synthesis with props/music
            </div>
          </div>
        </div>

        {/* Gilliam Projector Controls */}
        <div className={`p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl ${
          darkMode 
            ? 'bg-gray-900/50 border border-gray-700' 
            : 'bg-white/50 border border-gray-200'
        }`}>
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🎭 Terry Gilliam Projector</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => onEnterGilliamProjector('setup')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                darkMode 
                  ? 'bg-amber-700 hover:bg-amber-600 text-white' 
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-800 shadow-md'
              }`}
            >
              🎪 Open Gilliam Projector
            </button>
            <button
              onClick={() => onTriggerTransition('arts-culture', 'cinema')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                darkMode 
                  ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-800 shadow-md'
              }`}
            >
              🎨 Test Transition: Arts → Cinema
            </button>
            <button
              onClick={() => onTriggerTransition('history', 'sports')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                darkMode 
                  ? 'bg-green-700 hover:bg-green-600 text-white' 
                  : 'bg-green-100 hover:bg-green-200 text-green-800 shadow-md'
              }`}
            >
              🏛️ Test Transition: History → Sports
            </button>
            <button
              onClick={() => onTriggerTransition('actually', 'arts-culture')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                darkMode 
                  ? 'bg-indigo-700 hover:bg-indigo-600 text-white' 
                  : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 shadow-md'
              }`}
            >
              🔍 Test Transition: Actually → Arts
            </button>
          </div>
          <p className={`text-xs sm:text-sm mt-3 sm:mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Victorian collage animations connecting trivia categories with surreal humor
          </p>
        </div>
      </div>
    </div>
  )
}
