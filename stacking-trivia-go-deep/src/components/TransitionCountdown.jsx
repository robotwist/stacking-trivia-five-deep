import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TransitionCountdown = ({ 
  isVisible = false,
  countdownFrom = 5,
  message = "Next Round Starting",
  nextRoundInfo = null, // { category: "Sports", stack: "Olympic Records" }
  onComplete = () => {},
  showSkipButton = true,
  onSkip = () => {},
  crowdEnergy = 3, // 1-5 for visual intensity
  barMode = true // Enhanced features for bar/trivia night use
}) => {
  const [currentCount, setCurrentCount] = useState(countdownFrom)
  const [showMessage, setShowMessage] = useState(true)

  useEffect(() => {
    if (!isVisible) {
      setCurrentCount(countdownFrom)
      setShowMessage(true)
      return
    }

    if (currentCount > 0) {
      const timer = setTimeout(() => {
        setCurrentCount(currentCount - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      const completeTimer = setTimeout(() => {
        onComplete()
      }, 500)
      return () => clearTimeout(completeTimer)
    }
  }, [currentCount, isVisible, countdownFrom, onComplete])

  const getEnergyColors = () => {
    switch (crowdEnergy) {
      case 1: return 'from-gray-400 to-gray-600'
      case 2: return 'from-blue-400 to-blue-600'
      case 3: return 'from-green-400 to-green-600'
      case 4: return 'from-yellow-400 to-orange-600'
      case 5: return 'from-red-400 to-purple-600'
      default: return 'from-green-400 to-green-600'
    }
  }

  const getEnergyIntensity = () => {
    return crowdEnergy >= 4 ? 'animate-pulse' : ''
  }

  const encouragementMessages = [
    "Get ready to show your knowledge!",
    "Time to shine, teams!",
    "Who knows their stuff?",
    "Let's see what you've got!",
    "Bring the energy!",
    "Knowledge is power!",
    "Ready for the challenge?"
  ]

  const getRandomEncouragement = () => {
    return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-amber-900/90 via-yellow-900/90 to-amber-800/90 backdrop-blur-sm flex items-center justify-center"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45 animate-pulse" />
      </div>

      <div className="relative text-center max-w-2xl mx-auto px-8">
        {/* Main Message */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-amber-100 mb-4 drop-shadow-lg">
                {message}
              </h1>
              
              {nextRoundInfo && (
                <div className="space-y-2">
                  <p className="text-xl md:text-2xl text-amber-200">
                    Category: <span className="font-semibold text-yellow-300">{nextRoundInfo.category}</span>
                  </p>
                  {nextRoundInfo.stack && (
                    <p className="text-lg md:text-xl text-amber-300">
                      Stack: {nextRoundInfo.stack}
                    </p>
                  )}
                </div>
              )}

              {barMode && (
                <motion.p
                  key={Math.random()} // Force re-render for random message
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg text-amber-200 mt-6 italic"
                >
                  {getRandomEncouragement()}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown Display */}
        <AnimatePresence>
          {currentCount > 0 && (
            <motion.div
              key={currentCount}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15 
              }}
              className={`relative mb-12 ${getEnergyIntensity()}`}
            >
              {/* Glowing background circle */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getEnergyColors()} opacity-30 blur-xl transform scale-150`} />
              
              {/* Main countdown number */}
              <div className={`relative w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full bg-gradient-to-br ${getEnergyColors()} border-4 border-amber-200 shadow-2xl flex items-center justify-center`}>
                <span className="text-6xl md:text-8xl font-bold text-white drop-shadow-lg">
                  {currentCount}
                </span>
              </div>

              {/* Rotating energy rings */}
              {crowdEnergy >= 4 && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-32 h-32 md:w-48 md:h-48 mx-auto border-2 border-dashed border-yellow-300 rounded-full opacity-60"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-40 h-40 md:w-56 md:h-56 mx-auto border border-dashed border-amber-300 rounded-full opacity-40"
                    style={{ top: '-1rem', left: '-1rem' }}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ready Message */}
        {currentCount === 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-yellow-300 mb-4 drop-shadow-lg">
              GO!
            </h2>
            <div className="flex justify-center space-x-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="w-4 h-4 bg-yellow-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Skip Button (for hosts) */}
        {showSkipButton && currentCount > 1 && barMode && (
          <motion.button
            onClick={onSkip}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-semibold shadow-lg border-2 border-amber-400 transition-colors"
          >
            Skip Countdown ⏭️
          </motion.button>
        )}

        {/* Energy Indicators */}
        {barMode && crowdEnergy >= 3 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {[...Array(crowdEnergy)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
                className="w-3 h-3 bg-yellow-400 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Crowd Cheer Animation */}
        {crowdEnergy >= 4 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: `${Math.random() * 100}%`,
                  y: "100%",
                  scale: 0
                }}
                animate={{ 
                  y: "-20%",
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
                className="absolute text-yellow-300 text-2xl"
              >
                {['🎉', '⭐', '🏆', '🔥', '💪'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default TransitionCountdown
