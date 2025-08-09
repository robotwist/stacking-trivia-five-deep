import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, mode: initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { signup, login, loading } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLocalError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        // Validation for signup
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (!formData.email.includes('@')) {
          throw new Error('Please enter a valid email address');
        }

        await signup(formData.username, formData.email, formData.password);
      } else {
        await login(formData.username, formData.password);
      }
      
      onClose(); // Close modal on success
      
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setLocalError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" aria-describedby="auth-modal-description">
      <div className="bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-50 dark:from-amber-900/90 dark:via-yellow-900/90 dark:to-amber-800/90 rounded-lg border-2 border-amber-400 p-8 max-w-md w-full sepia shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-4" style={{ fontFamily: 'Baskervville, serif' }} aria-hidden="true">— ❦ —</div>
                    <h1 id="auth-modal-title" className="text-2xl font-bold text-amber-800 dark:text-amber-200" style={{ fontFamily: 'Baskervville, serif' }}>
            {isLogin ? 'Login to DeepStack' : 'Join DeepStack'}
          </h1>
          <p id="auth-modal-description" className="text-amber-600 dark:text-amber-300 mt-2">
            {mode === 'login' 
              ? 'Sign in to track your scores and continue your journey'
              : 'Create an account to save your progress and compete on leaderboards'
            }
          </p>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="bg-red-100 dark:bg-red-800/30 border-2 border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 p-3 rounded-lg mb-4 text-center">
            {localError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-800/50 text-amber-900 dark:text-amber-100 focus:outline-none focus:border-amber-500"
              style={{ fontFamily: 'Baskervville, serif' }}
              placeholder="Your username"
            />
          </div>

          {/* Email (signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-800/50 text-amber-900 dark:text-amber-100 focus:outline-none focus:border-amber-500"
                style={{ fontFamily: 'Baskervville, serif' }}
                placeholder="your.email@example.com"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-800/50 text-amber-900 dark:text-amber-100 focus:outline-none focus:border-amber-500"
              style={{ fontFamily: 'Baskervville, serif' }}
              placeholder="Your password"
            />
          </div>

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-800/50 text-amber-900 dark:text-amber-100 focus:outline-none focus:border-amber-500"
                style={{ fontFamily: 'Baskervville, serif' }}
                placeholder="Confirm your password"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 disabled:from-amber-400 disabled:to-amber-500 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 sepia hover:sepia-0 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Baskervville, serif' }}
          >
            {isSubmitting ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="text-center mt-6">
          <p className="text-amber-600 dark:text-amber-300 mb-2">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            onClick={switchMode}
            className="text-amber-700 dark:text-amber-200 font-semibold hover:underline"
            style={{ fontFamily: 'Baskervville, serif' }}
          >
            {mode === 'login' ? 'Sign up here' : 'Sign in here'}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 text-2xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
