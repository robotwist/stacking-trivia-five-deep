import { buildChallengeUrl, buildPlayUrl, getSiteOrigin } from './url'
import { ladderFromCode } from './playerRecords'

/**
 * Spoiler-free challenge: stack title, result ladder, score, and a link that drops the friend
 * into the same stack with the sender's score to beat.
 * @returns {Promise<'shared' | 'copied' | 'failed'>}
 */
export const shareRun = async ({ stackTitle, stackKey, categoryKey, score, maxScore, code, playerName, dailyNumber }) => {
  const url = stackKey
    ? buildChallengeUrl(stackKey, categoryKey, { score, code, name: playerName })
    : getSiteOrigin()
  const heading = dailyNumber ? `Deeply Trivial Daily #${dailyNumber}` : 'Deeply Trivial'
  const text = `${heading} — ${stackTitle}\n${ladderFromCode(code)} ${score}/${maxScore}\nCan you go deeper?`

  if (navigator.share) {
    try {
      await navigator.share({ title: `Deeply Trivial: ${stackTitle}`, text, url })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'failed'
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}

// Enhanced sharing utilities
export const shareScore = (score, totalPossible, stackName, accuracy, stackKey, categoryKey) => {
  const emoji = getScoreEmoji(score, totalPossible);
  const playUrl = stackKey ? buildPlayUrl(stackKey, categoryKey) : getSiteOrigin();
  const message = generateShareMessage(score, totalPossible, stackName, accuracy, emoji, playUrl);
  
  if (navigator.share) {
    navigator.share({
      title: 'DeepStack Trivia Score',
      text: message,
      url: playUrl
    }).catch(() => {
      // Fallback to clipboard
      copyToClipboard(message);
    });
  } else {
    copyToClipboard(message);
  }
};

export const shareAchievement = (achievement) => {
  const message = `🏆 Just unlocked "${achievement.title}" in DeepStack Trivia! 
${achievement.description}
🧠 Can you unlock it too? 
🌐 Play at: ${getSiteOrigin()}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'DeepStack Achievement Unlocked!',
      text: message,
      url: getSiteOrigin()
    }).catch(() => {
      copyToClipboard(message);
    });
  } else {
    copyToClipboard(message);
  }
};

export const shareStreak = (streakCount, totalScore) => {
  const message = `🔥 ${streakCount}-day streak in DeepStack Trivia! 
Total score: ${totalScore} points
🧠 Think you can beat my streak? 
🌐 Play at: ${getSiteOrigin()}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'DeepStack Streak!',
      text: message,
      url: getSiteOrigin()
    }).catch(() => {
      copyToClipboard(message);
    });
  } else {
    copyToClipboard(message);
  }
};

// Helper functions
const getScoreEmoji = (score, totalPossible) => {
  const percentage = (score / totalPossible) * 100;
  
  if (percentage >= 95) return '🏆';
  if (percentage >= 80) return '🎯';
  if (percentage >= 60) return '👍';
  if (percentage >= 40) return '😅';
  return '🤔';
};

const generateShareMessage = (score, totalPossible, stackName, accuracy, emoji, playUrl) => {
  const percentage = Math.round((score / totalPossible) * 100);
  
  if (percentage === 100) {
    return `${emoji} PERFECT SCORE! ${score}/${totalPossible} on "${stackName}" in DeepStack Trivia!
🧠 100% accuracy - can you match this perfect run?
🌐 Play: ${playUrl}`;
  }
  
  if (percentage >= 80) {
    return `${emoji} Great score! ${score}/${totalPossible} (${percentage}%) on "${stackName}" in DeepStack Trivia!
🎯 ${accuracy}% accuracy - think you can beat it?
🌐 Play: ${playUrl}`;
  }
  
  return `${emoji} Scored ${score}/${totalPossible} (${percentage}%) on "${stackName}" in DeepStack Trivia!
🧠 ${accuracy}% accuracy - challenge accepted?
🌐 Play: ${playUrl}`;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showCopyNotification();
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showCopyNotification();
  }
};

const showCopyNotification = () => {
  // Create a temporary notification
  const notification = document.createElement('div');
  notification.textContent = '📋 Copied to clipboard!';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10B981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(notification);
      document.head.removeChild(style);
    }, 300);
  }, 3000);
};
