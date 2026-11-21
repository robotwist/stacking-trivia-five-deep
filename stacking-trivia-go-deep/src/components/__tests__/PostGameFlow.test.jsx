import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostGameFlow from '../PostGameFlow'

vi.mock('../FeedbackModal', () => ({ default: () => null }))

const stack = {
  title: 'Star Wars: The Death Star Rescue',
  questions: [1, 2, 3, 4, 5].map((n) => ({ question: `Q${n}`, answer: `A${n}` })),
  easterEgg: { title: "Leia's cell came back", text: 'Finn is FN-2187.' },
}

const answers = (correctCount, total = 5) =>
  Array.from({ length: Math.min(total, correctCount + 1) }, (_, i) => ({ correct: i < correctCount }))

describe('PostGameFlow easter egg', () => {
  it('reveals the easter egg only after a perfect Go Deep', () => {
    render(<PostGameFlow stackKey="star-wars" stack={stack} score={310} maxScore={310} answers={answers(5)} />)
    expect(screen.getByText("Leia's cell came back")).toBeInTheDocument()
    expect(screen.getByText('Finn is FN-2187.')).toBeInTheDocument()
  })

  it('teases the easter egg without spoiling it when the player misses', () => {
    render(<PostGameFlow stackKey="star-wars" stack={stack} score={70} maxScore={310} answers={answers(3)} />)
    expect(screen.queryByText('Finn is FN-2187.')).not.toBeInTheDocument()
    expect(screen.getByText(/hides an easter egg/i)).toBeInTheDocument()
  })

  it('keeps a skipped level empty instead of shifting the later answers', () => {
    const indexed = [
      { questionIndex: 0, correct: true },
      { questionIndex: 2, correct: false, userAnswer: 'nope' },
    ]
    render(<PostGameFlow stackKey="star-wars" stack={stack} score={10} maxScore={310} answers={indexed} />)

    expect(screen.getByLabelText('Level 1 correct')).toBeInTheDocument()
    expect(screen.getByLabelText('Level 2 unseen')).toBeInTheDocument()
    expect(screen.getByLabelText('Level 3 missed')).toBeInTheDocument()
    expect(screen.getByText('Level 2 — still a mystery')).toBeInTheDocument()
    expect(screen.getByText('Q3')).toBeInTheDocument()
    expect(screen.getByText('You said “nope”')).toBeInTheDocument()
  })
})
