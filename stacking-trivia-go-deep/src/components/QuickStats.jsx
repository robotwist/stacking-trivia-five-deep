import { useAuth } from '../contexts/AuthContext';

const QuickStats = () => {
  const { user } = useAuth();
  
  // Calculate stats from user data
  const stats = {
    totalScore: user?.total_score || 0,
    stacksCompleted: user?.games_played || 0,
    currentStreak: user?.current_streak || 0,
    accuracy: user?.total_questions ? Math.round((user?.correct_answers / user?.total_questions) * 100) : 0,
    level: Math.floor((user?.total_score || 0) / 1000) + 1,
    globalRank: user?.global_rank || 'N/A'
  };

  // Get streak emoji based on length
  const getStreakEmoji = (streak) => {
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    if (streak >= 1) return '📈';
    return '📊';
  };

  // Get accuracy color
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-green-400';
    if (accuracy >= 80) return 'text-yellow-400';
    if (accuracy >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get level badge
  const getLevelBadge = (level) => {
    if (level >= 10) return '🏆';
    if (level >= 5) return '⭐';
    if (level >= 3) return '🌟';
    return '🌱';
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-6 max-w-2xl mx-auto border border-gray-700">
      <h3 className="text-center text-lg font-semibold text-gray-300 mb-4">
        Your Stats
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Score */}
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {stats.totalScore.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Points</div>
        </div>
        
        {/* Stacks Completed */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {stats.stacksCompleted}
          </div>
          <div className="text-sm text-gray-400">Stacks Done</div>
        </div>
        
        {/* Current Streak */}
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400 flex items-center justify-center">
            {getStreakEmoji(stats.currentStreak)}
            <span className="ml-1">{stats.currentStreak}</span>
          </div>
          <div className="text-sm text-gray-400">Day Streak</div>
        </div>
        
        {/* Accuracy */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${getAccuracyColor(stats.accuracy)}`}>
            {stats.accuracy}%
          </div>
          <div className="text-sm text-gray-400">Accuracy</div>
        </div>
        
        {/* Level */}
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400 flex items-center justify-center">
            {getLevelBadge(stats.level)}
            <span className="ml-1">{stats.level}</span>
          </div>
          <div className="text-sm text-gray-400">Level</div>
        </div>
        
        {/* Global Rank */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            #{stats.globalRank}
          </div>
          <div className="text-sm text-gray-400">Global Rank</div>
        </div>
      </div>
      
      {/* Motivational message */}
      {stats.currentStreak > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            🔥 Keep your {stats.currentStreak}-day streak alive! Play today to continue.
          </p>
        </div>
      )}
      
      {stats.stacksCompleted === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            🎯 Ready to start your trivia journey? Pick a topic and dive deep!
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickStats;
