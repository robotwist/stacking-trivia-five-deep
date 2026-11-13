import { useState } from 'react';
import { submitFeedback } from '../services/feedbackService';
import FeedbackModal from './FeedbackModal';
import { shareRun } from '../utils/share.js';
import { buildResultCode, ladderFromCode } from '../utils/playerRecords';
import { track } from '../utils/analytics';

const PLAYER_NAME_KEY = 'deepstack_player_name';

const readPlayerName = () => {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) || '';
  } catch {
    return '';
  }
};

const getHeadToHead = (score, challenge) => {
  const rival = challenge.name || 'Your friend';
  if (score > challenge.score) return `You beat ${rival}!`;
  if (score === challenge.score) return `Dead heat with ${rival}.`;
  return `${rival} wins this one.`;
};

const getHeadline = (levelsCleared, totalLevels) => {
  if (levelsCleared >= totalLevels) return 'Perfect dive!';
  if (levelsCleared === 0) return 'The story got away this time';
  return `You reached Level ${levelsCleared + 1} of ${totalLevels}`;
};

const PostGameFlow = ({
  stackKey,
  stack,
  categoryKey,
  score,
  maxScore,
  answers = [],
  isNewBest = false,
  previousBest = null,
  suggestions = [],
  challenge = null,
  dailyNumber = null,
  onPlayStack,
  onPlayAgain,
  onReturnToMenu,
}) => {
  const [revealRest, setRevealRest] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [toast, setToast] = useState('');
  const [playerName, setPlayerName] = useState(readPlayerName);

  const questions = stack?.questions || [];
  const totalLevels = questions.length || 5;
  const mainAnswers = answers.filter((a) => !a.deeper);
  const deeperAnswers = answers.filter((a) => a.deeper);
  const levelsCleared = mainAnswers.filter((a) => a.correct).length;
  const resultCode = buildResultCode(answers, totalLevels);
  const ladder = ladderFromCode(resultCode);
  const hasUnseenLevels = mainAnswers.length < totalLevels;

  const handleNameChange = (e) => {
    const name = e.target.value.slice(0, 24);
    setPlayerName(name);
    try {
      localStorage.setItem(PLAYER_NAME_KEY, name);
    } catch { /* best-effort */ }
  };

  const flash = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  };

  const handleShare = async () => {
    const result = await shareRun({
      stackTitle: stack?.title || stackKey,
      stackKey,
      categoryKey,
      score,
      maxScore,
      code: resultCode,
      playerName: playerName.trim() || undefined,
      dailyNumber,
    });
    track('result shared', { stack: stackKey, outcome: result, score, is_daily: !!dailyNumber, reply: !!challenge });
    if (result === 'copied') flash('Challenge link copied—paste it to a friend');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-amber-300 dark:border-amber-600 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 text-center text-white">
            <p className="text-sm uppercase tracking-widest opacity-90">{stack?.title}</p>
            <h1 className="text-3xl font-bold mt-1" style={{ fontFamily: 'Baskervville, serif' }}>
              {getHeadline(levelsCleared, totalLevels)}
            </h1>
            <p className="text-4xl tracking-widest mt-4" aria-label={`Result: ${levelsCleared} of ${totalLevels} levels cleared`}>
              {ladder}
            </p>
            <p className="mt-3 text-xl">
              <span className="font-bold text-3xl">{score}</span>
              <span className="opacity-90"> / {maxScore} points</span>
            </p>
            {stack?.easterEgg && levelsCleared >= totalLevels && (
              <p className="mt-2 text-sm font-semibold">🥚 You found the easter egg</p>
            )}
            {isNewBest && previousBest !== null && (
              <p className="mt-2 inline-block px-3 py-1 rounded-full bg-white/25 text-sm font-semibold">
                New best! Previous: {previousBest}
              </p>
            )}
          </div>

          {challenge && (
            <div className="px-5 pt-5 text-center">
              <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{getHeadToHead(score, challenge)}</p>
              <div className="mt-2 flex justify-center gap-6 text-sm text-gray-700 dark:text-gray-200">
                <span>You: <strong>{score}</strong> <span className="tracking-widest">{ladder}</span></span>
                <span>
                  {challenge.name || 'Friend'}: <strong>{challenge.score}</strong>{' '}
                  {challenge.code && <span className="tracking-widest">{ladderFromCode(challenge.code)}</span>}
                </span>
              </div>
            </div>
          )}

          <div className="px-5 pt-5">
            <label htmlFor="challenge-name" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Sign your challenge (optional)
            </label>
            <input
              id="challenge-name"
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Your name"
              maxLength={24}
              autoComplete="nickname"
              className="w-full px-3 py-2 rounded-lg border-2 border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="p-5 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 px-5 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold"
            >
              {challenge ? 'Send it back' : 'Challenge a friend'}
            </button>
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex-1 px-5 py-3 rounded-lg border-2 border-amber-400 text-amber-800 dark:text-amber-200 font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              Try this stack again
            </button>
          </div>
        </section>

        {stack?.easterEgg && (
          levelsCleared >= totalLevels ? (
            <section
              aria-label="Easter egg unlocked"
              className="rounded-xl border-2 border-dashed border-amber-400 bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/40 dark:to-gray-800 p-5"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">🥚 Easter egg unlocked</p>
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mt-1" style={{ fontFamily: 'Baskervville, serif' }}>
                {stack.easterEgg.title}
              </h2>
              <p className="mt-2 text-amber-900 dark:text-amber-100">{stack.easterEgg.text}</p>
            </section>
          ) : (
            <p className="text-center text-sm text-amber-700 dark:text-amber-300">
              🥚 This story hides an easter egg. Go all five levels deep to find it.
            </p>
          )
        )}

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow border border-amber-200 dark:border-amber-700 p-5">
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-4" style={{ fontFamily: 'Baskervville, serif' }}>
            The story, level by level
          </h2>
          <ol className="space-y-4">
            {questions.map((q, i) => {
              const answer = mainAnswers[i];
              const seen = !!answer;
              const visible = seen || revealRest;
              const status = !seen ? 'unseen' : !answer.correct ? 'missed' : answer.usedChoices ? 'assisted' : 'correct';
              return (
                <li key={i} className="flex gap-3">
                  <span
                    className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      status === 'correct' ? 'bg-green-600 text-white'
                        : status === 'assisted' ? 'bg-yellow-400 text-gray-900'
                        : status === 'missed' ? 'bg-red-500 text-white'
                          : 'bg-amber-100 dark:bg-gray-700 text-amber-700 dark:text-amber-300'
                    }`}
                    aria-label={`Level ${i + 1} ${status === 'assisted' ? 'correct with choices' : status}`}
                  >
                    {status === 'correct' || status === 'assisted' ? '✓' : status === 'missed' ? '✗' : i + 1}
                  </span>
                  <div className="min-w-0">
                    {visible ? (
                      <>
                        <p className="text-gray-800 dark:text-gray-100">{q.question}</p>
                        <p className="font-bold text-amber-800 dark:text-amber-200 mt-1">{q.answer}</p>
                        {status === 'missed' && answer.userAnswer && (
                          <p className="text-sm text-red-700 dark:text-red-300">You said “{answer.userAnswer}”</p>
                        )}
                        {q.explanation && (
                          <p className="text-sm italic text-gray-600 dark:text-gray-300 mt-1">{q.explanation}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic pt-1">Level {i + 1} — still a mystery</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {hasUnseenLevels && !revealRest && (
            <button
              type="button"
              onClick={() => {
                setRevealRest(true);
                track('story revealed', { stack: stackKey, levels_unseen: totalLevels - mainAnswers.length });
              }}
              className="mt-4 text-sm font-semibold text-amber-700 dark:text-amber-300 underline underline-offset-2"
            >
              Reveal the rest of the story (spoilers)
            </button>
          )}
          {deeperAnswers.length > 0 && (
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
              Deeper Mode: {deeperAnswers.filter((a) => a.correct).length} of {deeperAnswers.length} bonus questions answered.
            </p>
          )}
        </section>

        {suggestions.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3">Dive into another story</h2>
            <div className="grid gap-3">
              {suggestions.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => onPlayStack(s.key)}
                  className="text-left p-4 rounded-lg border-2 border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-gray-800 hover:border-amber-400"
                >
                  <span className="block font-bold text-amber-900 dark:text-amber-100">{s.title}</span>
                  <span className="block text-sm text-amber-700 dark:text-amber-300">{s.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
          <button
            type="button"
            onClick={onReturnToMenu}
            className="px-5 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 font-semibold"
          >
            ← All topics
          </button>
          <button
            type="button"
            onClick={() => setShowFeedback(true)}
            className="text-amber-700 dark:text-amber-300 underline underline-offset-2"
          >
            Spotted an error? Tell us
          </button>
        </div>

        <FeedbackModal
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          stackTitle={stack?.title || stackKey}
          onSubmitFeedback={async ({ stackTitle, rating, category, feedback, difficultyTag }) => {
            const res = await submitFeedback({ stackTitle, rating, category, message: feedback, difficultyTag });
            track('feedback sent', { stack: stackKey, rating, category });
            flash(res.ok ? 'Thanks! Feedback saved.' : 'Saved on this device; will sync later.');
          }}
        />

        {toast && (
          <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded shadow-lg border border-gray-700">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostGameFlow;
