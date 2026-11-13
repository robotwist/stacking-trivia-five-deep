import { useState, Suspense, lazy, useMemo, useEffect } from 'react'
import GameStack from './components/GameStack'
import CategorySelection from './components/CategorySelection'
import GameErrorBoundary from './components/GameErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import UnlockNotification from './components/UnlockNotification'
import PhotoFirstTest from './components/PhotoFirstTest'
import MoreModesDrawer from './components/MoreModesDrawer'
import UniversalOnboarding from './components/UniversalOnboarding'
import RecommendationDisplay from './components/RecommendationDisplay'
import PostGameFlow from './components/PostGameFlow'
import ProgressResume from './components/ProgressResume'
import InstallAppButton from './components/InstallAppButton'
import { AchievementUnlock } from './components/AchievementDisplay'
import { persistUserAchievements } from './services/userService'
import AchievementSystem from './components/AchievementSystem'
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
const HostNight = lazy(() => import('./components/host/HostNight'))
const HostScreen = lazy(() => import('./components/host/HostScreen'))
const MobilePlayerJoin = lazy(() => import('./components/MobilePlayerJoin'))

import { useDarkMode, useGameHistory } from './hooks/gameHooks'
import { stackUnlockManager } from './utils/stackUnlocks'
import { parsePlayParams } from './utils/url'
import StackPlayLink from './components/StackPlayLink'
import { playSound, initAudio } from './utils/audio.js'
import { celebratePerfectScore, celebrateFirstCompletion } from './utils/celebrations.js'
import {
  recordRun,
  getAllStackRecords,
  getPlayerSummary,
  pickDailyStack,
  pickSurpriseStack,
  dateKey,
  getDailyNumber,
} from './utils/playerRecords'
import { calculateMaxScore } from './utils/scoreUtils'
import { track } from './utils/analytics'

import categoriesConfig from './data/categories.json'
import { loadPlayableStacks } from './data/loadPlayableStacks.js'
import './App.css'

const MAX_STACK_SCORE = calculateMaxScore(5, false)

// Defined at module level: a component declared inside the app would get a new identity on
// every render and remount whatever it wraps (wiping a live Host Night).
const LazyRoute = ({ children }) => (
  <GameErrorBoundary>
    <Suspense fallback={<LoadingSpinner size="lg" message="Loading game mode..." darkMode />}>
      {children}
    </Suspense>
  </GameErrorBoundary>
)

function App() {
  const { user, loading, canPlay, cancelSignIn, isGuest } = useAuth();

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!canPlay) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-800 dark:text-amber-200 mb-2" style={{ fontFamily: 'Baskervville, serif' }}>
              Deeply Trivial
            </h1>
            <p className="text-amber-700 dark:text-amber-300 text-base mb-4">
              Sign in to keep your scores in the cloud and climb the leaderboard. Every stack stays free as a guest.
            </p>
          </div>
          <AuthForm />
          {isGuest && (
            <button
              type="button"
              onClick={cancelSignIn}
              className="mt-4 w-full text-center text-amber-800 dark:text-amber-200 underline underline-offset-2"
            >
              ← Back to the game
            </button>
          )}
        </div>
      </div>
    );
  }

  return <AuthenticatedGameApp />;
}

function AuthenticatedGameApp() {
  const { user, isGuest, requestSignIn } = useAuth();

  const [selectedStack, setSelectedStack] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [runId, setRunId] = useState(0)
  const [gameMode, setGameMode] = useState('solo') // solo, single-player, host, opening-round, individual-stacks, performance-finale, projector-scoreboard, gilliam-projector, category-transition, bar-trivia, multi-device-host, mobile-join
  const [teams, setTeams] = useState([])
  const [performanceScores, setPerformanceScores] = useState({})
  const [currentRound] = useState('Game')
  const [gamePhase, setGamePhase] = useState('playing') // playing, round-complete, final-results
  const [unlockNotification, setUnlockNotification] = useState(null)
  const [testMode, setTestMode] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [recordsVersion, setRecordsVersion] = useState(0)
  /** From a friend's challenge link: { stackKey, score, code, name } */
  const [challenge, setChallenge] = useState(null)
  const [runSource, setRunSource] = useState('other')

  const gameStacks = useMemo(() => loadPlayableStacks(), [])

  const stackCategory = useMemo(() => {
    const map = {}
    Object.entries(categoriesConfig.categories).forEach(([categoryKey, { stacks }]) => {
      stacks.forEach((key) => { if (!map[key]) map[key] = categoryKey })
    })
    return map
  }, [])

  const availableStackKeys = useMemo(
    () => Object.keys(gameStacks).filter((key) => stackUnlockManager.isStackAvailable(stackCategory[key] || key)),
    // recordsVersion: unlocks can change after a run
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameStacks, stackCategory, recordsVersion]
  )

  const stackRecords = useMemo(
    () => getAllStackRecords(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recordsVersion]
  )
  const playerSummary = useMemo(
    () => getPlayerSummary(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recordsVersion]
  )
  const dailyStackKey = useMemo(() => pickDailyStack(availableStackKeys), [availableStackKeys])

  // Check URL for special routes on component mount
  useEffect(() => {
    const path = window.location.pathname

    if (path.startsWith('/join/')) {
      const code = path.split('/join/')[1]
      if (code && code.length === 6) {
        setRoomCode(code)
        setGameMode('mobile-join')
        return
      }
    }

    if (path === '/join') {
      setGameMode('mobile-join')
      return
    }

    if (path === '/host') {
      setGameMode('host-night')
      return
    }

    if (path === '/screen') {
      setGameMode('host-screen')
      return
    }

    // Deep links: /s/<key> (shared links, with a per-stack preview card), the older
    // /play?stack=<key>, and /play?daily=1 from the home-screen shortcut
    const sharedStack = path.match(/^\/s\/([a-z0-9_-]+)\/?$/i)?.[1]
    if (sharedStack || path === '/play' || path === '/play/') {
      const { stack, category, challenge: incoming } = parsePlayParams()
      const daily = new URLSearchParams(window.location.search).get('daily')
      const requested = sharedStack || stack
      const target = requested && gameStacks[requested] ? requested : daily ? dailyStackKey : null
      if (target) {
        if (incoming) setChallenge({ stackKey: target, ...incoming })
        setSelectedCategory(category || stackCategory[target] || null)
        setSelectedStack(target)
        setRunSource(incoming ? 'challenge' : daily ? 'daily-shortcut' : 'link')
        setGameStarted(true)
      }
      track('app opened', { entry: incoming ? 'challenge' : daily ? 'daily-shortcut' : target ? 'link' : 'bad-link' })
      window.history.replaceState(null, '', '/')
      return
    }
    track('app opened', { entry: 'home' })
    // Run once on mount; later state changes should not re-trigger deep links
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [onboardingResult, setOnboardingResult] = useState(null)
  const [showPostGame, setShowPostGame] = useState(false)
  const [lastGameResult, setLastGameResult] = useState(null)

  const [achievementToShow, setAchievementToShow] = useState(null)
  const [resumeData, setResumeData] = useState(null)

  useEffect(() => {
    if (user?.isGuest) return;
    const hasCompletedOnboarding = localStorage.getItem('deepstack_onboarding_completed');
    if (!hasCompletedOnboarding) setShowOnboarding(true);
  }, [user]);

  useEffect(() => {
    initAudio();
  }, []);

  const [darkMode, toggleDarkMode] = useDarkMode()
  const [gameHistory, addToGameHistory] = useGameHistory()

  const [transitionState, setTransitionState] = useState({
    fromCategory: null,
    toCategory: null,
    isTransitioning: false
  })
  const [projectorState, setProjectorState] = useState({
    gameState: 'setup',
    currentQuestion: null,
    questionNumber: 1
  })
  const [showMore, setShowMore] = useState(false)

  /** @param {string} source where the player started it from, for analytics (daily, surprise, category, …) */
  const startStack = (stackKey, source = 'other', categoryKey = stackCategory[stackKey] || null) => {
    if (!stackKey || !gameStacks[stackKey]) return
    setRunSource(source)
    setSelectedCategory(categoryKey)
    setSelectedStack(stackKey)
    setResumeData(null)
    setShowPostGame(false)
    setLastGameResult(null)
    setRunId((n) => n + 1)
    setGameStarted(true)
    window.scrollTo(0, 0)
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
  }

  const handlePerformanceComplete = (scores) => {
    setPerformanceScores(scores)
    setGamePhase('final-results')
    setGameMode('projector-scoreboard')
  }

  const handleOnboardingComplete = (result) => {
    setOnboardingResult(result);
    setShowOnboarding(false);
    setShowRecommendation(true);
    localStorage.setItem('deepstack_onboarding_completed', 'true');
  }

  const handleResetOnboarding = () => {
    localStorage.removeItem('deepstack_onboarding_completed');
    setShowOnboarding(true);
    setShowRecommendation(false);
    setOnboardingResult(null);
  }

  const buildSuggestions = (justPlayed) => {
    const records = getAllStackRecords()
    const sameCategory = (categoriesConfig.categories[stackCategory[justPlayed]]?.stacks || [])
      .filter((k) => k !== justPlayed && availableStackKeys.includes(k))
    const ordered = [
      ...sameCategory.filter((k) => !records[k]),
      ...availableStackKeys.filter((k) => k !== justPlayed && !records[k] && !sameCategory.includes(k)),
      ...sameCategory.filter((k) => records[k]),
    ]
    const picks = []
    for (const key of ordered) {
      if (picks.length >= 3) break
      if (!picks.includes(key)) picks.push(key)
    }
    return picks.map((key) => ({
      key,
      title: gameStacks[key].title,
      description: gameStacks[key].description,
    }))
  }

  const handleStackComplete = async (score, totalPossible) => {
    if (!selectedStack) return
    try {
      await gamePersistence.saveGameScore(score, selectedStack);
    } catch (error) {
      console.log('Backend save failed, using local storage:', error);
    }

    const newUnlocks = stackUnlockManager.completeStack(selectedStack, score, totalPossible);
    if (newUnlocks.length > 0) {
      setUnlockNotification(stackUnlockManager.formatUnlockNotification(newUnlocks[0]));
    }

    addToGameHistory('stack_completed', gameStacks[selectedStack]?.title, {
      stackKey: selectedStack,
      score,
      totalPossible,
    });
  }

  const handleEnhancedStackComplete = (score, totalPossible, questionsAnswered, accuracy, answers = []) => {
    const stackKey = selectedStack
    const stack = gameStacks[stackKey]
    const totalLevels = stack?.questions.length || 5
    const levelsCleared = answers.filter((a) => !a.deeper && a.correct).length

    ProgressStorage.clearProgress();
    ProgressStorage.trackAction('stack_completed', {
      stackName: stackKey,
      score,
      totalPossible,
      questionsAnswered,
      accuracy,
    });

    const isFirstPlay = !getAllStackRecords()[stackKey]
    const { isNewBest, previousBest } = recordRun(stackKey, { score, levelsCleared, totalLevels })
    track('stack finished', {
      stack: stackKey,
      category: stackCategory[stackKey],
      source: runSource,
      score,
      levels_cleared: levelsCleared,
      perfect: levelsCleared >= totalLevels,
      easter_egg_found: levelsCleared >= totalLevels && !!stack?.easterEgg,
      choices_used: answers.filter((a) => a.usedChoices).length,
      deeper_answered: answers.filter((a) => a.deeper).length,
      first_play: isFirstPlay,
      is_daily: stackKey === dailyStackKey,
      challenged: challenge?.stackKey === stackKey,
      beat_challenge: challenge?.stackKey === stackKey ? score > challenge.score : null,
    })
    setRecordsVersion((v) => v + 1)

    if (levelsCleared >= totalLevels) {
      celebratePerfectScore();
    } else if (isFirstPlay && levelsCleared > 0) {
      celebrateFirstCompletion();
    } else if (levelsCleared >= 3) {
      playSound('achievement');
    }

    const newAchievements = AchievementSystem.checkAchievements({
      perfectScores: levelsCleared >= totalLevels ? 1 : 0,
      highScores: accuracy >= 90 ? 1 : 0,
      consistentHighAccuracy: accuracy >= 80 ? 1 : 0,
      longestStreak: levelsCleared,
      resumeCompletions: resumeData ? 1 : 0
    }, user);
    if (newAchievements.length > 0) {
      setAchievementToShow(newAchievements[0]);
      const payload = {}
      newAchievements.forEach(a => {
        payload[a.id] = { title: a.title, description: a.description, icon: a.icon, unlockedAt: Date.now() }
      })
      persistUserAchievements(payload).catch(() => {})
    }

    setLastGameResult({
      stackKey,
      score,
      maxScore: totalPossible,
      answers,
      isNewBest,
      previousBest,
      suggestions: buildSuggestions(stackKey),
    });
    setShowPostGame(true);
    setResumeData(null);

    handleStackComplete(score, totalPossible);
    handleBackToStacks();
    window.scrollTo(0, 0)
  }

  const handleResumeStack = (progressData) => {
    if (!gameStacks[progressData.stackName]) return
    setRunSource('resume')
    setResumeData(progressData);
    setSelectedCategory(stackCategory[progressData.stackName] || null)
    setSelectedStack(progressData.stackName);
    setRunId((n) => n + 1)
    setGameStarted(true);
    setShowPostGame(false);
    ProgressStorage.trackAction('stack_resumed', {
      stackName: progressData.stackName,
      resumeIndex: progressData.currentIndex,
      timeAway: Date.now() - progressData.timestamp
    });
  }

  const handleStartFresh = () => {
    ProgressStorage.clearProgress();
    setResumeData(null);
    setSelectedStack(null);
    setGameStarted(false);
  }

  const handleCloseAchievement = () => setAchievementToShow(null)

  const handleReturnToMenu = () => {
    setSelectedStack(null);
    setSelectedCategory(null);
    setGameStarted(false);
    setShowPostGame(false);
    setLastGameResult(null);
  }

  const enterGilliamProjector = (gameState = 'setup') => {
    setProjectorState({ gameState, currentQuestion: null, questionNumber: 1 })
    setGameMode('gilliam-projector')
  }

  const triggerCategoryTransition = (fromCategory, toCategory) => {
    setTransitionState({ fromCategory, toCategory, isTransitioning: true })
    setGameMode('category-transition')
  }

  const handleTransitionComplete = () => {
    setTransitionState({ fromCategory: null, toCategory: null, isTransitioning: false })
    setGameMode('gilliam-projector')
  }

  if (showOnboarding) {
    return (
      <UniversalOnboarding
        onComplete={handleOnboardingComplete}
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  if (showRecommendation && onboardingResult) {
    return (
      <RecommendationDisplay
        recommendation={onboardingResult.recommendation}
        onStartGame={(rec) => {
          setShowRecommendation(false);
          setGameMode(rec.mode);
          if (rec.stack && gameStacks[rec.stack]) startStack(rec.stack, 'onboarding');
          else setSelectedCategory(rec.category);
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

  if (showPostGame && lastGameResult) {
    return (
      <PostGameFlow
        stackKey={lastGameResult.stackKey}
        stack={gameStacks[lastGameResult.stackKey]}
        categoryKey={stackCategory[lastGameResult.stackKey]}
        score={lastGameResult.score}
        maxScore={lastGameResult.maxScore}
        answers={lastGameResult.answers}
        isNewBest={lastGameResult.isNewBest}
        previousBest={lastGameResult.previousBest}
        suggestions={lastGameResult.suggestions}
        challenge={challenge?.stackKey === lastGameResult.stackKey ? challenge : null}
        dailyNumber={lastGameResult.stackKey === dailyStackKey ? getDailyNumber() : null}
        onPlayStack={(key) => startStack(key, 'suggestion')}
        onPlayAgain={() => startStack(lastGameResult.stackKey, 'replay')}
        onReturnToMenu={handleReturnToMenu}
      />
    );
  }

  if (gameMode === 'host-night' || gameMode === 'bar-trivia') {
    return (
      <LazyRoute>
        <HostNight
          gameStacks={gameStacks}
          categoriesConfig={categoriesConfig}
          availableStackKeys={Object.keys(gameStacks)}
          onHostPass={() => setGameMode('host-upsell')}
          onExit={() => {
            if (window.location.pathname !== '/') window.history.replaceState(null, '', '/')
            setGameMode('solo')
          }}
        />
      </LazyRoute>
    )
  }

  if (gameMode === 'host-screen') {
    return (
      <LazyRoute>
        <HostScreen gameStacks={gameStacks} />
      </LazyRoute>
    )
  }

  if (gameMode === 'host') {
    return (
      <LazyRoute>
        <HostMode onStartGame={handleStartGame} onExitHost={exitHostMode} onEnterGilliamProjector={enterGilliamProjector} onTriggerTransition={triggerCategoryTransition} />
      </LazyRoute>
    )
  }

  if (gameMode === 'host-upsell') {
    return (
      <LazyRoute>
        <HostUpsell onBack={() => setGameMode('host-night')} />
      </LazyRoute>
    )
  }

  if (gameMode === 'opening-round') {
    return (
      <LazyRoute>
        <OpeningImageRound teams={teams} onRoundComplete={handleOpeningRoundComplete} />
      </LazyRoute>
    )
  }

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

  if (gameMode === 'multi-device-host') {
    return (
      <LazyRoute>
        <MultiDeviceHost
          gameStacks={gameStacks}
          onStartGame={() => setGameMode('solo')}
        />
      </LazyRoute>
    )
  }

  if (gameMode === 'mobile-join') {
    return (
      <LazyRoute>
        <MobilePlayerJoin roomCode={roomCode} onJoinSuccess={() => {}} />
      </LazyRoute>
    )
  }

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

  if (gameMode === 'individual-stacks') {
    setGameMode('solo')
    setSelectedCategory(null)
  }

  if (gameStarted && selectedStack && gameStacks[selectedStack]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-amber-900 dark:text-amber-50 transition-colors duration-300" style={{ fontFamily: 'Baskerville, serif' }}>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <button
            onClick={selectedCategory ? handleBackToStacks : handleReturnToMenu}
            className="mb-4 sm:mb-6 px-4 py-2 bg-amber-200/60 hover:bg-amber-300/60 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-sm text-amber-900 dark:text-amber-100 transition-all duration-200"
          >
            ← {selectedCategory ? 'Back to stacks' : 'Home'}
          </button>
          <GameStack
            key={`${selectedStack}-${runId}`}
            stackKey={selectedStack}
            stackData={gameStacks[selectedStack]}
            onComplete={handleEnhancedStackComplete}
            resumeData={resumeData}
            challenge={challenge?.stackKey === selectedStack ? challenge : null}
            source={runSource}
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
          <div className="mb-8">
            <button
              onClick={handleBackToCategories}
              className="px-4 py-2 rounded-sm transition-all duration-200 bg-amber-200/60 hover:bg-amber-300/60 text-amber-900"
            >
              ← All topics
            </button>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">{category.title}</h1>
            <p className="text-amber-700 max-w-2xl mx-auto">{category.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {category.stacks.map((stackKey) => {
              const stack = gameStacks[stackKey]
              if (!stack) return null
              const record = stackRecords[stackKey]

              return (
                <article
                  key={stackKey}
                  className="relative group p-4 sm:p-6 rounded-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-amber-100/80 hover:bg-amber-200/70 border border-amber-300 flex flex-col"
                >
                  {stack.imageHint && (
                    <div className="mb-4 p-4 rounded-sm bg-amber-200/40">
                      <p className="text-xs text-center italic text-amber-700">{stack.imageHint}</p>
                    </div>
                  )}
                  <div className={`w-full h-2 rounded-sm mb-4 bg-gradient-to-r ${category.color}`}></div>
                  <h2 className="text-xl font-bold mb-2">
                    <button
                      type="button"
                      onClick={() => startStack(stackKey, 'category', selectedCategory)}
                      className="text-left group-hover:text-amber-800 transition-colors after:absolute after:inset-0 focus:outline-none focus-visible:underline"
                    >
                      {stack.title}
                    </button>
                  </h2>
                  <p className="text-sm text-amber-700 mb-4 flex-grow">
                    {stack.description || 'Dive deep into this fascinating topic'}
                  </p>
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-amber-600">5 levels deep</span>
                    <span className="text-amber-800 font-semibold">
                      {record
                        ? record.perfect ? `✓ Perfect · best ${record.best}` : `Best ${record.best} / ${MAX_STACK_SCORE}`
                        : `${MAX_STACK_SCORE} pts max`}
                    </span>
                  </div>
                  <div className="relative z-10 mt-3 pt-3 border-t border-amber-300/60">
                    <StackPlayLink
                      stackKey={stackKey}
                      categoryKey={selectedCategory}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-950"
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

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

  const dailyStack = dailyStackKey ? gameStacks[dailyStackKey] : null
  const dailyRecord = dailyStackKey ? stackRecords[dailyStackKey] : null
  const playedDailyToday = dailyRecord?.lastPlayed === dateKey()

  // Main home screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap justify-between items-center gap-3 mb-8">
          <span className="text-lg font-bold text-amber-400" style={{ fontFamily: 'Baskervville, serif' }}>Deeply Trivial</span>
          <nav className="flex flex-wrap items-center gap-2" aria-label="Account and app">
            <InstallAppButton />
            {isGuest ? (
              <button
                type="button"
                onClick={requestSignIn}
                className="px-4 py-2 rounded-md font-semibold text-sm border border-gray-600 hover:border-gray-400 text-gray-200"
              >
                Sign in
              </button>
            ) : (
              <UserProfile />
            )}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Use light question cards' : 'Use dark question cards'}
              className="px-3 py-2 rounded-md text-sm border border-gray-700 hover:border-gray-500 text-gray-300"
            >
              {darkMode ? '☾' : '☀'}
            </button>
          </nav>
        </header>

        <main>
          <section className="text-center mb-10 px-2">
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
              Five questions. One story.
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Each answer unlocks the next question. Points double every level—10, 20, 40, 80, 160—and one miss ends the dive. How deep can you go?
            </p>
          </section>

          <div className="max-w-3xl mx-auto mb-8">
            <ProgressResume gameStacks={gameStacks} onResumeStack={handleResumeStack} onStartFresh={handleStartFresh} />
          </div>

          {dailyStack && (
            <section
              aria-labelledby="daily-stack-title"
              className="max-w-3xl mx-auto mb-6 rounded-xl border-2 border-amber-500/60 bg-gradient-to-br from-amber-900/40 via-gray-900 to-gray-900 p-6 sm:p-8 shadow-2xl"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-amber-400 mb-2">Today's stack</p>
              <h2 id="daily-stack-title" className="text-2xl sm:text-3xl font-bold mb-2">{dailyStack.title}</h2>
              <p className="text-gray-300 mb-1">{dailyStack.description}</p>
              {dailyStack.imageHint && <p className="text-sm italic text-gray-500 mb-5">{dailyStack.imageHint}</p>}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <button
                  type="button"
                  onClick={() => startStack(dailyStackKey, 'daily')}
                  className="px-8 py-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-900 text-lg font-bold shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300"
                >
                  {playedDailyToday ? 'Play again' : 'Start the dive'}
                </button>
                <button
                  type="button"
                  onClick={() => startStack(pickSurpriseStack(availableStackKeys, { exclude: [dailyStackKey] }), 'surprise')}
                  className="px-6 py-4 rounded-lg border-2 border-gray-600 hover:border-amber-400 text-gray-100 font-semibold"
                >
                  Surprise me
                </button>
                {dailyRecord && (
                  <span className="text-sm text-amber-300 sm:ml-auto">
                    Your best: {dailyRecord.best} / {MAX_STACK_SCORE}
                  </span>
                )}
              </div>
            </section>
          )}

          {playerSummary.stacksPlayed > 0 && (
            <section aria-label="Your progress" className="max-w-3xl mx-auto mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                ['Stacks played', `${playerSummary.stacksPlayed} / ${Object.keys(gameStacks).length}`],
                ['Perfect dives', playerSummary.perfectStacks],
                ['Best-score total', playerSummary.totalBest.toLocaleString()],
                ['Day streak', playerSummary.dayStreak ? `🔥 ${playerSummary.dayStreak}` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-gray-800/60 border border-gray-700 py-3">
                  <div className="text-xl font-bold text-amber-300">{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </section>
          )}

          <CategorySelection
            categoriesConfig={categoriesConfig}
            stackRecords={stackRecords}
            onCategorySelect={handleCategorySelect}
          />

          <section aria-labelledby="group-play-title" className="max-w-5xl mx-auto mt-14">
            <h2 id="group-play-title" className="text-2xl font-bold text-center mb-2 text-gray-100">Play with a group</h2>
            <p className="text-center text-gray-400 mb-6">Bar nights, classrooms, and family game night on one big screen.</p>
            <button
              type="button"
              onClick={() => setGameMode('host-night')}
              className="w-full mb-3 text-left p-5 sm:p-6 rounded-xl bg-gradient-to-r from-amber-900/50 to-gray-900 border-2 border-amber-500/60 hover:border-amber-400 transition-colors"
            >
              <span className="block text-xs uppercase tracking-[0.25em] text-amber-400 mb-1">For hosts · free during beta</span>
              <span className="block text-2xl font-bold text-amber-100">Host a trivia night</span>
              <span className="block text-gray-300 mt-1">
                Put the questions on the TV, score teams with a tap, and let the dive rule create late swings. Venue branding, printable answer key, and it survives a refresh.
              </span>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['Multi-Stack Challenge', 'Several stories back to back on one device', () => setGameMode('multi-stack')],
                ['Classic host mode', 'The original teams-and-rounds setup with projector extras', () => setGameMode('host')],
              ].map(([title, blurb, onClick]) => (
                <button
                  key={title}
                  type="button"
                  onClick={onClick}
                  className="text-left p-4 rounded-lg bg-gray-800/70 border border-gray-700 hover:border-amber-500 transition-colors"
                >
                  <span className="block font-bold text-amber-300">{title}</span>
                  <span className="block text-sm text-gray-400 mt-1">{blurb}</span>
                </button>
              ))}
            </div>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setShowMore(true)} className="text-sm text-gray-400 underline underline-offset-2 hover:text-gray-200">
                More modes and host tools
              </button>
            </div>
          </section>

          <footer className="text-center mt-14 text-gray-500 text-sm">
            <p>{Object.keys(gameStacks).length} stories · typos forgiven · works offline once installed</p>
          </footer>
        </main>

        {unlockNotification && (
          <UnlockNotification
            unlock={unlockNotification}
            onClose={() => setUnlockNotification(null)}
          />
        )}

        {achievementToShow && (
          <AchievementUnlock
            achievement={achievementToShow}
            onClose={handleCloseAchievement}
          />
        )}
      </div>

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

const AppWithAuth = () => (
  <AuthErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </AuthErrorBoundary>
);

export default AppWithAuth
