import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QuickHostControls = ({ 
  gameState = 'playing', // playing, paused, between-rounds
  currentQuestion = 1,
  totalQuestions = 5,
  timeRemaining = null,
  onPause = () => {},
  onResume = () => {},
  onSkipQuestion = () => {},
  onEndRound = () => {},
  onShowScoreboard = () => {},
  onPlaySound = () => {},
  isVisible = true,
  teamCount = 0,
  currentTeamName = ""
}) => {
  const [controlsExpanded, setControlsExpanded] = useState(false)
  const [crowdMeter, setCrowdMeter] = useState(3) // 1-5 energy level
  const [showQuickActions, setShowQuickActions] = useState(false)

  // Auto-hide controls after inactivity
  useEffect(() => {
    let hideTimer
    if (controlsExpanded) {
      hideTimer = setTimeout(() => {
        setControlsExpanded(false)
      }, 15000) // Hide after 15 seconds of no interaction
    }
    return () => clearTimeout(hideTimer)
  }, [controlsExpanded])

  const soundEffects = [
    { name: 'Applause', icon: '👏', sound: 'applause' },
    { name: 'Correct!', icon: '✅', sound: 'correct' },
    { name: 'Wrong', icon: '❌', sound: 'wrong' },
    { name: 'Suspense', icon: '⏰', sound: 'suspense' },
    { name: 'Celebration', icon: '🎉', sound: 'celebration' }
  ]

  const crowdEnergyLevels = [
    { level: 1, icon: '😴', label: 'Sleepy', color: 'text-gray-400' },
    { level: 2, icon: '😐', label: 'Calm', color: 'text-blue-400' },
    { level: 3, icon: '🙂', label: 'Engaged', color: 'text-green-400' },
    { level: 4, icon: '😄', label: 'Excited', color: 'text-yellow-400' },
    { level: 5, icon: '🤩', label: 'Electric!', color: 'text-red-400' }
  ]

  const currentEnergyLevel = crowdEnergyLevels[crowdMeter - 1]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 right-4 z-50"
        >
          {/* Main Control Button */}
          <motion.button
            onClick={() => setControlsExpanded(!controlsExpanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative mb-4 w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 rounded-full shadow-lg border-2 border-amber-400 flex items-center justify-center"
          >
            <span className="text-2xl">🎮</span>
            
            {/* Status indicators */}
            <div className="absolute -top-2 -right-2 flex flex-col space-y-1">
              {gameState === 'paused' && (
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" title="Paused" />
              )}
              {teamCount > 0 && (
                <div className="w-6 h-4 bg-blue-500 text-white text-xs rounded-sm flex items-center justify-center font-bold">
                  {teamCount}
                </div>
              )}
            </div>
          </motion.button>

          {/* Expanded Controls */}
          <AnimatePresence>
            {controlsExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-amber-400 p-4 w-80"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-200">
                  <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100">
                    Host Controls
                  </h3>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    Q {currentQuestion}/{totalQuestions}
                  </div>
                </div>

                {/* Game State Controls */}
                <div className="mb-4">
                  <div className="flex space-x-2 mb-3">
                    <motion.button
                      onClick={() => gameState === 'playing' ? onPause() : onResume()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-colors ${
                        gameState === 'paused' 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-yellow-500 text-white hover:bg-yellow-600'
                      }`}
                    >
                      {gameState === 'playing' ? '⏸️ Pause' : '▶️ Resume'}
                    </motion.button>
                    
                    <motion.button
                      onClick={onShowScoreboard}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                      📊 Scores
                    </motion.button>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      onClick={onSkipQuestion}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                      ⏭️ Skip
                    </motion.button>
                    
                    <motion.button
                      onClick={onEndRound}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      🏁 End Round
                    </motion.button>
                  </div>
                </div>

                {/* Crowd Energy Meter */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Crowd Energy
                    </span>
                    <span className={`text-lg ${currentEnergyLevel.color}`}>
                      {currentEnergyLevel.icon} {currentEnergyLevel.label}
                    </span>
                  </div>
                  
                  <div className="flex space-x-1">
                    {crowdEnergyLevels.map((level) => (
                      <motion.button
                        key={level.level}
                        onClick={() => setCrowdMeter(level.level)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex-1 py-2 rounded text-lg transition-all ${
                          crowdMeter >= level.level 
                            ? `${level.color} bg-amber-100 dark:bg-amber-900/30` 
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        {level.icon}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Quick Sound Effects */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Sound Effects
                    </span>
                    <motion.button
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs px-2 py-1 bg-amber-200 dark:bg-amber-700 rounded-full"
                    >
                      {showQuickActions ? 'Hide' : 'Show'}
                    </motion.button>
                  </div>
                  
                  <AnimatePresence>
                    {showQuickActions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-3 gap-2"
                      >
                        {soundEffects.map((effect) => (
                          <motion.button
                            key={effect.sound}
                            onClick={() => onPlaySound(effect.sound)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg text-center hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
                            title={effect.name}
                          >
                            <div className="text-lg">{effect.icon}</div>
                            <div className="text-xs font-medium text-amber-800 dark:text-amber-200">
                              {effect.name}
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Current Team Info */}
                {currentTeamName && (
                  <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                    <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                      Current Team
                    </div>
                    <div className="font-bold text-amber-900 dark:text-amber-100">
                      {currentTeamName}
                    </div>
                  </div>
                )}

                {/* Timer Display */}
                {timeRemaining !== null && (
                  <motion.div 
                    className={`mt-2 text-center p-2 rounded-lg font-mono text-lg font-bold ${
                      timeRemaining <= 10 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                    }`}
                    animate={{ 
                      scale: timeRemaining <= 10 && timeRemaining > 0 ? [1, 1.05, 1] : 1 
                    }}
                    transition={{ 
                      repeat: timeRemaining <= 10 && timeRemaining > 0 ? Infinity : 0,
                      duration: 1 
                    }}
                  >
                    {timeRemaining}s
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default QuickHostControls
