import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('trivia_token');
      const userData = localStorage.getItem('trivia_user');
      
      if (token && userData) {
        // Verify token is still valid
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setUser(JSON.parse(userData));
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('trivia_token');
          localStorage.removeItem('trivia_user');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username, email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store auth data
      localStorage.setItem('trivia_token', data.token);
      localStorage.setItem('trivia_user', JSON.stringify(data.user));
      setUser(data.user);
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store auth data
      localStorage.setItem('trivia_token', data.token);
      localStorage.setItem('trivia_user', JSON.stringify(data.user));
      setUser(data.user);
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    updateUserStats,
    getCompletedStacks,
    markStackCompleted,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
