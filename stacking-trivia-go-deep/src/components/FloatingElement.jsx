import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function FloatingElement({ 
  src, 
  initialX = '10%', 
  initialY = '20%', 
  animation = 'float',
  delay = 0,
  scale = 1,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  const animations = {
    float: {
      y: [0, -20, 0],
      transition: { 
        repeat: Infinity, 
        duration: 4 + Math.random() * 2,
        ease: "easeInOut"
      }
    },
    rotate: {
      rotate: [0, 360],
      transition: { 
        repeat: Infinity, 
        duration: 15 + Math.random() * 10,
        ease: "linear"
      }
    },
    wobble: {
      rotate: [-8, 8, -8],
      transition: { 
        repeat: Infinity, 
        duration: 3 + Math.random(),
        ease: "easeInOut"
      }
    },
    drift: {
      x: [0, 30, -15, 0],
      y: [0, -10, 20, 0],
      transition: { 
        repeat: Infinity, 
        duration: 8 + Math.random() * 4,
        ease: "easeInOut"
      }
    },
    pulse: {
      scale: [scale, scale * 1.1, scale],
      opacity: [0.7, 1, 0.7],
      transition: { 
        repeat: Infinity, 
        duration: 2 + Math.random(),
        ease: "easeInOut"
      }
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      className={`absolute pointer-events-none z-10 ${className}`}
      style={{ left: initialX, top: initialY }}
      initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
      animate={{ 
        opacity: 0.8, 
        scale: scale, 
        rotate: 0,
        ...animations[animation]
      }}
      transition={{ duration: 1.5, ease: "backOut" }}
    >
      <img 
        src={src} 
        alt="" 
        className="max-w-none" 
        style={{ 
          filter: 'sepia(0.3) contrast(1.2) brightness(0.9)',
          mixBlendMode: 'multiply'
        }}
        onError={(e) => {
          // Fallback for missing images
          e.target.style.display = 'none'
        }}
      />
    </motion.div>
  )
}
