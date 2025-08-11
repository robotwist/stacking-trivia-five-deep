import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MobilePlayerJoin = ({ roomCode: initialRoomCode, onJoinSuccess }) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '')
  const [playerName, setPlayerName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [joinStatus, setJoinStatus] = useState('') // 'success', 'error', 'waiting'
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [gameState, setGameState] = useState('lobby') // 'lobby', 'question', 'waiting', 'results'
  const [playerStats, setPlayerStats] = useState({ score: 0, position: 0 })

  const joinGame = async () => {
    if (!roomCode || !playerName.trim()) {
      setJoinStatus('error')
      return
    }

    setIsJoining(true)
    
    try {
      // Simulate API call - replace with actual backend
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In real implementation, this would validate room code and add player
      setJoinStatus('success')
      setGameState('lobby')
      onJoinSuccess?.({ roomCode, playerName })
      
    } catch (error) {
      setJoinStatus('error')
    } finally {
      setIsJoining(false)
    }
  }

  const submitAnswer = () => {
    if (!selectedAnswer) return
    
    // Submit answer to backend
    console.log(`Submitting answer: ${selectedAnswer}`)
    setGameState('waiting')
    setSelectedAnswer('')
  }

  // Join screen
  if (gameState === 'lobby' && joinStatus !== 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 text-white p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Join Trivia Game
              </h1>
              <p className="text-gray-300">Enter your details to join the fun!</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="w-full p-4 text-2xl font-mono text-center bg-black/30 border border-white/20 rounded-xl focus:border-yellow-400 focus:outline-none"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-4 bg-black/30 border border-white/20 rounded-xl focus:border-yellow-400 focus:outline-none"
                  maxLength={20}
                />
              </div>

              {joinStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center"
                >
                  Invalid room code or name. Please try again.
                </motion.div>
              )}

              <button
                onClick={joinGame}
                disabled={isJoining || !roomCode || !playerName.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  isJoining
                    ? 'bg-gray-600 text-gray-400'
                    : roomCode && playerName.trim()
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isJoining ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </div>
                ) : (
                  'Join Game'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Lobby waiting screen
  if (gameState === 'lobby' && joinStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-800 text-white p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">✅ You're In!</h2>
              <p className="text-gray-300">Welcome, {playerName}!</p>
            </div>

            <div className="mb-8">
              <div className="animate-pulse">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-lg">Waiting for game to start...</p>
                <p className="text-sm text-gray-400 mt-2">Keep this screen open</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-300">
              <p>📱 Your phone is your buzzer</p>
              <p>⚡ Answer quickly for bonus points</p>
              <p>🏆 Good luck!</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Question screen
  if (gameState === 'question' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-purple-600 to-blue-800 text-white p-4">
        <div className="max-w-md mx-auto pt-8">
          {/* Question */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6"
          >
            <div className="text-center mb-4">
              <div className="text-sm text-gray-300 mb-2">Question {currentQuestion.number}</div>
              <h2 className="text-lg font-bold">{currentQuestion.question}</h2>
            </div>
          </motion.div>

          {/* Answer Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {currentQuestion.type === 'multiple-choice' ? (
              currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedAnswer === option
                      ? 'bg-yellow-500 text-black font-bold'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))
            ) : (
              <div>
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full p-4 bg-black/30 border border-white/20 rounded-xl focus:border-yellow-400 focus:outline-none mb-4"
                />
              </div>
            )}

            <button
              onClick={submitAnswer}
              disabled={!selectedAnswer}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                selectedAnswer
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          </motion.div>

          {/* Player Stats */}
          <div className="mt-6 text-center text-sm text-gray-300">
            <p>Score: {playerStats.score} | Position: #{playerStats.position}</p>
          </div>
        </div>
      </div>
    )
  }

  // Waiting for next question
  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
            <div className="animate-bounce text-6xl mb-4">⏳</div>
            <h2 className="text-xl font-bold mb-2">Answer Submitted!</h2>
            <p className="text-gray-300 mb-4">Waiting for other players...</p>
            <div className="text-lg">Score: {playerStats.score}</div>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}

export default MobilePlayerJoin
