// Direct game persistence functions for frontend
export class GamePersistence {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '';
    // Align token key with AuthContext which uses 'trivia_token'
    this.token = localStorage.getItem('trivia_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, config);
    return response.ok ? response.json() : { error: 'API failed' };
  }

  // Store game score in user profile (workaround using user endpoint)
  async saveGameScore(score, stackName) {
    try {
      // Get current user
      const profile = await this.request('/api/user/profile');
      if (profile.error) return { error: 'Not authenticated' };

      const currentScore = profile.user.total_score || 0;
      const currentGames = profile.user.games_played || 0;
      const currentBest = profile.user.best_single_stack || 0;

      // Update with new game data
      const updates = {
        total_score: currentScore + score,
        games_played: currentGames + 1,
        best_single_stack: Math.max(currentBest, score),
        completed_stacks: [...(profile.user.completed_stacks || []), stackName]
      };

      return await this.request('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Score save failed:', error);
      return { error: error.message };
    }
  }

  // Get simple leaderboard from user profiles
  async getLeaderboard() {
    try {
      // Fallback: use database health check to get basic leaderboard data
      const response = await fetch(`${this.baseURL}/api/db-health`);
      const healthData = await response.json();
      
      if (healthData.status === 'Database connected successfully') {
        // Database is working, but we can't access game endpoints
        // Return mock data for now
        return {
          leaderboard: [
            { username: 'Loading...', total_score: 0, games_played: 0 }
          ]
        };
      }
      
      return { leaderboard: [] };
    } catch {
      return { leaderboard: [] };
    }
  }
}

export const gamePersistence = new GamePersistence();
