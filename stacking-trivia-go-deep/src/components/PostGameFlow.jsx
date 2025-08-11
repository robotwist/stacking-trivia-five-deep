import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRecommendations, stackMetadata, getDifficultyColor } from '../utils/stackMetadata';
import SmartRecommendations from './SmartRecommendations';
import { AchievementBadge } from './AchievementDisplay';

const PostGameFlow = ({ 
  score, 
  questionsAnswered, 
  accuracy, 
  completedStack, 
  onSelectNextStack, 
  onReturnToMenu,
  userStats 
}) => {
  const { user } = useAuth();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState(true);

  // Mock user completed stacks for demo - in real app this would come from database
  const completedStacks = ['van-gogh', 'tesla']; // Add the just completed stack
  completedStacks.push(completedStack);

  // PRIORITY 2: Get smart ML-driven recommendations
  const smartRecommendations = SmartRecommendations.getPersonalizedRecommendations(
    user, 
    completedStack, 
    3
  );
  
  // Fallback to original recommendations if smart ones fail
  const recommendations = smartRecommendations.length > 0 ? 
    smartRecommendations : 
    getRecommendations(userStats, completedStacks);

  useEffect(() => {
    // Show celebration for 3 seconds, then recommendations
    const timer = setTimeout(() => {
      setCelebrationPhase(false);
      setShowRecommendations(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate achievements
  const achievements = [];
  if (score >= 1000) achievements.push('High Scorer');
  if (accuracy >= 90) achievements.push('Perfectionist'); 
  if (questionsAnswered === 5) achievements.push('Stack Completed');
  if (userStats.currentStreak >= 5) achievements.push('On Fire');

  // Level up check
  const previousLevel = Math.floor((userStats.totalScore - score) / 1000) + 1;
  const currentLevel = Math.floor(userStats.totalScore / 1000) + 1;
  const leveledUp = currentLevel > previousLevel;

  if (celebrationPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-amber-300 dark:border-amber-600 p-8">
            
            {/* Celebration Animation */}
            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce">
                {leveledUp ? '⭐' : accuracy >= 90 ? '🎯' : '👏'}
              </div>
              {leveledUp && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-pulse">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    LEVEL UP!
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-4" style={{ fontFamily: 'Baskervville, serif' }}>
              {leveledUp ? `Level ${currentLevel} Unlocked!` : 'Great Job!'}
            </h2>
            
            <div className="text-lg text-amber-700 dark:text-amber-300 mb-4">
              You scored <span className="font-bold text-2xl text-amber-800 dark:text-amber-200">{score}</span> points
            </div>

            {/* Achievement Badges */}
            {achievements.length > 0 && (
              <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {achievements.map((achievement, index) => (
                  <span 
                    key={achievement}
                    className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full text-xs font-semibold animate-fadeIn"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {achievement}
                  </span>
                ))}
              </div>
            )}

            <div className="animate-pulse text-amber-600 dark:text-amber-400 text-sm">
              Preparing your next challenge...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-amber-300 dark:border-amber-600 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 text-center text-white">
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Baskervville, serif' }}>
              Stack Completed!
            </h2>
            <div className="flex justify-center gap-6 text-sm">
              <div>
                <div className="font-bold text-lg">{score}</div>
                <div>Points</div>
              </div>
              <div>
                <div className="font-bold text-lg">{accuracy}%</div>
                <div>Accuracy</div>
              </div>
              <div>
                <div className="font-bold text-lg">{questionsAnswered}/5</div>
                <div>Questions</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-4">
              What's Next?
            </h3>
            
            <p className="text-amber-700 dark:text-amber-300 mb-6">
              Based on your performance and interests, here are your next challenges:
            </p>

            {/* Recommendations */}
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((recommendation, index) => {
                // Handle both smart recommendations (objects) and old format (strings)
                const stackKey = typeof recommendation === 'string' ? recommendation : recommendation.stackName;
                const metadata = typeof recommendation === 'string' ? stackMetadata[stackKey] : recommendation.metadata;
                const reasoning = typeof recommendation === 'string' ? null : recommendation.reasoning;
                const confidence = typeof recommendation === 'string' ? null : recommendation.confidence;
                
                if (!metadata) return null;

                return (
                  <button
                    key={stackKey}
                    onClick={() => onSelectNextStack(stackKey)}
                    className="p-4 border-2 border-amber-200 dark:border-amber-700 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-200 text-left bg-amber-50 dark:bg-amber-900/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-amber-800 dark:text-amber-200 text-lg capitalize">
                        {(stackKey || '').replace(/-/g, ' ').replace(/_/g, ' ')}
                      </h4>
                      <div className="flex gap-2 items-center">
                        {index === 0 && (
                          <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                            {confidence ? `${Math.round(confidence)}% MATCH` : 'RECOMMENDED'}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(metadata.difficulty)}`}>
                          {metadata.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                      {metadata.description}
                    </p>
                    
                    {/* PRIORITY 2: Smart reasoning */}
                    {reasoning && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 italic">
                        💡 {reasoning}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        {metadata.estimatedTime}
                      </span>
                      <div className="flex gap-1">
                        {metadata.tags && metadata.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Alternative Options */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-amber-200 dark:border-amber-700">
              <button
                onClick={onReturnToMenu}
                className="flex-1 px-4 py-2 border-2 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors duration-200"
              >
                Browse All Stacks
              </button>
              <button
                onClick={() => onSelectNextStack(completedStack)}
                className="px-4 py-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>

        {/* Progress Update */}
        <div className="text-center mt-4 text-sm text-amber-700 dark:text-amber-300">
          You're now Level {currentLevel} with {userStats.totalScore} total points!
        </div>
      </div>
    </div>
  );
};

export default PostGameFlow;
