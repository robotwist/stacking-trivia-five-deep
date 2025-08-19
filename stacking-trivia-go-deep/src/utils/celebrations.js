import confetti from 'canvas-confetti';
import { playSound } from './audio.js';

// Celebration effects for different achievements
export const celebrateAchievement = (type = 'general') => {
  // Play achievement sound
  playSound('achievement');
  
  // Different confetti patterns for different achievements
  switch (type) {
    case 'perfect_score':
      // Golden confetti burst
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6B35', '#FFE135'],
        shapes: ['star', 'circle'],
        gravity: 0.8
      });
      break;
      
    case 'streak':
      // Fire-themed confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#FF4500', '#FF6347', '#FF8C00', '#FFA500'],
        gravity: 1.2
      });
      break;
      
    case 'first_completion':
      // Rainbow confetti
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
        gravity: 0.6
      });
      break;
      
    default:
      // Standard celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B35', '#4ECDC4', '#45B7D1'],
        gravity: 0.8
      });
  }
};

// Streak celebration
export const celebrateStreak = (streakCount) => {
  playSound('streak');
  
  // More confetti for longer streaks
  const particleCount = Math.min(streakCount * 20, 200);
  
  confetti({
    particleCount,
    spread: 80,
    origin: { y: 0.7 },
    colors: ['#FF4500', '#FF6347', '#FF8C00'],
    gravity: 1.0
  });
};

// Perfect score celebration
export const celebratePerfectScore = () => {
  celebrateAchievement('perfect_score');
  
  // Additional burst after a delay
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.4 },
      colors: ['#FFD700', '#FFA500'],
      shapes: ['star'],
      gravity: 0.6
    });
  }, 500);
};

// First time completion celebration
export const celebrateFirstCompletion = () => {
  celebrateAchievement('first_completion');
  
  // Multiple bursts for extra celebration
  setTimeout(() => {
    confetti({
      particleCount: 75,
      spread: 90,
      origin: { y: 0.3 },
      colors: ['#FF6B35', '#4ECDC4'],
      gravity: 0.7
    });
  }, 300);
  
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#45B7D1', '#96CEB4'],
      gravity: 0.9
    });
  }, 600);
};
