/**
 * Error boundary component for graceful error handling
 */
import React, { Component } from 'react'

class GameErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Game Error Boundary')
      console.error('Error:', error)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development'
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-amber-900 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-amber-100/90 rounded-sm border-2 border-amber-300 p-8 text-center shadow-xl">
            <div className="text-6xl mb-6">🎭</div>
            <h1 className="text-3xl font-bold mb-4 text-amber-800">
              Something Went Awry!
            </h1>
            <p className="text-lg mb-6 text-amber-700 leading-relaxed">
              Our Victorian contraption has encountered a mechanical difficulty. 
              Fear not - we shall endeavor to restore order forthwith!
            </p>
            
            {isDev && this.state.error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded text-left text-sm text-red-800">
                <div className="font-semibold mb-2">Error Details:</div>
                <div className="font-mono text-xs">
                  {this.state.error.toString()}
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                disabled={this.state.retryCount >= 3}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-sm font-semibold transition-colors"
              >
                {this.state.retryCount < 3 ? 'Try Again' : 'Max Retries Reached'}
              </button>
              
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-sm font-semibold transition-colors"
              >
                Reload Page
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-sm font-semibold transition-colors"
              >
                Go Back
              </button>
            </div>
            
            {this.props.onError && (
              <button
                onClick={() => this.props.onError(this.state.error)}
                className="mt-4 text-sm text-amber-600 hover:text-amber-800 underline"
              >
                Report This Issue
              </button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default GameErrorBoundary
