// Phase 8: Simple sound effects system using Web Audio API
class SoundEffectsManager {
  constructor() {
    this.audioContext = null
    this.sounds = new Map()
    this.enabled = true
    this.volume = 0.5
    
    // Initialize audio context on first user interaction
    this.initializeAudioContext()
  }

  initializeAudioContext() {
    if (typeof window !== 'undefined') {
      // Create audio context on first user interaction
      const createContext = () => {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        document.removeEventListener('click', createContext)
        document.removeEventListener('touchstart', createContext)
      }
      
      document.addEventListener('click', createContext)
      document.addEventListener('touchstart', createContext)
    }
  }

  // Generate simple tones for different sound effects
  generateTone(frequency, duration, type = 'sine') {
    if (!this.audioContext || !this.enabled) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // Generate chord progressions for more complex sounds
  generateChord(frequencies, duration, type = 'sine') {
    frequencies.forEach(freq => {
      this.generateTone(freq, duration, type)
    })
  }

  // Predefined sound effects for trivia game
  playSound(soundType) {
    if (!this.enabled) return

    switch (soundType) {
      case 'correct':
        // Happy chord progression
        this.generateChord([523.25, 659.25, 783.99], 0.5, 'triangle') // C-E-G major chord
        setTimeout(() => {
          this.generateChord([587.33, 739.99, 880.00], 0.3, 'triangle') // D-F#-A major chord
        }, 200)
        break
        
      case 'wrong':
        // Descending minor progression
        this.generateTone(523.25, 0.2, 'sawtooth') // C
        setTimeout(() => this.generateTone(466.16, 0.2, 'sawtooth'), 100) // Bb
        setTimeout(() => this.generateTone(415.30, 0.4, 'sawtooth'), 200) // Ab
        break
        
      case 'applause':
        // White noise burst for applause effect
        const duration = 2.0
        const bufferSize = this.audioContext.sampleRate * duration
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
        const output = buffer.getChannelData(0)
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * this.volume * Math.exp(-i / (bufferSize * 0.3))
        }
        
        const whiteNoise = this.audioContext.createBufferSource()
        whiteNoise.buffer = buffer
        
        const filter = this.audioContext.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.value = 1000
        
        whiteNoise.connect(filter)
        filter.connect(this.audioContext.destination)
        whiteNoise.start()
        break
        
      case 'suspense':
        // Low frequency rumble building up
        this.generateTone(55, 2.0, 'sawtooth') // Low A
        setTimeout(() => this.generateTone(73.42, 1.5, 'sawtooth'), 500) // Low D
        setTimeout(() => this.generateTone(98, 1.0, 'sawtooth'), 1000) // Low G
        break
        
      case 'celebration':
        // Festive ascending arpeggios
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50] // C major scale
        notes.forEach((freq, index) => {
          setTimeout(() => {
            this.generateTone(freq, 0.3, 'triangle')
          }, index * 100)
        })
        
        // Add harmonic bells
        setTimeout(() => {
          this.generateChord([1046.50, 1318.51, 1567.98], 1.0, 'sine') // High C-E-G
        }, 800)
        break
        
      case 'level-up':
        // Magical ascending progression
        this.generateTone(523.25, 0.2, 'triangle') // C
        setTimeout(() => this.generateTone(659.25, 0.2, 'triangle'), 150) // E
        setTimeout(() => this.generateTone(783.99, 0.2, 'triangle'), 300) // G
        setTimeout(() => this.generateTone(1046.50, 0.5, 'sine'), 450) // High C
        break
        
      case 'countdown':
        // Simple beep
        this.generateTone(800, 0.1, 'square')
        break
        
      case 'final-countdown':
        // More urgent beep
        this.generateTone(1000, 0.15, 'square')
        setTimeout(() => this.generateTone(1000, 0.15, 'square'), 200)
        break
        
      default:
        console.log(`Unknown sound type: ${soundType}`)
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }

  // For bar environments - quick volume controls
  muteAll() {
    this.enabled = false
  }

  unmuteAll() {
    this.enabled = true
  }
}

// Create singleton instance
const soundManager = new SoundEffectsManager()

// Export for use in React components
export default soundManager

// Helper hook for React components
export const useSoundEffects = () => {
  const playSound = (soundType) => {
    soundManager.playSound(soundType)
  }

  const setVolume = (volume) => {
    soundManager.setVolume(volume)
  }

  const toggleSound = () => {
    soundManager.setEnabled(!soundManager.enabled)
    return soundManager.enabled
  }

  return {
    playSound,
    setVolume,
    toggleSound,
    isEnabled: soundManager.enabled
  }
}
