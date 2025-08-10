/**
 * Smart ML-driven Recommendation Engine
 * Analyzes user behavior and performance to suggest optimal next stacks
 */

import ProgressStorage from '../utils/progressStorage.js';
import { stackMetadata } from '../utils/stackMetadata.js';

export class SmartRecommendations {
  /**
   * Generate personalized stack recommendations based on ML analysis
   * @param {Object} userProfile - User profile with stats and history
   * @param {string} currentStack - Currently completed stack (optional)
   * @param {number} limit - Number of recommendations to return
   * @returns {Array} Recommended stacks with confidence scores
   */
  static getPersonalizedRecommendations(userProfile, currentStack = null, limit = 3) {
    const preferences = ProgressStorage.getPreferences();
    const actionHistory = preferences.actionHistory || [];
    
    // Get all available stacks with metadata
    const availableStacks = Object.keys(stackMetadata);
    
    // Calculate recommendation scores for each stack
    const scoredStacks = availableStacks.map(stackName => {
      const score = this.calculateRecommendationScore(
        stackName,
        userProfile,
        preferences,
        actionHistory,
        currentStack
      );
      
      return {
        stackName,
        score,
        metadata: stackMetadata[stackName],
        reasoning: this.generateReasoning(stackName, userProfile, preferences)
      };
    });

    // Sort by score and return top recommendations
    return scoredStacks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        ...item,
        confidence: Math.min(100, Math.max(60, item.score)) // Convert to 60-100% confidence
      }));
  }

  /**
   * Calculate ML-driven recommendation score for a stack
   * @param {string} stackName - Stack to score
   * @param {Object} userProfile - User profile data
   * @param {Object} preferences - User preferences
   * @param {Array} actionHistory - User's action history
   * @param {string} currentStack - Currently completed stack
   * @returns {number} Recommendation score (0-100)
   */
  static calculateRecommendationScore(stackName, userProfile, preferences, actionHistory, currentStack) {
    const metadata = stackMetadata[stackName];
    if (!metadata) return 0;

    let score = 50; // Base score

    // Factor 1: Difficulty Matching (25 points)
    score += this.getDifficultyScore(metadata.difficulty, userProfile, preferences);

    // Factor 2: Topic Interest (20 points)
    score += this.getTopicInterestScore(stackName, preferences, actionHistory);

    // Factor 3: Completion Patterns (15 points)
    score += this.getCompletionPatternScore(metadata, userProfile, actionHistory);

    // Factor 4: Time Preference Matching (15 points)
    score += this.getTimePreferenceScore(metadata.estimatedTime, preferences);

    // Factor 5: Novelty vs Familiarity Balance (10 points)
    score += this.getNoveltyScore(stackName, userProfile, actionHistory);

    // Factor 6: Sequential Logic (10 points)
    score += this.getSequentialScore(stackName, currentStack, userProfile);

    // Factor 7: Success Prediction (5 points)
    score += this.getSuccessPredictionScore(metadata, userProfile);

    // Penalties
    score -= this.getPenalties(stackName, userProfile, actionHistory);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Score based on difficulty matching user's skill level
   */
  static getDifficultyScore(difficulty, userProfile, preferences) {
    const userLevel = this.estimateUserLevel(userProfile);
    const preferredDifficulty = preferences.preferredDifficulty || 'Intermediate';

    // Map difficulties to numeric levels
    const difficultyLevels = {
      'Beginner': 1,
      'Intermediate': 2,
      'Advanced': 3,
      'Expert': 4
    };

    const stackLevel = difficultyLevels[difficulty] || 2;
    const userPreferredLevel = difficultyLevels[preferredDifficulty] || 2;

    // Perfect match gets full points
    if (stackLevel === userLevel) return 25;
    if (stackLevel === userPreferredLevel) return 20;

    // Slight challenge is good (one level up)
    if (stackLevel === userLevel + 1) return 18;

    // Too easy or too hard gets lower scores
    const levelDiff = Math.abs(stackLevel - userLevel);
    return Math.max(0, 25 - (levelDiff * 8));
  }

  /**
   * Score based on user's topic interests derived from behavior
   */
  static getTopicInterestScore(stackName, preferences, actionHistory) {
    const favoriteTopics = preferences.favoriteTopics || [];
    
    // Direct topic match
    for (const topic of favoriteTopics) {
      if (stackName.toLowerCase().includes(topic.toLowerCase())) {
        return 20;
      }
    }

    // Analyze completion patterns from action history
    const completedStacks = actionHistory
      .filter(action => action.action === 'stack_completed')
      .map(action => action.data.stackName);

    // Find topic patterns
    const topicScore = this.analyzeTopicPatterns(stackName, completedStacks);
    return Math.min(20, topicScore);
  }

  /**
   * Score based on completion patterns and success rates
   */
  static getCompletionPatternScore(metadata, userProfile, actionHistory) {
    const completionRate = this.getCompletionRate(actionHistory);
    const avgAccuracy = userProfile.accuracy || 75;

    // High performers can handle more challenging content
    if (avgAccuracy > 85 && metadata.difficulty === 'Expert') return 15;
    if (avgAccuracy > 75 && metadata.difficulty === 'Advanced') return 12;
    if (avgAccuracy < 60 && metadata.difficulty === 'Beginner') return 10;

    // Match completion rate to stack difficulty
    if (completionRate > 0.8) return 15;
    if (completionRate > 0.6) return 10;
    return 5;
  }

  /**
   * Score based on time preference matching
   */
  static getTimePreferenceScore(estimatedTime, preferences) {
    const timePreference = preferences.playTimePreference || 'medium';
    const timeMinutes = this.parseTimeEstimate(estimatedTime);

    switch (timePreference) {
      case 'short':
        return timeMinutes <= 8 ? 15 : Math.max(0, 15 - (timeMinutes - 8) * 2);
      case 'medium':
        return timeMinutes >= 8 && timeMinutes <= 12 ? 15 : Math.max(0, 15 - Math.abs(timeMinutes - 10) * 2);
      case 'long':
        return timeMinutes >= 12 ? 15 : Math.max(0, 15 - (12 - timeMinutes) * 2);
      default:
        return 10;
    }
  }

  /**
   * Score balancing novelty (new topics) vs familiarity (known success)
   */
  static getNoveltyScore(stackName, userProfile, actionHistory) {
    const completedStacks = userProfile.completedStacks || [];
    const hasCompleted = completedStacks.includes(stackName);
    
    if (hasCompleted) return 0; // Don't recommend completed stacks

    // Analyze topic novelty
    const topicSimilarity = this.calculateTopicSimilarity(stackName, completedStacks);
    
    // Balance novelty and familiarity based on user's exploration tendency
    const explorationTendency = this.getExplorationTendency(actionHistory);
    
    if (explorationTendency > 0.7) {
      // Explorer: prefer novel topics
      return Math.max(0, 10 - topicSimilarity * 10);
    } else {
      // Cautious: prefer familiar territory
      return Math.min(10, topicSimilarity * 10 + 2);
    }
  }

  /**
   * Score based on logical sequencing (follow-up topics)
   */
  static getSequentialScore(stackName, currentStack, userProfile) {
    if (!currentStack) return 5; // Default score if no current stack

    // Check for logical progressions
    const progressions = {
      'ancient_greece': ['van-gogh', 'the_beatles'], // History → Arts/Culture
      'the_beatles': ['van-gogh', 'blade_runner'], // Music → Arts/Sci-fi
      'van-gogh': ['the_beatles', 'ancient_greece'], // Art → Music/History
      'blade_runner': ['van-gogh', 'the_beatles'], // Sci-fi → Arts/Culture
      'olympic_distance_current': ['olympic_distance_1980s', 'nebraska_sports'], // Modern → Historical/Local sports
      'olympic_distance_1980s': ['olympic_distance_current', 'nebraska_sports'], // Historical → Modern/Local sports
      'nebraska_sports': ['olympic_distance_current', 'olympic_distance_1980s'] // Local → Olympic sports
    };

    const logicalNext = progressions[currentStack] || [];
    return logicalNext.includes(stackName) ? 10 : 3;
  }

  /**
   * Predict success likelihood for this user on this stack
   */
  static getSuccessPredictionScore(metadata, userProfile) {
    const avgAccuracy = userProfile.accuracy || 75;
    const difficultyPenalty = {
      'Beginner': 0,
      'Intermediate': 5,
      'Advanced': 10,
      'Expert': 15
    };

    const predictedScore = avgAccuracy - (difficultyPenalty[metadata.difficulty] || 5);
    
    // Higher predicted success = higher recommendation
    if (predictedScore >= 80) return 5;
    if (predictedScore >= 70) return 3;
    if (predictedScore >= 60) return 1;
    return 0;
  }

  /**
   * Apply penalties for various factors
   */
  static getPenalties(stackName, userProfile, actionHistory) {
    let penalty = 0;

    // Recently abandoned stacks get penalty
    const recentAbandons = actionHistory
      .filter(action => action.action === 'stack_abandoned')
      .filter(action => Date.now() - action.timestamp < 24 * 60 * 60 * 1000); // Last 24h

    if (recentAbandons.some(action => action.data.stackName === stackName)) {
      penalty += 20;
    }

    // Recently completed stacks get small penalty to encourage variety
    const recentCompletions = actionHistory
      .filter(action => action.action === 'stack_completed')
      .filter(action => Date.now() - action.timestamp < 7 * 24 * 60 * 60 * 1000); // Last week

    if (recentCompletions.some(action => action.data.stackName === stackName)) {
      penalty += 10;
    }

    return penalty;
  }

  /**
   * Generate human-readable reasoning for recommendation
   */
  static generateReasoning(stackName, userProfile, preferences) {
    const metadata = stackMetadata[stackName];
    const userLevel = this.estimateUserLevel(userProfile);
    const accuracy = userProfile.accuracy || 75;

    const reasons = [];

    // Difficulty reasoning
    const difficultyLevels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
    const stackLevel = difficultyLevels[metadata.difficulty] || 2;

    if (stackLevel === userLevel) {
      reasons.push(`Perfect difficulty match for your skill level`);
    } else if (stackLevel === userLevel + 1) {
      reasons.push(`Great next challenge to advance your skills`);
    }

    // Performance reasoning
    if (accuracy > 85) {
      reasons.push(`You're performing excellently - ready for this challenge`);
    } else if (accuracy < 65) {
      reasons.push(`Good practice opportunity to build confidence`);
    }

    // Topic reasoning
    const topicKeywords = stackName.toLowerCase().replace(/[_-]/g, ' ').split(' ');
    const preferredTopics = preferences.favoriteTopics || [];
    const matchingTopics = preferredTopics.filter(topic => 
      topicKeywords.some(keyword => keyword.includes(topic.toLowerCase()))
    );

    if (matchingTopics.length > 0) {
      reasons.push(`Matches your interest in ${matchingTopics[0]}`);
    }

    // Time reasoning
    const timePreference = preferences.playTimePreference;
    if (timePreference === 'short' && metadata.estimatedTime.includes('6-8')) {
      reasons.push(`Perfect for a quick session`);
    } else if (timePreference === 'long' && metadata.estimatedTime.includes('12-15')) {
      reasons.push(`Great for a deep dive session`);
    }

    return reasons.length > 0 ? reasons[0] : 'Recommended based on your playing patterns';
  }

  // Helper methods

  static estimateUserLevel(userProfile) {
    const completed = userProfile.stacksCompleted || 0;
    const accuracy = userProfile.accuracy || 75;

    if (completed >= 8 && accuracy >= 85) return 4; // Expert
    if (completed >= 5 && accuracy >= 80) return 3; // Advanced  
    if (completed >= 2 || accuracy >= 70) return 2; // Intermediate
    return 1; // Beginner
  }

  static parseTimeEstimate(timeStr) {
    const match = timeStr.match(/(\d+)-(\d+)/);
    if (match) {
      return (parseInt(match[1]) + parseInt(match[2])) / 2;
    }
    return 10; // Default
  }

  static getCompletionRate(actionHistory) {
    const started = actionHistory.filter(a => a.action === 'stack_started').length;
    const completed = actionHistory.filter(a => a.action === 'stack_completed').length;
    return started > 0 ? completed / started : 0.8; // Default optimistic rate
  }

  static analyzeTopicPatterns(stackName, completedStacks) {
    // Simple keyword-based topic analysis
    const stackKeywords = stackName.toLowerCase().replace(/[_-]/g, ' ').split(' ');
    let topicScore = 0;

    completedStacks.forEach(completed => {
      const completedKeywords = completed.toLowerCase().replace(/[_-]/g, ' ').split(' ');
      const overlap = stackKeywords.filter(keyword => completedKeywords.includes(keyword));
      topicScore += overlap.length * 5;
    });

    return Math.min(20, topicScore);
  }

  static calculateTopicSimilarity(stackName, completedStacks) {
    if (completedStacks.length === 0) return 0;

    const stackKeywords = stackName.toLowerCase().replace(/[_-]/g, ' ').split(' ');
    let totalSimilarity = 0;

    completedStacks.forEach(completed => {
      const completedKeywords = completed.toLowerCase().replace(/[_-]/g, ' ').split(' ');
      const overlap = stackKeywords.filter(keyword => completedKeywords.includes(keyword));
      totalSimilarity += overlap.length / Math.max(stackKeywords.length, completedKeywords.length);
    });

    return totalSimilarity / completedStacks.length;
  }

  static getExplorationTendency(actionHistory) {
    const stacksSeen = new Set();
    actionHistory.forEach(action => {
      if (action.data && action.data.stackName) {
        stacksSeen.add(action.data.stackName);
      }
    });

    const totalActions = actionHistory.length;
    const uniqueStacks = stacksSeen.size;

    return totalActions > 0 ? uniqueStacks / totalActions : 0.5;
  }
}

export default SmartRecommendations;
