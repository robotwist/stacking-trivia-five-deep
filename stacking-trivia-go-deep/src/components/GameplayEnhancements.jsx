import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const GameplayEnhancements = ({ 
  isVisible,
  celebrationType = 'correct', // correct, wrong, levelUp, gameComplete
  children,
  onAnimationComplete = () => {}
}) => {
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (isVisible && celebrationType) {
      setShowCelebration(true)
      const timer = setTimeout(() => {
        setShowCelebration(false)
        onAnimationComplete()
      }, celebrationType === 'gameComplete' ? 3000 : 1500)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, celebrationType, onAnimationComplete])

  const celebrationVariants = {
    correct: {
      initial: { scale: 0, rotate: -180 },
      animate: { 
        scale: [0, 1.2, 1],
        rotate: [0, 10, -10, 0],
        transition: { duration: 0.6, ease: "easeOut" }
      },
      exit: { scale: 0, opacity: 0 }
    },
    wrong: {
      initial: { x: 0 },
      animate: { 
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      },
      exit: { opacity: 0 }
    },
    levelUp: {
      initial: { y: 50, opacity: 0 },
      animate: { 
        y: 0, 
        opacity: 1,
        scale: [1, 1.1, 1],
        transition: { duration: 0.8, ease: "easeOut" }
      },
      exit: { y: -50, opacity: 0 }
    },
    gameComplete: {
      initial: { scale: 0, opacity: 0 },
      animate: { 
        scale: [0, 1.2, 1],
        opacity: 1,
        rotate: [0, 360],
        transition: { duration: 1.2, ease: "easeOut" }
      },
      exit: { scale: 0, opacity: 0 }
    }
  }

  const backgroundEffects = {
    correct: "bg-green-500/20 border-green-400",
    wrong: "bg-red-500/20 border-red-400",
    levelUp: "bg-yellow-500/20 border-yellow-400",
    gameComplete: "bg-purple-500/20 border-purple-400"
  }

  const celebrationIcons = {
    correct: "🎉",
    wrong: "❌",
    levelUp: "⭐",
    gameComplete: "🏆"
  }

  const celebrationMessages = {
    correct: ["Brilliant!", "Excellent!", "Outstanding!", "Perfect!", "Fantastic!"],
    wrong: ["Almost!", "So Close!", "Try Again!", "Keep Going!"],
    levelUp: ["Level Up!", "Well Done!", "Impressive!", "Moving Up!"],
    gameComplete: ["Champion!", "Victory!", "Amazing Game!", "Congratulations!"]
  }

  const getRandomMessage = (type) => {
    const messages = celebrationMessages[type] || celebrationMessages.correct
    return messages[Math.floor(Math.random() * messages.length)]
  }

  return (
    <div className="relative">
      {children}
      
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className={`absolute inset-0 flex items-center justify-center z-50 rounded-xl border-2 ${backgroundEffects[celebrationType]} backdrop-blur-sm`}
            variants={celebrationVariants[celebrationType]}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ 
                  rotate: celebrationType === 'gameComplete' ? [0, 360] : [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {celebrationIcons[celebrationType]}
              </motion.div>
              
              <motion.h2 
                className="text-3xl font-bold text-white drop-shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {getRandomMessage(celebrationType)}
              </motion.h2>
              
              {celebrationType === 'levelUp' && (
                <motion.div
                  className="mt-4 text-yellow-400 font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Moving to the next level!
                </motion.div>
              )}
            </div>
            
            {/* Particle effects for special celebrations */}
            {(celebrationType === 'correct' || celebrationType === 'gameComplete') && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    initial={{ 
                      x: "50%", 
                      y: "50%",
                      scale: 0 
                    }}
                    animate={{ 
                      x: `${50 + (Math.cos(i * 30 * Math.PI / 180) * 200)}%`,
                      y: `${50 + (Math.sin(i * 30 * Math.PI / 180) * 200)}%`,
                      scale: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GameplayEnhancements
