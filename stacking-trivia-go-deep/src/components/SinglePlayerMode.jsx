import { useState, useEffect } from 'react'
import GameStack from './GameStack'
import { shuffleArray } from '../utils/arrayUtils'
import { useAuth } from '../contexts/AuthContext'
import { createGameSession, updateGameSession, recordStackResult } from '../services/gameSessionClient'

const SinglePlayerMode = ({ 
  gameStacks, 
  categoriesConfig, 
  onExit,
  selectedCategory = null 
}) => {
  const [playerScore, setPlayerScore] = useState(0)
  const [currentStackIndex, setCurrentStackIndex] = useState(0)
  const [currentCategory, setCurrentCategory] = useState(selectedCategory)
  const [completedStacks, setCompletedStacks] = useState([])
  const [gamePhase, setGamePhase] = useState('category-select') // category-select, stack-playing, round-complete, game-complete
  const [shuffledStacks, setShuffledStacks] = useState([]) // Store shuffled order
  const [gameSession, setGameSession] = useState(null)
  const [gameStartTime, setGameStartTime] = useState(null)

  const { isAuthenticated, user } = useAuth()

  // Get available stacks for current category and shuffle them
  const getAvailableStacks = () => {
    if (!currentCategory || !categoriesConfig.categories[currentCategory]) return []
    const availableStacks = categoriesConfig.categories[currentCategory].stacks.filter(stackKey => 
      gameStacks[stackKey] && !completedStacks.includes(stackKey)
    )
    return shuffleArray(availableStacks)
  }

  // Update shuffled stacks when category changes
  useEffect(() => {
    if (currentCategory) {
      setShuffledStacks(getAvailableStacks())
    }
  }, [currentCategory])

  const availableStacks = shuffledStacks
  const currentStackKey = availableStacks[currentStackIndex]
  const currentStack = currentStackKey ? gameStacks[currentStackKey] : null

  const handleStackComplete = async (finalScore) => {
    // Ensure we always get a valid score - fix for 0 points bug
    const stackScore = typeof finalScore === 'number' ? finalScore : 0
    console.log('Stack completed with score:', finalScore, 'processed as:', stackScore) // Debug log
    setPlayerScore(prev => prev + stackScore)
    setCompletedStacks(prev => [...prev, currentStackKey])
    
    // Record stack result if we have a game session
    if (gameSession && currentStack) {
      try {
        await recordStackResult(
          gameSession,
          currentStack.title,
          currentStack.questions?.length || 5,
          Math.floor(stackScore / 50), // Rough estimate of correct answers
          stackScore,
          false, // deeper mode attempted
          false, // deeper mode completed  
          currentCategory
        )
      } catch (error) {
        console.error('Failed to record stack result:', error)
      }
    }
    
    // Check if more stacks available in this category
    if (currentStackIndex + 1 < availableStacks.length) {
      setCurrentStackIndex(prev => prev + 1)
      setGamePhase('round-complete')
    } else {
      // Category complete - update final session
      if (gameSession) {
        try {
          const finalTotalScore = playerScore + stackScore
          const duration = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 60000) : 0
          await updateGameSession(
            gameSession,
            finalTotalScore,
            [...completedStacks, currentStackKey],
            duration
          )
        } catch (error) {
          console.error('Failed to update final game session:', error)
        }
      }
      setGamePhase('game-complete')
    }
  }

  const nextStack = () => {
    setGamePhase('stack-playing')
  }

  const selectCategory = async (categoryKey) => {
    setCurrentCategory(categoryKey)
    setCurrentStackIndex(0)
    setCompletedStacks([])
    setGameStartTime(Date.now())
    
    // Create game session
    try {
      const sessionId = await createGameSession(user?.id, 'single-player')
      setGameSession(sessionId)
    } catch (error) {
      console.error('Failed to create game session:', error)
    }
    
    // Shuffle stacks for this category immediately
    if (categoriesConfig.categories[categoryKey]) {
      const availableStacks = categoriesConfig.categories[categoryKey].stacks.filter(stackKey => 
        gameStacks[stackKey]
      )
      setShuffledStacks(shuffleArray(availableStacks))
    }
    setGamePhase('stack-playing')
  }

  const restartGame = () => {
    setPlayerScore(0)
    setCurrentStackIndex(0)
    setCurrentCategory(null)
    setCompletedStacks([])
    setShuffledStacks([]) // Clear shuffled stacks
    setGameSession(null)
    setGameStartTime(null)
    setGamePhase('category-select')
  }

  const exitGame = () => {
    onExit && onExit()
  }

  // Category selection screen
  if (gamePhase === 'category-select') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={exitGame}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Exit Single Player Mode"
            >
              ← Exit Single Player
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">Total Score: {playerScore}</div>
            </div>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">Single Player Mode</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Choose a category to begin your knowledge journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" role="grid" aria-label="Category selection grid">
            {Object.entries(categoriesConfig.categories).map(([categoryKey, category]) => (
              <button
                key={categoryKey}
                onClick={() => selectCategory(categoryKey)}
                className="group p-6 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                role="gridcell"
                aria-label={`Select ${category.title} category with ${category.stacks.length} available stacks`}
              >
                <div className="text-4xl mb-4 text-center">{category.icon}</div>
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {category.description}
                </p>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {category.stacks.length} stacks available
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Round complete screen (between stacks)
  if (gamePhase === 'round-complete') {
    const category = categoriesConfig.categories[currentCategory]
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center transition-colors duration-300">
        <div className="text-center max-w-2xl mx-auto p-8">
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">Stack Complete!</h1>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6 shadow-lg">
            <div className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Current Score: {playerScore}</div>
            <div className="text-lg mb-4 text-gray-600 dark:text-gray-300">
              {completedStacks.length} of {category.stacks.length} stacks completed in {category.title}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Next Stack:</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{currentStack?.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{currentStack?.description}</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={nextStack}
              className="px-8 py-4 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Continue to next trivia stack"
            >
              Continue to Next Stack
            </button>
            <button
              onClick={restartGame}
              className="px-8 py-4 text-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Choose a new category to play"
            >
              Choose New Category
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Game complete screen (category finished)
  if (gamePhase === 'game-complete') {
    const category = categoriesConfig.categories[currentCategory]
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center transition-colors duration-300">
        <div className="text-center max-w-2xl mx-auto p-8">
          <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">Category Complete!</h1>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-8 shadow-lg">
            <div className="text-4xl font-bold mb-4 text-blue-600 dark:text-blue-400">Final Score: {playerScore}</div>
            <div className="text-xl mb-4 text-gray-900 dark:text-gray-100">
              You completed all {completedStacks.length} stacks in {category.title}!
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-300">
              Well done on your knowledge journey through {category.title.toLowerCase()}.
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={restartGame}
              className="px-8 py-4 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Play another category"
            >
              Play Another Category
            </button>
            <button
              onClick={exitGame}
              className="px-8 py-4 text-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Return to main menu"
            >
              Return to Main Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Playing a stack
  if (gamePhase === 'stack-playing' && currentStack) {
    const category = categoriesConfig.categories[currentCategory]
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          {/* Header with score and progress */}
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={restartGame}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Choose different category"
            >
              ← Choose Category
            </button>
            <div className="text-center">
              <div className="text-lg font-semibold">{category.title}</div>
              <div className="text-sm text-amber-700">
                Stack {currentStackIndex + 1} of {availableStacks.length}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">Score: {playerScore}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {completedStacks.length} stacks complete
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-lg transition-all duration-500"
                style={{ width: `${(completedStacks.length / availableStacks.length) * 100}%` }}
                role="progressbar"
                aria-valuenow={completedStacks.length}
                aria-valuemax={availableStacks.length}
                aria-label={`Progress: ${completedStacks.length} of ${availableStacks.length} stacks completed`}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
              Progress: {completedStacks.length}/{availableStacks.length} stacks
            </div>
          </div>

          <GameStack 
            stackData={currentStack} 
            onComplete={handleStackComplete}
          />
        </div>
      </div>
    )
  }

  return null
}

export default SinglePlayerMode
