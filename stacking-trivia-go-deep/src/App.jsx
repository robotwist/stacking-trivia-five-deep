import { useState, Suspense, lazy, useMemo } from 'react'
import GameStack from './components/GameStack'
import CategorySelection from './components/CategorySelection'
import GameErrorBoundary from './components/GameErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import UnlockNotification from './components/UnlockNotification'
import PhotoFirstTest from './components/PhotoFirstTest'
import { AuthProvider } from './contexts/AuthContext'
import UserProfile from './components/UserProfile'
import AuthErrorBoundary from './components/AuthErrorBoundary'

import { gamePersistence } from './services/gamePersistence'

// Lazy load heavy components for better performance
const HostMode = lazy(() => import('./components/HostMode'))
const OpeningImageRound = lazy(() => import('./components/OpeningImageRound'))
const PerformanceFinale = lazy(() => import('./components/PerformanceFinale'))
const ProjectorScoreboard = lazy(() => import('./components/ProjectorScoreboard'))
const ProjectorMode = lazy(() => import('./components/ProjectorMode'))
const GilliamTransition = lazy(() => import('./components/GilliamTransition'))
const SinglePlayerMode = lazy(() => import('./components/SinglePlayerMode'))
const MultiStackMode = lazy(() => import('./components/MultiStackMode'))
const BarTriviaNight = lazy(() => import('./components/BarTriviaNight'))

// Import utilities
import { shuffleArray } from './utils/arrayUtils'
import { useDarkMode, useGameHistory } from './hooks/gameHooks'
import { stackUnlockManager } from './utils/stackUnlocks'

// Import categorized stacks
import vanGoghData from './data/categories/arts-culture/van-gogh.json'
import beatlesData from './data/categories/arts-culture/the_beatles.json'
import fridaKahloData from './data/categories/arts-culture/frida-kahlo.json'
import milesDavisData from './data/categories/arts-culture/miles-davis.json'
import shakespeareData from './data/categories/arts-culture/shakespeare.json'
import leonardoData from './data/categories/arts-culture/leonardo-da-vinci.json'
import mozartData from './data/categories/arts-culture/mozart.json'

import olympicCurrentData from './data/categories/sports/olympic_distance_current.json'
import muhammadAliData from './data/categories/sports/muhammad-ali.json'
import michaelJordanData from './data/categories/sports/michael-jordan.json'
import serenaWilliamsData from './data/categories/sports/serena-williams.json'

import teslaData from './data/categories/science-technology/tesla.json'
import darwinData from './data/categories/science-technology/darwin.json'
import nasaData from './data/categories/science-technology/nasa.json'
import marieCurieData from './data/categories/science-technology/marie-curie.json'
import steveJobsData from './data/categories/science-technology/steve-jobs.json'

import bladeRunnerData from './data/categories/cinema/blade_runner.json'
import godfatherData from './data/categories/cinema/the-godfather.json'
import starWarsData from './data/categories/cinema/star-wars.json'

// Kids category imports
import dinosaursData from './data/categories/kids/dinosaurs.json'
import superheroesData from './data/categories/kids/superheroes.json'
import spaceData from './data/categories/kids/space.json'
import videogamesData from './data/categories/kids/videogames.json'
import animalsData from './data/categories/kids/animals.json'

import ancientGreeceData from './data/categories/history/ancient_greece.json'
import cleopatraData from './data/categories/history/cleopatra.json'
import einsteinData from './data/categories/history/einstein.json'

import vanGoghMythsData from './data/categories/actually/van-gogh-myths.json'
import einsteinMythsData from './data/categories/actually/einstein-myths.json'
import shakespeareMythsData from './data/categories/actually/shakespeare-myths.json'

// Pop Culture stacks
import howIMetYourMotherData from './data/stacks/how_i_met_your_mother.json'
import communityData from './data/stacks/community.json'
import theGooniesData from './data/stacks/the_goonies.json'
import theOfficeData from './data/stacks/the_office.json'
import friendsData from './data/stacks/friends.json'
import backToTheFutureData from './data/stacks/back_to_the_future.json'
import strangerThingsData from './data/stacks/stranger_things.json'

// Super Stacks
import heroesJourneySuperData from './data/stacks/heroes-journey-super.json'
import jesusHistoricalMythicData from './data/stacks/jesus-historical-mythic.json'
import philipKDickSuperData from './data/stacks/philip-k-dick-super.json'
import characterNameOriginsData from './data/stacks/character-name-origins.json'

import categoriesConfig from './data/categories.json'
import './App.css'

function App() {
  const [selectedStack, setSelectedStack] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState('solo') // solo, single-player, host, opening-round, individual-stacks, performance-finale, projector-scoreboard, gilliam-projector, category-transition, bar-trivia
  const [teams, setTeams] = useState([])
  const [performanceScores, setPerformanceScores] = useState({})
  const [currentRound, setCurrentRound] = useState('Game')
  const [gamePhase, setGamePhase] = useState('playing') // playing, round-complete, final-results
  const [unlockNotification, setUnlockNotification] = useState(null)
  const [testMode, setTestMode] = useState(false) // For testing photo-first system
  
    // Memoize gameStacks object to prevent recreation on every render
  const gameStacks = useMemo(() => ({
    // Arts & Culture
    'van-gogh': vanGoghData,
    'the_beatles': beatlesData,
    'frida-kahlo': fridaKahloData,
    'miles-davis': milesDavisData,
    'shakespeare': shakespeareData,
    'leonardo-da-vinci': leonardoData,
    'mozart': mozartData,
    
    // Sports
    'olympic_distance_current': olympicCurrentData,
    'muhammad-ali': muhammadAliData,
    'michael-jordan': michaelJordanData,
    'serena-williams': serenaWilliamsData,
    
    // Science & Technology
    'tesla': teslaData,
    'darwin': darwinData,
    'nasa': nasaData,
    'marie-curie': marieCurieData,
    'steve-jobs': steveJobsData,
    
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
    'shakespeare-myths': shakespeareMythsData,
    
    // Pop Culture
    'how-i-met-your-mother': howIMetYourMotherData,
    'community': communityData,
    'the-goonies': theGooniesData,
    'the-office': theOfficeData,
    'friends': friendsData,
    'back-to-the-future': backToTheFutureData,
    'stranger-things': strangerThingsData,
    
    // Kids Zone
    'dinosaurs': dinosaursData,
    'superheroes': superheroesData,
    'space': spaceData,
    'videogames': videogamesData,
    'animals': animalsData,
    
    // Super Stacks
    'heroes-journey-super': heroesJourneySuperData,
    'jesus-historical-mythic': jesusHistoricalMythicData,
    'philip-k-dick-super': philipKDickSuperData,
    'character-name-origins': characterNameOriginsData
  }), [])
  
  // Use custom hooks
  const [darkMode, toggleDarkMode] = useDarkMode()
  const [gameHistory, addToGameHistory] = useGameHistory()
  
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

  // Stack completion with unlock system
  const handleStackComplete = async (score, totalPossible) => {
    if (selectedStack) {
      // Save to backend if user is authenticated
      try {
        await gamePersistence.saveGameScore(score, selectedStack);
      } catch (error) {
        console.log('Backend save failed, using local storage:', error);
      }
      
      // Check for new unlocks
      const newUnlocks = stackUnlockManager.completeStack(selectedStack, score, totalPossible);
      
      // Show unlock notification if there are new unlocks
      if (newUnlocks.length > 0) {
        const unlock = stackUnlockManager.formatUnlockNotification(newUnlocks[0]);
        setUnlockNotification(unlock);
      }
      
      // Add to game history
      addToGameHistory({
        stackKey: selectedStack,
        score,
        totalPossible,
        percentage: Math.round((score / totalPossible) * 100),
        completedAt: new Date().toISOString()
      });
    }
    
    // Return to stacks
    handleBackToStacks();
  }

  const handleCloseUnlockNotification = () => {
    setUnlockNotification(null);
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
    addToGameHistory(action, stackTitle)
  }

  // Higher-order component for lazy-loaded routes with error boundary and loading
  const LazyRoute = ({ children }) => (
    <GameErrorBoundary>
      <Suspense fallback={<LoadingSpinner size="lg" message="Loading game mode..." darkMode={darkMode} />}>
        {children}
      </Suspense>
    </GameErrorBoundary>
  )

  // Route to Host Mode
  if (gameMode === 'host') {
    return (
      <LazyRoute>
        <HostMode 
          onStartGame={handleStartGame} 
          onExitHost={exitHostMode} 
          onEnterGilliamProjector={enterGilliamProjector}
          onTriggerTransition={triggerCategoryTransition}
        />
      </LazyRoute>
    )
  }

  // Route to Opening Image Round
  if (gameMode === 'opening-round') {
    return (
      <LazyRoute>
        <OpeningImageRound teams={teams} onRoundComplete={handleOpeningRoundComplete} />
      </LazyRoute>
    )
  }

  // Route to Performance Finale
  if (gameMode === 'performance-finale') {
    return (
      <LazyRoute>
        <PerformanceFinale 
          teams={teams}
          gameHistory={gameHistory}
          onComplete={handlePerformanceComplete}
          darkMode={darkMode}
        />
      </LazyRoute>
    )
  }

  // Route to Projector Scoreboard
  if (gameMode === 'projector-scoreboard') {
    return (
      <LazyRoute>
        <ProjectorScoreboard 
          teams={teams}
          currentRound={currentRound}
          gamePhase={gamePhase}
          performanceScores={performanceScores}
          darkMode={darkMode}
          onExit={() => setGameMode('host')}
        />
      </LazyRoute>
    )
  }

  // Route to Gilliam Projector Mode
  if (gameMode === 'gilliam-projector') {
    return (
      <LazyRoute>
        <ProjectorMode
          gameState={projectorState.gameState}
          currentStack={selectedStack}
          question={projectorState.currentQuestion}
          teams={teams}
          questionNumber={projectorState.questionNumber}
          onClose={() => setGameMode('host')}
        />
      </LazyRoute>
    )
  }

  // Route to Category Transition
  if (gameMode === 'category-transition') {
    return (
      <LazyRoute>
        <GilliamTransition
          fromCategory={transitionState.fromCategory}
          toCategory={transitionState.toCategory}
          onComplete={handleTransitionComplete}
          duration={6000}
        />
      </LazyRoute>
    )
  }

  // Route to Single Player Mode
  if (gameMode === 'single-player') {
    return (
      <LazyRoute>
        <SinglePlayerMode
          gameStacks={gameStacks}
          categoriesConfig={categoriesConfig}
          onExit={() => setGameMode('solo')}
          selectedCategory={selectedCategory}
        />
      </LazyRoute>
    )
  }

  // Route to Multi-Stack Mode
  if (gameMode === 'multi-stack') {
    return (
      <LazyRoute>
        <MultiStackMode
          gameStacks={gameStacks}
          categoriesConfig={categoriesConfig}
          onExit={() => setGameMode('solo')}
        />
      </LazyRoute>
    )
  }

  // Phase 8: Route to Bar Trivia Night
  if (gameMode === 'bar-trivia') {
    return (
      <LazyRoute>
        <BarTriviaNight
          gameStacks={gameStacks}
          categoriesConfig={categoriesConfig}
          onExit={() => setGameMode('solo')}
        />
      </LazyRoute>
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900 transition-colors duration-300" style={{ fontFamily: 'Baskerville, serif' }}>
        <div className="container mx-auto px-4 py-8">
          <button 
            onClick={handleBackToStacks}
            className="mb-6 px-4 py-2 bg-amber-200/60 hover:bg-amber-300/60 rounded-sm text-amber-900 transition-all duration-200"
          >
            ← Back to Stacks
          </button>
          <GameStack 
            stackData={gameStacks[selectedStack]} 
            onComplete={handleStackComplete}
          />
        </div>
      </div>
    )
  }

  if (selectedCategory) {
    const category = categoriesConfig.categories[selectedCategory]
    return (
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900" style={{ fontFamily: 'Baskerville, serif' }}>
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <button 
              onClick={handleBackToCategories}
              className="px-4 py-2 rounded-sm transition-all duration-200 order-2 sm:order-1 bg-amber-200/60 hover:bg-amber-300/60 text-amber-900"
            >
              ← Back to Categories
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-sm transition-all duration-200 order-1 sm:order-2 bg-amber-200/60 hover:bg-amber-300/60 text-amber-800"
            >
              Victorian Mode
            </button>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{category.title}</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {shuffleArray(category.stacks).map((stackKey) => {
              const stack = gameStacks[stackKey]
              if (!stack) return null
              
              return (
                <button
                  key={stackKey}
                  onClick={() => handleStackSelect(stackKey)}
                  className="group p-4 sm:p-6 rounded-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl bg-amber-100/80 hover:bg-amber-200/70 border border-amber-300"
                >
                  {/* Visual hint area */}
                  {stack.imageHint && (
                    <div className="mb-4 p-4 rounded-sm bg-amber-200/40">
                      <p className="text-xs text-center italic text-amber-700">
                        {stack.imageHint}
                      </p>
                    </div>
                  )}
                  
                  <div className={`w-full h-2 rounded-sm mb-4 bg-gradient-to-r ${category.color}`}></div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-amber-800 transition-colors">
                    {stack.title}
                  </h2>
                  <p className="text-sm text-amber-700 mb-4">
                    {stack.description || "Dive deep into this fascinating topic"}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-600">
                      5 Questions Deep
                    </span>
                    <span className="text-amber-800 font-semibold">
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

  // Test mode for photo-first system
  if (testMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Photo-First System Testing</h1>
            <button
              onClick={() => setTestMode(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
            >
              Exit Test Mode
            </button>
          </div>
          <PhotoFirstTest />
        </div>
      </div>
    )
  }

  // Main category selection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <nav className="flex flex-wrap gap-2 sm:gap-3 order-2 sm:order-1 justify-center sm:justify-start" aria-label="Game modes">
            <button
              onClick={enterHostMode}
              className="px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base shadow-sm border bg-amber-700 hover:bg-amber-600 text-white border-amber-600 focus:outline-none focus:ring-3 focus:ring-amber-500"
            >
              Host Mode
            </button>
            <button
              onClick={enterPerformanceFinale}
              className="px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base shadow-sm border bg-yellow-700 hover:bg-yellow-600 text-white border-yellow-600 focus:outline-none focus:ring-3 focus:ring-yellow-500"
            >
              Performance Finale
            </button>
            <button
              onClick={enterProjectorMode}
              className="px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base shadow-sm border bg-amber-800 hover:bg-amber-700 text-white border-amber-700 focus:outline-none focus:ring-3 focus:ring-amber-500"
            >
              Classic Projector
            </button>
            <button
              onClick={() => enterGilliamProjector('setup')}
              className="px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base shadow-sm border bg-yellow-800 hover:bg-yellow-700 text-white border-yellow-700 focus:outline-none focus:ring-3 focus:ring-yellow-500"
            >
              Gilliam Projector
            </button>
            <button
              onClick={() => setTestMode(true)}
              className="px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base shadow-sm border bg-purple-700 hover:bg-purple-600 text-white border-purple-600 focus:outline-none focus:ring-3 focus:ring-purple-500"
            >
              Test Photo-First
            </button>
          </nav>
          <button
            onClick={toggleDarkMode}
            className="p-2 sm:p-3 rounded-md transition-all duration-200 order-1 sm:order-2 shadow-sm border font-semibold focus:outline-none focus:ring-3 focus:ring-yellow-500 bg-yellow-600 hover:bg-yellow-500 text-gray-900 border-yellow-500"
          >
            Archival Mode
          </button>
          
          {/* User Profile */}
          <div className="order-3">
            <UserProfile />
          </div>
        </header>
        
        <main>
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
              Deeply Trivial
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 font-medium text-gray-300">
              Trivia That Dares to Matter
            </p>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
              Choose your realm of knowledge and go five questions deep - creating nets of learning that connect the trivial to the profound.
            </p>
            
            {/* Single Player Mode Button */}
            <div className="mb-6 space-y-4">
              <button
                onClick={() => setGameMode('single-player')}
                className="px-8 py-4 text-xl bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-3 focus:ring-amber-500 mr-4 mb-4"
              >
                Single Player Mode
              </button>

              {/* Multi-Stack Challenge Button */}
              <button
                onClick={() => setGameMode('multi-stack')}
                className="px-8 py-4 text-xl bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-3 focus:ring-blue-500 mr-4 mb-4"
              >
                🌟 Multi-Stack Challenge
              </button>
              
              {/* Phase 8: Bar Trivia Night Button */}
              <button
                onClick={() => setGameMode('bar-trivia')}
                className="px-8 py-4 text-xl bg-gradient-to-r from-yellow-700 to-amber-700 hover:from-yellow-600 hover:to-amber-600 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-3 focus:ring-yellow-500 mr-4 mb-4"
              >
                🍺 Bar Trivia Night
              </button>
            </div>
          </div>

          {/* Use the new CategorySelection component */}
          <CategorySelection 
            categoriesConfig={categoriesConfig}
            darkMode={true} // Always use archival mode
            onCategorySelect={handleCategorySelect}
          />

          <div className="text-center mt-16 text-gray-500">
            <p className="text-sm font-mono">
              Each stack: 5 questions deep • Scoring: 10 → 20 → 40 → 80 → 160 points
            </p>
          </div>
        </main>
        
        {/* Unlock Notification */}
        {unlockNotification && (
          <UnlockNotification 
            unlock={unlockNotification} 
            onClose={handleCloseUnlockNotification} 
          />
        )}
      </div>
    </div>
  )
}

const AppWithAuth = () => {
  return (
    <AuthErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AuthErrorBoundary>
  );
};

export default AppWithAuth
