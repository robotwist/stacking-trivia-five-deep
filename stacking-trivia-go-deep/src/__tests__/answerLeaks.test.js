import { describe, it, expect } from 'vitest'
import { findAnswerLeaks } from '../../tools/answerLeaks.js'

const stack = (...questions) => ({ questions: questions.map(([question, answer]) => ({ question, answer })) })

describe('findAnswerLeaks', () => {
  it('flags a word of the answer inside its own question', () => {
    const leaks = findAnswerLeaks(stack(['Einstein won the Nobel for what effect?', 'Photoelectric effect']))
    expect(leaks).toEqual([expect.objectContaining({ level: 1, kind: 'own-question' })])
  })

  it('flags a nickname that gives away a long answer', () => {
    const leaks = findAnswerLeaks(stack(['Eugene honors Pre with the what Classic?', 'Prefontaine']))
    expect(leaks.map((l) => l.kind)).toContain('nickname')
  })

  it('flags an answer the player already gave or already read', () => {
    const repeated = findAnswerLeaks(stack(
      ['Which runner packed Hayward Field?', 'Steve Prefontaine'],
      ['His memorial meet is the what Classic?', 'Prefontaine'],
    ))
    expect(repeated.map((l) => l.kind)).toContain('already-said')

    const printedEarlier = findAnswerLeaks(stack(
      ['Texas and Arkansas feud over what dip?', 'Cheese dip'],
      ["Which state's senator called for a taste test?", 'Arkansas'],
    ))
    expect(printedEarlier).toEqual([expect.objectContaining({ level: 2, kind: 'already-said' })])
  })

  it('allows a chain that names the previous answer to ask about something new', () => {
    expect(findAnswerLeaks(stack(
      ["Who painted 'The Starry Night'?", 'Vincent van Gogh'],
      ['How many paintings did van Gogh sell?', 'One'],
      ['Who bought The Red Vineyard?', 'Anna Boch'],
    ))).toEqual([])
  })
})
