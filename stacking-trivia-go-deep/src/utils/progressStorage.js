/**
 * Progress Persistence System
 * Saves and restores mid-stack progress so users never lose their place
 */

const STORAGE_KEYS = {
  PROGRESS: 'deeply_trivial_progress',
  ACHIEVEMENTS: 'deeply_trivial_achievements',
  USER_PREFERENCES: 'deeply_trivial_preferences'
};

export class ProgressStorage {
  /**
   * Save current stack progress
   * @param {string} stackName - Name of the current stack
   * @param {number} currentIndex - Current question index
   * @param {number} score - Current score
   * @param {number} maxScore - Maximum possible score so far
   * @param {Array} userAnswers - Array of user's answers
   * @param {number} timestamp - When this progress was saved
   */
  static saveProgress(stackName, currentIndex, score, maxScore, userAnswers) {
    const progressData = {
      stackName,
      currentIndex,
      score,
      maxScore,
      userAnswers: [...userAnswers], // Clone to avoid references
      timestamp: Date.now(),
      questionsAnswered: userAnswers.length,
      accuracy: userAnswers.length > 0 ? 
        (userAnswers.filter(a => a.correct).length / userAnswers.length) * 100 : 0
    };

    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressData));
      console.log(`Progress saved for ${stackName} at question ${currentIndex + 1}`);
      return true;
    } catch (error) {
      console.error('Failed to save progress:', error);
      return false;
    }
  }

  /**
   * Load saved progress for a specific stack
   * @param {string} stackName - Name of the stack to check
   * @returns {Object|null} Progress data or null if none exists
   */
  static loadProgress(stackName) {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!saved) return null;

      const progressData = JSON.parse(saved);
      
      // Check if this progress is for the requested stack
      if (progressData.stackName !== stackName) return null;

      // Check if progress is recent (within 7 days)
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - progressData.timestamp > oneWeek) {
        this.clearProgress();
        return null;
      }

      return progressData;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  }

  /**
   * Check if there's any saved progress
   * @returns {Object|null} Current progress data or null
   */
  static getCurrentProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!saved) return null;

      const progressData = JSON.parse(saved);
      
      // Check if progress is recent
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - progressData.timestamp > oneWeek) {
        this.clearProgress();
        return null;
      }

      return progressData;
    } catch (error) {
      console.error('Failed to get current progress:', error);
      return null;
    }
  }

  /**
   * Clear saved progress (when stack is completed or abandoned)
   */
  static clearProgress() {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      console.log('Progress cleared');
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  }

  /**
   * Save achievement unlock
   * @param {string} achievementId - Unique achievement identifier
   * @param {string} title - Achievement title
   * @param {string} description - Achievement description
   * @param {string} icon - Achievement icon/emoji
   * @param {number} unlockedAt - Timestamp when unlocked
   */
  static unlockAchievement(achievementId, title, description, icon = '🏆') {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      const achievements = saved ? JSON.parse(saved) : {};

      // Don't unlock twice
      if (achievements[achievementId]) return false;

      achievements[achievementId] = {
        title,
        description,
        icon,
        unlockedAt: Date.now()
      };

      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      console.log(`Achievement unlocked: ${title}`);
      return true;
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      return false;
    }
  }

  /**
   * Get all unlocked achievements
   * @returns {Object} Dictionary of achievement data
   */
  static getAchievements() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return {};
    }
  }

  /**
   * Check if specific achievement is unlocked
   * @param {string} achievementId - Achievement to check
   * @returns {boolean} True if unlocked
   */
  static hasAchievement(achievementId) {
    const achievements = this.getAchievements();
    return !!achievements[achievementId];
  }

  /**
   * Save user preferences for ML recommendations
   * @param {Object} preferences - User preference data
   */
  static savePreferences(preferences) {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences, updatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }

  /**
   * Get user preferences
   * @returns {Object} User preference data
   */
  static getPreferences() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return saved ? JSON.parse(saved) : {
        preferredDifficulty: 'Intermediate',
        favoriteTopics: [],
        playTimePreference: 'medium', // short, medium, long
        learningStyle: 'balanced', // quick, deep, balanced
        createdAt: Date.now()
      };
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return {};
    }
  }

  /**
   * Track user behavior for ML recommendations
   * @param {string} action - Type of action (stack_completed, stack_abandoned, etc.)
   * @param {Object} data - Action data
   */
  static trackAction(action, data) {
    try {
      const preferences = this.getPreferences();
      const actions = preferences.actionHistory || [];
      
      actions.push({
        action,
        data,
        timestamp: Date.now()
      });

      // Keep only last 100 actions for performance
      if (actions.length > 100) {
        actions.splice(0, actions.length - 100);
      }

      this.savePreferences({ actionHistory: actions });
    } catch (error) {
      console.error('Failed to track action:', error);
    }
  }
}

export default ProgressStorage;
