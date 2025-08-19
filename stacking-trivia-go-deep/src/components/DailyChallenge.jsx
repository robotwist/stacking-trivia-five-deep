import { useState, useEffect } from 'react';

const DailyChallenge = ({ onStartChallenge }) => {
  const [challenge, setChallenge] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Daily challenges - rotate based on date
  const dailyChallenges = [
    {
      id: 'van-gogh-perfect',
      title: '🎨 Van Gogh Perfect Score',
      description: 'Complete the Van Gogh stack with 100% accuracy',
      stack: 'van-gogh',
      category: 'arts-culture',
      reward: 'Golden Palette Achievement',
      emoji: '🎨'
    },
    {
      id: 'beatles-speed',
      title: '🎵 Beatles Speed Run',
      description: 'Complete The Beatles stack in under 3 minutes',
      stack: 'the_beatles',
      category: 'arts-culture',
      reward: 'Speed Demon Achievement',
      emoji: '⚡'
    },
    {
      id: 'nebraska-expert',
      title: '🏈 Nebraska Expert',
      description: 'Score 140+ points on Nebraska Sports Ultimate',
      stack: 'nebraska-sports-ultimate',
      category: 'sports',
      reward: 'Cornhusker Legend Achievement',
      emoji: '🏆'
    },
    {
      id: 'tesla-master',
      title: '⚡ Tesla Master',
      description: 'Answer all Tesla questions correctly on first try',
      stack: 'tesla',
      category: 'science-tech',
      reward: 'Electric Genius Achievement',
      emoji: '🧠'
    },
    {
      id: 'star-wars-legend',
      title: '⭐ Star Wars Legend',
      description: 'Complete Star Wars stack with 90%+ accuracy',
      stack: 'star-wars',
      category: 'cinema',
      reward: 'Force Master Achievement',
      emoji: '🌌'
    }
  ];

  useEffect(() => {
    // Get today's challenge based on date
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const challengeIndex = dayOfYear % dailyChallenges.length;
    
    setChallenge(dailyChallenges[challengeIndex]);
    
    // Check if user has completed today's challenge
    const completedChallenges = JSON.parse(localStorage.getItem('completedDailyChallenges') || '{}');
    const todayKey = today.toDateString();
    
    if (completedChallenges[todayKey]?.includes(dailyChallenges[challengeIndex].id)) {
      setIsCompleted(true);
    }
  }, []);

  const handleStartChallenge = () => {
    if (onStartChallenge && challenge) {
      onStartChallenge(challenge);
    }
  };

  const markAsCompleted = () => {
    const today = new Date().toDateString();
    const completedChallenges = JSON.parse(localStorage.getItem('completedDailyChallenges') || '{}');
    
    if (!completedChallenges[today]) {
      completedChallenges[today] = [];
    }
    
    if (!completedChallenges[today].includes(challenge.id)) {
      completedChallenges[today].push(challenge.id);
      localStorage.setItem('completedDailyChallenges', JSON.stringify(completedChallenges));
      setIsCompleted(true);
    }
  };

  if (!challenge) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white p-6 rounded-lg mb-6 border-2 border-purple-400 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{challenge.emoji}</span>
          <div>
            <h3 className="text-xl font-bold">{challenge.title}</h3>
            <p className="text-purple-100 text-sm">{challenge.description}</p>
          </div>
        </div>
        
        {isCompleted && (
          <div className="text-2xl animate-pulse">✅</div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-purple-100">
          <span className="font-semibold">Reward:</span> {challenge.reward}
        </div>
        
        {!isCompleted ? (
          <button
            onClick={handleStartChallenge}
            className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors duration-200 transform hover:scale-105"
          >
            Take Challenge
          </button>
        ) : (
          <div className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold">
            Completed! 🎉
          </div>
        )}
      </div>
      
      {/* Progress indicator */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-purple-100 mb-1">
          <span>Daily Progress</span>
          <span>{isCompleted ? '1/1' : '0/1'}</span>
        </div>
        <div className="w-full bg-purple-800 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: isCompleted ? '100%' : '0%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;
