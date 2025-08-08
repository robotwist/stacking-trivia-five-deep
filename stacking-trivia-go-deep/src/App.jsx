import { useState } from 'react'
import GameStack from './components/GameStack'
import vanGoghData from './data/stacks/van-gogh.json'
import olympicCurrentData from './data/stacks/olympic_distance_current.json'
import olympic1980sData from './data/stacks/olympic_distance_1980s.json'
import beatlesData from './data/stacks/the_beatles.json'
import bladeRunnerData from './data/stacks/blade_runner.json'
import nebraskaData from './data/stacks/nebraska_sports.json'
import ancientGreeceData from './data/stacks/ancient_greece.json'
import './App.css'

const gameStacks = {
  'van-gogh': vanGoghData,
  'olympic-current': olympicCurrentData,
  'olympic-1980s': olympic1980sData,
  'beatles': beatlesData,
  'blade-runner': bladeRunnerData,
  'nebraska': nebraskaData,
  'ancient-greece': ancientGreeceData
}

function App() {
  const [selectedStack, setSelectedStack] = useState('van-gogh')
  const [gameStarted, setGameStarted] = useState(false)

  const handleStackSelect = (stackKey) => {
    setSelectedStack(stackKey)
    setGameStarted(false)
  }

  const startGame = () => {
    setGameStarted(true)
  }

  const resetGame = () => {
    setGameStarted(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Stacking Trivia: Go Deep
        </h1>
        
        {!gameStarted ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Choose Your Topic</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(gameStacks).map(([key, stack]) => (
                  <button
                    key={key}
                    onClick={() => handleStackSelect(key)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedStack === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold">{stack.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{stack.description}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Start Game
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <button
                onClick={resetGame}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                ← Back to Selection
              </button>
            </div>
            <GameStack stack={gameStacks[selectedStack]} onComplete={resetGame} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
