import { useState, useEffect } from 'react'

const PerformanceFinale = ({ 
  teams = [], 
  gameHistory = [], 
  onComplete,
  darkMode = false 
}) => {
  const [currentPhase, setCurrentPhase] = useState('setup') // setup, prep, perform, judge
  const [prepTime, setPrepTime] = useState(300) // 5 minutes prep time
  const [currentTeam, setCurrentTeam] = useState(0)
  const [performances, setPerformances] = useState({})
  const [judgeScores, setJudgeScores] = useState({})

  // Extract topics from game history for inspiration
  const sessionTopics = gameHistory.map(entry => entry.stackTitle || entry.topic).filter(Boolean)

  useEffect(() => {
    let timer
    if (currentPhase === 'prep' && prepTime > 0) {
      timer = setTimeout(() => setPrepTime(prepTime - 1), 1000)
    } else if (currentPhase === 'prep' && prepTime === 0) {
      setCurrentPhase('perform')
    }
    return () => clearTimeout(timer)
  }, [currentPhase, prepTime])

  const startPrep = () => {
    setCurrentPhase('prep')
    setPrepTime(300) // Reset to 5 minutes
  }

  const nextTeam = () => {
    if (currentTeam < teams.length - 1) {
      setCurrentTeam(currentTeam + 1)
    } else {
      setCurrentPhase('judge')
    }
  }

  const recordPerformance = (teamId, description) => {
    setPerformances(prev => ({
      ...prev,
      [teamId]: description
    }))
  }

  const scoreTeam = (teamId, criteria, score) => {
    setJudgeScores(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [criteria]: score
      }
    }))
  }

  const calculateFinalScores = () => {
    const finalScores = {}
    Object.keys(judgeScores).forEach(teamId => {
      const scores = judgeScores[teamId] || {}
      finalScores[teamId] = (scores.accuracy || 0) + (scores.creativity || 0) + (scores.cohesion || 0)
    })
    return finalScores
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (currentPhase === 'setup') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 text-gray-900'
      }`}>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">PERFORMANCE FINALE</h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8">GO THE DEEPEST</p>
            <p className="text-base sm:text-lg mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              The ultimate test: Teams create a performance (song, rap, play, spoken word) 
              using the topics we've explored tonight. Props and music available.
            </p>
          </div>

          <div className={`max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-2xl mb-6 sm:mb-8 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Tonight's Deep Topics:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {sessionTopics.map((topic, index) => (
                <div key={index} className={`p-3 sm:p-4 rounded-lg text-center ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <span className="font-medium text-sm sm:text-base">{topic}</span>
                </div>
              ))}
            </div>

            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Performance Guidelines:</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Available Props:</h4>
                  <ul className="text-sm sm:text-base space-y-1">
                    <li>• Guitar (acoustic)</li>
                    <li>• Microphone with backing beats</li>
                    <li>• Simple costumes/hats</li>
                    <li>• Whiteboard for visual aids</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Judging Criteria:</h4>
                  <ul className="text-sm sm:text-base space-y-1">
                    <li>• <strong>Accuracy:</strong> Use of actual facts from tonight</li>
                    <li>• <strong>Creativity:</strong> Originality and entertainment value</li>
                    <li>• <strong>Cohesion:</strong> How well topics connect together</li>
                    <li>• Each category: 1-10 points</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startPrep}
                className={`px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-bold rounded-xl transition-all duration-200 ${
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                } shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto`}
              >
                Start 5-Minute Prep Time
              </button>
            </div>
          </div>

          <div className={`text-center text-xs sm:text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <p>Teams will have 5 minutes to prepare, then perform in order</p>
          </div>
        </div>
      </div>
    )
  }

  if (currentPhase === 'prep') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-red-900 to-black text-white' 
          : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 text-gray-900'
      }`}>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4">PREP TIME</h1>
            <div className="text-8xl font-mono font-bold mb-8 text-red-500">
              {formatTime(prepTime)}
            </div>
            <p className="text-2xl mb-8">All teams: Plan your performance!</p>
          </div>

          <div className={`max-w-2xl mx-auto p-6 rounded-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl`}>
            <h2 className="text-xl font-bold mb-4">Quick Reminder:</h2>
            <div className="text-left space-y-2">
              <p>• Use tonight's topics: {sessionTopics.join(', ')}</p>
              <p>• 2-3 minutes per performance</p>
              <p>• Props available at front</p>
              <p>• Focus on accuracy + creativity + cohesion</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentPhase === 'perform') {
    const team = teams[currentTeam]
    
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'
      }`}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">PERFORMANCE TIME</h1>
            <h2 className="text-3xl mb-8">Team: {team?.name || `Team ${currentTeam + 1}`}</h2>
            <p className="text-xl">Take the stage! 2-3 minutes to go the deepest.</p>
          </div>

          <div className={`max-w-2xl mx-auto p-8 rounded-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl text-center`}>
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Performance Notes:</h3>
              <textarea
                placeholder="Describe the performance for judging..."
                className={`w-full h-32 p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'
                } border-2 border-gray-300 focus:border-blue-500`}
                onChange={(e) => recordPerformance(team?.id || currentTeam, e.target.value)}
              />
            </div>

            <button
              onClick={nextTeam}
              className={`px-8 py-4 text-xl font-bold rounded-xl transition-all duration-200 ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } shadow-lg hover:shadow-xl`}
            >
              {currentTeam < teams.length - 1 ? 'Next Team' : 'Begin Judging'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentPhase === 'judge') {
    const finalScores = calculateFinalScores()
    
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-yellow-900 to-black text-white' 
          : 'bg-gradient-to-br from-yellow-50 via-gold-50 to-orange-50 text-gray-900'
      }`}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-8">JUDGE THE PERFORMANCES</h1>
          </div>

          <div className="grid gap-8 max-w-6xl mx-auto">
            {teams.map((team, index) => (
              <div key={team?.id || index} className={`p-6 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-xl`}>
                <h3 className="text-2xl font-bold mb-4">
                  {team?.name || `Team ${index + 1}`}
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {['accuracy', 'creativity', 'cohesion'].map(criteria => (
                    <div key={criteria}>
                      <label className="block font-semibold mb-2 capitalize">
                        {criteria} (1-10):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className={`w-full p-3 rounded-lg ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        } text-center text-xl font-bold`}
                        onChange={(e) => scoreTeam(team?.id || index, criteria, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="text-right">
                  <span className="text-2xl font-bold">
                    Total: {finalScores[team?.id || index] || 0}/30
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onComplete(finalScores)}
              className={`px-8 py-4 text-xl font-bold rounded-xl transition-all duration-200 ${
                darkMode 
                  ? 'bg-gold-600 hover:bg-gold-500 text-black' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-black'
              } shadow-lg hover:shadow-xl`}
            >
              Complete Performance Finale
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default PerformanceFinale
