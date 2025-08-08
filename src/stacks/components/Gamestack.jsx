import { useState } from 'react';

export default function GameStack({ stack }) {
  const [depth, setDepth] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const current = stack.questions[depth];

  const checkAnswer = () => {
    if (current.a.some(a => input.toLowerCase().includes(a))) {
      const newScore = score + 10 * Math.pow(2, depth);
      setScore(newScore);
      setDepth(depth + 1);
      setInput('');
    } else {
      alert("Incorrect. Stack ends here.");
    }
  };

  if (depth >= stack.questions.length) {
    return <div>Stack complete! Final score: {score}</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{stack.title} (Depth {depth + 1})</h2>
      <p className="mb-2">{current.q}</p>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <button onClick={checkAnswer} className="bg-black text-white px-4 py-2">Submit</button>
      <p className="mt-4">Current Score: {score}</p>
    </div>
  );
}
