/**
 * Achievement Display Component
 * Shows achievement unlocks with celebration animations
 */

import React, { useState, useEffect } from 'react';
import AchievementSystem from './AchievementSystem.js';

export const AchievementUnlock = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-xl p-8 mx-4 max-w-md w-full transform transition-all duration-500 ${isVisible ? 'scale-100 rotate-0' : 'scale-75 rotate-12'}`}>
        {/* Achievement unlock animation */}
        <div className="text-center">
          <div className="relative mb-6">
            <div className="text-6xl animate-bounce">
              {achievement.icon}
            </div>
            <div className="absolute -top-2 -right-2 text-2xl animate-spin">
              ✨
            </div>
            <div className="absolute -bottom-2 -left-2 text-2xl animate-pulse">
              ⭐
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Achievement Unlocked!
          </h2>

          <h3 className="text-xl font-semibold text-amber-600 mb-3">
            {achievement.title}
          </h3>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {achievement.description}
          </p>

          <button
            onClick={handleClose}
            className="bg-amber-500 text-white px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
};

export const AchievementGrid = ({ compact = false }) => {
  const [achievements, setAchievements] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  useEffect(() => {
    setAchievements(AchievementSystem.getAllAchievements());
  }, []);

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  if (compact) {
    // Compact view for profile/dashboard
    const recentUnlocked = achievements.filter(a => a.unlocked).slice(0, 6);
    
    return (
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Achievements</h3>
        <div className="grid grid-cols-3 gap-2">
          {recentUnlocked.map(achievement => (
            <div key={achievement.id} className="text-center p-2 bg-amber-50 rounded-lg">
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <p className="text-xs font-medium text-gray-700 truncate">{achievement.title}</p>
            </div>
          ))}
        </div>
        
        {recentUnlocked.length === 0 && (
          <p className="text-gray-500 text-sm italic text-center py-4">
            Complete stacks to unlock achievements!
          </p>
        )}
      </div>
    );
  }

  // Full achievement browser
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({achievements.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unlocked' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unlocked ({achievements.filter(a => a.unlocked).length})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'locked' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Locked ({achievements.filter(a => !a.unlocked).length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No achievements found for the selected filter.
        </p>
      )}
    </div>
  );
};

const AchievementCard = ({ achievement }) => {
  const isUnlocked = achievement.unlocked;
  const unlockedDate = achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : null;

  return (
    <div className={`rounded-lg p-4 border-2 transition-all duration-200 ${
      isUnlocked 
        ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 shadow-md' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="text-center">
        <div className={`text-4xl mb-3 ${isUnlocked ? 'filter-none' : 'filter grayscale opacity-40'}`}>
          {achievement.icon}
        </div>

        <h3 className={`font-semibold mb-2 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
          {achievement.title}
        </h3>

        <p className={`text-sm mb-3 leading-relaxed ${isUnlocked ? 'text-gray-700' : 'text-gray-400'}`}>
          {achievement.description}
        </p>

        {isUnlocked ? (
          <div className="space-y-1">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Unlocked
            </div>
            {unlockedDate && (
              <p className="text-xs text-gray-500">
                {unlockedDate}
              </p>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            🔒 Locked
          </div>
        )}
      </div>
    </div>
  );
};

export const AchievementBadge = ({ achievementId, size = 'sm' }) => {
  const [achievement, setAchievement] = useState(null);

  useEffect(() => {
    const achievements = AchievementSystem.getAllAchievements();
    const found = achievements.find(a => a.id === achievementId);
    setAchievement(found);
  }, [achievementId]);

  if (!achievement || !achievement.unlocked) return null;

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-12 h-12 text-2xl'
  };

  return (
    <div 
      className={`${sizeClasses[size]} bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300`}
      title={`${achievement.title}: ${achievement.description}`}
    >
      {achievement.icon}
    </div>
  );
};

export default { AchievementUnlock, AchievementGrid, AchievementBadge };
