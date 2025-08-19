import { useState, Suspense, lazy, useMemo, useEffect } from 'react'
import GameStack from './components/GameStack'
import CategorySelection from './components/CategorySelection'
import GameErrorBoundary from './components/GameErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import UnlockNotification from './components/UnlockNotification'
import FeedbackModal from './components/FeedbackModal'
import PhotoFirstTest from './components/PhotoFirstTest'
import MoreModesDrawer from './components/MoreModesDrawer'
import OnboardingFlow from './components/OnboardingFlow'
import UniversalOnboarding from './components/UniversalOnboarding'
import RecommendationDisplay from './components/RecommendationDisplay'
import QuickStats from './components/QuickStats'
import DailyChallenge from './components/DailyChallenge'
import PostGameFlow from './components/PostGameFlow'
import ProgressResume from './components/ProgressResume'
import { AchievementUnlock } from './components/AchievementDisplay'
import { persistUserAchievements } from './services/userService'
import AchievementSystem from './components/AchievementSystem'
import SmartRecommendations from './components/SmartRecommendations'
import ProgressStorage from './utils/progressStorage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import UserProfile from './components/UserProfile'
import AuthErrorBoundary from './components/AuthErrorBoundary'
import AuthForm from './components/AuthForm'

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
const MultiDeviceHost = lazy(() => import('./components/MultiDeviceHost'))
  const HostUpsell = lazy(() => import('./components/HostUpsell'))
const MobilePlayerJoin = lazy(() => import('./components/MobilePlayerJoin'))

// Import utilities
import { shuffleArray } from './utils/arrayUtils'
import { useDarkMode, useGameHistory } from './hooks/gameHooks'
import { stackUnlockManager } from './utils/stackUnlocks'
import { parsePlayParams } from './utils/url'
import { playSound, initAudio } from './utils/audio.js'
import { celebratePerfectScore, celebrateFirstCompletion } from './utils/celebrations.js'
import { shareScore } from './utils/share.js'

// Import categorized stacks
import vanGoghData from './data/categories/arts-culture/van-gogh.json'
import beatlesData from './data/categories/arts-culture/the-beatles-ultimate.json'
import fridaKahloData from './data/categories/arts-culture/frida-kahlo.json'
import milesDavisData from './data/categories/arts-culture/miles-davis.json'
import shakespeareData from './data/categories/arts-culture/shakespeare.json'
import leonardoData from './data/categories/arts-culture/leonardo-da-vinci.json'
import mozartData from './data/categories/arts-culture/mozart.json'

import olympicCurrentData from './data/categories/sports/olympic_distance_current.json'
import nebraskaUltimateData from './data/categories/sports/nebraska-sports-ultimate.json'
import elGuerroujData from './data/categories/sports/el-guerrouj-ultimate.json'
import prefontaineData from './data/categories/sports/prefontaine-ultimate.json'
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
  console.log('🚀 App: Component rendering...');
  
  const { user, loading } = useAuth();

  console.log('🔐 App: Auth state check:', { 
    user: user?.email || user?.uid || 'no user', 
    loading,
    userExists: !!user
  });

  // If still loading auth state, show loading spinner
  if (loading) {
    console.log('⏳ App: Showing loading spinner');
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated, show login form
  if (!user) {
    console.log('🚪 App: Showing auth form');
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-800 dark:text-amber-200 mb-2" style={{ fontFamily: 'Baskervville, serif' }}>
              Deeply Trivial
            </h1>
            <p className="text-amber-700 dark:text-amber-300 text-lg mb-4">
              A Game that is Deep (But Only Trivially So)
            </p>
            <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
              Sign in to track your progress and compete!
            </p>
            <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300">
              <ul className="text-base text-amber-700 dark:text-amber-300 text-left space-y-2">
                <li>• Level progression & global rankings</li>
                <li>• Detailed stats & streak tracking</li>
                <li>• Leaderboards & achievement badges</li>
                <li>• Personal progress history</li>
              </ul>
            </div>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  // User is authenticated - show the main game interface
  console.log('✅ App: User authenticated, loading main game...');
  return <AuthenticatedGameApp />;
}

function AuthenticatedGameApp() {
  console.log('🎮 AuthenticatedGameApp: Component rendering...');
  
  const { user } = useAuth();
  
  console.log('👤 AuthenticatedGameApp: User data:', { 
    user: user?.email || user?.uid || 'no user identifier',
    gamesPlayed: user?.games_played,
    userExists: !!user
  });
  
  const [selectedStack, setSelectedStack] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState('solo') // solo, single-player, host, opening-round, individual-stacks, performance-finale, projector-scoreboard, gilliam-projector, category-transition, bar-trivia, multi-device-host, mobile-join
  const [teams, setTeams] = useState([])
  const [performanceScores, setPerformanceScores] = useState({})
  const [currentRound, _setCurrentRound] = useState('Game')
  const [gamePhase, setGamePhase] = useState('playing') // playing, round-complete, final-results
  const [unlockNotification, setUnlockNotification] = useState(null)
  const [testMode, setTestMode] = useState(false) // For testing photo-first system
  
  // URL routing for multi-device functionality
  const [roomCode, setRoomCode] = useState('')
  
  // Check URL for special routes on component mount
  useEffect(() => {
    const path = window.location.pathname
    
    // Handle /join/:roomCode URLs
    if (path.startsWith('/join/')) {
      const code = path.split('/join/')[1]
      if (code && code.length === 6) {
        setRoomCode(code)
        setGameMode('mobile-join')
        return
      }
    }
    
    // Handle /join route (no code provided)
    if (path === '/join') {
      setGameMode('mobile-join')
      return
    }
    
    // Handle /host route for multi-device hosting
    if (path === '/host') {
      setGameMode('multi-device-host')
      return
    }

    // Deep link: /play?stack=<key>&category=<key>
    if (path === '/play' || path === '/play/') {
      const { stack, category } = parsePlayParams()
      if (stack) {
        if (category) setSelectedCategory(category)
        setSelectedStack(stack)
        setGameStarted(true)
        return
      }
    }
  }, [])
  
  // New onboarding and post-game states
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [onboardingResult, setOnboardingResult] = useState(null)
  const [showPostGame, setShowPostGame] = useState(false)
  const [lastGameResult, setLastGameResult] = useState(null)

  // Priority 2 Features: Progress Persistence & Achievement System
  const [achievementToShow, setAchievementToShow] = useState(null)
  const [resumeData, setResumeData] = useState(null)

  // Check if user needs onboarding (first time user or wants to try new onboarding)
  useEffect(() => {
    console.log('🎯 AuthenticatedGameApp: Onboarding effect triggered:', { 
      user: !!user, 
      gamesPlayed: user?.games_played 
    });
    
    // Show onboarding for new users or if user wants to try the new onboarding
    const hasCompletedOnboarding = localStorage.getItem('deepstack_onboarding_completed');
    if (!hasCompletedOnboarding) {
      console.log('👋 AuthenticatedGameApp: Showing onboarding for new user');
      setShowOnboarding(true);
    }
  }, [user]);

  // Initialize audio on first user interaction
  useEffect(() => {
    initAudio();
  }, []);

  // Mock user stats - in real app this would come from the user object
  const userStats = {
    totalScore: user?.total_score || 2847,
    stacksCompleted: user?.games_played || 12,
    currentStreak: user?.current_streak || 7,
    accuracy: Math.round((user?.correct_answers / Math.max(user?.total_questions, 1)) * 100) || 87,
    level: Math.floor((user?.total_score || 2847) / 1000) + 1,
    globalRank: user?.global_rank || 156,
    questionsAnswered: user?.total_questions || 423
  };
  
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
    'nebraska-sports-ultimate': nebraskaUltimateData,
    'el-guerrouj-ultimate': elGuerroujData,
    'prefontaine-ultimate': prefontaineData,
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
  const [showMore, setShowMore] = useState(false)

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
  // Host mode entry handled inline in header button

  const exitHostMode = () => {
    setGameMode('solo')
    setTeams([])
  }

  const handleStartGame = (gameData) => {
    setTeams(gameData.teams)
    setGameMode('opening-round')
  }

  const handleOpeningRoundComplete = () => {
    setGameMode('individual-stacks')
    // Could update team order based on opening round results
  }

  // Performance Finale handlers
  // Performance finale is accessible from More drawer via setGameMode

  const handlePerformanceComplete = (scores) => {
    setPerformanceScores(scores)
    setGamePhase('final-results')
    setGameMode('projector-scoreboard')
  }

  // Onboarding handlers
  const handleOnboardingComplete = (result) => {
    setOnboardingResult(result);
    setShowOnboarding(false);
    setShowRecommendation(true);
    // Mark onboarding as completed
    localStorage.setItem('deepstack_onboarding_completed', 'true');
  }

  const handleResetOnboarding = () => {
    localStorage.removeItem('deepstack_onboarding_completed');
    setShowOnboarding(true);
    setShowRecommendation(false);
    setOnboardingResult(null);
  }

  const handleDailyChallenge = (challenge) => {
    setSelectedCategory(challenge.category);
    setSelectedStack(challenge.stack);
    setGameStarted(true);
  }

  const handleOnboardingStackSelect = (stackKey) => {
    setSelectedStack(stackKey);
    setGameStarted(true);
    setShowOnboarding(false);
  }

  // Enhanced stack completion with post-game flow
  const handleEnhancedStackComplete = (score, totalPossible, questionsAnswered, accuracy) => {
    // PRIORITY 2: Clear any saved progress (stack completed)
    ProgressStorage.clearProgress();
    
    // PRIORITY 2: Track completion for ML recommendations
    ProgressStorage.trackAction('stack_completed', {
      stackName: selectedStack,
      score,
      totalPossible,
      questionsAnswered,
      accuracy,
      timeTaken: Date.now() - (gamePersistence.getStartTime() || Date.now())
    });
    
    // NEW: Play completion sound and celebrate
    if (accuracy === 100) {
      celebratePerfectScore();
    } else if (accuracy >= 80) {
      playSound('achievement');
    }
    
    // Check if this is user's first completion
    const completedStacks = JSON.parse(localStorage.getItem('completedStacks') || '[]');
    if (!completedStacks.includes(selectedStack)) {
      celebrateFirstCompletion();
      completedStacks.push(selectedStack);
      localStorage.setItem('completedStacks', JSON.stringify(completedStacks));
    }
    
    // PRIORITY 2: Check for achievement unlocks
    const gameStats = {
      perfectScores: accuracy === 100 ? 1 : 0,
      highScores: accuracy >= 90 ? 1 : 0,
      consistentHighAccuracy: accuracy >= 80 ? 1 : 0,
      fastestCompletion: (Date.now() - (gamePersistence.getStartTime() || Date.now())) / 1000,
      longestStreak: questionsAnswered, // Simplified for now
      resumeCompletions: resumeData ? 1 : 0
    };
    
    const newAchievements = AchievementSystem.checkAchievements(gameStats, user);
    if (newAchievements.length > 0) {
      // Show first achievement, queue others
      setAchievementToShow(newAchievements[0]);
      // Persist to backend for authenticated users
      try {
        const payload = {}
        newAchievements.forEach(a => {
          payload[a.id] = {
            title: a.title,
            description: a.description,
            icon: a.icon,
            unlockedAt: Date.now()
          }
        })
        persistUserAchievements(payload).catch(() => {})
      } catch (e) {
        // Non-blocking
        console.error('Failed to persist achievements', e)
      }
    }
    
    // Store game result for post-game screen
    setLastGameResult({
      score,
      totalPossible,
      questionsAnswered,
      accuracy,
      completedStack: selectedStack,
      newAchievements
    });
    
    // Show post-game flow
    setShowPostGame(true);
    setGameStarted(false);
    
    // Clear resume data if it was used
    setResumeData(null);
    
    // Original stack completion logic
    handleStackComplete(score, totalPossible);
  }

  // Post-game handlers
  const handleSelectNextStack = (stackKey) => {
    setSelectedStack(stackKey);
    setGameStarted(true);
    setShowPostGame(false);
    setLastGameResult(null);
  }

  // PRIORITY 2: Progress Resume Handlers
  const handleResumeStack = (progressData) => {
    setResumeData(progressData);
    setSelectedStack(progressData.stackName);
    setGameStarted(true);
    setShowPostGame(false);
    
    // Track resume action for ML
    ProgressStorage.trackAction('stack_resumed', {
      stackName: progressData.stackName,
      resumeIndex: progressData.currentIndex,
      timeAway: Date.now() - progressData.timestamp
    });
  }

  const handleStartFresh = () => {
    // Clear any saved progress and restart selection
    ProgressStorage.clearProgress();
    setResumeData(null);
    setSelectedStack(null);
    setGameStarted(false);
  }

  // PRIORITY 2: Achievement System Handlers  
  const handleCloseAchievement = () => {
    setAchievementToShow(null);
  }

  const handleReturnToMenu = () => {
    setSelectedStack(null);
    setSelectedCategory(null);
    setGameStarted(false);
    setShowPostGame(false);
    setLastGameResult(null);
  }

  // Projector Scoreboard handlers
  // removed direct projector button in header; kept function for More drawer use via handler
  // Projector mode is accessible from More drawer via setGameMode

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

  // Projector state updater (kept if needed)
  // const updateProjectorState = (newState) => setProjectorState(prev => ({ ...prev, ...newState }))

  // Analytics hook (enable when needed)
  // const trackGameAction = (action, stackTitle = null) => addToGameHistory(action, stackTitle)

  // Higher-order component for lazy-loaded routes with error boundary and loading
  const LazyRoute = ({ children }) => (
    <GameErrorBoundary>
      <Suspense fallback={<LoadingSpinner size="lg" message="Loading game mode..." darkMode={darkMode} />}>
        {children}
      </Suspense>
    </GameErrorBoundary>
  )

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <UniversalOnboarding 
        onComplete={handleOnboardingComplete}
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  // Show recommendation after onboarding
  if (showRecommendation && onboardingResult) {
    return (
      <RecommendationDisplay
        recommendation={onboardingResult.recommendation}
        onStartGame={(rec) => {
          if (rec.stack && gameStacks[rec.stack]) {
            setSelectedStack(rec.stack);
            setGameMode(rec.mode);
            setGameStarted(true);
            setShowRecommendation(false);
          } else {
            setSelectedCategory(rec.category);
            setGameMode(rec.mode);
            setShowRecommendation(false);
          }
        }}
        onBrowseAll={() => {
          setShowRecommendation(false);
          setGameMode('single-player');
        }}
        onCustomize={() => {
          setShowRecommendation(false);
          setShowOnboarding(true);
        }}
      />
    );
  }

  // Show post-game flow after stack completion
  if (showPostGame && lastGameResult) {
    return (
      <PostGameFlow 
        score={lastGameResult.score}
        questionsAnswered={lastGameResult.questionsAnswered}
        accuracy={lastGameResult.accuracy}
        completedStack={lastGameResult.completedStack}
        onSelectNextStack={handleSelectNextStack}
        onReturnToMenu={handleReturnToMenu}
        userStats={userStats}
      />
    );
  }

  // Route to Host Mode
  if (gameMode === 'host') {
    return (
      <LazyRoute>
        {/* Host upsell gate could be shown here in free tier */}
        <HostMode onStartGame={handleStartGame} onExitHost={exitHostMode} onEnterGilliamProjector={enterGilliamProjector} onTriggerTransition={triggerCategoryTransition} />
      </LazyRoute>
    )
  }

  // Route: Host Upsell Pro
  if (gameMode === 'host-upsell') {
    return (
      <LazyRoute>
        <HostUpsell />
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

  // Multi-Device Host Mode
  if (gameMode === 'multi-device-host') {
    return (
      <LazyRoute>
        <MultiDeviceHost
          gameStacks={gameStacks}
          onStartGame={(gameData) => {
            console.log('Starting multi-device game:', gameData)
            // Here you would transition to the actual game mode
            // For now, redirect back to solo mode
            setGameMode('solo')
          }}
        />
      </LazyRoute>
    )
  }

  // Mobile Player Join Mode
  if (gameMode === 'mobile-join') {
    return (
      <LazyRoute>
        <MobilePlayerJoin
          roomCode={roomCode}
          onJoinSuccess={(playerData) => {
            console.log('Player joined:', playerData)
            // Player successfully joined, stay in this mode for game play
          }}
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
            onComplete={handleEnhancedStackComplete}
            resumeData={resumeData}
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
          <nav className="flex flex-wrap gap-2 sm:gap-3 order-2 sm:order-1 justify-center sm:justify-start" aria-label="Primary actions">
            <button
              onClick={() => {
                setSelectedCategory(null)
                setSelectedStack(null)
                // Play Now: choose a recommended stack (first of first category)
                const firstCategoryKey = Object.keys(categoriesConfig.categories)[0]
                const firstStackKey = categoriesConfig.categories[firstCategoryKey].stacks[0]
                setSelectedCategory(firstCategoryKey)
                setSelectedStack(firstStackKey)
                setGameStarted(true)
              }}
              className="px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base shadow-sm border bg-amber-600 hover:bg-amber-500 text-white border-amber-500 focus:outline-none focus:ring-3 focus:ring-amber-500"
            >
              Play Now
            </button>
            <button
              onClick={() => setGameMode('single-player')}
              className="px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base shadow-sm border bg-amber-700 hover:bg-amber-600 text-white border-amber-600 focus:outline-none focus:ring-3 focus:ring-amber-500"
            >
              Browse Topics
            </button>
            <button onClick={() => setGameMode('host')} className="px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base shadow-sm border bg-yellow-700 hover:bg-yellow-600 text-white border-yellow-600 focus:outline-none focus:ring-3 focus:ring-yellow-500">Host a Game</button>
            <button
              onClick={() => setShowMore(true)}
              className="px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base shadow-sm border bg-gray-800 hover:bg-gray-700 text-white border-gray-700 focus:outline-none focus:ring-3 focus:ring-gray-600"
            >
              More
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
            
            {/* Daily Challenge */}
            <DailyChallenge onStartChallenge={handleDailyChallenge} />
            
            {/* Quick Stats Display */}
            <QuickStats />
            
            {/* Single Player Mode Button */}
            <div className="mb-6 space-y-4">
              {/* Quick Start with Nebraska Stack */}
              <button
                onClick={() => {
                  setSelectedCategory('sports')
                  setSelectedStack('nebraska-sports-ultimate')
                  setGameStarted(true)
                }}
                className="px-10 py-5 text-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-3 focus:ring-red-500 mr-4 mb-4 border-2 border-red-400"
              >
                Quick Start - Nebraska Sports
              </button>

              <button
                onClick={() => setGameMode('single-player')}
                className="px-8 py-4 text-xl bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-3 focus:ring-amber-500 mr-4 mb-4"
              >
                Browse All Topics
              </button>

              {/* Multi-Stack Challenge Button */}
              <button
                onClick={() => setGameMode('multi-stack')}
                className="px-8 py-4 text-xl bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-3 focus:ring-blue-500 mr-4 mb-4"
              >
                Multi-Stack Challenge
              </button>
              
              {/* Phase 8: Bar Trivia Night Button */}
              <button
                onClick={() => setGameMode('bar-trivia')}
                className="px-8 py-4 text-xl bg-gradient-to-r from-yellow-700 to-amber-700 hover:from-yellow-600 hover:to-amber-600 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-3 focus:ring-yellow-500 mr-4 mb-4"
              >
                Bar Trivia Night
              </button>
              
              {/* Multi-Device Host Button */}
              <button
                onClick={() => setGameMode('multi-device-host')}
                className="px-8 py-4 text-xl bg-gradient-to-r from-green-700 to-teal-700 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-3 focus:ring-green-500 mr-4 mb-4"
              >
                📱 Multi-Device Trivia
              </button>
            </div>
          </div>

          {/* Use the new CategorySelection component */}
          <CategorySelection 
            categoriesConfig={categoriesConfig}
            darkMode={true} // Always use archival mode
            onCategorySelect={handleCategorySelect}
          />

          {/* PRIORITY 2: Progress Resume Component */}
          <div className="max-w-4xl mx-auto mt-8 px-4">
            <ProgressResume 
              onResumeStack={handleResumeStack}
              onStartFresh={handleStartFresh}
            />
          </div>

          {/* Featured Stack Recommendations */}
          <div className="max-w-4xl mx-auto mt-12 mb-8 px-4">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">Featured Deep Dives</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-700/50 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => {
                     setSelectedCategory('sports')
                     setSelectedStack('nebraska-sports-ultimate')
                     setGameStarted(true)
                   }}>
                <h3 className="font-bold text-red-400 mb-2">Nebraska Sports Ultimate</h3>
                <p className="text-sm text-gray-300 mb-3">35 questions diving deep into Cornhusker sports history</p>
                <div className="text-xs text-red-300">Sports • Expert Level</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-700/50 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => {
                     setSelectedCategory('arts-culture')
                     setSelectedStack('the_beatles')
                     setGameStarted(true)
                   }}>
                <h3 className="font-bold text-purple-400 mb-2">The Beatles Ultimate</h3>
                <p className="text-sm text-gray-300 mb-3">35 questions from Liverpool to legend</p>
                <div className="text-xs text-purple-300">Music • Expert Level</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/50 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => {
                     setSelectedCategory('sports')
                     setSelectedStack('prefontaine-ultimate')
                     setGameStarted(true)
                   }}>
                <h3 className="font-bold text-green-400 mb-2">Prefontaine Ultimate</h3>
                <p className="text-sm text-gray-300 mb-3">35 questions on the rebel runner who changed everything</p>
                <div className="text-xs text-green-300">Sports • Expert Level</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700/50 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => {
                     setSelectedCategory('sports')
                     setSelectedStack('el-guerrouj-ultimate')
                     setGameStarted(true)
                   }}>
                <h3 className="font-bold text-blue-400 mb-2">El Guerrouj Ultimate</h3>
                <p className="text-sm text-gray-300 mb-3">35 questions on the greatest miler in history</p>
                <div className="text-xs text-blue-300">Sports • Expert Level</div>
              </div>
            </div>
          </div>

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

        {/* PRIORITY 2: Achievement Unlock Modal */}
        {achievementToShow && (
          <AchievementUnlock 
            achievement={achievementToShow}
            onClose={handleCloseAchievement}
          />
        )}
      </div>

      {/* More Modes Drawer */}
      {showMore && (
        <MoreModesDrawer
          isOpen={showMore}
          onClose={() => setShowMore(false)}
          onSelectMode={(mode) => setGameMode(mode)}
          onEnterGilliamProjector={enterGilliamProjector}
          onSetTestPhoto={setTestMode}
          onResetOnboarding={handleResetOnboarding}
        />
      )}
    </div>
  )
}

const AppWithAuth = () => {
  console.log('🏗️ AppWithAuth: Wrapper component rendering...');
  
  return (
    <AuthErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AuthErrorBoundary>
  );
};

export default AppWithAuth
