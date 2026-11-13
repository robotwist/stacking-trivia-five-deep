// Audio utility for game sound effects

// One shared context: browsers cap how many can exist, so creating one per sound
// eventually silences the game in a long session.
let sharedContext = null

const getAudioContext = () => {
  if (sharedContext) return sharedContext
  const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (typeof AudioContextClass !== 'function') return null
  try {
    sharedContext = new AudioContextClass()
  } catch {
    sharedContext = null
  }
  return sharedContext
}

export const playSound = (type) => {
  const audioContext = getAudioContext();
  if (!audioContext) return;
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  try {
    
    // Generate simple tones for different sounds
    const generateTone = (frequency, duration, type = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };
    
    switch (type) {
      case 'correct':
        // Happy ascending tone
        generateTone(523.25, 0.2); // C5
        setTimeout(() => generateTone(659.25, 0.2), 100); // E5
        setTimeout(() => generateTone(783.99, 0.3), 200); // G5
        break;
      case 'incorrect':
        // Sad descending tone
        generateTone(523.25, 0.3); // C5
        setTimeout(() => generateTone(493.88, 0.3), 150); // B4
        setTimeout(() => generateTone(440.00, 0.4), 300); // A4
        break;
      case 'achievement':
        // Celebratory fanfare
        generateTone(659.25, 0.1); // E5
        setTimeout(() => generateTone(783.99, 0.1), 50); // G5
        setTimeout(() => generateTone(987.77, 0.2), 100); // B5
        setTimeout(() => generateTone(1318.51, 0.3), 150); // E6
        break;
      case 'streak':
        // Fire sound effect
        generateTone(200, 0.1, 'sawtooth');
        setTimeout(() => generateTone(150, 0.1, 'sawtooth'), 50);
        setTimeout(() => generateTone(100, 0.1, 'sawtooth'), 100);
        break;
      default:
        break;
    }
  } catch {
    // Graceful fallback - no audio if not supported
  }
};

// Browsers only allow audio after a user gesture; unlock the shared context on the first one
export const initAudio = () => {
  const unlock = () => {
    const ctx = getAudioContext()
    if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
  };
  document.addEventListener('click', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });
};
