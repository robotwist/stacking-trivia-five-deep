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
        ? 'bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-800 text-amber-50' 
        : 'bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900'
    }`}>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 bg-clip-text text-transparent">
              Host Mode
            </h1>
            <p className={`text-base sm:text-lg ${darkMode ? 'text-amber-200' : 'text-amber-700'}`}>
              Set up teams for DeepStack: Trivia That Dares to Matter
            </p>
          </div>
          <button
            onClick={onExitHost}
            className={`px-4 py-2 rounded-sm border-2 border-amber-500 hover:border-amber-400 transition-all duration-200 text-sm sm:text-base sepia hover:sepia-0 ${
              darkMode 
                ? 'bg-gradient-to-r from-amber-700 to-yellow-700 text-amber-50' 
                : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900'
            }`}
          >
            Exit Host Mode
          </button>
        </div>

        {/* Team Setup Section */}
        <div className={`p-4 sm:p-6 lg:p-8 rounded-sm border-2 border-amber-400 mb-6 sm:mb-8 sepia ${
          darkMode 
            ? 'bg-gradient-to-br from-amber-900/60 via-yellow-900/50 to-amber-800/60' 
            : 'bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-amber-100/80'
        }`}>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Team Setup</h2>
          
          {/* Add Team Input */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <label htmlFor="team-name-input" className="sr-only">Enter team name</label>
            <input
              id="team-name-input"
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter team name..."
              aria-describedby="team-input-help"
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-sm border-2 focus:outline-none transition-all duration-200 text-base ${
                darkMode
                  ? 'bg-amber-900/50 border-amber-600 focus:border-yellow-400 text-amber-50 placeholder-amber-300'
                  : 'bg-amber-50 border-amber-300 focus:border-yellow-500 text-amber-900 placeholder-amber-600'
              }`}
              disabled={teams.length >= 6}
            />
            <span id="team-input-help" className="sr-only">
              {teams.length >= 6 ? 'Maximum 6 teams reached' : 'Add up to 6 teams for trivia competition'}
            </span>
            <button
              onClick={addTeam}
              disabled={!newTeamName.trim() || teams.length >= 6}
              className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 disabled:from-amber-400 disabled:to-yellow-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed text-sm sm:text-base border-2 border-amber-500 hover:border-amber-400 sepia hover:sepia-0"
            >
              Add Team
            </button>
          </div>

          <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
            {teams.length}/6 teams • Need at least 2 teams to start
          </p>

          {/* Teams List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {teams.map((team, index) => (
              <div
                key={team.id}
                className={`p-3 sm:p-4 rounded-sm border-2 border-amber-400 transition-all duration-200 sepia ${
                  darkMode
                    ? 'bg-gradient-to-br from-amber-800/50 via-yellow-800/40 to-amber-900/50 hover:bg-gradient-to-br hover:from-amber-700/60 hover:via-yellow-700/50 hover:to-amber-800/60'
                    : 'bg-gradient-to-br from-amber-100/60 via-yellow-100/50 to-amber-50/60 hover:bg-gradient-to-br hover:from-amber-200/70 hover:via-yellow-200/60 hover:to-amber-100/70'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{team.name}</h3>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                      Team #{index + 1}
                    </p>
                  </div>
                  <button
                    onClick={() => removeTeam(team.id)}
                    className={`p-1 sm:p-2 rounded-sm border border-red-400 transition-all duration-200 text-sm sm:text-base ${
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
            className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 disabled:from-amber-400 disabled:to-yellow-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-sm border-2 border-amber-500 hover:border-amber-400 text-lg sm:text-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 sepia hover:sepia-0 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Start DeepStack Game
          </button>
          
          {teams.length < 2 && (
            <p className={`mt-3 sm:mt-4 text-xs sm:text-sm ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              Add at least 2 teams to begin
            </p>
          )}
        </div>

        {/* Game Rules Preview */}
        <div className={`mt-8 sm:mt-12 p-4 sm:p-6 rounded-sm border-2 border-amber-400 sepia ${
          darkMode 
            ? 'bg-gradient-to-br from-amber-900/40 via-yellow-900/30 to-amber-800/40' 
            : 'bg-gradient-to-br from-amber-50/70 via-yellow-50/50 to-amber-100/70'
        }`}>
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Game Format Preview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="p-3 rounded-sm bg-gradient-to-br from-amber-200/60 to-yellow-200/50 dark:bg-gradient-to-br dark:from-amber-800/60 dark:to-yellow-800/50 border border-amber-300 dark:border-amber-600">
              <strong>Round 1:</strong> Opening Image Round
              <br />All teams collaborate on visual prompt
            </div>
            <div className="p-3 rounded-sm bg-gradient-to-br from-yellow-200/60 to-amber-200/50 dark:bg-gradient-to-br dark:from-yellow-800/60 dark:to-amber-800/50 border border-yellow-300 dark:border-yellow-600">
              <strong>Round 2:</strong> Individual Stacks
              <br />Teams choose expertise areas
            </div>
            <div className="p-3 rounded-sm bg-gradient-to-br from-amber-100/60 to-yellow-100/50 dark:bg-gradient-to-br dark:from-amber-700/60 dark:to-yellow-700/50 border border-amber-300 dark:border-amber-600">
              <strong>Round 3:</strong> Performance Finale
              <br />Creative synthesis with props/music
            </div>
          </div>
        </div>

        {/* Gilliam Projector Controls */}
        <div className={`p-4 sm:p-6 lg:p-8 rounded-sm border-2 border-amber-400 sepia ${
          darkMode 
            ? 'bg-gradient-to-br from-amber-900/50 via-yellow-900/40 to-amber-800/50' 
            : 'bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-amber-100/80'
        }`}>
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Terry Gilliam Projector</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => onEnterGilliamProjector('setup')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-sm border-2 border-amber-500 hover:border-amber-400 font-semibold transition-all duration-200 text-sm sm:text-base sepia hover:sepia-0 ${
                darkMode 
                  ? 'bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 text-amber-50' 
                  : 'bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-800'
              }`}
            >
              Open Gilliam Projector
            </button>
            <button
              onClick={() => onTriggerTransition('arts-culture', 'cinema')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-sm border-2 border-yellow-500 hover:border-yellow-400 font-semibold transition-all duration-200 text-sm sm:text-base sepia hover:sepia-0 ${
                darkMode 
                  ? 'bg-gradient-to-r from-yellow-700 to-amber-700 hover:from-yellow-600 hover:to-amber-600 text-amber-50' 
                  : 'bg-gradient-to-r from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 text-amber-800'
              }`}
            >
              Test Transition: Arts → Cinema
            </button>
            <button
              onClick={() => onTriggerTransition('history', 'sports')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-sm border-2 border-amber-600 hover:border-amber-500 font-semibold transition-all duration-200 text-sm sm:text-base sepia hover:sepia-0 ${
                darkMode 
                  ? 'bg-gradient-to-r from-amber-800 to-yellow-800 hover:from-amber-700 hover:to-yellow-700 text-amber-50' 
                  : 'bg-gradient-to-r from-amber-200 to-yellow-200 hover:from-amber-300 hover:to-yellow-300 text-amber-900'
              }`}
            >
              Test Transition: History → Sports
            </button>
            <button
              onClick={() => onTriggerTransition('actually', 'arts-culture')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-sm border-2 border-yellow-600 hover:border-yellow-500 font-semibold transition-all duration-200 text-sm sm:text-base sepia hover:sepia-0 ${
                darkMode 
                  ? 'bg-gradient-to-r from-yellow-800 to-amber-800 hover:from-yellow-700 hover:to-amber-700 text-amber-50' 
                  : 'bg-gradient-to-r from-yellow-200 to-amber-200 hover:from-yellow-300 hover:to-amber-300 text-amber-900'
              }`}
            >
              Test Transition: Actually → Arts
            </button>
          </div>
          <p className={`text-xs sm:text-sm mt-3 sm:mt-4 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
            Victorian collage animations connecting trivia categories with surreal humor
          </p>
        </div>
      </div>
    </div>
  )
}
