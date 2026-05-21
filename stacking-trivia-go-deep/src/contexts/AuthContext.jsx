import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { railwayAPI } from '../services/railwayAPI';

const GUEST_SESSION_KEY = 'trivia_guest_session';

const AuthContext = createContext();

export function createGuestUser() {
  return {
    uid: 'guest',
    username: 'Guest',
    isGuest: true,
    total_score: 0,
    games_played: 0,
    current_streak: 0,
    correct_answers: 0,
    total_questions: 0,
    global_rank: null,
    created_at: new Date().toISOString(),
  };
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('🏗️ AuthProvider: Component initializing...');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('📊 AuthProvider: Initial state set - loading:', true, 'user:', null);

  // Check for existing session on app load
  useEffect(() => {
    console.log('🚀 AuthProvider: useEffect triggered - starting auth check...');
    
    // Call the auth check function
    checkAuthStatus().catch(error => {
      console.error('💥 AuthProvider: checkAuthStatus promise rejected:', error);
      setLoading(false); // Ensure loading is cleared even if checkAuthStatus fails
    });
    
    // Failsafe: ensure loading state doesn't hang forever
    const failsafe = setTimeout(() => {
      console.log('⏰ AuthProvider: Failsafe timeout triggered (10s) - forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second failsafe
    
    return () => {
      console.log('🧹 AuthProvider: useEffect cleanup - clearing failsafe timeout');
      clearTimeout(failsafe);
    };
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔍 AuthContext: checkAuthStatus started');
    try {
      console.log('🔍 AuthContext: Getting stored tokens...');
      const token = localStorage.getItem('trivia_token');
      const userData = localStorage.getItem('trivia_user');
      
      console.log('🔍 AuthContext: token exists?', !!token, 'userData exists?', !!userData);
      
      const guestSession = sessionStorage.getItem(GUEST_SESSION_KEY);
      if (guestSession === '1') {
        setUser(createGuestUser());
        return;
      }

      if (token && userData) {
        console.log('🔍 AuthContext: Found stored auth data, verifying...');
        // Verify token is still valid - handle missing backend gracefully with timeout
        try {
          console.log('🔍 AuthContext: Creating fetch request...');
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('⏰ AuthContext: Fetch timeout triggered (5s)');
            controller.abort();
          }, 5000); // 5 second timeout
          
          console.log('🌐 AuthContext: Sending auth verify request...');
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          console.log('✅ AuthContext: Verification response received', response.status);
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              console.log('📄 AuthContext: Valid JSON response, setting user');
              setUser(JSON.parse(userData));
            } else {
              // Backend not available, but keep user logged in locally for offline mode
              console.log('🏠 AuthContext: Non-JSON response, using local session');
              setUser(JSON.parse(userData));
            }
          } else {
            // Token is invalid, clear storage
            console.log('❌ AuthContext: Token invalid, clearing auth');
            localStorage.removeItem('trivia_token');
            localStorage.removeItem('trivia_user');
          }
        } catch (networkError) {
          // Network error or timeout - keep user logged in locally
          console.log('🌐 AuthContext: Network error during auth check, using local session:', networkError.name, networkError.message);
          try {
            console.log('🔄 AuthContext: Attempting to parse stored user data...');
            const parsedUser = JSON.parse(userData);
            console.log('👤 AuthContext: Successfully parsed user, setting state');
            setUser(parsedUser);
          } catch (parseError) {
            console.error('💥 AuthContext: Failed to parse stored user data:', parseError);
            // Clear corrupted data
            localStorage.removeItem('trivia_token');
            localStorage.removeItem('trivia_user');
          }
        }
      } else {
        console.log('🚫 AuthContext: No stored auth data found');
      }
    } catch (error) {
      console.error('💥 AuthContext: Auth check failed:', error);
    } finally {
      console.log('🏁 AuthContext: Setting loading to false');
      setLoading(false);
    }
  };

  const signup = async (username, email, password) => {
    console.log('📝 AuthContext: Signup attempt for:', { username, email });
    try {
      setError(null);
      setLoading(true);
      
      // For development/demo purposes, create a mock user when backend is unavailable
      try {
        const response = await railwayAPI.signup(username, email, password);

        // Store auth data
        localStorage.setItem('trivia_token', response.token);
        localStorage.setItem('trivia_user', JSON.stringify(response.user));
        setUser(response.user);
        
        console.log('✅ AuthContext: Signup successful via backend');
        return response;
      } catch (networkError) {
        if (!import.meta.env.VITE_DEMO_MODE) throw networkError
        console.log('🏠 AuthContext: Backend unavailable, creating local demo account (demo mode)');
        
        // Create a demo user for offline mode
        const demoUser = {
          uid: `demo_${Date.now()}`,
          username,
          email,
          total_score: 0,
          games_played: 0,
          current_streak: 0,
          correct_answers: 0,
          total_questions: 0,
          global_rank: Math.floor(Math.random() * 1000) + 1,
          created_at: new Date().toISOString()
        };
        
        const demoToken = `demo_token_${Date.now()}`;
        
        // Store demo auth data
        localStorage.setItem('trivia_token', demoToken);
        localStorage.setItem('trivia_user', JSON.stringify(demoUser));
        setUser(demoUser);
        
        console.log('✅ AuthContext: Demo account created successfully');
        return { user: demoUser, token: demoToken };
      }
    } catch (error) {
      console.error('❌ AuthContext: Signup failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    console.log('🔑 AuthContext: Login attempt for:', username);
    try {
      setError(null);
      setLoading(true);
      
      // For development/demo purposes, handle login when backend is unavailable
      try {
        const response = await railwayAPI.login(username, password);

        // Store auth data
        localStorage.setItem('trivia_token', response.token);
        localStorage.setItem('trivia_user', JSON.stringify(response.user));
        setUser(response.user);
        
        console.log('✅ AuthContext: Login successful via backend');
        return response;
      } catch (networkError) {
        if (!import.meta.env.VITE_DEMO_MODE) throw networkError
        console.log('🏠 AuthContext: Backend unavailable, creating local demo account (demo mode)');
        
        // Create a demo user for offline mode
        const demoUser = {
          uid: `demo_${Date.now()}`,
          username,
          email: `${username}@demo.local`,
          total_score: Math.floor(Math.random() * 5000) + 1000,
          games_played: Math.floor(Math.random() * 50) + 10,
          current_streak: Math.floor(Math.random() * 10) + 1,
          correct_answers: Math.floor(Math.random() * 200) + 50,
          total_questions: Math.floor(Math.random() * 300) + 100,
          global_rank: Math.floor(Math.random() * 1000) + 1,
          created_at: new Date().toISOString()
        };
        
        const demoToken = `demo_token_${Date.now()}`;
        
        // Store demo auth data
        localStorage.setItem('trivia_token', demoToken);
        localStorage.setItem('trivia_user', JSON.stringify(demoUser));
        setUser(demoUser);
        
        console.log('✅ AuthContext: Demo login successful');
        return { user: demoUser, token: demoToken };
      }
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const enterGuestMode = useCallback(() => {
    sessionStorage.setItem(GUEST_SESSION_KEY, '1');
    localStorage.removeItem('trivia_token');
    localStorage.removeItem('trivia_user');
    setUser(createGuestUser());
    setError(null);
    setLoading(false);
  }, []);

  const logout = () => {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
    localStorage.removeItem('trivia_token');
    localStorage.removeItem('trivia_user');
    setUser(null);
    setError(null);
  };

  const updateUserStats = (newStats) => {
    const updatedUser = { ...user, ...newStats };
    setUser(updatedUser);
    localStorage.setItem('trivia_user', JSON.stringify(updatedUser));
  };

  const getCompletedStacks = async () => {
    try {
      const token = localStorage.getItem('trivia_token');
      if (!token) return []; // No token, return empty array
      
      const response = await fetch('/api/user/completed-stacks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.completedStacks || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch completed stacks:', error);
      return []; // Return empty array on network error
    }
  };

  const markStackCompleted = async (stackName, score) => {
    if (user?.isGuest) {
      return;
    }
    try {
      const token = localStorage.getItem('trivia_token');
      if (!token) {
        console.log('No auth token, skipping stack completion tracking');
        return; // Gracefully handle no authentication
      }
      
      const response = await fetch('/api/user/complete-stack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stackName, score })
      });
      
      if (response.ok) {
        const data = await response.json();
        updateUserStats(data.user);
        return data;
      }
    } catch (error) {
      console.error('Failed to mark stack completed:', error);
      // Don't throw error, just log it - game should continue
    }
  };

  const isGuest = !!user?.isGuest;

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    enterGuestMode,
    updateUserStats,
    getCompletedStacks,
    markStackCompleted,
    isGuest,
    isAuthenticated: !!user && !isGuest,
    canPlay: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
