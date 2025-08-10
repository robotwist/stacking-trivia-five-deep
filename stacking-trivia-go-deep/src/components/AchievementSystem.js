/**
 * Achievement System
 * Defines and manages all achievements in Deeply Trivial
 */

import ProgressStorage from '../utils/progressStorage.js';

export const ACHIEVEMENTS = {
  // Completion Achievements
  FIRST_STACK: {
    id: 'first_stack',
    title: 'Getting Deep',
    description: 'Complete your first trivia stack',
    icon: '🌱',
    requirement: { type: 'stacks_completed', value: 1 }
  },
  
  STACK_COLLECTOR: {
    id: 'stack_collector',
    title: 'Stack Collector',
    description: 'Complete 5 different trivia stacks',
    icon: '📚',
    requirement: { type: 'stacks_completed', value: 5 }
  },

  STACK_MASTER: {
    id: 'stack_master',
    title: 'Stack Master',
    description: 'Complete 10 different trivia stacks',
    icon: '🎓',
    requirement: { type: 'stacks_completed', value: 10 }
  },

  // Accuracy Achievements
  PERFECTIONIST: {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Score 100% on any stack',
    icon: '💯',
    requirement: { type: 'perfect_score', value: 1 }
  },

  HIGH_ACHIEVER: {
    id: 'high_achiever',
    title: 'High Achiever',
    description: 'Score 90%+ on 3 different stacks',
    icon: '⭐',
    requirement: { type: 'high_scores', value: 3, threshold: 90 }
  },

  CONSISTENT_PERFORMER: {
    id: 'consistent_performer',
    title: 'Consistent Performer',
    description: 'Maintain 80%+ accuracy across 5 stacks',
    icon: '🎯',
    requirement: { type: 'consistent_accuracy', value: 5, threshold: 80 }
  },

  // Speed Achievements
  LIGHTNING_ROUND: {
    id: 'lightning_round',
    title: 'Lightning Round',
    description: 'Complete a stack in under 5 minutes',
    icon: '⚡',
    requirement: { type: 'completion_time', value: 300 } // 5 minutes in seconds
  },

  SPEED_DEMON: {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete 3 stacks in under 6 minutes each',
    icon: '🏃‍♂️',
    requirement: { type: 'fast_completions', value: 3, threshold: 360 }
  },

  // Streak Achievements
  ON_FIRE: {
    id: 'on_fire',
    title: 'On Fire',
    description: 'Get 5 questions right in a row',
    icon: '🔥',
    requirement: { type: 'streak', value: 5 }
  },

  UNSTOPPABLE: {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Get 10 questions right in a row',
    icon: '🚀',
    requirement: { type: 'streak', value: 10 }
  },

  // Topic-Specific Achievements
  HISTORY_BUFF: {
    id: 'history_buff',
    title: 'History Buff',
    description: 'Complete 3 history-related stacks',
    icon: '📜',
    requirement: { type: 'topic_mastery', value: 3, topic: 'history' }
  },

  CULTURE_VULTURE: {
    id: 'culture_vulture',
    title: 'Culture Vulture',
    description: 'Complete 3 culture/arts stacks',
    icon: '🎭',
    requirement: { type: 'topic_mastery', value: 3, topic: 'culture' }
  },

  SPORTS_FANATIC: {
    id: 'sports_fanatic',
    title: 'Sports Fanatic',
    description: 'Complete 3 sports-related stacks',
    icon: '🏆',
    requirement: { type: 'topic_mastery', value: 3, topic: 'sports' }
  },

  // Discovery Achievements
  EXPLORER: {
    id: 'explorer',
    title: 'Explorer',
    description: 'Try stacks from 4 different difficulty levels',
    icon: '🧭',
    requirement: { type: 'difficulty_range', value: 4 }
  },

  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Complete at least one Expert-level stack',
    icon: '🔍',
    requirement: { type: 'difficulty_completed', value: 'Expert' }
  },

  // Social Achievements
  COMEBACK_KID: {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Resume and complete a saved stack',
    icon: '↩️',
    requirement: { type: 'resume_completion', value: 1 }
  },

  DEDICATED_LEARNER: {
    id: 'dedicated_learner',
    title: 'Dedicated Learner',
    description: 'Play trivia for 7 days in a row',
    icon: '📅',
    requirement: { type: 'daily_streak', value: 7 }
  }
};

export class AchievementSystem {
  /**
   * Check and unlock achievements based on game stats
   * @param {Object} gameStats - Current game statistics
   * @param {Object} userProfile - User profile data
   * @returns {Array} Newly unlocked achievements
   */
  static checkAchievements(gameStats, userProfile) {
    const newlyUnlocked = [];

    Object.values(ACHIEVEMENTS).forEach(achievement => {
      // Skip if already unlocked
      if (ProgressStorage.hasAchievement(achievement.id)) return;

      if (this.isAchievementUnlocked(achievement, gameStats, userProfile)) {
        const unlocked = ProgressStorage.unlockAchievement(
          achievement.id,
          achievement.title,
          achievement.description,
          achievement.icon
        );

        if (unlocked) {
          newlyUnlocked.push(achievement);
        }
      }
    });

    return newlyUnlocked;
  }

  /**
   * Check if a specific achievement should be unlocked
   * @param {Object} achievement - Achievement definition
   * @param {Object} gameStats - Current game statistics
   * @param {Object} userProfile - User profile data
   * @returns {boolean} True if achievement should be unlocked
   */
  static isAchievementUnlocked(achievement, gameStats, userProfile) {
    const req = achievement.requirement;

    switch (req.type) {
      case 'stacks_completed':
        return (userProfile.stacksCompleted || 0) >= req.value;

      case 'perfect_score':
        return gameStats.perfectScores >= req.value;

      case 'high_scores':
        return gameStats.highScores >= req.value;

      case 'consistent_accuracy':
        return gameStats.consistentHighAccuracy >= req.value;

      case 'completion_time':
        return gameStats.fastestCompletion <= req.value;

      case 'fast_completions':
        return gameStats.fastCompletions >= req.value;

      case 'streak':
        return gameStats.longestStreak >= req.value;

      case 'topic_mastery':
        return this.getTopicCompletions(req.topic, userProfile) >= req.value;

      case 'difficulty_range':
        return this.getDifficultyRange(userProfile) >= req.value;

      case 'difficulty_completed':
        return this.hasCompletedDifficulty(req.value, userProfile);

      case 'resume_completion':
        return gameStats.resumeCompletions >= req.value;

      case 'daily_streak':
        return gameStats.dailyStreak >= req.value;

      default:
        return false;
    }
  }

  /**
   * Get number of completions for a specific topic
   * @param {string} topic - Topic to check
   * @param {Object} userProfile - User profile data
   * @returns {number} Number of completions
   */
  static getTopicCompletions(topic, userProfile) {
    if (!userProfile.completedStacks) return 0;
    
    return userProfile.completedStacks.filter(stack => {
      const stackName = stack.toLowerCase();
      switch (topic) {
        case 'history':
          return stackName.includes('history') || 
                 stackName.includes('ancient') ||
                 stackName.includes('greece');
        case 'culture':
          return stackName.includes('culture') ||
                 stackName.includes('art') ||
                 stackName.includes('beatles') ||
                 stackName.includes('van-gogh');
        case 'sports':
          return stackName.includes('sport') ||
                 stackName.includes('olympic') ||
                 stackName.includes('nebraska');
        default:
          return false;
      }
    }).length;
  }

  /**
   * Get number of different difficulty levels completed
   * @param {Object} userProfile - User profile data  
   * @returns {number} Number of different difficulty levels
   */
  static getDifficultyRange(userProfile) {
    // This would need integration with stackMetadata to map stacks to difficulties
    // For now, estimate based on completion count
    const completed = userProfile.stacksCompleted || 0;
    if (completed >= 8) return 4; // All levels
    if (completed >= 5) return 3;
    if (completed >= 2) return 2;
    return completed > 0 ? 1 : 0;
  }

  /**
   * Check if user has completed any stack of specific difficulty
   * @param {string} difficulty - Difficulty level
   * @param {Object} userProfile - User profile data
   * @returns {boolean} True if completed
   */
  static hasCompletedDifficulty(difficulty, userProfile) {
    // This would need integration with stackMetadata
    // For now, assume Expert level requires high completion count
    if (difficulty === 'Expert') {
      return (userProfile.stacksCompleted || 0) >= 3;
    }
    return true;
  }

  /**
   * Get all achievements with unlock status
   * @returns {Array} Array of achievements with unlocked status
   */
  static getAllAchievements() {
    const unlocked = ProgressStorage.getAchievements();
    
    return Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: !!unlocked[achievement.id],
      unlockedAt: unlocked[achievement.id]?.unlockedAt || null
    }));
  }

  /**
   * Get recently unlocked achievements (last 7 days)
   * @returns {Array} Recent achievements
   */
  static getRecentAchievements() {
    const unlocked = ProgressStorage.getAchievements();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - oneWeek;

    return Object.entries(unlocked)
      .filter(([_, data]) => data.unlockedAt > cutoff)
      .map(([id, data]) => ({
        id,
        ...data,
        achievement: ACHIEVEMENTS[id.toUpperCase()]
      }));
  }
}

export default AchievementSystem;
