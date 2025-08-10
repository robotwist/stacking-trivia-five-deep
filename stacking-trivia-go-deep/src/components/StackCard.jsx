import React from 'react';
import { stackMetadata, getDifficultyColor } from '../utils/stackMetadata';

const StackCard = ({ stackKey, stackData, onSelect, isLocked = false }) => {
  const metadata = stackMetadata[stackKey];
  
  // Default metadata if not found
  const displayMetadata = metadata || {
    difficulty: 'Unknown',
    estimatedTime: '8-10 min',
    description: 'A challenging trivia stack',
    tags: ['General'],
    difficultyScore: 5
  };

  const formatStackName = (key) => {
    return key
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLocked) {
    return (
      <div className="relative group">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg opacity-50 cursor-not-allowed">
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-bold text-gray-600 dark:text-gray-400">
              {formatStackName(stackKey)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Complete more stacks to unlock
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(stackKey)}
      className="w-full p-4 bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-700 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all duration-200 text-left group"
    >
      {/* Header with difficulty badge */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-amber-800 dark:text-amber-200 text-lg group-hover:text-amber-900 dark:group-hover:text-amber-100 transition-colors">
          {formatStackName(stackKey)}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(displayMetadata.difficulty)}`}>
          {displayMetadata.difficulty}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-amber-700 dark:text-amber-300 mb-3 line-clamp-2">
        {displayMetadata.description}
      </p>

      {/* Metadata row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-4 text-xs text-amber-600 dark:text-amber-400">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {displayMetadata.estimatedTime}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            5 Questions
          </span>
        </div>

        {/* Quality indicator */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < Math.floor(displayMetadata.difficultyScore / 2)
                  ? 'bg-amber-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1 flex-wrap">
        {displayMetadata.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors"
          >
            {tag}
          </span>
        ))}
        {displayMetadata.tags.length > 3 && (
          <span className="text-xs px-2 py-1 text-amber-600 dark:text-amber-400">
            +{displayMetadata.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Hover effect indicator */}
      <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex justify-between items-center">
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Click to start this stack
          </span>
          <svg className="w-4 h-4 text-amber-500 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default StackCard;
