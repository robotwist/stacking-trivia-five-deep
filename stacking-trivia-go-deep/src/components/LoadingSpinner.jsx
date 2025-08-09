/**
 * Optimized loading component with progressive states
 */
import { memo } from 'react'

const LoadingSpinner = memo(function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  progress = null,
  darkMode = false 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${
      darkMode ? 'text-amber-200' : 'text-amber-800'
    }`}>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className={`w-full h-full border-4 border-transparent border-t-current border-r-current rounded-full ${
          darkMode ? 'border-t-amber-400 border-r-amber-400' : 'border-t-amber-600 border-r-amber-600'
        }`}></div>
      </div>
      
      {message && (
        <p className="mt-4 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
      
      {progress !== null && (
        <div className={`w-48 h-2 mt-3 rounded-full overflow-hidden ${
          darkMode ? 'bg-amber-800/50' : 'bg-amber-200'
        }`}>
          <div 
            className={`h-full transition-all duration-300 ${
              darkMode ? 'bg-amber-400' : 'bg-amber-600'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </div>
  )
})

export default LoadingSpinner
