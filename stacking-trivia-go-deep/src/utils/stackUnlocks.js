/**
 * Stack unlocking system - manages progression and reveals
 */

export class StackUnlockManager {
  constructor() {
    this.completedStacks = this.loadCompletedStacks();
    this.unlockedStacks = this.loadUnlockedStacks();
  }

  loadCompletedStacks() {
    const saved = localStorage.getItem('deeply-trivial-completed-stacks');
    return saved ? JSON.parse(saved) : {};
  }

  loadUnlockedStacks() {
    const saved = localStorage.getItem('deeply-trivial-unlocked-stacks');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure we return a Set, whether saved data is array or object
      return new Set(Array.isArray(parsed) ? parsed : Object.keys(parsed));
    }
    return new Set();
  }

  saveProgress() {
    localStorage.setItem('deeply-trivial-completed-stacks', JSON.stringify(this.completedStacks));
    // Convert Set to array for JSON storage
    localStorage.setItem('deeply-trivial-unlocked-stacks', JSON.stringify([...this.unlockedStacks]));
  }

  /**
   * Mark a stack as completed and check for unlocks
   */
  completeStack(stackKey, score, totalPossible) {
    const completion = {
      score,
      totalPossible,
      percentage: Math.round((score / totalPossible) * 100),
      completedAt: new Date().toISOString()
    };

    this.completedStacks[stackKey] = completion;
    
    // Check for unlocks
    const newUnlocks = this.checkUnlocks(stackKey, score);
    
    this.saveProgress();
    
    return newUnlocks;
  }

  /**
   * Check what stacks this completion unlocks
   */
  checkUnlocks(completedStackKey, score) {
    const newUnlocks = [];
    
    // Define unlock relationships
    const unlockRules = {
      'blade_runner': {
        unlocks: ['philip-k-dick-super'],
        requirement: { minScore: 80 }
      },
      'heroes-journey-super': {
        unlocks: ['character-name-origins', 'comparative-mythology'],
        requirement: { minScore: 120 }
      },
      'jesus-historical-mythic': {
        unlocks: ['gnostic-texts', 'comparative-christ-figures'],
        requirement: { minScore: 100 }
      },
      'philip-k-dick-super': {
        unlocks: ['cyberpunk-origins', 'simulation-theory'],
        requirement: { minScore: 120 }
      }
    };

    const rule = unlockRules[completedStackKey];
    if (rule && score >= rule.requirement.minScore) {
      rule.unlocks.forEach(stackKey => {
        if (!this.unlockedStacks.has(stackKey)) {
          this.unlockedStacks.add(stackKey);
          newUnlocks.push(stackKey);
        }
      });
    }

    return newUnlocks;
  }

  /**
   * Check if a stack is unlocked and available to play
   */
  isStackAvailable(stackKey) {
    // Super stacks and unlockable stacks need to be unlocked
    const restrictedStacks = [
      'philip-k-dick-super',
      'character-name-origins', 
      'comparative-mythology',
      'gnostic-texts',
      'comparative-christ-figures',
      'cyberpunk-origins',
      'simulation-theory'
    ];

    if (!restrictedStacks.includes(stackKey)) {
      return true; // Regular stacks are always available
    }

    return this.unlockedStacks.has(stackKey);
  }

  /**
   * Get unlock requirements for a locked stack
   */
  getUnlockRequirements(stackKey) {
    const requirements = {
      'philip-k-dick-super': {
        requires: 'Complete Blade Runner with 80+ points',
        prerequisiteStack: 'blade_runner',
        minScore: 80
      },
      'character-name-origins': {
        requires: 'Complete Hero\'s Journey with 120+ points',
        prerequisiteStack: 'heroes-journey-super',
        minScore: 120
      },
      'comparative-mythology': {
        requires: 'Complete Hero\'s Journey with 120+ points',
        prerequisiteStack: 'heroes-journey-super', 
        minScore: 120
      },
      'gnostic-texts': {
        requires: 'Complete Jesus stack with 100+ points',
        prerequisiteStack: 'jesus-historical-mythic',
        minScore: 100
      },
      'comparative-christ-figures': {
        requires: 'Complete Jesus stack with 100+ points',
        prerequisiteStack: 'jesus-historical-mythic',
        minScore: 100
      },
      'cyberpunk-origins': {
        requires: 'Complete Philip K. Dick with 120+ points',
        prerequisiteStack: 'philip-k-dick-super',
        minScore: 120
      },
      'simulation-theory': {
        requires: 'Complete Philip K. Dick with 120+ points', 
        prerequisiteStack: 'philip-k-dick-super',
        minScore: 120
      }
    };

    return requirements[stackKey];
  }

  /**
   * Get completion status for a stack
   */
  getStackCompletion(stackKey) {
    return this.completedStacks[stackKey] || null;
  }

  /**
   * Get all unlocked stacks
   */
  getUnlockedStacks() {
    return [...this.unlockedStacks];
  }

  /**
   * Get achievement-style unlock notifications
   */
  formatUnlockNotification(unlockedStackKey) {
    const stackTitles = {
      'philip-k-dick-super': 'Philip K. Dick: Reality\'s Interrogator',
      'character-name-origins': 'Character Name Origins: Encoded Destinies',
      'comparative-mythology': 'Comparative Mythology: Universal Patterns',
      'gnostic-texts': 'Gnostic Texts: Hidden Christianities',
      'comparative-christ-figures': 'Comparative Christ Figures: Global Saviors',
      'cyberpunk-origins': 'Cyberpunk Origins: Digital Dystopia Genesis',
      'simulation-theory': 'Simulation Theory: Are We Living in Code?'
    };

    return {
      title: '🔓 New Stack Unlocked!',
      stackTitle: stackTitles[unlockedStackKey],
      message: 'Your deep knowledge has revealed new mysteries to explore.',
      stackKey: unlockedStackKey
    };
  }
}

// Singleton instance
export const stackUnlockManager = new StackUnlockManager();
