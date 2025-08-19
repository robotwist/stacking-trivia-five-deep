import { useState } from 'react'

const RecommendationDisplay = ({ recommendation, onStartGame, onBrowseAll, onCustomize }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getModeDescription = (mode) => {
    const descriptions = {
      'single-player': 'Perfect for solo play - dive deep into a single topic',
      'host': 'Great for hosting friends - everyone plays together',
      'multi-stack': 'Challenge yourself with multiple topics',
      'bar-trivia': 'Classic bar trivia night experience'
    }
    return descriptions[mode] || 'Customized for your preferences'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'arts-culture': '🎨',
      'science-tech': '🔬',
      'sports': '⚽',
      'history': '📚',
      'cinema': '🎬',
      'pop-culture': '🌟',
      'kids': '👨‍👩‍👧‍👦'
    }
    return icons[category] || '🎯'
  }

  const getStackDescription = (stack) => {
    const descriptions = {
      'van-gogh': 'Explore the life and art of Vincent van Gogh',
      'the_beatles': 'Dive into the world of The Beatles',
      'shakespeare': 'Test your knowledge of Shakespeare\'s works',
      'leonardo-da-vinci': 'Discover the genius of Leonardo da Vinci',
      'tesla': 'Learn about Nikola Tesla\'s innovations',
      'nasa': 'Explore space exploration and NASA history',
      'darwin': 'Understand evolution and Charles Darwin',
      'marie-curie': 'Discover the pioneering work of Marie Curie',
      'michael-jordan': 'Basketball legend Michael Jordan',
      'serena-williams': 'Tennis champion Serena Williams',
      'muhammad-ali': 'Boxing legend Muhammad Ali',
      'nebraska-sports-ultimate': 'Comprehensive Nebraska sports history',
      'star-wars': 'The epic Star Wars universe',
      'the-godfather': 'The classic Godfather films',
      'blade_runner': 'The sci-fi masterpiece Blade Runner'
    }
    return descriptions[stack] || 'A curated collection of questions'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-amber-900 dark:to-orange-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Perfect Game Experience
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {recommendation.message}
          </p>
        </div>

        {/* Main Recommendation Card */}
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg p-6 mb-6 border-2 border-amber-200 dark:border-amber-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getCategoryIcon(recommendation.category)}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {recommendation.stack ? getStackDescription(recommendation.stack).split(' - ')[0] : 'Recommended Stack'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {getModeDescription(recommendation.mode)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">160</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">max points</div>
            </div>
          </div>

          {recommendation.stack && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {getStackDescription(recommendation.stack)}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
              {recommendation.mode.replace('-', ' ')}
            </span>
            <span className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              {recommendation.category.replace('-', ' ')}
            </span>
            {recommendation.stack && (
              <span className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                Curated
              </span>
            )}
          </div>

          <button
            onClick={() => onStartGame(recommendation)}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105"
          >
            Start This Game Now!
          </button>
        </div>

        {/* Alternative Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={onBrowseAll}
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔍</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Browse All Topics</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Explore our full collection</div>
              </div>
            </div>
          </button>

          <button
            onClick={onCustomize}
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Customize More</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Adjust your preferences</div>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Why This Recommendation?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">5</div>
              <div className="text-gray-600 dark:text-gray-400">Questions Deep</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">15-20</div>
              <div className="text-gray-600 dark:text-gray-400">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">160</div>
              <div className="text-gray-600 dark:text-gray-400">Max Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4</div>
              <div className="text-gray-600 dark:text-gray-400">Choices</div>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <div className="mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <span>{isExpanded ? 'Hide' : 'Show'} recommendation details</span>
            <span className="ml-2 transform transition-transform duration-200">
              {isExpanded ? '↑' : '↓'}
            </span>
          </button>

          {isExpanded && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How We Chose This:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Based on your experience level and interests</li>
                <li>• Optimized for your preferred play style</li>
                <li>• Matches your available time commitment</li>
                <li>• Curated for maximum engagement</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecommendationDisplay
