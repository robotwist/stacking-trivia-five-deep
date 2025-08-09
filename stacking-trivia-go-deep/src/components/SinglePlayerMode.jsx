import { useState, useEffect } from 'react'
import GameStack from './GameStack'
import { shuffleArray } from '../utils/arrayUtils'
import { usePersistedState } from '../hooks/gameHooks'

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

  const handleStackComplete = (finalScore) => {
    // Ensure we always get a valid score - fix for 0 points bug
    const stackScore = typeof finalScore === 'number' ? finalScore : 0
    console.log('Stack completed with score:', finalScore, 'processed as:', stackScore) // Debug log
    setPlayerScore(prev => prev + stackScore)
    setCompletedStacks(prev => [...prev, currentStackKey])
    
    // Check if more stacks available in this category
    if (currentStackIndex + 1 < availableStacks.length) {
      setCurrentStackIndex(prev => prev + 1)
      setGamePhase('round-complete')
    } else {
      // Category complete
      setGamePhase('game-complete')
    }
  }

  const nextStack = () => {
    setGamePhase('stack-playing')
  }

  const selectCategory = (categoryKey) => {
    setCurrentCategory(categoryKey)
    setCurrentStackIndex(0)
    setCompletedStacks([])
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
    setGamePhase('category-select')
  }

  const exitGame = () => {
    onExit && onExit()
  }

  // Category selection screen
  if (gamePhase === 'category-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900 transition-colors duration-300" style={{ fontFamily: 'Baskerville, serif' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={exitGame}
              className="px-4 py-2 bg-amber-200/60 hover:bg-amber-300/60 rounded-sm text-amber-900 transition-all duration-200"
            >
              ← Exit Single Player
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold">Total Score: {playerScore}</div>
            </div>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-amber-800 drop-shadow-lg">Single Player Mode</h1>
            <p className="text-lg text-amber-700">Choose a category to begin your knowledge journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {Object.entries(categoriesConfig.categories).map(([categoryKey, category]) => (
              <button
                key={categoryKey}
                onClick={() => selectCategory(categoryKey)}
                className="group p-6 rounded-sm bg-amber-100/80 hover:bg-amber-200/70 border border-amber-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className={`w-full h-2 rounded-sm mb-4 bg-gradient-to-r ${category.color}`}></div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-amber-800 transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                  {category.description}
                </p>
                <div className="text-xs text-amber-600">
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900 flex items-center justify-center" style={{ fontFamily: 'Baskerville, serif' }}>
        <div className="text-center max-w-2xl mx-auto p-8">
          <h1 className="text-4xl font-bold mb-6 text-amber-800 drop-shadow-lg">Stack Complete!</h1>
          
          <div className="bg-amber-100/80 border border-amber-300 rounded-sm p-6 mb-6">
            <div className="text-2xl font-bold mb-4">Current Score: {playerScore}</div>
            <div className="text-lg mb-4">
              {completedStacks.length} of {category.stacks.length} stacks completed in {category.title}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Next Stack:</h2>
            <div className="bg-amber-200/60 border border-amber-300 rounded-sm p-4">
              <h3 className="text-xl font-bold mb-2">{currentStack?.title}</h3>
              <p className="text-amber-700">{currentStack?.description}</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={nextStack}
              className="px-8 py-4 text-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-sm font-bold transition-all sepia filter"
            >
              Continue to Next Stack
            </button>
            <button
              onClick={restartGame}
              className="px-8 py-4 text-xl bg-amber-200/60 hover:bg-amber-300/60 text-amber-900 rounded-sm font-bold transition-all"
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900 flex items-center justify-center" style={{ fontFamily: 'Baskerville, serif' }}>
        <div className="text-center max-w-2xl mx-auto p-8">
          <h1 className="text-5xl font-bold mb-6 text-amber-800 drop-shadow-lg">Category Complete!</h1>
          
          <div className="bg-amber-100/80 border border-amber-300 rounded-sm p-8 mb-8">
            <div className="text-4xl font-bold mb-4">Final Score: {playerScore}</div>
            <div className="text-xl mb-4">
              You completed all {completedStacks.length} stacks in {category.title}!
            </div>
            <div className="text-lg text-amber-700">
              Well done on your knowledge journey through {category.title.toLowerCase()}.
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={restartGame}
              className="px-8 py-4 text-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-sm font-bold transition-all sepia filter"
            >
              Play Another Category
            </button>
            <button
              onClick={exitGame}
              className="px-8 py-4 text-xl bg-amber-200/60 hover:bg-amber-300/60 text-amber-900 rounded-sm font-bold transition-all"
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900 transition-colors duration-300" style={{ fontFamily: 'Baskerville, serif' }}>
        <div className="container mx-auto px-4 py-8">
          {/* Header with score and progress */}
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={restartGame}
              className="px-4 py-2 bg-amber-200/60 hover:bg-amber-300/60 rounded-sm text-amber-900 transition-all duration-200"
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
              <div className="text-2xl font-bold">Score: {playerScore}</div>
              <div className="text-sm text-amber-700">
                {completedStacks.length} stacks complete
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="w-full bg-amber-200/60 rounded-sm h-2">
              <div 
                className="bg-gradient-to-r from-amber-600 to-yellow-600 h-2 rounded-sm transition-all duration-500"
                style={{ width: `${(completedStacks.length / availableStacks.length) * 100}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-amber-700 mt-2">
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
