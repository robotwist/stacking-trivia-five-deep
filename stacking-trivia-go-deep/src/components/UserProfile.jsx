import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  // Enhanced user stats with competitive elements
  const userStats = {
    totalScore: user.total_score || 2847,
    stacksCompleted: user.games_played || 12,
    currentStreak: user.current_streak || 7,
    accuracy: Math.round((user.correct_answers / Math.max(user.total_questions, 1)) * 100) || 87,
    level: Math.floor((user.total_score || 2847) / 1000) + 1,
    globalRank: user.global_rank || 156,
    questionsAnswered: user.total_questions || 423
  };

  // Mock leaderboard data for competitive element
  const mockLeaderboard = [
    { rank: 1, username: "TriviaMaster", score: 9847, streak: 23 },
    { rank: 2, username: "QuizKing", score: 8934, streak: 15 },
    { rank: 3, username: "BrainBox", score: 7652, streak: 19 },
    { rank: userStats.globalRank, username: user.username, score: userStats.totalScore, streak: userStats.currentStreak },
    { rank: 157, username: "NewPlayer", score: 2134, streak: 4 }
  ].sort((a, b) => b.score - a.score);

  return (
    <>
      <div className="relative">
        {/* Profile Button */}
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 px-3 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-600 hover:bg-amber-200 dark:hover:bg-amber-800/70 transition-all duration-200 sepia"
          style={{ fontFamily: 'Baskervville, serif' }}
        >
          <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold">{user.username}</span>
          <svg 
            className={`w-4 h-4 transform transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Enhanced Profile Dropdown */}
        {showProfile && (
          <div className="absolute right-0 mt-2 w-80 bg-gray-900 border-2 border-amber-300 rounded-lg shadow-2xl z-50 overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-4 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2 backdrop-blur-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-white text-lg" style={{ fontFamily: 'Baskervville, serif' }}>
                {user.username}
              </h3>
              <div className="text-amber-100 text-sm mt-1">
                Level {userStats.level} • Global Rank #{userStats.globalRank}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <h4 className="text-white font-bold mb-3">Your Progress</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-2xl font-bold text-yellow-400">{userStats.totalScore.toLocaleString()}</div>
                  <div className="text-xs text-gray-300">Total Score</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-2xl font-bold text-green-400">{userStats.stacksCompleted}</div>
                  <div className="text-xs text-gray-300">Stacks Completed</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-2xl font-bold text-blue-400">{userStats.currentStreak}</div>
                  <div className="text-xs text-gray-300">Current Streak</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-2xl font-bold text-purple-400">{userStats.accuracy}%</div>
                  <div className="text-xs text-gray-300">Accuracy</div>
                </div>
              </div>
              
              {/* Level Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Level {userStats.level}</span>
                  <span>{((userStats.totalScore % 1000) / 10).toFixed(1)}% to Level {userStats.level + 1}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(userStats.totalScore % 1000) / 10}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mini Leaderboard */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <h4 className="text-white font-bold mb-3">Top Players</h4>
              <div className="space-y-2">
                {mockLeaderboard.slice(0, 5).map((player) => (
                  <div key={player.rank} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">#{player.rank}</span>
                      <span className={`text-sm ${player.username === user.username ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
                        {player.username}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">{player.score.toLocaleString()} pts</div>
                      <div className="text-xs text-gray-500">{player.streak} streak</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-900">
              <button
                onClick={() => {
                  logout();
                  setShowProfile(false);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showProfile && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfile(false)}
        />
      )}
    </>
  );
};

export default UserProfile;
