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
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-green-600">Stack Complete!</h2>
        <p className="text-lg sm:text-xl lg:text-2xl mb-4">Final score: <span className="font-bold">{score}</span></p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 text-center sm:text-left">
        {stack.title} <span className="text-purple-600">(Depth {depth + 1})</span>
      </h2>
      <p className="mb-4 text-base sm:text-lg leading-relaxed">{current.q}</p>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="border border-gray-300 rounded-lg p-3 w-full mb-4 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        placeholder="Enter your answer..."
      />
      <button 
        onClick={checkAnswer} 
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg w-full sm:w-auto font-semibold transition-colors duration-200 text-base sm:text-lg"
      >
        Submit Answer
      </button>
      <p className="mt-4 text-center sm:text-left text-lg sm:text-xl font-medium">
        Current Score: <span className="text-purple-600 font-bold">{score}</span>
      </p>
    </div>
  );
}
