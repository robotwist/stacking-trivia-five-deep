import React from 'react';

class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Authentication Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 flex items-center justify-center p-4">
          <div className="bg-amber-100 dark:bg-amber-900/90 border-2 border-amber-400 rounded-lg p-8 max-w-md text-center sepia">
            <div className="text-4xl mb-4" style={{ fontFamily: 'Baskervville, serif' }}>⚠️</div>
            <h1 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-4" style={{ fontFamily: 'Baskervville, serif' }}>
              Authentication Error
            </h1>
            <p className="text-amber-700 dark:text-amber-300 mb-6">
              There was a problem with the authentication system. You can still play as a guest.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              style={{ fontFamily: 'Baskervville, serif' }}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
