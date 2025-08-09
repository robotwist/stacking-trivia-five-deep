import { useState, useEffect } from 'react';
import GameplayEnhancements from './GameplayEnhancements';
import QuickHostControls from './QuickHostControls';
import TransitionCountdown from './TransitionCountdown';

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
  
  // Phase 8 enhancements
  const [celebrationState, setCelebrationState] = useState({ show: false, type: 'correct' });
  const [crowdEnergy, setCrowdEnergy] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  
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

  // Phase 8: Enhanced celebration triggers
  const triggerCelebration = (type, callback) => {
    if (enableCelebrations) {
      setCelebrationState({ show: true, type });
      
      // Adjust crowd energy based on performance
      if (type === 'correct') {
        setCrowdEnergy(prev => Math.min(5, prev + 0.5));
      } else if (type === 'wrong') {
        setCrowdEnergy(prev => Math.max(1, prev - 0.3));
      }
      
      setTimeout(() => {
        setCelebrationState({ show: false, type });
        if (callback) callback();
      }, type === 'gameComplete' ? 3000 : 1500);
    } else if (callback) {
      callback();
    }
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
      triggerCelebration('levelUp');
    }
  };

  const handlePlaySound = (soundType) => {
    // Placeholder for actual sound implementation
    console.log(`Playing sound: ${soundType}`);
    // Future: integrate with Web Audio API or Howler.js
  };

  const showLevelTransition = (message) => {
    setTransitionMessage(message);
    setShowTransition(true);
    setTimeout(() => {
      setShowTransition(false);
    }, 3000);
  };

  const checkAnswer = () => {
    if (!current || isPaused) return;
    
    const userAnswer = input.toLowerCase().trim();
    let isCorrect = false;
    
    // Enhanced answer matching - more forgiving for variations
    const normalizeAnswer = (text) => {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')    // Normalize whitespace
        .trim();
    };
    
    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    
    // Check new format first (acceptedAnswers array)
    if (current.acceptedAnswers && Array.isArray(current.acceptedAnswers)) {
      isCorrect = current.acceptedAnswers.some(acceptedAnswer => {
        const normalizedAccepted = normalizeAnswer(acceptedAnswer);
        return normalizedUserAnswer.includes(normalizedAccepted) || 
               normalizedAccepted.includes(normalizedUserAnswer);
      });
    }
    // Check old format (a array)
    else if (current.a && Array.isArray(current.a)) {
      isCorrect = current.a.some(acceptedAnswer => {
        const normalizedAccepted = normalizeAnswer(acceptedAnswer);
        return normalizedUserAnswer.includes(normalizedAccepted) || 
               normalizedAccepted.includes(normalizedUserAnswer);
      });
    } 
    // Check single answer field
    else if (current.answer) {
      const normalizedCorrectAnswer = normalizeAnswer(current.answer);
      isCorrect = normalizedUserAnswer.includes(normalizedCorrectAnswer) || 
                 normalizedCorrectAnswer.includes(normalizedUserAnswer);
    }
    
    if (isCorrect) {
      if (isDeepMode) {
        // Handle Deeper Mode scoring
        const bonusPoints = current.bonus || 100;
        const newScore = score + bonusPoints;
        setScore(newScore);
        setFeedback(`DEEPER MODE CORRECT! +${bonusPoints} bonus points!`);
        
        // Phase 8: Enhanced celebration for deeper mode
        triggerCelebration('correct', () => {
          if (deepModeDepth + 1 >= stackData.deeperMode.questions.length) {
            triggerCelebration('gameComplete', () => {
              if (onComplete) onComplete(newScore);
            });
          } else {
            setDeepModeDepth(deepModeDepth + 1);
            setInput('');
            setFeedback('');
            setShowHint(false);
          }
        });
      } else {
        // Handle regular mode scoring
        const pointsEarned = 10 * Math.pow(2, depth);
        const newScore = score + pointsEarned;
        setScore(newScore);
        setFeedback(`Correct! +${pointsEarned} points!`);
        
        // Phase 8: Enhanced celebrations and transitions
        triggerCelebration('correct', () => {
          if (depth + 1 >= stackData.questions.length) {
            // Check if Deeper Mode is available
            if (stackData.deeperMode && !showDeeperModeOffer) {
              showLevelTransition("Entering Deeper Mode Decision...");
              setShowDeeperModeOffer(true);
              setFeedback('');
              return;
            } else {
              triggerCelebration('gameComplete', () => {
                if (onComplete) onComplete(newScore);
              });
              return;
            }
          }
          
          // Regular level progression with transition
          if (depth + 1 === Math.floor(stackData.questions.length / 2)) {
            showLevelTransition("Halfway there! Questions getting harder...");
          } else if (depth + 1 === stackData.questions.length - 1) {
            showLevelTransition("Final question coming up!");
          }
          
          triggerCelebration('levelUp', () => {
            setDepth(depth + 1);
            setInput('');
            setFeedback('');
            setShowHint(false);
          });
        });
      }
    } else {
      const correctAnswer = current.answer || (current.acceptedAnswers && current.acceptedAnswers[0]) || (current.a && current.a[0]) || 'Unknown';
      const modeText = isDeepMode ? "DEEPER MODE" : "Stack";
      setFeedback(`The answer was: ${correctAnswer}. ${modeText} ends here.`);
      
      console.log('Wrong answer - ending with score:', score); // Debug log
      
      // Phase 8: Wrong answer celebration and completion
      triggerCelebration('wrong', () => {
        setTimeout(() => {
          if (onComplete) {
            console.log('Calling onComplete with score:', score); // Debug log
            onComplete(score);
          }
        }, 2000);
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !feedback.includes('The answer was:') && !isPaused && !celebrationState.show) {
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
    // Proceed to completion
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
            Risk it all for bonus points: {stackData.deeperMode.questions.map(q => q.bonus || 100).join(' + ')} possible
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
                ? 'bg-gradient-to-r from-amber-800/50 to-yellow-800/50 hover:from-amber-700/60 hover:to-yellow-700/60 text-amber-200' 
                : 'bg-gradient-to-r from-amber-100/50 to-yellow-100/50 hover:from-amber-200/60 hover:to-yellow-200/60 text-amber-800'
            }`}
            style={{ fontFamily: 'Baskervville, serif' }}
          >
            Take My Score & Run
          </button>
        </div>
      </div>
    );
  }

  // Check for completion - either regular stack or deeper mode
  const isStackComplete = depth >= stackData.questions.length && !showDeeperModeOffer;
  const isDeeperModeComplete = isDeepMode && stackData.deeperMode && deepModeDepth >= stackData.deeperMode.questions.length;
  
  if (isStackComplete || isDeeperModeComplete) {
    const completionTitle = isDeeperModeComplete ? "DEEPER MODE MASTERED!" : "Stack Mastered!";
    const completionGradient = isDeeperModeComplete 
      ? "from-amber-700 via-yellow-600 to-amber-800" 
      : "from-amber-600 to-yellow-600";
    
    return (
      <GameplayEnhancements
        isVisible={true}
        celebrationType="gameComplete"
      >
        <div className={`p-8 max-w-2xl mx-auto rounded-sm border-2 border-amber-400 text-center sepia ${
          darkMode 
            ? 'bg-gradient-to-br from-amber-900/90 via-yellow-900/80 to-amber-800/90 text-amber-50' 
            : 'bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-amber-100/90 text-amber-900'
        }`}>
          <div className="text-6xl mb-6" style={{ fontFamily: 'Baskervville, serif' }}>— ❦ —</div>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r ${completionGradient} bg-clip-text text-transparent`} style={{ fontFamily: 'Baskervville, serif' }}>
            {completionTitle}
          </h2>
          {isDeeperModeComplete && (
            <div className="text-lg mb-4 text-amber-700 dark:text-amber-300 font-semibold" style={{ fontFamily: 'Baskervville, serif' }}>
              You've mastered the obsessive details!
            </div>
          )}
          <div className={`text-2xl sm:text-3xl mb-6 ${darkMode ? 'text-amber-100' : 'text-amber-900'}`} style={{ fontFamily: 'Baskervville, serif' }}>
            Final Score: <span className="font-bold text-amber-700 dark:text-amber-300">{score} points</span>
          </div>
          
          {/* Phase 8: Achievement display for high scores */}
          {score >= 300 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-lg border border-yellow-400">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-300">
                Trivia Master Achievement!
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-300">
                Exceptional performance! Perfect for bar trivia nights.
              </div>
            </div>
          )}
          
          <p className={`text-lg mb-8 ${darkMode ? 'text-amber-300' : 'text-amber-600'}`} style={{ fontFamily: 'Baskervville, serif' }}>
            You've conquered {stackData.title}{isDeeperModeComplete ? ' AND its deepest secrets!' : '!'}
          </p>
          <button
            onClick={() => onComplete(score)}
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-8 py-4 rounded-sm border-2 border-amber-500 hover:border-amber-400 text-lg font-semibold transition-all duration-300 transform hover:scale-105 sepia hover:sepia-0"
            style={{ fontFamily: 'Baskervville, serif' }}
          >
            Choose Another Stack
          </button>
        </div>
      </GameplayEnhancements>
    );
  }

  if (!current) {
    return (
      <div className={`p-8 text-center rounded-sm border-2 border-amber-400 sepia ${
        darkMode ? 'bg-gradient-to-br from-amber-900/80 to-yellow-900/70 text-amber-100' : 'bg-gradient-to-br from-amber-50/80 to-yellow-50/70 text-amber-900'
      }`} style={{ fontFamily: 'Baskervville, serif' }}>
        No questions available
      </div>
    );
  }

  const progressPercentage = ((depth) / stackData.questions.length) * 100;
  const currentPoints = 10 * Math.pow(2, depth);

  return (
    <>
      {/* Phase 8: Transition Countdown */}
      <TransitionCountdown
        isVisible={showTransition}
        countdownFrom={3}
        message={transitionMessage}
        crowdEnergy={crowdEnergy}
        barMode={isHostMode}
        onComplete={() => setShowTransition(false)}
      />

      {/* Phase 8: Host Controls */}
      {showHostControls && (
        <QuickHostControls
          gameState={isPaused ? 'paused' : 'playing'}
          currentQuestion={depth + 1}
          totalQuestions={stackData.questions.length}
          onPause={handlePause}
          onResume={handleResume}
          onSkipQuestion={handleSkipQuestion}
          onShowScoreboard={() => console.log('Show scoreboard')}
          onPlaySound={handlePlaySound}
          teamCount={1}
          currentTeamName={teamName}
        />
      )}

      {/* Main Game Interface with Celebrations */}
      <GameplayEnhancements
        isVisible={celebrationState.show}
        celebrationType={celebrationState.type}
        onAnimationComplete={() => setCelebrationState({ show: false, type: 'correct' })}
      >
        <div className={`p-6 sm:p-8 max-w-4xl mx-auto rounded-sm border-2 border-amber-400 sepia ${
          darkMode 
            ? 'bg-gradient-to-br from-amber-900/90 via-yellow-900/80 to-amber-800/90 text-amber-50' 
            : 'bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-amber-100/90 text-amber-900'
        } ${isPaused ? 'opacity-60' : ''} transition-opacity duration-300`}>

          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-sm flex items-center justify-center z-40">
              <div className="bg-amber-100 dark:bg-amber-800 p-6 rounded-lg border-2 border-amber-400 text-center">
                <div className="text-4xl mb-2">⏸️</div>
                <div className="text-lg font-semibold text-amber-900 dark:text-amber-100">Game Paused</div>
                <button
                  onClick={handleResume}
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Resume
                </button>
              </div>
            </div>
          )}

          {/* Header with title and progress */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Baskervville, serif' }}>
                    {stackData.title}
                  </h2>
                  {isDeepMode && (
                    <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-amber-900 px-3 py-1 rounded-sm border border-amber-500 text-sm font-bold sepia" style={{ fontFamily: 'Baskervville, serif' }}>
                      DEEPER MODE
                    </div>
                  )}
                  {crowdEnergy >= 4 && (
                    <div className="animate-pulse text-2xl">🔥</div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm" style={{ fontFamily: 'Baskervville, serif' }}>
                  {isDeepMode ? (
                    <>
                      <span className={`${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
                        Deeper Level {deepModeDepth + 1} of {stackData.deeperMode.questions.length}
                      </span>
                      <span className="text-amber-700 dark:text-amber-300 font-semibold">
                        {current?.bonus || 100} bonus points at stake
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={`${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
                        Level {depth + 1} of {stackData.questions.length}
                      </span>
                      <span className="text-amber-700 dark:text-amber-300 font-semibold">
                        {currentPoints} points at stake
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 sm:mt-0 text-right">
                <div className="text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-300" style={{ fontFamily: 'Baskervville, serif' }}>
                  {score}
                </div>
                <div className={`text-sm ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} style={{ fontFamily: 'Baskervville, serif' }}>
                  Total Score
                </div>
                {/* Crowd Energy Indicator */}
                <div className="flex justify-end mt-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full mx-0.5 ${
                        i < crowdEnergy ? 'bg-yellow-400' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Progress Bar with Pulsing Effect */}
            <div className={`w-full rounded-sm h-3 border border-amber-500 ${darkMode ? 'bg-amber-900/30' : 'bg-amber-100/50'}`}>
              <div 
                className={`bg-gradient-to-r from-amber-600 to-yellow-600 h-3 rounded-sm transition-all duration-500 ease-out ${
                  crowdEnergy >= 4 ? 'animate-pulse' : ''
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* Question Section */}
          <div className="mb-8">
            <div className={`p-6 rounded-sm border-2 border-amber-400 mb-6 sepia ${
              darkMode 
                ? 'bg-gradient-to-br from-amber-900/50 via-yellow-900/40 to-amber-800/50' 
                : 'bg-gradient-to-br from-amber-50/60 via-yellow-50/50 to-amber-100/60'
            }`}>
              <p className="text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'Baskervville, serif' }}>
                {current.question || current.q}
              </p>
            </div>
            
            {/* Hint Section */}
            {showHint && current.hint && (
              <div className={`p-4 rounded-sm mb-4 border-l-4 border-amber-500 ${
                darkMode 
                  ? 'bg-amber-900/30 text-amber-300' 
                  : 'bg-amber-50 text-amber-700'
              }`}>
                <p className="flex items-center gap-2" style={{ fontFamily: 'Baskervville, serif' }}>
                  <span>※</span>
                  <span>Hint: {current.hint}</span>
                </p>
              </div>
            )}
            
            {/* Feedback Section */}
            {feedback && (
              <div className={`p-4 rounded-sm border-2 mb-4 sepia ${
                feedback.includes('Correct') 
                  ? darkMode 
                    ? 'bg-amber-900/40 border-amber-600 text-amber-200' 
                    : 'bg-amber-100/60 border-amber-400 text-amber-800'
                  : darkMode 
                    ? 'bg-yellow-900/40 border-yellow-600 text-yellow-200' 
                    : 'bg-yellow-100/60 border-yellow-400 text-yellow-800'
              }`}>
                <p className="font-semibold" style={{ fontFamily: 'Baskervville, serif' }}>{feedback}</p>
              </div>
            )}
          </div>
          
          {/* Input Section */}
          <div className="mb-6">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your answer..."
              style={{ fontFamily: 'Baskervville, serif' }}
              className={`w-full p-4 border-2 rounded-sm focus:outline-none text-lg transition-all duration-200 sepia ${
                darkMode
                  ? 'bg-amber-900/30 border-amber-600 focus:border-amber-400 text-amber-100 placeholder-amber-300'
                  : 'bg-amber-50/30 border-amber-400 focus:border-amber-600 text-amber-900 placeholder-amber-600'
              } ${isPaused ? 'pointer-events-none' : ''}`}
              disabled={feedback.includes('ends here') || isPaused}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-3">
              <button
                onClick={checkAnswer}
                disabled={!input.trim() || feedback.includes('ends here') || isPaused}
                style={{ fontFamily: 'Baskervville, serif' }}
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:from-amber-400 disabled:to-yellow-500 text-white px-6 py-3 rounded-sm border-2 border-amber-500 hover:border-amber-400 font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 sepia hover:sepia-0"
              >
                Submit Answer
              </button>
              
              {current.hint && (
                <button
                  onClick={toggleHint}
                  disabled={isPaused}
                  style={{ fontFamily: 'Baskervville, serif' }}
                  className={`px-4 py-3 rounded-sm border-2 text-sm font-semibold transition-all duration-200 sepia hover:sepia-0 disabled:opacity-50 ${
                    darkMode
                      ? 'bg-gradient-to-r from-amber-700/70 to-yellow-700/70 hover:from-amber-600/80 hover:to-yellow-600/80 border-amber-500 hover:border-amber-400 text-amber-200'
                      : 'bg-gradient-to-r from-amber-200/70 to-yellow-200/70 hover:from-amber-300/80 hover:to-yellow-300/80 border-amber-400 hover:border-amber-500 text-amber-800'
                  }`}
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              )}
            </div>
            
            <div className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-600'} text-center sm:text-right`} style={{ fontFamily: 'Baskervville, serif' }}>
              <div>Depth progression: 10 → 20 → 40 → 80 → 160</div>
              <div>Current level worth: <span className="font-semibold text-amber-700 dark:text-amber-300">{currentPoints} points</span></div>
            </div>
          </div>
        </div>
      </GameplayEnhancements>
    </>
  );
}
