import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import QuickHostControls from './QuickHostControls';
import PhotoIdentification from './PhotoIdentification';
import { checkAnswerMatch } from '../utils/textUtils';
import { getLevelLabel } from '../utils/normalizeStack';
import { calculateQuestionScore, getCrowdMultiplier, calculateMaxScore } from '../utils/scoreUtils';
import { generateMultipleChoiceOptions } from '../utils/mcq';
import { useAuth } from '../contexts/AuthContext';
import ProgressStorage from '../utils/progressStorage';
import { playSound } from '../utils/audio.js';

const getAcceptedAnswers = (question) =>
  question.acceptedAnswers || question.a || [question.answer];

const getCanonicalAnswer = (question) =>
  question.answer ||
  (question.acceptedAnswers && question.acceptedAnswers[0]) ||
  (question.a && question.a[0]) ||
  'Unknown';

const GameStack = memo(function GameStack({
  stackData,
  stackKey,
  onComplete,
  showHostControls = false,
  teamName = "",
  onPause = () => {},
  onResume = () => {},
  resumeData = null
}) {
  const [depth, setDepth] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isDeepMode, setIsDeepMode] = useState(false);
  const [deepModeDepth, setDeepModeDepth] = useState(0);
  const [showDeeperModeOffer, setShowDeeperModeOffer] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  /** Shown after each submission until the player taps Continue: { correct, points, answer, explanation } */
  const [reveal, setReveal] = useState(null);

  const [crowdEnergy, setCrowdEnergy] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showMcqHint, setShowMcqHint] = useState(() => {
    try {
      return localStorage.getItem('deepstack_answer_input_mode') === 'mcq-hint'
    } catch {
      return false
    }
  });
  const submittingRef = useRef(false);
  const continueButtonRef = useRef(null);
  const inputRef = useRef(null);

  const [photoPhase, setPhotoPhase] = useState('pending');

  const { isAuthenticated, markStackCompleted } = useAuth();

  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark')
  });

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

  const progressKey = stackKey || stackData.title;
  const deeperQuestions = useMemo(() => stackData.deeperMode?.questions || [], [stackData.deeperMode]);
  const hasDeeperMode = deeperQuestions.length > 0;

  useEffect(() => {
    if (resumeData) {
      setDepth(resumeData.currentIndex);
      setScore(resumeData.score);
      setUserAnswers(resumeData.userAnswers || []);
    }
    ProgressStorage.trackAction('stack_started', {
      stackName: progressKey,
      resumed: !!resumeData,
      startIndex: resumeData?.currentIndex || 0
    });
  }, [resumeData, progressKey])

  const current = useMemo(() => {
    if (isDeepMode) return deeperQuestions[deepModeDepth];
    return stackData.questions[depth];
  }, [isDeepMode, deeperQuestions, deepModeDepth, stackData.questions, depth]);

  // Keep focus where the player's thumb/keyboard needs it next
  useEffect(() => {
    if (reveal) continueButtonRef.current?.focus();
    else inputRef.current?.focus({ preventScroll: true });
  }, [reveal, depth, deepModeDepth]);

  const toggleMcqHint = useCallback(() => {
    setShowMcqHint((prev) => {
      const next = !prev
      try {
        localStorage.setItem('deepstack_answer_input_mode', next ? 'mcq-hint' : 'type')
      } catch { /* ignore */ }
      return next
    })
  }, [])

  const mcqOptions = useMemo(() => {
    if (!showMcqHint || isDeepMode || !stackData?.questions?.length || !current) return []
    return generateMultipleChoiceOptions(stackData, depth, 4)
  }, [showMcqHint, stackData, current, isDeepMode, depth])

  const animateScore = useCallback(() => {
    setScoreAnimation(true);
    setTimeout(() => setScoreAnimation(false), 1000);
  }, []);

  const finish = useCallback((finalScore, answers, { deeper = false } = {}) => {
    setIsCompleted(true);
    ProgressStorage.clearProgress();
    if (isAuthenticated) {
      markStackCompleted(deeper ? `${stackData.title} - Deeper Mode` : stackData.title, finalScore);
    }
    if (onComplete) {
      const correctCount = answers.filter((a) => a.correct).length;
      const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
      const runMax = calculateMaxScore(stackData.questions.length, deeper);
      onComplete(finalScore, runMax, answers.length, accuracy, answers);
    }
  }, [isAuthenticated, markStackCompleted, onComplete, stackData.title, stackData.questions.length]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    onPause();
  }, [onPause]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    onResume();
  }, [onResume]);

  const resetForNextQuestion = () => {
    setInput('');
    setSelectedOption(null);
    setShowHint(false);
    setReveal(null);
    submittingRef.current = false;
  };

  const handleSkipQuestion = useCallback(() => {
    if (depth + 1 >= stackData.questions.length) {
      finish(score, userAnswers);
    } else {
      setDepth(depth + 1);
      resetForNextQuestion();
    }
  }, [depth, stackData.questions.length, finish, score, userAnswers]);

  const handlePlaySound = useCallback((soundType) => {
    playSound(soundType);
  }, []);

  const checkAnswer = () => {
    if (!current || isPaused || reveal || isCompleted || submittingRef.current) return;
    submittingRef.current = true;

    const userAnswer = (selectedOption && String(selectedOption)) || input.trim();
    const isCorrect = checkAnswerMatch(userAnswer, getAcceptedAnswers(current));
    const currentDepth = isDeepMode ? deepModeDepth : depth;

    let points = 0;
    if (isCorrect) {
      const multiplier = showHostControls ? getCrowdMultiplier(crowdEnergy) : 1;
      points = Math.round(calculateQuestionScore(currentDepth, isDeepMode) * multiplier);
    }

    playSound(isCorrect ? 'correct' : 'incorrect');

    const nextAnswers = [
      ...userAnswers,
      {
        questionIndex: currentDepth,
        deeper: isDeepMode,
        questionText: current.question || current.q,
        acceptedAnswers: getAcceptedAnswers(current),
        answer: getCanonicalAnswer(current),
        userAnswer,
        correct: isCorrect,
        pointsAwarded: points,
      }
    ];
    setUserAnswers(nextAnswers);

    if (isCorrect) {
      setScore((prev) => prev + points);
      animateScore();
      if (!isDeepMode && depth + 1 < stackData.questions.length) {
        ProgressStorage.saveProgress(
          progressKey,
          depth + 1,
          score + points,
          calculateMaxScore(stackData.questions.length, false),
          nextAnswers
        );
      }
    } else {
      // A miss ends the run, so there is nothing to resume
      ProgressStorage.clearProgress();
    }

    setReveal({
      correct: isCorrect,
      points,
      answer: getCanonicalAnswer(current),
      explanation: current.explanation || null,
      userAnswer,
    });
  };

  const handleContinue = () => {
    if (!reveal) return;

    if (!reveal.correct) {
      finish(score, userAnswers, { deeper: isDeepMode });
      return;
    }

    if (isDeepMode) {
      if (deepModeDepth + 1 >= deeperQuestions.length) {
        finish(score, userAnswers, { deeper: true });
      } else {
        setDeepModeDepth(deepModeDepth + 1);
        resetForNextQuestion();
      }
      return;
    }

    if (depth + 1 >= stackData.questions.length) {
      if (hasDeeperMode) {
        setReveal(null);
        setShowDeeperModeOffer(true);
      } else {
        finish(score, userAnswers);
      }
      return;
    }

    setDepth(depth + 1);
    resetForNextQuestion();
  };

  const getContinueLabel = () => {
    if (!reveal) return '';
    if (!reveal.correct) return 'See the full story';
    const isLastMain = !isDeepMode && depth + 1 >= stackData.questions.length;
    const isLastDeeper = isDeepMode && deepModeDepth + 1 >= deeperQuestions.length;
    if (isLastMain && hasDeeperMode) return 'Continue';
    if (isLastMain || isLastDeeper) return 'See your results';
    return 'Go deeper ↓';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isPaused && (input.trim() || selectedOption)) {
      e.preventDefault();
      checkAnswer();
    }
  };

  const toggleHint = useCallback(() => {
    setShowHint((prev) => !prev);
  }, []);

  const enterDeeperMode = () => {
    setIsDeepMode(true);
    setDeepModeDepth(0);
    setShowDeeperModeOffer(false);
    resetForNextQuestion();
  };

  const declineDeeperMode = () => {
    setShowDeeperModeOffer(false);
    finish(score, userAnswers);
  };

  const handlePhotoIdentification = useCallback((result) => {
    setPhotoPhase('completed');
    setScore(prev => prev + result.bonusPoints);
  }, []);

  const handlePhotoSkip = useCallback(() => {
    setPhotoPhase('skipped');
  }, []);

  const isPhotoFirst = stackData.photoFirst && stackData.questions[0]?.photo;

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

  if (showDeeperModeOffer && hasDeeperMode) {
    return (
      <div className={`p-8 max-w-3xl mx-auto rounded-sm border-2 border-amber-400 text-center ${
        darkMode
          ? 'bg-gradient-to-br from-amber-900/90 via-yellow-900/90 to-amber-800/90 text-amber-50'
          : 'bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-50 text-amber-900'
      }`}>
        <div className="text-7xl mb-6" style={{ fontFamily: 'Baskervville, serif' }}>— ❦ —</div>
        <p className="text-sm uppercase tracking-widest text-amber-600 mb-2">Perfect stack — bonus unlocked</p>
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
            {deeperQuestions.length} bonus question{deeperQuestions.length === 1 ? '' : 's'} — your points are safe, a miss just ends the bonus round
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={enterDeeperMode}
            className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 text-white px-8 py-4 rounded-sm border-2 border-amber-500 hover:border-amber-400 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            style={{ fontFamily: 'Baskervville, serif' }}
          >
            ENTER DEEPER MODE
          </button>
          <button
            onClick={declineDeeperMode}
            className={`px-8 py-4 rounded-sm border-2 border-amber-400 hover:border-amber-300 text-lg font-semibold transition-all duration-300 ${
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

  const totalLevels = isDeepMode ? deeperQuestions.length : stackData.questions.length;
  const levelIndex = isDeepMode ? deepModeDepth : depth;
  const inputLocked = isPaused || !!reveal || isCompleted;

  return (
    <div className={`p-5 sm:p-6 max-w-4xl mx-auto rounded-sm transition-colors duration-300 ${
      darkMode
        ? 'bg-gradient-to-br from-amber-900/70 via-yellow-900/70 to-amber-800/70 text-amber-50'
        : 'bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-50 text-amber-900'
    }`} style={{ fontFamily: 'Baskerville, serif' }}>

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
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-amber-800 dark:text-amber-200">
          {isDeepMode ? stackData.deeperMode?.title : stackData.title}
        </h2>
        <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
          <span className={`text-lg font-semibold ${scoreAnimation ? 'animate-bounce text-green-600' : ''}`}>
            Score: {score}
          </span>
          <span className="text-sm text-amber-600 dark:text-amber-400">
            {isDeepMode
              ? `Deeper ${deepModeDepth + 1}/${deeperQuestions.length}`
              : `Level ${current?.level || depth + 1} of ${stackData.questions.length} — ${getLevelLabel(current?.level || depth + 1)}`}
          </span>
        </div>

        {/* Depth ladder: each rung is a level, worth double the last */}
        <ol className="flex justify-center gap-1.5" aria-label="Stack progress">
          {Array.from({ length: totalLevels }).map((_, i) => {
            const answered = userAnswers.find((a) => a.questionIndex === i && !!a.deeper === isDeepMode);
            const state = answered ? (answered.correct ? 'correct' : 'missed') : i === levelIndex ? 'current' : 'ahead';
            return (
              <li
                key={i}
                aria-label={`Level ${i + 1}: ${state}`}
                className={`h-2.5 w-10 sm:w-14 rounded-full transition-colors duration-500 ${
                  state === 'correct' ? 'bg-green-600'
                    : state === 'missed' ? 'bg-red-500'
                      : state === 'current' ? 'bg-amber-500 animate-pulse'
                        : 'bg-amber-200 dark:bg-amber-800/60'
                }`}
              />
            );
          })}
        </ol>
        {!isDeepMode && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Worth {calculateQuestionScore(depth, false)} pts · one miss ends the dive
          </p>
        )}
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl mb-6 leading-relaxed font-medium text-gray-900 dark:text-gray-100">
          {current.question || current.q}
        </h3>

        {current.hint && !reveal && (
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

      {reveal ? (
        <div
          className={`text-center p-5 sm:p-6 rounded-sm border-2 mb-6 ${
            reveal.correct
              ? (darkMode ? 'bg-green-900/30 border-green-600 text-green-100' : 'bg-green-50 border-green-400 text-green-900')
              : (darkMode ? 'bg-red-900/30 border-red-600 text-red-100' : 'bg-red-50 border-red-300 text-red-900')
          }`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-lg font-semibold">
            {reveal.correct ? `Correct! +${reveal.points} points` : 'Not quite—the dive ends here.'}
          </p>
          <p className="mt-2 text-2xl font-bold" style={{ fontFamily: 'Baskervville, serif' }}>
            {reveal.answer}
          </p>
          {!reveal.correct && reveal.userAnswer && (
            <p className="mt-1 text-sm opacity-80">You said: “{reveal.userAnswer}”</p>
          )}
          {reveal.explanation && (
            <p className={`mt-4 text-base leading-relaxed italic ${darkMode ? 'text-amber-100' : 'text-amber-900'}`}>
              {reveal.explanation}
            </p>
          )}
          <button
            ref={continueButtonRef}
            type="button"
            onClick={handleContinue}
            className="mt-5 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 text-white px-8 py-3 rounded-sm text-lg font-semibold transition-all duration-300"
          >
            {getContinueLabel()}
          </button>
        </div>
      ) : (
        <div className="text-center mb-6">
          {!isDeepMode && (
            <div className="mb-4">
              <button
                type="button"
                onClick={toggleMcqHint}
                disabled={inputLocked}
                className={`px-4 py-2 rounded-sm border-2 text-sm transition-colors ${
                  showMcqHint
                    ? 'bg-amber-300 dark:bg-amber-700 border-amber-500 text-amber-900 dark:text-amber-50'
                    : 'bg-amber-50 dark:bg-amber-800/40 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 hover:bg-amber-100'
                }`}
              >
                {showMcqHint ? 'Hide answer choices' : 'Show answer choices'}
              </button>
            </div>
          )}
          {mcqOptions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-6">
              {mcqOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!inputLocked) {
                      setSelectedOption(String(opt))
                      setInput('')
                    }
                  }}
                  disabled={inputLocked}
                  aria-pressed={selectedOption === String(opt)}
                  className={`px-4 py-3 rounded-sm border-2 transition-colors ${
                    selectedOption === String(opt)
                      ? 'bg-amber-300 dark:bg-amber-700 border-amber-500 dark:border-amber-500 text-amber-900 dark:text-amber-50'
                      : 'bg-amber-50 dark:bg-amber-800/40 border-amber-300 dark:border-amber-600 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-800/60'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          <label htmlFor="trivia-answer-input" className="sr-only">
            Your answer to the trivia question
          </label>
          <input
            ref={inputRef}
            id="trivia-answer-input"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (selectedOption) setSelectedOption(null)
            }}
            onKeyDown={handleKeyDown}
            disabled={inputLocked}
            placeholder="Your answer..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            aria-describedby="answer-instructions"
            className={`w-full max-w-md px-4 py-3 text-lg rounded-sm border-2 text-center transition-all duration-200 ${
              darkMode
                ? 'bg-amber-800/50 border-amber-600 text-amber-100 placeholder-amber-400'
                : 'bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600'
            } focus:outline-none focus:border-amber-500`}
            style={{ fontFamily: 'Baskerville, serif', fontSize: '18px' }}
          />
          <div id="answer-instructions" className="sr-only">
            Type your answer and press Enter or tap Submit. Small typos are forgiven.
          </div>
          <div className="mt-4">
            <button
              aria-label="Submit answer"
              onClick={checkAnswer}
              disabled={inputLocked || !(input.trim() || selectedOption)}
              className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 disabled:from-amber-400 disabled:to-amber-500 text-white px-8 py-3 rounded-sm text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default GameStack;
