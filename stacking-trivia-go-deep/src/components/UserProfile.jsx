import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const UserProfile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 sepia hover:sepia-0"
            style={{ fontFamily: 'Baskervville, serif' }}
          >
            Sign In
          </button>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          mode="login"
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center gap-2 bg-amber-100 dark:bg-amber-800/50 hover:bg-amber-200 dark:hover:bg-amber-700/50 px-4 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-600 transition-all duration-200"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-semibold text-amber-800 dark:text-amber-200" style={{ fontFamily: 'Baskervville, serif' }}>
              {user.username}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400">
              Score: {user.total_score || 0}
            </div>
          </div>
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Profile Dropdown */}
        {showProfile && (
          <div className="absolute right-0 mt-2 w-64 bg-amber-50 dark:bg-amber-900/90 border-2 border-amber-300 dark:border-amber-600 rounded-lg shadow-xl z-50 sepia">
            <div className="p-4">
              
              {/* User Info */}
              <div className="text-center mb-4 pb-4 border-b-2 border-amber-200 dark:border-amber-700">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-amber-800 dark:text-amber-200" style={{ fontFamily: 'Baskervville, serif' }}>
                  {user.username}
                </h3>
                {user.email && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">{user.email}</p>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700 dark:text-amber-300">Total Score:</span>
                  <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">{user.total_score || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700 dark:text-amber-300">Games Played:</span>
                  <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">{user.games_played || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700 dark:text-amber-300">Best Score:</span>
                  <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">{user.best_single_stack || 0}</span>
                </div>
                {user.created_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-amber-700 dark:text-amber-300">Member Since:</span>
                    <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t-2 border-amber-200 dark:border-amber-700">
                <button
                  onClick={() => {
                    logout();
                    setShowProfile(false);
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                  style={{ fontFamily: 'Baskervville, serif' }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showProfile && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfile(false)}
        />
      )}
    </>
  );
};

export default UserProfile;
