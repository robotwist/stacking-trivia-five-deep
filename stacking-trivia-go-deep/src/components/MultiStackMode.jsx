import { useState, useEffect } from 'react'
import GameStack from './GameStack'
import { shuffleArray } from '../utils/arrayUtils'
import { useAuth } from '../contexts/AuthContext'
import { createGameSession, updateGameSession, recordStackResult } from '../services/gameSessionClient'

const MultiStackMode = ({ 
  gameStacks, 
  categoriesConfig, 
  onExit,
  enableCrossCategoryPlay = true 
}) => {
  const [playerScore, setPlayerScore] = useState(0)
  const [currentStackIndex, setCurrentStackIndex] = useState(0)
  const [completedStacks, setCompletedStacks] = useState([])
  const [gamePhase, setGamePhase] = useState('stack-select') // stack-select, stack-playing, game-complete
  const [availableStacks, setAvailableStacks] = useState([])
  const [selectedStacks, setSelectedStacks] = useState([])
  const [gameSession, setGameSession] = useState(null)
  const [gameStartTime, setGameStartTime] = useState(null)
  // Moved out of conditional render to comply with React hooks rules
  const [selectedStackKeys, setSelectedStackKeys] = useState(new Set())
  const [numberOfStacks, setNumberOfStacks] = useState(5)

  const { isAuthenticated, user } = useAuth()

  // Initialize available stacks from all categories
  useEffect(() => {
    const allStacks = []
    Object.entries(categoriesConfig.categories).forEach(([categoryKey, category]) => {
      category.stacks.forEach(stackKey => {
        if (gameStacks[stackKey]) {
          allStacks.push({
            key: stackKey,
            data: gameStacks[stackKey],
            category: categoryKey,
            categoryTitle: category.title,
            categoryIcon: category.icon
          })
        }
      })
    })
    setAvailableStacks(shuffleArray(allStacks))
  }, [gameStacks, categoriesConfig])

  const currentStack = selectedStacks[currentStackIndex]

  const startGame = async (stacksToPlay) => {
    setSelectedStacks(stacksToPlay)
    setCurrentStackIndex(0)
    setPlayerScore(0)
    setCompletedStacks([])
    setGameStartTime(Date.now())
    
    // Create game session if user is authenticated
    if (isAuthenticated && user) {
      try {
        const sessionId = await createGameSession(user.id, 'multi-stack')
        setGameSession(sessionId)
      } catch (error) {
        console.error('Failed to create game session:', error)
      }
    }
    
    setGamePhase('stack-playing')
  }

  const handleStackComplete = async (finalScore) => {
    const stackScore = typeof finalScore === 'number' ? finalScore : 0
    console.log('Stack completed with score:', finalScore, 'processed as:', stackScore)
    
    setPlayerScore(prev => prev + stackScore)
    setCompletedStacks(prev => [...prev, currentStack.key])
    
    // Record stack result if authenticated
    if (isAuthenticated && gameSession && currentStack) {
      try {
        await recordStackResult(
          gameSession,
          currentStack.data.title,
          currentStack.data.questions?.length || 5,
          Math.floor(stackScore / 50), // Rough estimate of correct answers
          stackScore,
          false, // deeper mode attempted
          false, // deeper mode completed
          currentStack.category
        )
      } catch (error) {
        console.error('Failed to record stack result:', error)
      }
    }
    
    // Check if more stacks available
    if (currentStackIndex + 1 < selectedStacks.length) {
      setCurrentStackIndex(prev => prev + 1)
      // Continue to next stack after a brief pause
      setTimeout(() => {
        // Game continues automatically
      }, 1000)
    } else {
      // All stacks complete
      if (isAuthenticated && gameSession) {
        try {
          const duration = Math.floor((Date.now() - gameStartTime) / 60000) // minutes
          await updateGameSession(
            gameSession,
            playerScore + stackScore,
            completedStacks.concat(currentStack.key),
            duration
          )
        } catch (error) {
          console.error('Failed to update game session:', error)
        }
      }
      setGamePhase('game-complete')
    }
  }

  const restartGame = () => {
    setPlayerScore(0)
    setCurrentStackIndex(0)
    setCompletedStacks([])
    setSelectedStacks([])
    setGameSession(null)
    setGameStartTime(null)
    setGamePhase('stack-select')
  }

  const exitGame = () => {
    onExit && onExit()
  }

  // Stack selection screen
  if (gamePhase === 'stack-select') {

    const toggleStackSelection = (stackKey) => {
      const newSelection = new Set(selectedStackKeys)
      if (newSelection.has(stackKey)) {
        newSelection.delete(stackKey)
      } else {
        newSelection.add(stackKey)
      }
      setSelectedStackKeys(newSelection)
    }

    const selectRandomStacks = () => {
      const randomStacks = shuffleArray([...availableStacks])
        .slice(0, numberOfStacks)
        .map(stack => stack.key)
      setSelectedStackKeys(new Set(randomStacks))
    }

    const startSelectedGame = () => {
      const stacksToPlay = availableStacks.filter(stack => 
        selectedStackKeys.has(stack.key)
      )
      if (stacksToPlay.length > 0) {
        startGame(stacksToPlay)
      }
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={exitGame}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Exit Multi-Stack Mode"
            >
              ← Exit Multi-Stack Mode
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedStackKeys.size} stacks selected
              </div>
            </div>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">Multi-Stack Challenge</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Select multiple stacks from different categories for the ultimate trivia challenge</p>
          </div>

          {/* Controls */}
          <div className="mb-8 flex flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 dark:text-gray-300">Random stacks:</label>
              <select 
                value={numberOfStacks} 
                onChange={(e) => setNumberOfStacks(parseInt(e.target.value))}
                className="px-3 py-1 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
              </select>
              <button
                onClick={selectRandomStacks}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
              >
                Select Random
              </button>
            </div>
            
            <button
              onClick={() => setSelectedStackKeys(new Set())}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
            >
              Clear All
            </button>

            {selectedStackKeys.size > 0 && (
              <button
                onClick={startSelectedGame}
                className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300"
              >
                Start Game ({selectedStackKeys.size} stacks)
              </button>
            )}
          </div>

          {/* Stack grid organized by category */}
          <div className="max-w-7xl mx-auto">
            {Object.entries(categoriesConfig.categories).map(([categoryKey, category]) => {
              const categoryStacks = availableStacks.filter(stack => stack.category === categoryKey)
              if (categoryStacks.length === 0) return null

              return (
                <div key={categoryKey} className="mb-10">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <span className="text-3xl">{category.icon}</span>
                    {category.title}
                    <span className="text-sm font-normal text-gray-500">
                      ({categoryStacks.filter(stack => selectedStackKeys.has(stack.key)).length}/{categoryStacks.length} selected)
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryStacks.map((stack) => (
                      <div
                        key={stack.key}
                        onClick={() => toggleStackSelection(stack.key)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          selectedStackKeys.has(stack.key)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                          {stack.data.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {stack.data.description || `${stack.data.questions?.length || 5} questions`}
                        </p>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {selectedStackKeys.has(stack.key) ? '✓ Selected' : 'Click to select'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Game complete screen
  if (gamePhase === 'game-complete') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center transition-colors duration-300">
        <div className="text-center max-w-2xl mx-auto p-8">
          <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">Challenge Complete!</h1>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-8 shadow-lg">
            <div className="text-4xl font-bold mb-4 text-blue-600 dark:text-blue-400">Final Score: {playerScore}</div>
            <div className="text-xl mb-4 text-gray-900 dark:text-gray-100">
              You completed {completedStacks.length} stacks from multiple categories!
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-300">
              Average score per stack: {Math.round(playerScore / completedStacks.length)} points
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={restartGame}
              className="px-8 py-4 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Start another multi-stack challenge"
            >
              New Challenge
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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          {/* Header with score and progress */}
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={restartGame}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Return to stack selection"
            >
              ← Select Different Stacks
            </button>
            <div className="text-center">
              <div className="text-lg font-semibold">{currentStack.categoryTitle}</div>
              <div className="text-sm text-amber-700">
                Stack {currentStackIndex + 1} of {selectedStacks.length}
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
                style={{ width: `${(completedStacks.length / selectedStacks.length) * 100}%` }}
                role="progressbar"
                aria-valuenow={completedStacks.length}
                aria-valuemax={selectedStacks.length}
                aria-label={`Progress: ${completedStacks.length} of ${selectedStacks.length} stacks completed`}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
              Progress: {completedStacks.length}/{selectedStacks.length} stacks
            </div>
          </div>

          <GameStack 
            stackData={currentStack.data} 
            onComplete={handleStackComplete}
          />
        </div>
      </div>
    )
  }

  return null
}

export default MultiStackMode
