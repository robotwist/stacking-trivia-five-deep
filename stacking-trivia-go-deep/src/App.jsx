import { useState, useEffect } from 'react'
import GameStack from './components/GameStack'
import HostMode from './components/HostMode'
import OpeningImageRound from './components/OpeningImageRound'
import PerformanceFinale from './components/PerformanceFinale'
import ProjectorScoreboard from './components/ProjectorScoreboard'
import ProjectorMode from './components/ProjectorMode'
import GilliamTransition from './components/GilliamTransition'

// Import categorized stacks
import vanGoghData from './data/categories/arts-culture/van-gogh.json'
import beatlesData from './data/categories/arts-culture/the_beatles.json'
import fridaKahloData from './data/categories/arts-culture/frida-kahlo.json'
import milesDavisData from './data/categories/arts-culture/miles-davis.json'
import shakespeareData from './data/categories/arts-culture/shakespeare.json'

import olympicCurrentData from './data/categories/sports/olympic_distance_current.json'
import muhammadAliData from './data/categories/sports/muhammad-ali.json'
import michaelJordanData from './data/categories/sports/michael-jordan.json'

import bladeRunnerData from './data/categories/cinema/blade_runner.json'
import godfatherData from './data/categories/cinema/the-godfather.json'
import starWarsData from './data/categories/cinema/star-wars.json'

import ancientGreeceData from './data/categories/history/ancient_greece.json'
import cleopatraData from './data/categories/history/cleopatra.json'
import einsteinData from './data/categories/history/einstein.json'

import vanGoghMythsData from './data/categories/actually/van-gogh-myths.json'
import einsteinMythsData from './data/categories/actually/einstein-myths.json'
import shakespeareMythsData from './data/categories/actually/shakespeare-myths.json'

import categoriesConfig from './data/categories.json'
import './App.css'

const gameStacks = {
  // Arts & Culture
  'van-gogh': vanGoghData,
  'the_beatles': beatlesData,
  'frida-kahlo': fridaKahloData,
  'miles-davis': milesDavisData,
  'shakespeare': shakespeareData,
  
  // Sports
  'olympic_distance_current': olympicCurrentData,
  'muhammad-ali': muhammadAliData,
  'michael-jordan': michaelJordanData,
  
  // Cinema
  'blade_runner': bladeRunnerData,
  'the-godfather': godfatherData,
  'star-wars': starWarsData,
  
  // History
  'ancient_greece': ancientGreeceData,
  'cleopatra': cleopatraData,
  'einstein': einsteinData,
  
  // Actually (Misconceptions)
  'van-gogh-myths': vanGoghMythsData,
  'einstein-myths': einsteinMythsData,
  'shakespeare-myths': shakespeareMythsData
}

function App() {
  const [selectedStack, setSelectedStack] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState('solo') // solo, host, opening-round, individual-stacks, performance-finale, projector-scoreboard, gilliam-projector, category-transition
  const [teams, setTeams] = useState([])
  const [gameHistory, setGameHistory] = useState([])
  const [performanceScores, setPerformanceScores] = useState({})
  const [currentRound, setCurrentRound] = useState('Game')
  const [gamePhase, setGamePhase] = useState('playing') // playing, round-complete, final-results
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  
  // Gilliam transition state
  const [transitionState, setTransitionState] = useState({
    fromCategory: null,
    toCategory: null,
    isTransitioning: false
  })
  const [projectorState, setProjectorState] = useState({
    gameState: 'setup', // setup, question, scoreboard, performance
    currentQuestion: null,
    questionNumber: 1
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

  // Performance Finale handlers
  const enterPerformanceFinale = () => {
    setGameMode('performance-finale')
    setCurrentRound('Performance Finale')
    setGamePhase('round-complete')
  }

  const handlePerformanceComplete = (scores) => {
    setPerformanceScores(scores)
    setGamePhase('final-results')
    setGameMode('projector-scoreboard')
  }

  // Projector Scoreboard handlers
  const enterProjectorMode = () => {
    setGameMode('projector-scoreboard')
  }

  // Gilliam Projector handlers
  const enterGilliamProjector = (gameState = 'setup') => {
    setProjectorState({
      gameState,
      currentQuestion: null,
      questionNumber: 1
    })
    setGameMode('gilliam-projector')
  }

  const triggerCategoryTransition = (fromCategory, toCategory) => {
    setTransitionState({
      fromCategory,
      toCategory, 
      isTransitioning: true
    })
    setGameMode('category-transition')
  }

  const handleTransitionComplete = () => {
    setTransitionState({
      fromCategory: null,
      toCategory: null,
      isTransitioning: false
    })
    // Return to previous mode or default
    setGameMode('gilliam-projector')
  }

  const updateProjectorState = (newState) => {
    setProjectorState(prev => ({ ...prev, ...newState }))
  }

  const trackGameAction = (action, stackTitle = null) => {
    setGameHistory(prev => [...prev, { 
      action, 
      stackTitle, 
      timestamp: Date.now() 
    }])
  }

  // Route to Host Mode
  if (gameMode === 'host') {
    return <HostMode 
      onStartGame={handleStartGame} 
      onExitHost={exitHostMode} 
      onEnterGilliamProjector={enterGilliamProjector}
      onTriggerTransition={triggerCategoryTransition}
    />
  }

  // Route to Opening Image Round
  if (gameMode === 'opening-round') {
    return <OpeningImageRound teams={teams} onRoundComplete={handleOpeningRoundComplete} />
  }

  // Route to Performance Finale
  if (gameMode === 'performance-finale') {
    return (
      <PerformanceFinale 
        teams={teams}
        gameHistory={gameHistory}
        onComplete={handlePerformanceComplete}
        darkMode={darkMode}
      />
    )
  }

  // Route to Projector Scoreboard
  if (gameMode === 'projector-scoreboard') {
    return (
      <ProjectorScoreboard 
        teams={teams}
        currentRound={currentRound}
        gamePhase={gamePhase}
        performanceScores={performanceScores}
        darkMode={darkMode}
      />
    )
  }

  // Route to Gilliam Projector Mode
  if (gameMode === 'gilliam-projector') {
    return (
      <ProjectorMode
        gameState={projectorState.gameState}
        currentStack={selectedStack}
        question={projectorState.currentQuestion}
        teams={teams}
        questionNumber={projectorState.questionNumber}
        onClose={() => setGameMode('host')}
      />
    )
  }

  // Route to Category Transition
  if (gameMode === 'category-transition') {
    return (
      <GilliamTransition
        fromCategory={transitionState.fromCategory}
        toCategory={transitionState.toCategory}
        onComplete={handleTransitionComplete}
        duration={6000}
      />
    )
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <button 
              onClick={handleBackToCategories}
              className={`px-4 py-2 rounded-lg transition-all duration-200 order-2 sm:order-1 ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md'
              }`}
            >
              ← Back to Categories
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 order-1 sm:order-2 ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md'
              }`}
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{category.title}</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {category.stacks.map((stackKey) => {
              const stack = gameStacks[stackKey]
              if (!stack) return null
              
              return (
                <button
                  key={stackKey}
                  onClick={() => handleStackSelect(stackKey)}
                  className={`group p-4 sm:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                    darkMode
                      ? 'bg-gray-800/50 hover:bg-gray-700/70 backdrop-blur-sm border border-gray-700/50'
                      : 'bg-white/80 hover:bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-200/30'
                  }`}
                >
                  {/* Visual hint area */}
                  {stack.imageHint && (
                    <div className={`mb-4 p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'
                    }`}>
                      <div className={`text-center mb-2 ${
                        darkMode ? 'text-yellow-400' : 'text-yellow-600'
                      }`}>
                        🖼️
                      </div>
                      <p className={`text-xs text-center italic ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {stack.imageHint}
                      </p>
                    </div>
                  )}
                  
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
        ? 'bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-800 text-amber-50' 
        : 'bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900'
    }`}>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-3 order-2 sm:order-1 justify-center sm:justify-start">
            <button
              onClick={enterHostMode}
              className={`px-3 sm:px-4 py-2 rounded-sm font-semibold transition-all duration-200 text-sm sm:text-base shadow-md border-2 ${
                darkMode 
                  ? 'bg-amber-700 hover:bg-amber-600 text-amber-100 border-amber-600' 
                  : 'bg-amber-700 hover:bg-amber-800 text-amber-100 border-amber-800'
              }`}
              style={{ filter: 'sepia(0.1) contrast(1.05)' }}
            >
              Host Mode
            </button>
            <button
              onClick={enterPerformanceFinale}
              className={`px-3 sm:px-4 py-2 rounded-sm font-semibold transition-all duration-200 text-sm sm:text-base shadow-md border-2 ${
                darkMode 
                  ? 'bg-yellow-700 hover:bg-yellow-600 text-yellow-100 border-yellow-600' 
                  : 'bg-yellow-700 hover:bg-yellow-800 text-yellow-100 border-yellow-800'
              }`}
              style={{ filter: 'sepia(0.1) contrast(1.05)' }}
            >
              Performance Finale
            </button>
            <button
              onClick={enterProjectorMode}
              className={`px-3 sm:px-4 py-2 rounded-sm font-semibold transition-all duration-200 text-sm sm:text-base shadow-md border-2 ${
                darkMode 
                  ? 'bg-yellow-800 hover:bg-yellow-700 text-yellow-100 border-yellow-600' 
                  : 'bg-yellow-800 hover:bg-yellow-900 text-yellow-100 border-yellow-900'
              }`}
              style={{ filter: 'sepia(0.1) contrast(1.05)' }}
            >
              Classic Projector
            </button>
            <button
              onClick={() => enterGilliamProjector('setup')}
              className={`px-3 sm:px-4 py-2 rounded-sm font-semibold transition-all duration-200 text-sm sm:text-base shadow-md border-2 ${
                darkMode 
                  ? 'bg-amber-800 hover:bg-amber-700 text-amber-100 border-amber-600' 
                  : 'bg-amber-800 hover:bg-amber-900 text-amber-100 border-amber-900'
              }`}
              style={{ filter: 'sepia(0.1) contrast(1.05)' }}
            >
              Gilliam Projector
            </button>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 sm:p-3 rounded-sm transition-all duration-200 order-1 sm:order-2 shadow-md border-2 font-semibold ${
              darkMode 
                ? 'bg-amber-600 hover:bg-amber-500 text-amber-100 border-amber-500' 
                : 'bg-amber-900 hover:bg-amber-800 text-amber-100 border-amber-800'
            }`}
            style={{ filter: 'sepia(0.1) contrast(1.05)' }}
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
        
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 bg-clip-text text-transparent">
            DeepStack
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 font-medium text-amber-800 dark:text-amber-200">
            Trivia That Dares to Matter
          </p>
          <p className={`text-base sm:text-lg ${darkMode ? 'text-amber-300' : 'text-amber-700'} max-w-3xl mx-auto leading-relaxed`}>
            Monty Python meets You Don't Know Jack meets bar culture. 
            Choose your realm of knowledge and go five questions deep.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-2 sm:px-4">
          {Object.entries(categoriesConfig.categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleCategorySelect(key)}
              className={`group p-4 sm:p-6 lg:p-8 rounded-sm sm:rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 ${
                darkMode
                  ? 'bg-amber-900/70 hover:bg-amber-800/80 backdrop-blur-sm border-amber-700/60 shadow-xl'
                  : 'bg-amber-100/90 hover:bg-amber-200/95 backdrop-blur-sm border-amber-300/60 shadow-xl'
              }`}
              style={{
                filter: darkMode ? 'sepia(0.3) contrast(1.2)' : 'sepia(0.2) contrast(1.1)',
                backgroundImage: darkMode 
                  ? 'linear-gradient(135deg, rgba(146, 64, 14, 0.2) 0%, rgba(92, 38, 7, 0.3) 100%)'
                  : 'linear-gradient(135deg, rgba(251, 245, 233, 0.8) 0%, rgba(254, 252, 232, 0.9) 100%)'
              }}
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <div className={`w-full h-2 sm:h-3 rounded-sm mb-4 sm:mb-6 bg-gradient-to-r ${category.color}`} style={{ filter: 'sepia(0.2)' }}></div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {category.title}
              </h2>
              <p className={`${darkMode ? 'text-amber-300' : 'text-amber-700'} mb-3 sm:mb-4 text-sm sm:text-base`}>
                {category.description}
              </p>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className={`${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  {category.stacks.length} Stacks Available
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  Explore →
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className={`text-center mt-16 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
          <p className="text-sm">
            Each stack: 5 questions deep • Scoring: 10 → 20 → 40 → 80 → 160 points
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
