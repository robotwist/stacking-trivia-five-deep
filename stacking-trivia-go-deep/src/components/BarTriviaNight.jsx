import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameStack from './GameStack'
import QuickHostControls from './QuickHostControls'
import TransitionCountdown from './TransitionCountdown'

const BarTriviaNight = ({ 
  gameStacks, 
  categoriesConfig, 
  onExit 
}) => {
  const [teams, setTeams] = useState([])
  const [currentTeam, setCurrentTeam] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [gamePhase, setGamePhase] = useState('setup') // setup, playing, between-teams, round-complete, final-results
  const [currentStack, setCurrentStack] = useState(null)
  const [gameIsPaused, setGameIsPaused] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const [roundScores, setRoundScores] = useState({})
  const [crowdEnergy, setCrowdEnergy] = useState(3)
  const [autoProgressTimer, setAutoProgressTimer] = useState(null)

  // Phase 8: Bar-friendly team management
  const addQuickTeam = (teamName = '') => {
    const name = teamName || `Team ${teams.length + 1}`
    const newTeam = {
      id: Date.now(),
      name: name,
      totalScore: 0,
      roundScores: [],
      currentStack: null,
      isPlaying: false
    }
    setTeams([...teams, newTeam])
  }

  // Phase 8: Quick setup for common bar scenarios
  const quickSetup = (setupType) => {
    setTeams([])
    switch (setupType) {
      case 'pub-quiz':
        ['The Regulars', 'Quiz Masters', 'Brain Trust', 'Lucky Guess', 'Last Call'].forEach(name => {
          addQuickTeam(name)
        })
        break
      case 'small-group':
        ['Team Alpha', 'Team Beta', 'Team Charlie'].forEach(name => {
          addQuickTeam(name)
        })
        break
      case 'large-group':
        for (let i = 1; i <= 8; i++) {
          addQuickTeam(`Table ${i}`)
        }
        break
    }
  }

  // Phase 8: Automated team progression
  const nextTeam = (score = 0) => {
    const updatedTeams = [...teams]
    updatedTeams[currentTeam].roundScores.push(score)
    updatedTeams[currentTeam].totalScore += score
    setTeams(updatedTeams)

    if (currentTeam + 1 < teams.length) {
      // More teams to go in this round
      setCurrentTeam(currentTeam + 1)
      setGamePhase('between-teams')
      showTeamTransition()
    } else {
      // Round complete
      setCurrentTeam(0)
      setCurrentRound(currentRound + 1)
      setGamePhase('round-complete')
      showRoundCompleteTransition()
    }
  }

  const showTeamTransition = () => {
    setShowTransition(true)
    setGamePhase('between-teams')
    
    // Auto-progress after 5 seconds unless manually skipped
    const timer = setTimeout(() => {
      setShowTransition(false)
      setGamePhase('playing')
    }, 5000)
    
    setAutoProgressTimer(timer)
  }

  const showRoundCompleteTransition = () => {
    setShowTransition(true)
    // Show round results for 10 seconds
    setTimeout(() => {
      setShowTransition(false)
      if (currentRound <= 3) { // Play 3 rounds typically
        setGamePhase('playing')
      } else {
        setGamePhase('final-results')
      }
    }, 10000)
  }

  const skipTransition = () => {
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer)
      setAutoProgressTimer(null)
    }
    setShowTransition(false)
    
    if (gamePhase === 'between-teams') {
      setGamePhase('playing')
    } else if (gamePhase === 'round-complete') {
      if (currentRound <= 3) {
        setGamePhase('playing')
      } else {
        setGamePhase('final-results')
      }
    }
  }

  // Phase 8: Host control functions
  const handlePause = () => {
    setGameIsPaused(true)
  }

  const handleResume = () => {
    setGameIsPaused(false)
  }

  const handleSkipTeam = () => {
    nextTeam(0) // Give current team 0 points and move to next
  }

  const handlePlaySound = (soundType) => {
    // Placeholder for actual sound implementation
    console.log(`Playing sound: ${soundType}`)
  }

  const getCurrentTeamName = () => {
    return teams[currentTeam]?.name || 'Unknown Team'
  }

  // Phase 8: Get random stack for variety
  const getRandomStack = () => {
    const allStackKeys = Object.keys(gameStacks)
    const randomKey = allStackKeys[Math.floor(Math.random() * allStackKeys.length)]
    return { key: randomKey, data: gameStacks[randomKey] }
  }

  // Start playing with random stack
  const startGame = () => {
    if (teams.length >= 2) {
      const stack = getRandomStack()
      setCurrentStack(stack)
      setGamePhase('playing')
    }
  }

  // Setup phase
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 bg-clip-text text-transparent">
              Bar Trivia Night
            </h1>
            <p className="text-xl text-amber-700">
              Perfect for pubs, bars, and trivia nights
            </p>
          </div>

          {/* Quick Setup Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.button
              onClick={() => quickSetup('pub-quiz')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-xl border-2 border-amber-400 hover:border-amber-500 transition-all"
            >
              <div className="text-4xl mb-3">🍺</div>
              <h2 className="text-xl font-bold mb-2">Pub Quiz Night</h2>
              <p className="text-amber-700">5 teams with pub-style names</p>
            </motion.button>

            <motion.button
              onClick={() => quickSetup('small-group')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl border-2 border-green-400 hover:border-green-500 transition-all"
            >
              <div className="text-4xl mb-3">👥</div>
              <h2 className="text-xl font-bold mb-2">Small Group</h2>
              <p className="text-green-700">3 teams for intimate settings</p>
            </motion.button>

            <motion.button
              onClick={() => quickSetup('large-group')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-xl border-2 border-blue-400 hover:border-blue-500 transition-all"
            >
              <div className="text-4xl mb-3">🏢</div>
              <h2 className="text-xl font-bold mb-2">Large Event</h2>
              <p className="text-blue-700">8 tables for big venues</p>
            </motion.button>
          </div>

          {/* Current Teams */}
          {teams.length > 0 && (
            <div className="bg-white/50 backdrop-blur rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Teams Ready ({teams.length})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teams.map((team, index) => (
                  <div key={team.id} className="p-3 bg-amber-100 rounded-lg border border-amber-300">
                    <span className="font-semibold">#{index + 1}: {team.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {teams.length >= 2 && (
              <motion.button
                onClick={startGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-xl border-2 border-green-400 shadow-lg"
              >
                🎯 Start Trivia Night!
              </motion.button>
            )}
            
            <motion.button
              onClick={onExit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-semibold border-2 border-gray-300"
            >
              Exit
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // Between teams transition
  if (showTransition && gamePhase === 'between-teams') {
    const nextTeamName = teams[currentTeam]?.name || 'Next Team'
    return (
      <TransitionCountdown
        isVisible={true}
        countdownFrom={5}
        message={`${nextTeamName}'s Turn`}
        nextRoundInfo={{ 
          category: currentStack?.data?.category || 'Trivia',
          stack: currentStack?.data?.title || 'Questions'
        }}
        crowdEnergy={crowdEnergy}
        barMode={true}
        onComplete={() => skipTransition()}
        onSkip={() => skipTransition()}
      />
    )
  }

  // Round complete transition
  if (showTransition && gamePhase === 'round-complete') {
    const sortedTeams = [...teams].sort((a, b) => b.totalScore - a.totalScore)
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-amber-900/90 via-yellow-900/90 to-amber-800/90 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl p-8 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-amber-800">Round {currentRound - 1} Complete!</h2>
          
          <div className="space-y-3 mb-8">
            {sortedTeams.slice(0, 3).map((team, index) => (
              <div 
                key={team.id}
                className={`p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-200 border-2 border-yellow-400' :
                  index === 1 ? 'bg-gray-200 border-2 border-gray-400' :
                  'bg-amber-200 border-2 border-amber-400'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {team.name}
                  </span>
                  <span className="text-xl font-bold">{team.totalScore} pts</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={skipTransition}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-bold text-lg hover:from-amber-700 hover:to-yellow-700 transition-all"
          >
            Continue to Round {currentRound}
          </button>
        </div>
      </div>
    )
  }

  // Main playing phase
  if (gamePhase === 'playing' && currentStack) {
    return (
      <>
        <QuickHostControls
          gameState={gameIsPaused ? 'paused' : 'playing'}
          currentQuestion={1}
          totalQuestions={5}
          onPause={handlePause}
          onResume={handleResume}
          onSkipQuestion={handleSkipTeam}
          onShowScoreboard={() => console.log('Show scoreboard')}
          onPlaySound={handlePlaySound}
          teamCount={teams.length}
          currentTeamName={getCurrentTeamName()}
          isVisible={true}
        />
        
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Game Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-amber-800 mb-2">Bar Trivia Night - Round {currentRound}</h2>
              <div className="text-xl text-amber-700">
                Current Team: <span className="font-bold text-amber-900">{getCurrentTeamName()}</span>
              </div>
              <div className="text-sm text-amber-600 mt-2">
                Team {currentTeam + 1} of {teams.length} • Stack: {currentStack.data.title}
              </div>
            </div>

            {/* Team Progress Indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {teams.map((team, index) => (
                  <div
                    key={team.id}
                    className={`w-4 h-4 rounded-full transition-all ${
                      index === currentTeam 
                        ? 'bg-yellow-500 ring-2 ring-yellow-400 scale-125' 
                        : index < currentTeam 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* GameStack with enhanced features */}
            <GameStack
              stackData={currentStack.data}
              onComplete={(score) => nextTeam(score)}
              isHostMode={true}
              showHostControls={false} // Using floating controls instead
              teamName={getCurrentTeamName()}
              onPause={handlePause}
              onResume={handleResume}
              gameState={gameIsPaused ? 'paused' : 'playing'}
              enableCelebrations={true}
            />
          </div>
        </div>
      </>
    )
  }

  // Final results
  if (gamePhase === 'final-results') {
    const sortedTeams = [...teams].sort((a, b) => b.totalScore - a.totalScore)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-amber-900 to-yellow-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-amber-200 bg-clip-text text-transparent">
              🏆 FINAL RESULTS! 🏆
            </h2>
          </motion.div>

          <div className="space-y-6 mb-12">
            {sortedTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.3 }}
                className={`p-6 rounded-xl border-2 ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400' :
                  index === 1 ? 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-400' :
                  index === 2 ? 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-500' :
                  'bg-white/10 border-white/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold">{team.name}</h2>
                      <p className="text-lg opacity-80">
                        {team.roundScores.length} rounds completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{team.totalScore}</div>
                    <div className="text-sm opacity-80">total points</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setGamePhase('setup')
                setTeams([])
                setCurrentTeam(0)
                setCurrentRound(1)
              }}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              🔄 New Game
            </button>
            
            <button
              onClick={onExit}
              className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold text-lg hover:from-gray-700 hover:to-gray-800 transition-all"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default BarTriviaNight
