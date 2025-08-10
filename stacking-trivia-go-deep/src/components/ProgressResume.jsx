/**
 * Progress Resume Component
 * Allows users to resume saved progress from where they left off
 */

import React, { useState } from 'react';
import ProgressStorage from '../utils/progressStorage.js';
import { stackMetadata } from './stackMetadata.js';

export const ProgressResume = ({ onResumeStack, onStartFresh }) => {
  const [savedProgress, setSavedProgress] = useState(() => ProgressStorage.getCurrentProgress());

  if (!savedProgress) return null;

  const metadata = stackMetadata[savedProgress.stackName];
  const progressPercent = Math.round((savedProgress.currentIndex / (metadata?.totalQuestions || 20)) * 100);
  const timeAgo = getTimeAgo(savedProgress.timestamp);

  const handleResume = () => {
    // Track the resume action for ML recommendations
    ProgressStorage.trackAction('stack_resumed', {
      stackName: savedProgress.stackName,
      resumeIndex: savedProgress.currentIndex,
      timeAway: Date.now() - savedProgress.timestamp
    });

    onResumeStack(savedProgress);
  };

  const handleStartFresh = () => {
    // Clear the saved progress and start fresh
    ProgressStorage.clearProgress();
    setSavedProgress(null);
    
    ProgressStorage.trackAction('progress_discarded', {
      stackName: savedProgress.stackName,
      discardedAtIndex: savedProgress.currentIndex
    });

    if (onStartFresh) {
      onStartFresh();
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-400 p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Continue Where You Left Off
          </h3>
          
          <div className="space-y-2 mb-4">
            <p className="text-gray-700">
              <span className="font-medium">{savedProgress.stackName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Question {savedProgress.currentIndex + 1} of {metadata?.totalQuestions || '?'}</span>
              <span>•</span>
              <span>{progressPercent}% complete</span>
              <span>•</span>
              <span>Saved {timeAgo}</span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Score: {savedProgress.score}/{savedProgress.maxScore}</span>
              {savedProgress.accuracy > 0 && (
                <>
                  <span>•</span>
                  <span>Accuracy: {Math.round(savedProgress.accuracy)}%</span>
                </>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-amber-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleResume}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium"
            >
              Resume Game
            </button>
            
            <button
              onClick={handleStartFresh}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              Start Fresh
            </button>
          </div>

          {/* Achievement opportunity hint */}
          {!ProgressStorage.hasAchievement('comeback_kid') && (
            <p className="text-xs text-amber-600 mt-2 italic">
              🏆 Complete this stack to unlock the "Comeback Kid" achievement!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format time ago
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diffMs = now - timestamp;
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

export default ProgressResume;
