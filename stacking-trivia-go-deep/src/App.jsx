import { useState, useEffect } from 'react'
import GameStack from './components/GameStack'
import HostMode from './components/HostMode'
import OpeningImageRound from './components/OpeningImageRound'

// Import categorized stacks
import vanGoghData from './data/categories/arts-culture/van-gogh.json'
import beatlesData from './data/categories/arts-culture/the_beatles.json'
import fridaKahloData from './data/categories/arts-culture/frida-kahlo.json'
import milesDavisData from './data/categories/arts-culture/miles-davis.json'

import olympicCurrentData from './data/categories/sports/olympic_distance_current.json'
import muhammadAliData from './data/categories/sports/muhammad-ali.json'
import michaelJordanData from './data/categories/sports/michael-jordan.json'

import bladeRunnerData from './data/categories/cinema/blade_runner.json'
import godfatherData from './data/categories/cinema/the-godfather.json'

import ancientGreeceData from './data/categories/history/ancient_greece.json'
import cleopatraData from './data/categories/history/cleopatra.json'

import categoriesConfig from './data/categories.json'
import './App.css'

const gameStacks = {
  // Arts & Culture
  'van-gogh': vanGoghData,
  'the_beatles': beatlesData,
  'frida-kahlo': fridaKahloData,
  'miles-davis': milesDavisData,
  
  // Sports
  'olympic_distance_current': olympicCurrentData,
  'muhammad-ali': muhammadAliData,
  'michael-jordan': michaelJordanData,
  
  // Cinema
  'blade_runner': bladeRunnerData,
  'the-godfather': godfatherData,
  
  // History
  'ancient_greece': ancientGreeceData,
  'cleopatra': cleopatraData
}

function App() {
  const [selectedStack, setSelectedStack] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState('solo') // solo, host, opening-round, individual-stacks
  const [teams, setTeams] = useState([])
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleStackSelect = (stackKey) => {
    setSelectedStack(stackKey)
    setGameStarted(true)
  }

  const handleCategorySelect = (categoryKey) => {
    setSelectedCategory(categoryKey)
    setSelectedStack(null)
    setGameStarted(false)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSelectedStack(null)
    setGameStarted(false)
    setGameMode('solo')
  }

  const handleBackToStacks = () => {
    setSelectedStack(null)
    setGameStarted(false)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Host Mode handlers
  const enterHostMode = () => {
    setGameMode('host')
    setSelectedCategory(null)
    setSelectedStack(null)
    setGameStarted(false)
  }

  const exitHostMode = () => {
    setGameMode('solo')
    setTeams([])
  }

  const handleStartGame = (gameData) => {
    setTeams(gameData.teams)
    setGameMode('opening-round')
  }

  const handleOpeningRoundComplete = (results) => {
    setGameMode('individual-stacks')
    // Could update team order based on opening round results
  }

  // Route to Host Mode
  if (gameMode === 'host') {
    return <HostMode onStartGame={handleStartGame} onExitHost={exitHostMode} />
  }

  // Route to Opening Image Round
  if (gameMode === 'opening-round') {
    return <OpeningImageRound teams={teams} onRoundComplete={handleOpeningRoundComplete} />
  }

  // Route to Individual Stacks (multi-team mode)
  if (gameMode === 'individual-stacks') {
    // For now, redirect back to categories - this would be enhanced later
    setGameMode('solo')
    setSelectedCategory(null)
  }

  if (gameStarted && selectedStack && gameStacks[selectedStack]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <button 
            onClick={handleBackToStacks}
            className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200 backdrop-blur-sm"
          >
            ← Back to Stacks
          </button>
          <GameStack 
            stackData={gameStacks[selectedStack]} 
            onComplete={handleBackToStacks}
          />
        </div>
      </div>
    )
  }

  if (selectedCategory) {
    const category = categoriesConfig.categories[selectedCategory]
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900'
      }`}>
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={handleBackToCategories}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md'
              }`}
            >
              ← Back to Categories
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">{category.icon}</div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{category.title}</h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {category.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {category.stacks.map((stackKey) => {
              const stack = gameStacks[stackKey]
              if (!stack) return null
              
              return (
                <button
                  key={stackKey}
                  onClick={() => handleStackSelect(stackKey)}
                  className={`group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                    darkMode
                      ? 'bg-gray-800/50 hover:bg-gray-700/60 backdrop-blur-sm border border-gray-700/50'
                      : 'bg-white/70 hover:bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl border border-white/50'
                  }`}
                >
                  <div className={`w-full h-2 rounded-full mb-4 bg-gradient-to-r ${category.color}`}></div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {stack.title}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    {stack.description || "Dive deep into this fascinating topic"}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      5 Questions Deep
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      160 pts max
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Main category selection screen
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white' 
        : 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={enterHostMode}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              darkMode 
                ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                : 'bg-purple-100 hover:bg-purple-200 text-purple-800 shadow-md'
            }`}
          >
            🎭 Host Mode
          </button>
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-lg transition-all duration-200 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md'
            }`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className="text-center mb-12">
          <div className="text-7xl mb-6">🎯</div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            DeepStack
          </h1>
          <p className="text-xl sm:text-2xl mb-4 font-medium">
            Trivia That Dares to Matter
          </p>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Monty Python meets You Don't Know Jack meets bar culture. 
            Choose your realm of knowledge and go five questions deep.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.entries(categoriesConfig.categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleCategorySelect(key)}
              className={`group p-8 rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                darkMode
                  ? 'bg-gray-800/30 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/30'
                  : 'bg-white/60 hover:bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl border border-white/40'
              }`}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <div className={`w-full h-3 rounded-full mb-6 bg-gradient-to-r ${category.color}`}></div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {category.title}
              </h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                {category.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {category.stacks.length} Stacks Available
                </span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  Explore →
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className={`text-center mt-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-sm">
            Each stack: 5 questions deep • Exponential scoring: 10 → 20 → 40 → 80 → 160 points
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
