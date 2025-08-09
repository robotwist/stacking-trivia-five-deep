import { useState, useEffect } from 'react';
import QuickHostControls from './QuickHostControls';
import { checkAnswerMatch } from '../utils/textUtils';
import { calculateQuestionScore, getCrowdMultiplier } from '../utils/scoreUtils';

export default function GameStack({ 
  stackData, 
  onComplete,
  isHostMode = false,
  showHostControls = false,
  teamName = "",
  onPause = () => {},
  onResume = () => {},
  gameState = 'playing',
  enableCelebrations = true
}) {
  const [depth, setDepth] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isDeepMode, setIsDeepMode] = useState(false);
  const [deepModeDepth, setDeepModeDepth] = useState(0);
  const [showDeeperModeOffer, setShowDeeperModeOffer] = useState(false);
  
  // Phase 8 enhancements - simplified
  const [crowdEnergy, setCrowdEnergy] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  
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
  
  // Get current question - either from main questions or deeper mode
  const getCurrentQuestion = () => {
    if (isDeepMode && stackData.deeperMode) {
      return stackData.deeperMode.questions[deepModeDepth];
    }
    return stackData.questions[depth];
  };
  
  const current = getCurrentQuestion();

  // Simplified score animation trigger
  const animateScore = () => {
    setScoreAnimation(true);
    setTimeout(() => setScoreAnimation(false), 1000);
  };

  // Phase 8: Host control functions
  const handlePause = () => {
    setIsPaused(true);
    onPause();
  };

  const handleResume = () => {
    setIsPaused(false);
    onResume();
  };

  const handleSkipQuestion = () => {
    if (depth + 1 >= stackData.questions.length) {
      if (onComplete) onComplete(score);
    } else {
      setDepth(depth + 1);
      setInput('');
      setFeedback('');
      setShowHint(false);
    }
  };

  const handlePlaySound = (soundType) => {
    // Placeholder for actual sound implementation
    console.log(`Playing sound: ${soundType}`);
    // Future: integrate with Web Audio API or Howler.js
  };

  const checkAnswer = () => {
    if (!current || isPaused) return;
    
    const userAnswer = input.trim();
    const isCorrect = checkAnswerMatch(userAnswer, current.acceptedAnswers || current.a || [current.answer]);
    
    if (isCorrect) {
      // Calculate score with crowd multiplier if in bar mode
      const baseScore = calculateQuestionScore(isDeepMode ? deepModeDepth : depth, isDeepMode);
      const multiplier = showHostControls ? getCrowdMultiplier(crowdEnergy) : 1;
      const questionScore = Math.round(baseScore * multiplier);
      
      const newScore = score + questionScore;
      setScore(newScore);
      setFeedback(`Correct! +${questionScore} points`);
      animateScore();
      
      // Progress logic
      if (isDeepMode) {
        if (deepModeDepth + 1 >= (stackData.deeperMode?.questions.length || 0)) {
          setTimeout(() => {
            if (onComplete) onComplete(newScore);
          }, 2000);
        } else {
          setTimeout(() => {
            setDeepModeDepth(deepModeDepth + 1);
            setInput('');
            setFeedback('');
            setShowHint(false);
          }, 2000);
        }
      } else {
        if (depth + 1 >= stackData.questions.length) {
          // Offer deeper mode if available
          if (stackData.deeperMode && !showDeeperModeOffer) {
            setTimeout(() => {
              setShowDeeperModeOffer(true);
              setFeedback('');
            }, 2000);
          } else {
            setTimeout(() => {
              if (onComplete) onComplete(newScore);
            }, 2000);
          }
        } else {
          setTimeout(() => {
            setDepth(depth + 1);
            setInput('');
            setFeedback('');
            setShowHint(false);
          }, 2000);
        }
      }
    } else {
      const correctAnswer = (current.acceptedAnswers && current.acceptedAnswers[0]) || 
                           (current.a && current.a[0]) || 
                           current.answer || 'Unknown';
      setFeedback(`Not quite. The answer was: ${correctAnswer}`);
      setTimeout(() => {
        if (onComplete) onComplete(score);
      }, 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !feedback.includes('The answer was:') && !isPaused) {
      checkAnswer();
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const enterDeeperMode = () => {
    setIsDeepMode(true);
    setDeepModeDepth(0);
    setShowDeeperModeOffer(false);
    setInput('');
    setFeedback('DEEPER MODE ACTIVATED! The questions get obsessive now...');
    setTimeout(() => setFeedback(''), 2000);
  };

  const declineDeeperMode = () => {
    setShowDeeperModeOffer(false);
    if (onComplete) onComplete(score);
  };

  // Show Deeper Mode offer screen
  if (showDeeperModeOffer && stackData.deeperMode) {
    return (
      <div className={`p-8 max-w-3xl mx-auto rounded-sm border-2 border-amber-400 text-center sepia ${
        darkMode 
          ? 'bg-gradient-to-br from-amber-900/90 via-yellow-900/90 to-amber-800/90 text-amber-50' 
          : 'bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-50 text-amber-900'
      }`}>
        <div className="text-7xl mb-6" style={{ fontFamily: 'Baskervville, serif' }}>— ❦ —</div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-amber-700 dark:text-amber-200" style={{ fontFamily: 'Baskervville, serif' }}>
          {stackData.deeperMode.title}
        </h2>
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
        <h3 className="text-xl sm:text-2xl mb-6 leading-relaxed font-medium">
          {current.question}
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
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isPaused || feedback.includes('The answer was:')}
          placeholder="Your answer..."
          className={`w-full max-w-md px-4 py-3 text-lg rounded-sm border-2 text-center transition-all duration-200 ${
            darkMode 
              ? 'bg-amber-800/50 border-amber-600 text-amber-100 placeholder-amber-400' 
              : 'bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600'
          } focus:outline-none focus:border-amber-500`}
          style={{ fontFamily: 'Baskerville, serif' }}
        />
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
        <div className={`text-center p-4 rounded-sm border-2 mb-6 ${
          feedback.includes('Correct') 
            ? (darkMode ? 'bg-green-800/30 border-green-600 text-green-200' : 'bg-green-100 border-green-300 text-green-800')
            : (darkMode ? 'bg-red-800/30 border-red-600 text-red-200' : 'bg-red-100 border-red-300 text-red-800')
        }`}>
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
}
