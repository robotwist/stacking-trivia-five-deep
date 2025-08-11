import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MultiDeviceHost = ({ onStartGame, gameStacks }) => {
  const [roomCode, setRoomCode] = useState('')
  const [players, setPlayers] = useState([])
  const [gameSettings, setGameSettings] = useState({
    maxPlayers: 8,
    stackSelection: 'random',
    questionTime: 30,
    showAnswers: true
  })
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  // Generate room code on component mount
  useEffect(() => {
    generateRoomCode()
  }, [])

  const generateRoomCode = () => {
    // Generate 6-digit room code
    const code = Math.random().toString().substr(2, 6)
    setRoomCode(code)
    
    // Generate QR code URL for easy mobile joining
    const joinUrl = `${window.location.origin}/join/${code}`
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`)
    
    // Initialize WebSocket connection for real-time updates
    initializeWebSocket(code)
  }

  const initializeWebSocket = (code) => {
    // This would connect to your backend WebSocket for real-time player management
    // For now, we'll simulate with localStorage and polling
    console.log(`Initializing room ${code}`)
  }

  const addPlayer = (playerName) => {
    const newPlayer = {
      id: Date.now(),
      name: playerName,
      score: 0,
      device: 'mobile',
      connected: true,
      joinTime: new Date()
    }
    setPlayers(prev => [...prev, newPlayer])
  }

  const removePlayer = (playerId) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId))
  }

  const startGame = () => {
    if (players.length < 2) {
      alert('Need at least 2 players to start!')
      return
    }
    setIsGameStarted(true)
    onStartGame({
      roomCode,
      players,
      settings: gameSettings
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Deeply Trivial
          </h1>
          <p className="text-xl text-gray-300">Multi-Device Bar Trivia Experience</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Room Info & Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Room Code Display */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Room Code</h2>
              <div className="text-6xl font-mono font-black text-yellow-400 mb-4 tracking-wider">
                {roomCode}
              </div>
              <p className="text-gray-300 mb-4">
                Players join at: <span className="font-mono">{window.location.origin}/join</span>
              </p>
              
              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="Join QR Code"
                    className="border-4 border-white/20 rounded-lg"
                  />
                </div>
              )}
              
              <button
                onClick={generateRoomCode}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                New Room Code
              </button>
            </div>

            {/* Game Settings */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Game Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Players</label>
                  <select 
                    value={gameSettings.maxPlayers}
                    onChange={(e) => setGameSettings(prev => ({...prev, maxPlayers: parseInt(e.target.value)}))}
                    className="w-full p-2 bg-black/30 rounded border border-white/20"
                  >
                    <option value={4}>4 Players</option>
                    <option value={6}>6 Players</option>
                    <option value={8}>8 Players</option>
                    <option value={12}>12 Players</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Question Time (seconds)</label>
                  <select 
                    value={gameSettings.questionTime}
                    onChange={(e) => setGameSettings(prev => ({...prev, questionTime: parseInt(e.target.value)}))}
                    className="w-full p-2 bg-black/30 rounded border border-white/20"
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={45}>45 seconds</option>
                    <option value={60}>60 seconds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stack Selection</label>
                  <select 
                    value={gameSettings.stackSelection}
                    onChange={(e) => setGameSettings(prev => ({...prev, stackSelection: e.target.value}))}
                    className="w-full p-2 bg-black/30 rounded border border-white/20"
                  >
                    <option value="random">Random Mix</option>
                    <option value="family">Family Favorites</option>
                    <option value="expert">Expert Level</option>
                    <option value="custom">Host Choice</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showAnswers"
                    checked={gameSettings.showAnswers}
                    onChange={(e) => setGameSettings(prev => ({...prev, showAnswers: e.target.checked}))}
                    className="mr-2"
                  />
                  <label htmlFor="showAnswers">Show correct answers after each question</label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Players List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Players Lobby */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Players ({players.length}/{gameSettings.maxPlayers})</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => addPlayer(`Player ${players.length + 1}`)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                  >
                    Add Test Player
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <AnimatePresence>
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${player.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="font-medium">{player.name}</span>
                        <span className="text-xs text-gray-400">{player.device}</span>
                      </div>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {players.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-lg mb-2">👥 Waiting for players...</p>
                    <p className="text-sm">Players can join by visiting the link above or scanning the QR code</p>
                  </div>
                )}
              </div>

              {/* Start Game Button */}
              <button
                onClick={startGame}
                disabled={players.length < 2}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  players.length >= 2
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {players.length < 2 ? 'Need at least 2 players' : `Start Game with ${players.length} players`}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-3">How It Works</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>1. 📱 Players visit the join link on their phones</p>
                <p>2. 🎯 Enter their names and the room code</p>
                <p>3. 🎮 Questions appear on the main screen</p>
                <p>4. ⚡ Players submit answers on their devices</p>
                <p>5. 🏆 Points awarded for speed and accuracy</p>
                <p>6. 📊 Real-time leaderboard updates</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default MultiDeviceHost
