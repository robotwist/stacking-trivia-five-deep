import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AvatarStudio from './AvatarStudio';
import { loadAvatar } from '../utils/avatarStorage';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showAvatarStudio, setShowAvatarStudio] = useState(false);
  const [avatar, setAvatar] = useState(user ? loadAvatar(user.id || user.uid || user.username) : null);
  const [completedStacks, setCompletedStacks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [profileFresh, setProfileFresh] = useState(null);

  if (!user) return null;

  // Fetch fresh profile data and leaderboard when opened
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('trivia_token');
        if (token) {
          const [profileRes, stacksRes] = await Promise.all([
            fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } }),
            fetch('/api/user/completed-stacks', { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (profileRes.ok) {
            const { user: fresh } = await profileRes.json();
            setProfileFresh(fresh);
          }
          if (stacksRes.ok) {
            const { completedStacks } = await stacksRes.json();
            setCompletedStacks(Array.isArray(completedStacks) ? completedStacks : []);
          }
        } else {
          setCompletedStacks([]);
        }
      } catch {
        // keep existing state on failure
      }
      try {
        const lbRes = await fetch('/api/game/leaderboard?limit=10');
        if (lbRes.ok) {
          const { leaderboard } = await lbRes.json();
          setLeaderboard(Array.isArray(leaderboard) ? leaderboard : []);
        }
      } catch {
        setLeaderboard([]);
      }
    };
    if (showProfile) fetchData();
  }, [showProfile]);

  // Enhanced user stats with competitive elements from fresh profile if available
  const basis = profileFresh || user;
  const totalScoreVal = Number(basis?.total_score || 0);
  const userStats = {
    totalScore: totalScoreVal,
    stacksCompleted: Number(basis?.games_played || 0),
    currentStreak: Number(basis?.current_streak || 0),
    accuracy: basis && basis.total_questions ? Math.round((basis.correct_answers / Math.max(basis.total_questions, 1)) * 100) : 0,
    level: Math.floor(totalScoreVal / 1000) + 1,
    globalRank: Number(basis?.global_rank || 0) || undefined,
    questionsAnswered: Number(basis?.total_questions || 0)
  };

  const displayLeaderboard = leaderboard.length > 0 
    ? leaderboard.map((row, idx) => ({
        rank: idx + 1,
        username: row.username || row.user || 'Player',
        score: Number(row.score || row.total_score || 0),
        streak: row.streak || 0
      }))
    : [];

  const avatarUserId = user.id || user.uid || user.username;
  const frameMap = {
    'torn-1': 'rotate-[-2deg] border-4 border-yellow-300 shadow-[6px_6px_0_rgba(0,0,0,0.4)]',
    'tape-1': 'rotate-[3deg] border-2 border-amber-400 shadow-[4px_4px_0_rgba(0,0,0,0.45)]',
    'polaroid': 'rotate-[-1deg] bg-white p-1 shadow-[8px_8px_0_rgba(0,0,0,0.5)]',
    'ransom': 'rotate-[1deg] border-2 border-pink-400 shadow-[4px_4px_0_rgba(0,0,0,0.45)]'
  };

  return (
    <>
      <div className="relative">
        {/* Profile Button */}
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 px-3 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-600 hover:bg-amber-200 dark:hover:bg-amber-800/70 transition-all duration-200 sepia"
          style={{ fontFamily: 'Baskervville, serif' }}
        >
          <div className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center ${avatar ? frameMap[avatar.frame] : 'bg-gradient-to-r from-amber-500 to-yellow-500'} text-white text-xs font-bold`} style={{ background: avatar?.bgColor }}>
            {avatar?.imageSrc ? (
              <img src={avatar.imageSrc} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
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
              <div className={`w-16 h-16 rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center ${avatar ? frameMap[avatar.frame] : 'bg-white/20'} backdrop-blur-sm`} style={{ background: avatar?.bgColor }}>
                {avatar?.imageSrc ? (
                  <img src={avatar.imageSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-2xl">{user.username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3 className="font-bold text-white text-lg" style={{ fontFamily: 'Baskervville, serif' }}>
                {user.username}
              </h3>
              <div className="text-amber-100 text-sm mt-1">
                Level {userStats.level} • Global Rank #{userStats.globalRank}
              </div>
              <div className="mt-2">
                <button
                  onClick={() => setShowAvatarStudio(true)}
                  className="px-3 py-1 bg-gray-900/20 hover:bg-gray-900/30 text-white border border-white/30 rounded"
                >Customize Avatar</button>
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

            {/* Owned Stacks */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <h4 className="text-white font-bold mb-3">Owned Stacks</h4>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto pr-1">
                {(completedStacks.length > 0 ? completedStacks : (basis?.completed_stacks || []))
                  .slice(-8)
                  .reverse()
                  .map((stackKey) => (
                  <div key={stackKey} className="px-2 py-1 text-xs bg-gray-700/60 border border-gray-600 rounded text-gray-200 truncate" title={stackKey}>
                    {(stackKey || '').replace(/-/g,' ').replace(/_/g,' ')}
                  </div>
                ))}
                {((completedStacks.length === 0) && (!basis?.completed_stacks || basis.completed_stacks.length === 0)) && (
                  <div className="text-xs text-gray-400">No stacks owned yet</div>
                )}
              </div>
            </div>

            {/* Mini Leaderboard */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <h4 className="text-white font-bold mb-3">Top Players</h4>
              <div className="space-y-2">
                {displayLeaderboard.slice(0, 5).map((player) => (
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
                {displayLeaderboard.length === 0 && (
                  <div className="text-xs text-gray-400">Leaderboard unavailable</div>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <h4 className="text-white font-bold mb-3">Achievements</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(user.achievements) && user.achievements.length > 0 ? (
                  user.achievements.slice(-8).map((ach, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-yellow-500/20 border border-yellow-500/40 text-yellow-200 rounded">
                      {ach.title || ach}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No achievements yet</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-900">
              <a
                href="https://buymeacoffee.com/"
                target="_blank"
                rel="noreferrer"
                className="w-full mb-2 inline-block text-center bg-yellow-500 hover:bg-yellow-400 text-gray-900 py-2 px-4 rounded-lg transition-colors duration-200 font-semibold"
              >
                ☕ Tip Jar
              </a>
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

      {showAvatarStudio && (
        <AvatarStudio
          userId={avatarUserId}
          onClose={() => setShowAvatarStudio(false)}
          onSave={(data) => setAvatar(data)}
        />
      )}
    </>
  );
};

export default UserProfile;
