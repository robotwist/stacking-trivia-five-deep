import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const UniversalOnboarding = ({ onComplete, onSkip }) => {
  const { user, login, signup } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState(null) // 'login', 'signup', or null

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to DeepStack Trivia!',
      subtitle: 'Let\'s find your perfect game experience',
      type: 'welcome',
      content: 'DeepStack is trivia that goes deep on narrow topics - like "You Don\'t Know Jack" meets "Monty Python". We\'ll ask a few quick questions to customize your experience.'
    },
    {
      id: 'experience',
      title: 'What\'s your trivia experience?',
      type: 'choice',
      options: [
        { value: 'beginner', label: 'New to trivia games', description: 'I\'m just getting started' },
        { value: 'casual', label: 'Casual player', description: 'I play occasionally for fun' },
        { value: 'experienced', label: 'Experienced player', description: 'I know my stuff' },
        { value: 'expert', label: 'Trivia expert', description: 'I\'m a trivia master' }
      ]
    },
    {
      id: 'playstyle',
      title: 'How do you like to play?',
      type: 'choice',
      options: [
        { value: 'solo', label: 'Solo challenge', description: 'I prefer playing alone' },
        { value: 'social', label: 'Social experience', description: 'I like playing with friends' },
        { value: 'competitive', label: 'Competitive', description: 'I want to compete and win' },
        { value: 'learning', label: 'Learning focused', description: 'I want to learn new things' }
      ]
    },
    {
      id: 'topics',
      title: 'What interests you most?',
      type: 'multiChoice',
      options: [
        { value: 'arts-culture', label: 'Arts & Culture', icon: '🎨' },
        { value: 'science-tech', label: 'Science & Technology', icon: '🔬' },
        { value: 'sports', label: 'Sports', icon: '⚽' },
        { value: 'history', label: 'History', icon: '📚' },
        { value: 'cinema', label: 'Movies & TV', icon: '🎬' },
        { value: 'pop-culture', label: 'Pop Culture', icon: '🌟' },
        { value: 'kids', label: 'Family Friendly', icon: '👨‍👩‍👧‍👦' }
      ],
      maxSelections: 3
    },
    {
      id: 'time',
      title: 'How much time do you have?',
      type: 'choice',
      options: [
        { value: 'quick', label: 'Quick game (5-10 min)', description: 'Just a few questions' },
        { value: 'standard', label: 'Standard game (15-20 min)', description: 'Full stack experience' },
        { value: 'deep', label: 'Deep dive (30+ min)', description: 'Multiple stacks, go deep' },
        { value: 'flexible', label: 'Flexible', description: 'I\'ll decide as I go' }
      ]
    },
    {
      id: 'auth',
      title: 'Save your progress?',
      subtitle: 'Optional - you can always skip',
      type: 'auth',
      content: 'Create an account to save your progress, track achievements, and compete on leaderboards.'
    }
  ]

  const handleAnswer = (stepId, value) => {
    setAnswers(prev => ({
      ...prev,
      [stepId]: value
    }))
    setCurrentStep(prev => prev + 1)
  }

  const handleMultiChoice = (stepId, value) => {
    const currentSelections = answers[stepId] || []
    const newSelections = currentSelections.includes(value)
      ? currentSelections.filter(v => v !== value)
      : [...currentSelections, value].slice(0, steps.find(s => s.id === stepId).maxSelections)
    
    setAnswers(prev => ({
      ...prev,
      [stepId]: newSelections
    }))
  }

  const handleAuth = async (mode, credentials = null) => {
    setIsLoading(true)
    try {
      if (mode === 'skip') {
        setAuthMode('skip')
        setCurrentStep(prev => prev + 1)
      } else if (mode === 'guest') {
        setAuthMode('guest')
        setCurrentStep(prev => prev + 1)
      } else if (credentials) {
        const result = mode === 'login' ? await login(credentials) : await signup(credentials)
        if (result.user) {
          setAuthMode(mode)
          setCurrentStep(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRecommendation = () => {
    const experience = answers.experience || 'casual'
    const playstyle = answers.playstyle || 'solo'
    const topics = answers.topics || ['arts-culture']
    const time = answers.time || 'standard'

    // Recommendation logic
    let recommendation = {
      mode: 'single-player',
      category: topics[0],
      stack: null,
      message: 'Based on your preferences, here\'s your perfect starting point:'
    }

    // Mode recommendations
    if (playstyle === 'social') {
      recommendation.mode = 'host'
      recommendation.message = 'Perfect for hosting friends! Try our social game mode:'
    } else if (playstyle === 'competitive') {
      recommendation.mode = 'multi-stack'
      recommendation.message = 'Ready for a challenge? Take on multiple stacks:'
    } else if (time === 'quick') {
      recommendation.mode = 'single-player'
      recommendation.message = 'Quick and focused - perfect for your time:'
    }

    // Stack recommendations based on experience and topics
    const stackRecommendations = {
      'arts-culture': {
        beginner: 'van-gogh',
        casual: 'the_beatles',
        experienced: 'shakespeare',
        expert: 'leonardo-da-vinci'
      },
      'science-tech': {
        beginner: 'tesla',
        casual: 'nasa',
        experienced: 'darwin',
        expert: 'marie-curie'
      },
      'sports': {
        beginner: 'michael-jordan',
        casual: 'serena-williams',
        experienced: 'muhammad-ali',
        expert: 'nebraska-sports-ultimate'
      },
      'cinema': {
        beginner: 'star-wars',
        casual: 'the-godfather',
        experienced: 'blade_runner',
        expert: 'star-wars'
      }
    }

    const primaryTopic = topics[0]
    if (stackRecommendations[primaryTopic]) {
      recommendation.stack = stackRecommendations[primaryTopic][experience]
    }

    return recommendation
  }

  const handleComplete = () => {
    const recommendation = getRecommendation()
    onComplete({
      answers,
      recommendation,
      authMode
    })
  }

  const currentStepData = steps[currentStep]

  if (!currentStepData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-amber-900 dark:to-orange-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {currentStepData.title}
          </h1>
          {currentStepData.subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {currentStepData.subtitle}
            </p>
          )}
          {currentStepData.content && (
            <p className="text-gray-700 dark:text-gray-300">
              {currentStepData.content}
            </p>
          )}
        </div>

        {/* Step-specific content */}
        {currentStepData.type === 'welcome' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600 dark:text-gray-400">
                Get ready for trivia that goes deep on what matters to you!
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleAnswer(currentStepData.id, 'start')}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105"
              >
                Let's Get Started!
              </button>
              <button
                onClick={onSkip}
                className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {currentStepData.type === 'choice' && (
          <div className="space-y-3">
            {currentStepData.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentStepData.id, option.value)}
                className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-200 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {option.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        )}

        {currentStepData.type === 'multiChoice' && (
          <div className="space-y-3">
            {currentStepData.options.map((option) => {
              const isSelected = (answers[currentStepData.id] || []).includes(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() => handleMultiChoice(currentStepData.id, option.value)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="ml-auto text-amber-600">
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
            <div className="flex justify-between items-center pt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {(answers[currentStepData.id] || []).length}/{currentStepData.maxSelections}
              </span>
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={(answers[currentStepData.id] || []).length === 0}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-amber-700 transition-all duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {currentStepData.type === 'auth' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🔐</div>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStepData.content}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleAuth('signup')}
                disabled={isLoading}
                className="p-4 border-2 border-green-200 dark:border-green-700 rounded-lg hover:border-green-400 dark:hover:border-green-500 transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-semibold text-gray-900 dark:text-white">Create Account</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Save progress & compete</div>
              </button>
              
              <button
                onClick={() => handleAuth('login')}
                disabled={isLoading}
                className="p-4 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <div className="text-2xl mb-2">🔑</div>
                <div className="font-semibold text-gray-900 dark:text-white">Sign In</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Continue your journey</div>
              </button>
              
              <button
                onClick={() => handleAuth('guest')}
                disabled={isLoading}
                className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900/20"
              >
                <div className="text-2xl mb-2">🎮</div>
                <div className="font-semibold text-gray-900 dark:text-white">Play as Guest</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">No account needed</div>
              </button>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => handleAuth('skip')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {currentStep > 0 && currentStepData.type !== 'auth' && (
          <div className="flex justify-between items-center pt-6">
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ← Back
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all duration-200"
            >
              Get My Recommendation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UniversalOnboarding
