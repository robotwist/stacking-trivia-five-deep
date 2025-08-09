/**
 * Photo-First Test Component - For manual testing and refinement
 */

import React, { useState } from 'react';
import PhotoIdentification from './PhotoIdentification';

const PhotoFirstTest = () => {
  const [testComplete, setTestComplete] = useState(false);
  const [result, setResult] = useState(null);

  // Test data for Shakespeare
  const shakespearePhotoData = {
    photo: {
      description: "Portrait of a balding man with mustache and small pointed beard, wearing an elaborate white ruff collar, intelligent piercing eyes",
      era: "Late 16th/early 17th century Elizabethan England",
      style: "Formal Elizabethan portraiture"
    },
    question: "Name this playwright who invented words like 'assassination', 'swagger', and 'eyeball'",
    acceptedAnswers: ["william shakespeare", "shakespeare", "william shakspere", "the bard"],
    hint: "He wrote approximately 37 plays and 154 sonnets",
    explanation: "William Shakespeare (1564-1616) is credited with coining over 1,700 words and phrases that entered English permanently, from 'bedroom' to 'fashionable' to 'lonely'.",
    points: 10
  };

  const handleIdentification = (identificationResult) => {
    setResult(identificationResult);
    setTestComplete(true);
  };

  const handleSkip = (skipResult) => {
    setResult(skipResult);
    setTestComplete(true);
  };

  const resetTest = () => {
    setTestComplete(false);
    setResult(null);
  };

  if (testComplete) {
    return (
      <div className="test-results max-w-2xl mx-auto p-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            🧪 Photo-First Test Results
          </h2>
          
          <div className="space-y-3 text-green-700">
            <p><strong>Person Identified:</strong> {result.personName}</p>
            <p><strong>Correct Identification:</strong> {result.identified ? 'Yes ✅' : 'No ❌'}</p>
            <p><strong>Bonus Points Earned:</strong> {result.bonusPoints}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={resetTest}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            >
              🔄 Test Again
            </button>
            <button
              onClick={() => {
                console.log('Photo-First Test Result:', result);
                alert('Result logged to console for development analysis');
              }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
            >
              📋 Log Result
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-bold text-yellow-800 mb-2">Next Steps:</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Test with different portraits (Byron, Marie Curie, etc.)</li>
              <li>• Implement actual image display instead of text description</li>
              <li>• Fine-tune scoring bonus calculations</li>
              <li>• Test transition animations</li>
              <li>• Integrate with full GameStack component</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-first-test min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 py-8">
      <div className="container mx-auto px-4">
        
        {/* Test Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">
            🧪 Photo-First System Test
          </h1>
          <p className="text-amber-700">
            Testing the photo identification challenge before full integration
          </p>
        </div>

        {/* Photo Identification Component */}
        <PhotoIdentification
          photoData={shakespearePhotoData}
          onCorrectIdentification={handleIdentification}
          onSkip={handleSkip}
          stackTitle="Shakespeare: The Great Word-Forger"
        />

        {/* Developer Notes */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-800 mb-3">🔧 Implementation Notes:</h3>
            <div className="text-blue-700 space-y-2 text-sm">
              <p><strong>Current State:</strong> Using text description placeholder for actual portrait image</p>
              <p><strong>Scoring Logic:</strong> Correct photo ID = 50% bonus points</p>
              <p><strong>User Experience:</strong> Hint available after wrong answer, skip option always available</p>
              <p><strong>Integration Point:</strong> This will be the first phase before regular trivia questions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoFirstTest;
