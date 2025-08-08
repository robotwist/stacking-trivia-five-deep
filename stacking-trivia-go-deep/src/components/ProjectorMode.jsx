import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import FloatingElement from './FloatingElement'

export default function ProjectorMode({ 
  gameState, 
  currentStack, 
  question, 
  teams = [],
  questionNumber = 1,
  onClose 
}) {
  const [showDecoration, setShowDecoration] = useState(false)
  
  useEffect(() => {
    setShowDecoration(true)
  }, [])

  const getCategoryArt = (category) => {
    const artMap = {
      'arts-culture': {
        background: 'linear-gradient(135deg, #8B4513 0%, #DEB887 50%, #D2691E 100%)',
        elements: [
          { src: '/art/gilliam/elements/paintbrush.png', x: '5%', y: '15%', animation: 'float' },
          { src: '/art/gilliam/elements/artist-palette.png', x: '85%', y: '75%', animation: 'wobble' },
          { src: '/art/gilliam/elements/ornate-frame.png', x: '10%', y: '70%', animation: 'pulse' }
        ]
      },
      'cinema': {
        background: 'linear-gradient(135deg, #2F4F4F 0%, #708090 50%, #4682B4 100%)',
        elements: [
          { src: '/art/gilliam/elements/film-reel.png', x: '8%', y: '20%', animation: 'rotate' },
          { src: '/art/gilliam/elements/movie-camera.png', x: '90%', y: '10%', animation: 'drift' },
          { src: '/art/gilliam/elements/film-strip.png', x: '2%', y: '80%', animation: 'float' }
        ]
      },
      'history': {
        background: 'linear-gradient(135deg, #8B0000 0%, #CD853F 50%, #DAA520 100%)',
        elements: [
          { src: '/art/gilliam/elements/ancient-scroll.png', x: '7%', y: '25%', animation: 'wobble' },
          { src: '/art/gilliam/elements/colosseum.png', x: '87%', y: '65%', animation: 'pulse' },
          { src: '/art/gilliam/elements/egyptian-pyramid.png', x: '15%', y: '75%', animation: 'float' }
        ]
      },
      'sports': {
        background: 'linear-gradient(135deg, #228B22 0%, #32CD32 50%, #90EE90 100%)',
        elements: [
          { src: '/art/gilliam/elements/boxing-gloves.png', x: '10%', y: '30%', animation: 'wobble' },
          { src: '/art/gilliam/elements/olympic-rings.png', x: '85%', y: '20%', animation: 'pulse' },
          { src: '/art/gilliam/elements/trophy.png', x: '5%', y: '80%', animation: 'float' }
        ]
      },
      'actually': {
        background: 'linear-gradient(135deg, #4B0082 0%, #8A2BE2 50%, #9932CC 100%)',
        elements: [
          { src: '/art/gilliam/elements/magnifying-glass.png', x: '12%', y: '18%', animation: 'wobble' },
          { src: '/art/gilliam/elements/question-mark.png', x: '88%', y: '72%', animation: 'float' },
          { src: '/art/gilliam/elements/detective-hat.png', x: '8%', y: '85%', animation: 'drift' }
        ]
      }
    }
    return artMap[category] || artMap['arts-culture']
  }

  const currentArt = currentStack ? getCategoryArt(currentStack.category) : getCategoryArt('arts-culture')

  if (gameState === 'setup') {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "backOut" }}
        >
          <h1 className="text-8xl font-bold mb-8 text-yellow-400" 
              style={{ fontFamily: 'serif', textShadow: '4px 4px 8px rgba(0,0,0,0.5)' }}>
            DeepStack
          </h1>
          <p className="text-3xl text-gray-300 mb-12">Trivia That Dares to Matter</p>
          
          {/* Decorative elements */}
          {showDecoration && (
            <div className="relative">
              <FloatingElement src="/art/gilliam/elements/ornate-frame.png" 
                               initialX="20%" initialY="10%" animation="float" />
              <FloatingElement src="/art/gilliam/elements/clockwork-gear.png" 
                               initialX="80%" initialY="20%" animation="rotate" />
            </div>
          )}
          
          <motion.button
            onClick={onClose}
            className="text-xl bg-yellow-600 hover:bg-yellow-500 px-8 py-4 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Return to Host Mode
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 text-white overflow-hidden z-50"
      style={{ background: currentArt.background }}
    >
      {/* Victorian paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(160, 82, 45, 0.3) 0%, transparent 50%),
            linear-gradient(0deg, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '200px 200px, 200px 200px, 40px 40px, 40px 40px'
        }}
      />

      {/* Floating decorative elements */}
      {showDecoration && currentArt.elements.map((element, index) => (
        <FloatingElement
          key={index}
          src={element.src}
          initialX={element.x}
          initialY={element.y}
          animation={element.animation}
          delay={index * 0.5}
          scale={1.2}
        />
      ))}

      {/* Ornate border frame */}
      <div className="absolute inset-8 border-8 border-yellow-400 rounded-3xl"
           style={{
             borderImage: 'repeating-linear-gradient(45deg, #ffd700, #ffd700 10px, #ffb347 10px, #ffb347 20px) 8',
             boxShadow: 'inset 0 0 50px rgba(255, 215, 0, 0.2), 0 0 50px rgba(0, 0, 0, 0.5)'
           }} />

      {/* Content Area */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center p-4 sm:p-8 md:p-16">
        
        {gameState === 'question' && question && (
          <motion.div 
            className="text-center max-w-6xl px-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "backOut" }}
          >
            {/* Question number indicator */}
            <motion.div 
              className="mb-4 sm:mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <div className="inline-block bg-yellow-400 text-black px-4 py-2 sm:px-6 sm:py-3 rounded-full text-lg sm:text-2xl font-bold">
                Level {questionNumber} • {question.points} Points
              </div>
            </motion.div>

            {/* Question text */}
            <motion.h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-12 leading-tight"
              style={{ 
                fontFamily: 'serif',
                textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.1))'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              {question.question}
            </motion.h2>

            {/* Decorative divider */}
            <motion.div 
              className="w-32 sm:w-48 md:w-64 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mb-4 sm:mb-8"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 1.5, duration: 1 }}
            />

            {/* Stack info */}
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-yellow-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              {currentStack?.title} • {currentStack?.category?.replace('-', ' & ').toUpperCase()}
            </motion.p>
          </motion.div>
        )}

        {gameState === 'scoreboard' && (
          <motion.div 
            className="text-center w-full max-w-4xl px-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "backOut" }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-12 text-yellow-400">Current Standings</h2>
            
            <div className="space-y-3 sm:space-y-6">
              {teams
                .sort((a, b) => b.score - a.score)
                .map((team, index) => (
                <motion.div
                  key={team.id}
                  className="flex flex-col sm:flex-row justify-between items-center bg-black bg-opacity-50 p-3 sm:p-6 rounded-lg border-2 border-yellow-400"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                >
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 w-8 sm:w-16">
                      #{index + 1}
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-semibold ml-2">{team.name}</div>
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400">
                    {team.score}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'performance' && (
          <motion.div 
            className="text-center px-4"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 1.5, ease: "backOut" }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-8 text-yellow-400" 
                style={{ fontFamily: 'serif', textShadow: '4px 4px 8px rgba(0,0,0,0.5)' }}>
              PERFORMANCE FINALE!
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-yellow-200 mb-6 sm:mb-12">
              Time to showcase your expertise!
            </p>
            
            {/* Celebration elements */}
            <motion.div 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
            >
              ✨🎪✨
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Close button (always visible) */}
      <motion.button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-8 sm:right-8 text-lg sm:text-2xl bg-black bg-opacity-70 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-opacity-90 transition-all z-20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Exit Projector
      </motion.button>
    </div>
  )
}
