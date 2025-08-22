// Railway Backend API Client
class RailwayAPIClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    this.token = localStorage.getItem('auth_token');
    
    // Debug logging
    console.log('🚂 RailwayAPI Client initialized with baseURL:', this.baseURL);
    console.log('🌍 Environment variables:', {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE
    });
  }

  // Helper method to make authenticated requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    console.log(`🌐 Making API request to: ${url}`);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ API Error ${response.status}:`, error);
        throw new Error(`API Error: ${response.status} - ${error}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error(`❌ API request failed: ${endpoint}`, error);
      
      // Check if it's a network/connection error
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Backend not available - please check your connection');
      }
      
      throw error;
    }
  }

  // Authentication methods
  async signup(username, email, password) {
    const response = await this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(username, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    await this.request('/api/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // User methods
  async getProfile() {
    return await this.request('/api/user/profile');
  }

  async updateProfile(updates) {
    return await this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Game methods
  async createGameSession(sessionType = 'single-player') {
    return await this.request('/api/game/session', {
      method: 'POST',
      body: JSON.stringify({ sessionType }),
    });
  }

  async updateGameSession(sessionId, updates) {
    return await this.request(`/api/game/session/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async recordStackResult(sessionId, stackResult) {
    return await this.request(`/api/game/session/${sessionId}/stack`, {
      method: 'POST',
      body: JSON.stringify(stackResult),
    });
  }

  async getGameHistory() {
    return await this.request('/api/game/history');
  }

  async getLeaderboard(limit = 10) {
    return await this.request(`/api/game/leaderboard?limit=${limit}`);
  }

  async getUserStats() {
    return await this.request('/api/game/stats');
  }

  // Health checks
  async checkHealth() {
    return await this.request('/api/health');
  }

  async checkDatabaseHealth() {
    return await this.request('/api/db-health');
  }

  // Test connection method for debugging
  async testConnection() {
    console.log('🔍 Testing backend connection...');
    console.log('📍 Base URL:', this.baseURL);
    console.log('🌍 Environment:', import.meta.env.MODE);
    
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend is working:', data);
        return { success: true, data };
      } else {
        console.log('❌ Backend returned error status:', response.status);
        return { success: false, status: response.status };
      }
    } catch (error) {
      console.log('❌ Network error:', error.message);
      console.log('❌ Error type:', error.constructor.name);
      return { success: false, error: error.message };
    }
  }

  // Token management
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Create and export singleton instance
export const railwayAPI = new RailwayAPIClient();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.railwayAPI = railwayAPI;
  window.testBackendConnection = () => railwayAPI.testConnection();
}

// React hook for using the API client
export const useRailwayAPI = () => {
  return railwayAPI;
};

export default RailwayAPIClient;
