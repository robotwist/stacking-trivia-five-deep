import { useState } from 'react';

export default function GameStack({ stack, onComplete }) {
  const [depth, setDepth] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  
  const current = stack.questions[depth];

  const checkAnswer = () => {
    if (!current) return;
    
    const userAnswer = input.toLowerCase().trim();
    let isCorrect = false;
    
    // Check if the data format has 'a' array (old format) or 'answer' string (new format)
    if (current.a && Array.isArray(current.a)) {
      isCorrect = current.a.some(a => userAnswer.includes(a.toLowerCase()));
    } else if (current.answer) {
      isCorrect = userAnswer.includes(current.answer.toLowerCase()) || 
                 current.answer.toLowerCase().includes(userAnswer);
    }
    
    if (isCorrect) {
      const newScore = score + 10 * Math.pow(2, depth);
      setScore(newScore);
      setFeedback('Correct! Moving to the next level...');
      
      setTimeout(() => {
        setDepth(depth + 1);
        setInput('');
        setFeedback('');
        setShowHint(false);
      }, 1500);
    } else {
      setFeedback(`Incorrect. The answer was: ${current.answer || current.a?.[0] || 'Unknown'}. Stack ends here.`);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (depth >= stack.questions.length) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Stack Complete!</h2>
        <p className="text-xl mb-4">Final Score: <span className="font-bold">{score}</span></p>
        <p className="text-gray-600 mb-6">You've mastered the {stack.title} stack!</p>
        <button
          onClick={onComplete}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
        >
          Play Again
        </button>
      </div>
    );
  }

  if (!current) {
    return <div className="p-4 text-center">No questions available</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {stack.title} <span className="text-sm font-normal text-gray-500">(Level {depth + 1})</span>
        </h2>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((depth) / stack.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-lg text-gray-700 mb-4">
          {current.question || current.q}
        </p>
        
        {showHint && current.hint && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
            <p className="text-yellow-700">💡 Hint: {current.hint}</p>
          </div>
        )}
        
        {feedback && (
          <div className={`p-3 rounded-lg mb-4 ${
            feedback.includes('Correct') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {feedback}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your answer..."
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
          disabled={feedback.includes('Incorrect')}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={checkAnswer}
            disabled={!input.trim() || feedback.includes('Incorrect')}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Submit
          </button>
          
          {current.hint && (
            <button
              onClick={toggleHint}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}
        </div>
        
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-700">Score: {score}</p>
          <p className="text-sm text-gray-500">Level {depth + 1} of {stack.questions.length}</p>
        </div>
      </div>
    </div>
  );
}
