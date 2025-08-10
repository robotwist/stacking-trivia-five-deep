import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import QuickHostControls from './QuickHostControls';
import PhotoIdentification from './PhotoIdentification';
import { checkAnswerMatch } from '../utils/textUtils';
import { calculateQuestionScore, getCrowdMultiplier, calculateMaxScore } from '../utils/scoreUtils';
import { useAuth } from '../contexts/AuthContext';
import ProgressStorage from '../utils/progressStorage';

const GameStack = memo(function GameStack({ 
  stackData, 
  onComplete,
  isHostMode = false,
  showHostControls = false,
  teamName = "",
  onPause = () => {},
  onResume = () => {},
  gameState = 'playing',
  enableCelebrations = true,
  resumeData = null // PRIORITY 2: Resume from saved progress
}) {
  const [depth, setDepth] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isDeepMode, setIsDeepMode] = useState(false);
  const [deepModeDepth, setDeepModeDepth] = useState(0);
  const [showDeeperModeOffer, setShowDeeperModeOffer] = useState(false);
  
  // Track game statistics for post-game flow
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  
  // Phase 8 enhancements - simplified
  const [crowdEnergy, setCrowdEnergy] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  
  // Photo-first system state
  const [photoPhase, setPhotoPhase] = useState('pending'); // 'pending', 'completed', 'skipped'
  const [photoBonus, setPhotoBonus] = useState(0);
  const [identifiedPerson, setIdentifiedPerson] = useState('');
  
  const { isAuthenticated, markStackCompleted } = useAuth();
  
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark')
  });
  
  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setDarkMode(document.documentElement.classList.contains('dark'))
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  // PRIORITY 2: Initialize from resume data if provided
  useEffect(() => {
    if (resumeData) {
      setDepth(resumeData.currentIndex);
      setScore(resumeData.score);
      setCorrectAnswers(resumeData.userAnswers.filter(a => a.correct).length);
      setTotalAttempts(resumeData.userAnswers.length);
      
      // Track start of resumed game
      ProgressStorage.trackAction('stack_started', {
        stackName: stackData.name,
        resumed: true,
        startIndex: resumeData.currentIndex
      });
    } else {
      // Track start of new game
      ProgressStorage.trackAction('stack_started', {
        stackName: stackData.name,
        resumed: false,
        startIndex: 0
      });
    }
  }, [resumeData, stackData.name])
  
  // Get current question - memoized for performance
  const current = useMemo(() => {
    if (isDeepMode && stackData.deeperMode) {
      return stackData.deeperMode.questions[deepModeDepth];
    }
    return stackData.questions[depth];
  }, [isDeepMode, stackData, deepModeDepth, depth]);

  // Calculate maximum possible score
  const maxPossibleScore = useMemo(() => {
    return calculateMaxScore(stackData.questions?.length || 5, !!stackData.deeperMode);
  }, [stackData.questions?.length, stackData.deeperMode]);

  // Memoized score animation trigger
  const animateScore = useCallback(() => {
    setScoreAnimation(true);
    setTimeout(() => setScoreAnimation(false), 1000);
  }, []);

  // Phase 8: Host control functions - memoized
  const handlePause = useCallback(() => {
    setIsPaused(true);
    onPause();
  }, [onPause]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    onResume();
  }, [onResume]);

  const handleSkipQuestion = useCallback(() => {
    if (depth + 1 >= stackData.questions.length) {
      const questionsAnswered = depth + 1;
      const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
      if (onComplete) onComplete(score, maxPossibleScore, questionsAnswered, accuracy);
    } else {
      setDepth(depth + 1);
      setInput('');
      setFeedback('');
      setShowHint(false);
    }
  }, [depth, stackData.questions.length, onComplete, score, maxPossibleScore, correctAnswers, totalAttempts]);

  const handlePlaySound = useCallback((soundType) => {
    // Placeholder for actual sound implementation
    console.log(`Playing sound: ${soundType}`);
    // Future: integrate with Web Audio API or Howler.js
  }, []);

  // Use refs to capture latest values for callbacks
  const stateRef = useRef();
  stateRef.current = {
    depth,
    score, 
    input,
    isDeepMode,
    deepModeDepth,
    showDeeperModeOffer,
    isPaused,
    current,
    stackData,
    showHostControls,
    crowdEnergy,
    onComplete,
    animateScore
  };

  const checkAnswer = useCallback(() => {
    const state = stateRef.current;
    if (!state.current || state.isPaused) return;
    
    const userAnswer = state.input.trim();
    const isCorrect = checkAnswerMatch(userAnswer, state.current.acceptedAnswers || state.current.a || [state.current.answer]);
    
    // Track attempts and correct answers for statistics
    setTotalAttempts(prev => prev + 1);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    if (isCorrect) {
      // Calculate score with crowd multiplier if in bar mode
      const currentDepth = state.isDeepMode ? state.deepModeDepth : state.depth;
      const baseScore = calculateQuestionScore(currentDepth, state.isDeepMode);
      const multiplier = state.showHostControls ? getCrowdMultiplier(state.crowdEnergy) : 1;
      const questionScore = Math.round(baseScore * multiplier);
      
      console.log(`Score calculation: ${state.score} + ${questionScore} = ${state.score + questionScore}`);
      
      // Use functional update to ensure we get the latest score
      setScore(prevScore => prevScore + questionScore);
      setFeedback(`Correct! +${questionScore} points`);
      state.animateScore();
      
      // Progress logic
      if (state.isDeepMode) {
        if (state.deepModeDepth + 1 >= (state.stackData.deeperMode?.questions.length || 0)) {
          setTimeout(() => {
            const finalScore = state.score + questionScore;
            const questionsAnswered = state.deepModeDepth + 1;
            const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
            console.log('Deep mode complete, final score:', finalScore);
            
            // Mark stack as completed for authenticated users
            if (isAuthenticated) {
              markStackCompleted(`${state.stackData.title} - Deeper Mode`, finalScore);
            }
            
            if (state.onComplete) state.onComplete(finalScore, maxPossibleScore, questionsAnswered, accuracy);
          }, 2000);
        } else {
          setTimeout(() => {
            setDeepModeDepth(state.deepModeDepth + 1);
            setInput('');
            setFeedback('');
            setShowHint(false);
          }, 2000);
        }
      } else {
        if (state.depth + 1 >= state.stackData.questions.length) {
          // Offer deeper mode if available
          if (state.stackData.deeperMode && !state.showDeeperModeOffer) {
            setTimeout(() => {
              setShowDeeperModeOffer(true);
              setFeedback('');
            }, 2000);
          } else {
            setTimeout(() => {
              const finalScore = state.score + questionScore;
              const questionsAnswered = state.depth + 1;
              const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
              console.log('Stack complete, final score:', finalScore);
              
              // Mark stack as completed for authenticated users
              if (isAuthenticated) {
                markStackCompleted(state.stackData.title, finalScore);
              }
              
              if (state.onComplete) state.onComplete(finalScore, maxPossibleScore, questionsAnswered, accuracy);
            }, 2000);
          }
        } else {
          setTimeout(() => {
            const newDepth = state.depth + 1;
            setDepth(newDepth);
            setInput('');
            setFeedback('');
            setShowHint(false);
            
            // PRIORITY 2: Auto-save progress after each question
            const userAnswers = []; // TODO: Track all user answers properly
            ProgressStorage.saveProgress(
              state.stackData.name,
              newDepth,
              state.score + questionScore,
              maxPossibleScore,
              userAnswers
            );
          }, 2000);
        }
      }
    } else {
      const correctAnswer = (state.current.acceptedAnswers && state.current.acceptedAnswers[0]) || 
                           (state.current.a && state.current.a[0]) || 
                           state.current.answer || 'Unknown';
      setFeedback(`Not quite. The answer was: ${correctAnswer}`);
      setTimeout(() => {
        const questionsAnswered = state.depth + 1;
        const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
        console.log('Wrong answer, final score:', state.score);
        if (state.onComplete) state.onComplete(state.score, maxPossibleScore, questionsAnswered, accuracy);
      }, 3000);
    }
  }, []); // Empty dependency array - we'll access current values via ref

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !feedback.includes('The answer was:') && !isPaused && input.trim()) {
      e.preventDefault();
      checkAnswer();
    }
  }, [feedback, isPaused, input, checkAnswer]);

  // Use onKeyDown instead of onKeyPress (onKeyPress is deprecated)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !feedback.includes('The answer was:') && !isPaused && input.trim()) {
      e.preventDefault();
      checkAnswer();
    }
  }, [feedback, isPaused, input, checkAnswer]);

  const toggleHint = useCallback(() => {
    setShowHint(!showHint);
  }, [showHint]);

  const enterDeeperMode = useCallback(() => {
    setIsDeepMode(true);
    setDeepModeDepth(0);
    setShowDeeperModeOffer(false);
    setInput('');
    setFeedback('DEEPER MODE ACTIVATED! The questions get obsessive now...');
    setTimeout(() => setFeedback(''), 2000);
  }, []);

  const declineDeeperMode = useCallback(() => {
    const questionsAnswered = depth + 1;
    const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
    setShowDeeperModeOffer(false);
    if (onComplete) onComplete(score, maxPossibleScore, questionsAnswered, accuracy);
  }, [onComplete, score, maxPossibleScore, depth, correctAnswers, totalAttempts]);

  // Photo-first system handlers
  const handlePhotoIdentification = useCallback((result) => {
    setPhotoPhase('completed');
    setPhotoBonus(result.bonusPoints);
    setIdentifiedPerson(result.personName);
    // Add photo bonus to score
    setScore(prev => prev + result.bonusPoints);
  }, []);

  const handlePhotoSkip = useCallback((result) => {
    setPhotoPhase('skipped');
    setPhotoBonus(0);
    setIdentifiedPerson(result.personName);
  }, []);

  // Check if stack uses photo-first system
  const isPhotoFirst = stackData.photoFirst && stackData.questions[0]?.photo;

  // Show photo identification challenge first (for photo-first stacks)
  if (isPhotoFirst && photoPhase === 'pending') {
    return (
      <PhotoIdentification 
        photoData={stackData.questions[0]}
        onCorrectIdentification={handlePhotoIdentification}
        onSkip={handlePhotoSkip}
        stackTitle={stackData.title}
      />
    );
  }

  // Show Deeper Mode offer screen
  if (showDeeperModeOffer && stackData.deeperMode) {
    return (
      <div className={`p-8 max-w-3xl mx-auto rounded-sm border-2 border-amber-400 text-center sepia ${
        darkMode 
          ? 'bg-gradient-to-br from-amber-900/90 via-yellow-900/90 to-amber-800/90 text-amber-50' 
          : 'bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-50 text-amber-900'
      }`}>
        <div className="text-7xl mb-6" style={{ fontFamily: 'Baskervville, serif' }}>— ❦ —</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-amber-700 dark:text-amber-200" style={{ fontFamily: 'Baskervville, serif' }}>
          {stackData.deeperMode.title}
        </h1>
        <p className={`text-lg sm:text-xl mb-8 ${darkMode ? 'text-amber-200' : 'text-amber-700'} max-w-2xl mx-auto leading-relaxed`} style={{ fontFamily: 'Baskervville, serif' }}>
          {stackData.deeperMode.description}
        </p>
        <div className={`p-6 rounded-sm border-2 border-amber-500 mb-8 ${
          darkMode ? 'bg-amber-900/30' : 'bg-amber-50/50'
        }`}>
          <div className="text-2xl font-bold mb-2 text-amber-700 dark:text-amber-200" style={{ fontFamily: 'Baskervville, serif' }}>Current Score: {score}</div>
          <div className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-600'}`} style={{ fontFamily: 'Baskervville, serif' }}>
            Risk it all for bonus points
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={enterDeeperMode}
            className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 text-white px-8 py-4 rounded-sm border-2 border-amber-500 hover:border-amber-400 text-lg font-semibold transition-all duration-300 transform hover:scale-105 sepia hover:sepia-0"
            style={{ fontFamily: 'Baskervville, serif' }}
          >
            ENTER DEEPER MODE
          </button>
          <button
            onClick={declineDeeperMode}
            className={`px-8 py-4 rounded-sm border-2 border-amber-400 hover:border-amber-300 text-lg font-semibold transition-all duration-300 sepia hover:sepia-0 ${
              darkMode 
                ? 'bg-amber-800/20 hover:bg-amber-700/30 text-amber-200' 
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
            }`}
            style={{ fontFamily: 'Baskervville, serif' }}
          >
            Take My Points & Run
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className={`p-8 text-center ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>
        <p>No questions available</p>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-4xl mx-auto rounded-sm sepia transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-amber-900/70 via-yellow-900/70 to-amber-800/70 text-amber-50' 
        : 'bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-50 text-amber-900'
    }`} style={{ fontFamily: 'Baskerville, serif' }}>
      
      {/* Host Controls */}
      {showHostControls && (
        <QuickHostControls
          isPaused={isPaused}
          onPause={handlePause}
          onResume={handleResume}
          onSkip={handleSkipQuestion}
          onPlaySound={handlePlaySound}
          crowdEnergy={crowdEnergy}
          onCrowdEnergyChange={setCrowdEnergy}
          teamName={teamName}
        />
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-amber-800 dark:text-amber-200">
          {isDeepMode ? stackData.deeperMode?.title : stackData.title}
        </h2>
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className={`text-lg font-semibold ${scoreAnimation ? 'animate-bounce text-green-600' : ''}`}>
            Score: {score}
          </span>
          <span className="text-sm text-amber-600 dark:text-amber-400">
            {isDeepMode ? `Deeper ${deepModeDepth + 1}/5` : `Question ${depth + 1}/5`}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <h3 className="text-xl sm:text-2xl mb-6 leading-relaxed font-medium text-gray-900 dark:text-gray-100">
          {current.question || current.q}
        </h3>
        
        {/* Hint */}
        {current.hint && (
          <div className="mb-6">
            <button
              onClick={toggleHint}
              className={`px-4 py-2 rounded-sm border-2 transition-all duration-200 ${
                showHint 
                  ? (darkMode ? 'bg-amber-700 border-amber-600' : 'bg-amber-200 border-amber-300')
                  : (darkMode ? 'bg-amber-800/50 border-amber-700' : 'bg-amber-100/50 border-amber-300')
              }`}
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {showHint && (
              <p className={`mt-4 p-4 rounded-sm border-2 border-amber-300 italic ${
                darkMode ? 'bg-amber-800/30 text-amber-200' : 'bg-amber-50 text-amber-700'
              }`}>
                {current.hint}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="text-center mb-8">
        <label htmlFor="trivia-answer-input" className="sr-only">
          Your answer to the trivia question
        </label>
        <input
          id="trivia-answer-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPaused || feedback.includes('The answer was:')}
          placeholder="Your answer..."
          aria-describedby="answer-instructions"
          className={`w-full max-w-md px-4 py-3 text-lg rounded-sm border-2 text-center transition-all duration-200 ${
            darkMode 
              ? 'bg-amber-800/50 border-amber-600 text-amber-100 placeholder-amber-400' 
              : 'bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600'
          } focus:outline-none focus:border-amber-500`}
          style={{ fontFamily: 'Baskerville, serif' }}
        />
        <div id="answer-instructions" className="sr-only">
          Type your answer and press Enter or click Submit Answer button
        </div>
        <div className="mt-4">
          <button
            onClick={checkAnswer}
            disabled={isPaused || feedback.includes('The answer was:') || !input.trim()}
            className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 disabled:from-amber-400 disabled:to-amber-500 text-white px-8 py-3 rounded-sm text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 sepia hover:sepia-0 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div 
          className={`text-center p-4 rounded-sm border-2 mb-6 ${
            feedback.includes('Correct') 
              ? (darkMode ? 'bg-green-800/30 border-green-600 text-green-200' : 'bg-green-100 border-green-300 text-green-800')
              : (darkMode ? 'bg-red-800/30 border-red-600 text-red-200' : 'bg-red-100 border-red-300 text-red-800')
          }`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-lg font-semibold">{feedback}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className={`w-full h-2 rounded-sm mb-4 ${darkMode ? 'bg-amber-800/50' : 'bg-amber-200'}`}>
        <div 
          className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full rounded-sm transition-all duration-500"
          style={{ 
            width: isDeepMode 
              ? `${((deepModeDepth + 1) / (stackData.deeperMode?.questions.length || 5)) * 100}%`
              : `${((depth + 1) / stackData.questions.length) * 100}%` 
          }}
        ></div>
      </div>
    </div>
  );
});

export default GameStack;
