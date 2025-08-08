import { useState, useEffect } from 'react';

export default function GameStack({ stackData, onComplete }) {
  const [depth, setDepth] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isDeepMode, setIsDeepMode] = useState(false);
  const [deepModeDepth, setDeepModeDepth] = useState(0);
  const [showDeeperModeOffer, setShowDeeperModeOffer] = useState(false);
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

  const checkAnswer = () => {
    if (!current) return;
    
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
        setFeedback(`🔥 DEEPER MODE CORRECT! +${bonusPoints} bonus points!`);
        
        setTimeout(() => {
          if (deepModeDepth + 1 >= stackData.deeperMode.questions.length) {
            return; // Complete deeper mode
          }
          setDeepModeDepth(deepModeDepth + 1);
          setInput('');
          setFeedback('');
          setShowHint(false);
        }, 2000);
      } else {
        // Handle regular mode scoring
        const pointsEarned = 10 * Math.pow(2, depth);
        const newScore = score + pointsEarned;
        setScore(newScore);
        setFeedback(`🎯 Correct! +${pointsEarned} points!`);
        
        setTimeout(() => {
          if (depth + 1 >= stackData.questions.length) {
            // Check if Deeper Mode is available
            if (stackData.deeperMode && !showDeeperModeOffer) {
              setShowDeeperModeOffer(true);
              setFeedback('');
              return;
            }
          }
          setDepth(depth + 1);
          setInput('');
          setFeedback('');
          setShowHint(false);
        }, 1500);
      }
    } else {
      const correctAnswer = current.answer || (current.acceptedAnswers && current.acceptedAnswers[0]) || (current.a && current.a[0]) || 'Unknown';
      const modeText = isDeepMode ? "DEEPER MODE" : "Stack";
      setFeedback(`💀 The answer was: ${correctAnswer}. ${modeText} ends here.`);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !feedback.includes('💀')) {
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
    setFeedback('🔥 DEEPER MODE ACTIVATED! The questions get obsessive now...');
    setTimeout(() => setFeedback(''), 2000);
  };

  const declineDeeperMode = () => {
    setShowDeeperModeOffer(false);
    // Proceed to completion
  };

  // Show Deeper Mode offer screen
  if (showDeeperModeOffer && stackData.deeperMode) {
    return (
      <div className={`p-8 max-w-3xl mx-auto rounded-2xl shadow-2xl text-center animate-fade-in ${
        darkMode 
          ? 'bg-gradient-to-br from-orange-900/90 via-red-900/90 to-purple-900/90 backdrop-blur-sm border border-orange-700/50 text-white' 
          : 'bg-gradient-to-br from-orange-100 via-red-100 to-purple-100 backdrop-blur-sm shadow-xl text-gray-900'
      }`}>
        <div className="text-7xl mb-6 animate-pulse-slow">🔥</div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 bg-clip-text text-transparent">
          {stackData.deeperMode.title}
        </h2>
        <p className={`text-lg sm:text-xl mb-8 ${darkMode ? 'text-gray-200' : 'text-gray-700'} max-w-2xl mx-auto leading-relaxed`}>
          {stackData.deeperMode.description}
        </p>
        <div className={`p-6 rounded-xl mb-8 ${
          darkMode ? 'bg-black/30 border border-orange-700/50' : 'bg-white/50 border border-orange-200'
        }`}>
          <div className="text-2xl font-bold mb-2 text-purple-600">Current Score: {score}</div>
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Risk it all for bonus points: {stackData.deeperMode.questions.map(q => q.bonus || 100).join(' + ')} possible
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={enterDeeperMode}
            className="bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 hover:from-orange-700 hover:via-red-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🔥 ENTER DEEPER MODE
          </button>
          <button
            onClick={declineDeeperMode}
            className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
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
    const completionEmoji = isDeeperModeComplete ? "🔥" : "🏆";
    const completionTitle = isDeeperModeComplete ? "DEEPER MODE MASTERED!" : "Stack Mastered!";
    const completionGradient = isDeeperModeComplete 
      ? "from-orange-600 via-red-600 to-purple-600" 
      : "from-green-600 to-emerald-600";
    
    return (
      <div className={`p-8 max-w-2xl mx-auto rounded-2xl shadow-2xl text-center animate-fade-in ${
        darkMode 
          ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50' 
          : 'bg-white/90 backdrop-blur-sm shadow-xl'
      }`}>
        <div className="text-6xl mb-6">{completionEmoji}</div>
        <h2 className={`text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r ${completionGradient} bg-clip-text text-transparent`}>
          {completionTitle}
        </h2>
        {isDeeperModeComplete && (
          <div className="text-lg mb-4 text-orange-600 dark:text-orange-400 font-semibold">
            You've mastered the obsessive details! 🔥
          </div>
        )}
        <div className={`text-2xl sm:text-3xl mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Final Score: <span className="font-bold text-purple-600">{score} points</span>
        </div>
        <p className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          You've conquered {stackData.title}{isDeeperModeComplete ? ' AND its deepest secrets!' : '!'}
        </p>
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Choose Another Stack
        </button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className={`p-8 text-center rounded-2xl ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        No questions available
      </div>
    );
  }

  const progressPercentage = ((depth) / stackData.questions.length) * 100;
  const currentPoints = 10 * Math.pow(2, depth);

  return (
    <div className={`p-6 sm:p-8 max-w-4xl mx-auto rounded-2xl shadow-2xl animate-slide-up ${
      darkMode 
        ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-white' 
        : 'bg-white/90 backdrop-blur-sm shadow-xl text-gray-900'
    }`}>
      {/* Header with title and progress */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold">
                {stackData.title}
              </h2>
              {isDeepMode && (
                <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  🔥 DEEPER MODE
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm">
              {isDeepMode ? (
                <>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Deeper Level {deepModeDepth + 1} of {stackData.deeperMode.questions.length}
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">
                    {current?.bonus || 100} bonus points at stake
                  </span>
                </>
              ) : (
                <>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Level {depth + 1} of {stackData.questions.length}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    {currentPoints} points at stake
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {score}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Score
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question Section */}
      <div className="mb-8">
        <div className={`p-6 rounded-xl mb-6 ${
          darkMode 
            ? 'bg-gray-700/50 border border-gray-600/50' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <p className="text-lg sm:text-xl leading-relaxed">
            {current.question || current.q}
          </p>
        </div>
        
        {/* Hint Section */}
        {showHint && current.hint && (
          <div className={`p-4 rounded-lg mb-4 border-l-4 ${
            darkMode 
              ? 'bg-yellow-900/30 border-yellow-400 text-yellow-300' 
              : 'bg-yellow-50 border-yellow-400 text-yellow-700'
          }`}>
            <p className="flex items-center gap-2">
              <span>💡</span>
              <span>Hint: {current.hint}</span>
            </p>
          </div>
        )}
        
        {/* Feedback Section */}
        {feedback && (
          <div className={`p-4 rounded-lg mb-4 animate-fade-in ${
            feedback.includes('🎯') 
              ? darkMode 
                ? 'bg-green-900/30 border border-green-700 text-green-300' 
                : 'bg-green-50 border border-green-200 text-green-700'
              : darkMode 
                ? 'bg-red-900/30 border border-red-700 text-red-300' 
                : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="font-semibold">{feedback}</p>
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
          className={`w-full p-4 border-2 rounded-xl focus:outline-none text-lg transition-all duration-200 ${
            darkMode
              ? 'bg-gray-700 border-gray-600 focus:border-purple-400 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 focus:border-purple-500 text-gray-900 placeholder-gray-500'
          }`}
          disabled={feedback.includes('💀')}
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-3">
          <button
            onClick={checkAnswer}
            disabled={!input.trim() || feedback.includes('💀')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            Submit Answer
          </button>
          
          {current.hint && (
            <button
              onClick={toggleHint}
              className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                darkMode
                  ? 'bg-yellow-700 hover:bg-yellow-600 text-yellow-100'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}
        </div>
        
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center sm:text-right`}>
          <div>Depth progression: 10 → 20 → 40 → 80 → 160</div>
          <div>Current level worth: <span className="font-semibold text-purple-600 dark:text-purple-400">{currentPoints} points</span></div>
        </div>
      </div>
    </div>
  );
}
