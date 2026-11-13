/**
 * Find questions that give away their own answer.
 *
 * - own-question: a meaningful word of the answer appears in its own question
 *   ("Eugene honors Pre with the ___ Classic" → "Prefontaine")
 * - nickname: the question contains a short form of a long answer word ("Pre" → "Prefontaine")
 * - already-said: the answer was already printed in an earlier question of the same story,
 *   or is the answer to an earlier level, so the player gets it for free
 */
import { normalizeAnswer } from '../src/utils/textUtils.js'

const STOPWORDS = new Set([
  'the', 'and', 'of', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by',
  'his', 'her', 'their', 'its', 'what', 'which', 'who', 'that', 'this', 'one', 'two',
  'three', 'four', 'five', 'six', 'over', 'about', 'years', 'year', 'part', 'all',
])

const words = (text) => normalizeAnswer(text).split(' ').filter(Boolean)

const meaningfulWords = (text) => words(text).filter((w) => w.length >= 4 && !STOPWORDS.has(w) && !/^\d+$/.test(w))

const containsWord = (text, word) => words(text).includes(word)

/**
 * @param {{ questions: { question: string, answer: string }[] }} stack
 * @returns {{ level: number, kind: string, detail: string }[]}
 */
export function findAnswerLeaks(stack) {
  const leaks = []
  const questions = stack.questions || []

  questions.forEach((q, index) => {
    const level = index + 1
    const answerWords = meaningfulWords(q.answer)

    answerWords.forEach((word) => {
      if (containsWord(q.question, word)) {
        leaks.push({ level, kind: 'own-question', detail: `"${word}" from the answer "${q.answer}" is in the question` })
      }
    })

    words(q.question).forEach((qWord) => {
      if (qWord.length < 3 || STOPWORDS.has(qWord)) return
      answerWords.forEach((word) => {
        if (word.length >= 7 && word !== qWord && word.startsWith(qWord)) {
          leaks.push({ level, kind: 'nickname', detail: `"${qWord}" in the question is short for "${word}" in the answer "${q.answer}"` })
        }
      })
    })

    const answer = normalizeAnswer(q.answer)
    questions.slice(0, index).forEach((earlier, earlierIndex) => {
      const earlierAnswer = normalizeAnswer(earlier.answer)
      const sameAsEarlierAnswer = answer === earlierAnswer ||
        (answer.length >= 5 && containsWord(earlier.answer, answer)) ||
        (earlierAnswer.length >= 5 && containsWord(q.answer, earlierAnswer))
      if (sameAsEarlierAnswer) {
        leaks.push({ level, kind: 'already-said', detail: `answer "${q.answer}" repeats the level ${earlierIndex + 1} answer "${earlier.answer}"` })
      } else if (answer.length >= 5 && ` ${normalizeAnswer(earlier.question)} `.includes(` ${answer} `)) {
        leaks.push({ level, kind: 'already-said', detail: `answer "${q.answer}" is printed in the level ${earlierIndex + 1} question` })
      }
    })
  })

  return leaks
}
