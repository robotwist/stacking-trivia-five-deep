/**
 * Photo-First Question Component
 * Handles the initial photo identification challenge
 */

import React, { useState, useEffect } from 'react';
import { checkAnswerMatch } from '../utils/textUtils';

const PhotoIdentification = ({ 
  photoData, 
  onCorrectIdentification, 
  onSkip,
  stackTitle 
}) => {
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isMatch = checkAnswerMatch(input, photoData.acceptedAnswers);
    
    if (isMatch) {
      setIsCorrect(true);
      setFeedback(`✓ Correct! This is ${photoData.acceptedAnswers[0]}`);
      setShowTransition(true);
      
      // Bonus points for photo identification
      const bonusPoints = Math.floor(photoData.points * 0.5); // 50% bonus
      
      setTimeout(() => {
        onCorrectIdentification({
          identified: true,
          bonusPoints,
          personName: photoData.acceptedAnswers[0]
        });
      }, 2000);
    } else {
      setFeedback(`Not quite. ${showHint ? 'Hint: ' + photoData.hint : 'Try again or use the hint.'}`);
      // Allow them to continue after wrong answer, but no bonus
      setTimeout(() => {
        if (!showHint) {
          setShowHint(true);
        }
      }, 3000);
    }
  };

  const handleSkipPhoto = () => {
    onSkip({ identified: false, bonusPoints: 0, personName: 'Unknown' });
  };

  return (
    <div className={`photo-identification-container transition-all duration-1000 ${
      showTransition ? 'transform scale-105 opacity-90' : ''
    }`}>
      
      {/* Photo Display */}
      <div className="photo-challenge-card bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 rounded-lg border-2 border-amber-400 p-8 max-w-2xl mx-auto">
        
        {/* Photo Frame */}
        <div className="photo-frame mb-6 relative">
          <div className="aspect-square bg-gradient-to-br from-sepia-100 to-sepia-200 rounded-lg overflow-hidden border-4 border-amber-300 shadow-2xl">
            
            {/* Simulated Photo - In real implementation, this would be an actual image */}
            <div className="photo-placeholder h-full flex items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 text-amber-800">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-sm leading-relaxed font-mono">
                  {photoData.photo.description}
                </p>
                <p className="text-xs mt-3 opacity-70">
                  {photoData.photo.era}
                </p>
              </div>
            </div>
            
            {/* Photo Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
              <p className="text-xs">{photoData.photo.style}</p>
            </div>
          </div>
        </div>

        {/* Challenge Text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-2">
            📸 Photo Challenge
          </h2>
          <p className="text-lg text-amber-700 dark:text-amber-300 leading-relaxed">
            {photoData.question}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your answer..."
              className="flex-1 px-4 py-3 border-2 border-amber-300 rounded-md focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white dark:bg-amber-900 text-amber-900 dark:text-amber-100"
              disabled={isCorrect}
            />
            <button
              type="submit"
              disabled={isCorrect || !input.trim()}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-md font-medium transition-colors"
            >
              {isCorrect ? '✓' : 'Identify'}
            </button>
          </div>
        </form>

        {/* Feedback */}
        {feedback && (
          <div className={`feedback p-3 rounded-md text-center font-medium ${
            isCorrect 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          }`}>
            {feedback}
          </div>
        )}

        {/* Hint Button */}
        {!isCorrect && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-md text-sm transition-colors"
            >
              {showHint ? 'Hide Hint' : '💡 Show Hint'}
            </button>
            <button
              onClick={handleSkipPhoto}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm transition-colors"
            >
              Skip Photo Challenge →
            </button>
          </div>
        )}

        {/* Hint Display */}
        {showHint && photoData.hint && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm">
              <strong>Hint:</strong> {photoData.hint}
            </p>
          </div>
        )}

        {/* Transition Message */}
        {showTransition && (
          <div className="transition-message mt-6 p-4 bg-gradient-to-r from-gold-100 to-amber-100 border border-gold-300 rounded-md text-center">
            <p className="text-gold-800 font-medium">
              🎉 Excellent! Now let's explore what {photoData.acceptedAnswers[0]} created...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoIdentification;
