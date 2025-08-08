import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import FloatingElement from './FloatingElement'

const transitionSequences = {
  'arts-culture-to-cinema': {
    title: "From Canvas to Silver Screen",
    subtitle: "Where paintbrushes meet projectors...",
    elements: [
      { src: '/art/gilliam/elements/paintbrush.png', x: '20%', y: '30%', animation: 'float', delay: 0 },
      { src: '/art/gilliam/elements/film-reel.png', x: '70%', y: '20%', animation: 'rotate', delay: 1 },
      { src: '/art/gilliam/elements/victorian-camera.png', x: '50%', y: '60%', animation: 'wobble', delay: 2 }
    ],
    sequence: "Paintbrush → Film Reel → Movie Magic"
  },
  
  'history-to-sports': {
    title: "From Ancient Arenas to Modern Games",
    subtitle: "Gladiators become athletes...",
    elements: [
      { src: '/art/gilliam/elements/colosseum.png', x: '15%', y: '40%', animation: 'pulse', delay: 0 },
      { src: '/art/gilliam/elements/gladiator-helmet.png', x: '45%', y: '25%', animation: 'drift', delay: 1 },
      { src: '/art/gilliam/elements/boxing-gloves.png', x: '75%', y: '50%', animation: 'wobble', delay: 2 }
    ],
    sequence: "Colosseum → Gladiator → Boxing Ring"
  },

  'cinema-to-history': {
    title: "From Fiction to Fact",
    subtitle: "When movies meet monuments...",
    elements: [
      { src: '/art/gilliam/elements/movie-camera.png', x: '25%', y: '20%', animation: 'rotate', delay: 0 },
      { src: '/art/gilliam/elements/ancient-scroll.png', x: '60%', y: '45%', animation: 'float', delay: 1 },
      { src: '/art/gilliam/elements/egyptian-pyramid.png', x: '40%', y: '70%', animation: 'pulse', delay: 2 }
    ],
    sequence: "Camera → Scroll → History"
  },

  'actually-to-arts-culture': {
    title: "Debunking Myths, Revealing Truth",
    subtitle: "Facts finally set the record straight...",
    elements: [
      { src: '/art/gilliam/elements/magnifying-glass.png', x: '30%', y: '35%', animation: 'wobble', delay: 0 },
      { src: '/art/gilliam/elements/question-mark.png', x: '50%', y: '20%', animation: 'float', delay: 1 },
      { src: '/art/gilliam/elements/artist-palette.png', x: '70%', y: '55%', animation: 'drift', delay: 2 }
    ],
    sequence: "Investigation → Question → Art"
  }
}

export default function GilliamTransition({ fromCategory, toCategory, onComplete, duration = 6000 }) {
  const [currentPhase, setCurrentPhase] = useState('entering')
  const [showElements, setShowElements] = useState(false)
  
  const transitionKey = `${fromCategory}-to-${toCategory}`
  const transition = transitionSequences[transitionKey] || transitionSequences['arts-culture-to-cinema']

  useEffect(() => {
    const phases = [
      { phase: 'entering', delay: 500 },
      { phase: 'elements', delay: 1000 },
      { phase: 'climax', delay: duration - 2000 },
      { phase: 'exiting', delay: duration - 500 }
    ]

    phases.forEach(({ phase, delay }) => {
      setTimeout(() => {
        setCurrentPhase(phase)
        if (phase === 'elements') setShowElements(true)
      }, delay)
    })

    // Complete transition
    setTimeout(onComplete, duration)
  }, [duration, onComplete])

  return (
    <motion.div 
      className="fixed inset-0 z-50 overflow-hidden sepia"
      style={{
        background: 'linear-gradient(45deg, #92400e 0%, #b45309 25%, #d97706 50%, #f59e0b 75%, #fbbf24 100%)',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(92, 64, 14, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(180, 83, 9, 0.2) 0%, transparent 50%),
          linear-gradient(0deg, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 40px 40px'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Decorative Victorian border */}
      <motion.div 
        className="absolute inset-2 sm:inset-4 border-4 sm:border-8 border-amber-800 rounded-sm"
        style={{
          borderImage: 'repeating-linear-gradient(45deg, #92400e, #92400e 10px, #f59e0b 10px, #f59e0b 20px) 8'
        }}
        initial={{ scale: 0.8, rotate: -2 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: "backOut" }}
      />

      {/* Title Section */}
      <motion.div 
        className="absolute top-8 sm:top-16 left-0 right-0 text-center z-20 px-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease: "backOut" }}
      >
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 mb-2 sm:mb-4" 
            style={{ fontFamily: 'Baskervville, serif', textShadow: '3px 3px 6px rgba(0,0,0,0.3)' }}>
          {transition.title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-amber-700 italic" style={{ fontFamily: 'Baskervville, serif' }}>
          {transition.subtitle}
        </p>
      </motion.div>

      {/* Floating Elements */}
      <AnimatePresence>
        {showElements && transition.elements.map((element, index) => (
          <FloatingElement
            key={index}
            src={element.src}
            initialX={element.x}
            initialY={element.y}
            animation={element.animation}
            delay={element.delay}
            scale={1.5}
          />
        ))}
      </AnimatePresence>

      {/* Sequence Description */}
      <motion.div 
        className="absolute bottom-8 sm:bottom-16 left-0 right-0 text-center z-20 px-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: currentPhase === 'climax' ? -10 : 0, 
          opacity: 1,
          scale: currentPhase === 'climax' ? 1.05 : 1
        }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="bg-gradient-to-r from-amber-100/90 to-yellow-100/90 mx-auto px-4 sm:px-8 py-2 sm:py-4 rounded-sm border-2 border-amber-600 max-w-xs sm:max-w-2xl sepia">
          <p className="text-sm sm:text-lg md:text-xl text-amber-900 font-semibold" style={{ fontFamily: 'Baskervville, serif' }}>
            {transition.sequence}
          </p>
        </div>
      </motion.div>

      {/* Animated gears and mechanical elements */}
      <motion.div 
        className="absolute top-12 sm:top-20 right-8 sm:right-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-2 sm:border-4 border-amber-700 rounded-full"
             style={{
               background: 'conic-gradient(from 0deg, #f59e0b, #d97706, #f59e0b)',
               boxShadow: 'inset 0 0 10px rgba(0,0,0,0.4)'
             }}>
          {/* Gear teeth */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-3 sm:w-2 sm:h-6 bg-amber-800"
              style={{
                left: '50%',
                top: '-4px',
                transformOrigin: '50% 20px',
                transform: `translateX(-50%) rotate(${i * 45}deg)`
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Phase-specific effects */}
      {currentPhase === 'climax' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-40 sepia"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      )}

      {/* Exit countdown */}
      {currentPhase === 'exiting' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-900 to-yellow-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  )
}
