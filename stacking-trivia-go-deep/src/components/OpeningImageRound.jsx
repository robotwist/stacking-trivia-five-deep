import { useState, useEffect } from 'react'

const OPENING_IMAGES = [
  {
    id: 'tesla-coil',
    src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2fc0?w=800',
    alt: 'Tesla coil with electric arcs',
    stack: {
      title: 'Tesla: Lightning in a Bottle',
      description: 'From this image, dive into the mind of electricity\'s master',
      questions: [
        {
          level: 1,
          question: 'Which inventor is famous for experiments with electricity and wireless power?',
          answer: 'Nikola Tesla',
          acceptedAnswers: ['nikola tesla', 'tesla']
        },
        {
          level: 2,
          question: 'What was Tesla\'s most famous invention for transmitting electricity?',
          answer: 'Tesla coil',
          acceptedAnswers: ['tesla coil', 'coil']
        },
        {
          level: 3,
          question: 'Which rival inventor did Tesla work for before starting his own company?',
          answer: 'Thomas Edison',
          acceptedAnswers: ['thomas edison', 'edison']
        },
        {
          level: 4,
          question: 'What type of electrical current did Tesla champion over Edison\'s preference?',
          answer: 'Alternating current',
          acceptedAnswers: ['alternating current', 'ac', 'ac current']
        },
        {
          level: 5,
          question: 'In what hotel room did Tesla spend his final years in New York?',
          answer: 'New Yorker Hotel Room 3327',
          acceptedAnswers: ['new yorker hotel', 'room 3327', 'new yorker']
        }
      ]
    }
  },
  {
    id: 'vintage-coca-cola',
    src: 'https://images.unsplash.com/photo-1567103472667-6898f3cd4ec9?w=800',
    alt: 'Vintage Coca-Cola advertisement',
    stack: {
      title: 'Coca-Cola: The Secret Formula',
      description: 'From this vintage ad, explore America\'s most guarded recipe',
      questions: [
        {
          level: 1,
          question: 'What soft drink was originally marketed as a patent medicine?',
          answer: 'Coca-Cola',
          acceptedAnswers: ['coca-cola', 'coke', 'coca cola']
        },
        {
          level: 2,
          question: 'Who invented Coca-Cola in 1886?',
          answer: 'John Stith Pemberton',
          acceptedAnswers: ['john pemberton', 'pemberton', 'john stith pemberton']
        },
        {
          level: 3,
          question: 'What narcotic ingredient was originally in Coca-Cola?',
          answer: 'Cocaine',
          acceptedAnswers: ['cocaine', 'coca extract']
        },
        {
          level: 4,
          question: 'In what Georgia city was Coca-Cola first sold?',
          answer: 'Atlanta',
          acceptedAnswers: ['atlanta', 'atlanta georgia']
        },
        {
          level: 5,
          question: 'What is the code name for Coca-Cola\'s secret formula?',
          answer: 'Merchandise 7X',
          acceptedAnswers: ['merchandise 7x', '7x', 'merchandise seven x']
        }
      ]
    }
  }
]

export default function OpeningImageRound({ teams, onRoundComplete }) {
  const [currentImage] = useState(() => 
    OPENING_IMAGES[Math.floor(Math.random() * OPENING_IMAGES.length)]
  )
  const [gameStarted, setGameStarted] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setDarkMode(document.documentElement.classList.contains('dark'))
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  const startImageRound = () => {
    setGameStarted(true)
  }

  const handleStackComplete = (finalScore) => {
    // Determine winner and pass control back to main game
    onRoundComplete({
      winningScore: finalScore,
      nextPhase: 'individual-stacks'
    })
  }

  if (!gameStarted) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-black via-purple-900 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 text-gray-900'
      }`}>
        <div className="container mx-auto px-4 py-8 text-center">
          
          {/* Dramatic Intro */}
          <div className="mb-12">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              🎬 Round 1
            </h1>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              "And Now for Something Completely Deep"
            </h2>
            <p className={`text-lg sm:text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              All teams will see the same visual prompt and collaborate on a 5-deep stack dive.
              <br />
              <strong>Winner of the final question goes first in individual rounds!</strong>
            </p>
          </div>

          {/* Teams Display */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Competing Teams:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className={`p-4 rounded-xl ${
                    darkMode 
                      ? 'bg-gray-800/50 border border-gray-700/50' 
                      : 'bg-white/70 border border-gray-200 shadow-md'
                  }`}
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-semibold">{team.name}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Team #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mystery Image Preview */}
          <div className={`max-w-2xl mx-auto mb-8 p-6 rounded-2xl ${
            darkMode 
              ? 'bg-gray-800/30 border border-gray-700/30' 
              : 'bg-white/50 border border-gray-200'
          }`}>
            <h3 className="text-xl font-bold mb-4">🎭 Visual Prompt Ready</h3>
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-4xl text-white">?</span>
            </div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              A mysterious image awaits. From visual → cultural → absurd.
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={startImageRound}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white px-12 py-6 rounded-2xl text-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            🎬 Reveal the Image & Begin!
          </button>
        </div>
      </div>
    )
  }

  // Show the actual image and game
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            🎬 Opening Image Round
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            All teams work together • Winner of question 5 goes first
          </p>
        </div>

        {/* The Reveal */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className={`p-8 rounded-2xl mb-6 ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50' 
              : 'bg-white/70 backdrop-blur-sm shadow-lg border border-white/50'
          }`}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4">Your Visual Prompt:</h2>
              <div className="relative max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src={currentImage.src} 
                  alt={currentImage.alt}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <p className={`mt-4 text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentImage.alt}
              </p>
            </div>
          </div>
        </div>

        {/* Game Stack Component */}
        <div className="max-w-4xl mx-auto">
          <div className={`p-6 rounded-2xl ${
            darkMode 
              ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-sm shadow-xl border border-white/50'
          }`}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {currentImage.stack.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentImage.stack.description}
              </p>
            </div>
            
            {/* Placeholder for GameStack integration */}
            <div className="text-center">
              <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                GameStack component would be integrated here with the opening image stack
              </p>
              <button
                onClick={() => handleStackComplete(160)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300"
              >
                🎯 Complete Opening Round (Demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
