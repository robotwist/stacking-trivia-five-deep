/**
 * Performance monitoring utilities
 */
import React from 'react'

/**
 * Performance metrics tracker
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.startTimes = new Map()
  }

  /**
   * Start timing an operation
   * @param {string} name - Operation name
   */
  startTimer(name) {
    this.startTimes.set(name, performance.now())
  }

  /**
   * End timing an operation
   * @param {string} name - Operation name
   * @returns {number} Duration in milliseconds
   */
  endTimer(name) {
    const startTime = this.startTimes.get(name)
    if (!startTime) {
      console.warn(`No start time found for: ${name}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.metrics.set(name, duration)
    this.startTimes.delete(name)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }

  /**
   * Get all metrics
   * @returns {Object} Metrics object
   */
  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear()
    this.startTimes.clear()
  }

  /**
   * Log performance summary
   */
  logSummary() {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Performance Summary')
      for (const [name, duration] of this.metrics) {
        const status = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴'
        console.log(`${status} ${name}: ${duration.toFixed(2)}ms`)
      }
      console.groupEnd()
    }
  }
}

// Global instance
export const perfMonitor = new PerformanceMonitor()

/**
 * HOC for measuring component render time
 * @param {React.Component} WrappedComponent - Component to measure
 * @param {string} componentName - Name for logging
 * @returns {React.Component} Wrapped component
 */
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return function PerformanceTrackedComponent(props) {
    const startTime = performance.now()
    
    React.useEffect(() => {
      const renderTime = performance.now() - startTime
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms (>16ms)`)
      }
    }, [startTime])
    
    return <WrappedComponent {...props} />
  }
}

/**
 * Hook for measuring operation performance
 * @param {string} operationName - Name of the operation
 * @returns {Object} Performance tracking functions
 */
export const usePerformanceTracking = (operationName) => {
  const start = React.useCallback(() => {
    perfMonitor.startTimer(operationName)
  }, [operationName])

  const end = React.useCallback(() => {
    return perfMonitor.endTimer(operationName)
  }, [operationName])

  const measure = React.useCallback((fn) => {
    perfMonitor.startTimer(operationName)
    const result = fn()
    perfMonitor.endTimer(operationName)
    return result
  }, [operationName])

  return { start, end, measure }
}

/**
 * Monitor bundle loading performance
 */
export const trackBundleLoad = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0]
        if (navigation) {
          const metrics = {
            'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
            'TCP Connection': navigation.connectEnd - navigation.connectStart,
            'Request': navigation.responseStart - navigation.requestStart,
            'Response': navigation.responseEnd - navigation.responseStart,
            'DOM Processing': navigation.domContentLoadedEventStart - navigation.responseEnd,
            'Load Complete': navigation.loadEventEnd - navigation.navigationStart
          }

          if (process.env.NODE_ENV === 'development') {
            console.group('📈 Bundle Load Performance')
            Object.entries(metrics).forEach(([name, time]) => {
              console.log(`${name}: ${time.toFixed(2)}ms`)
            })
            console.groupEnd()
          }
        }
      }, 0)
    })
  }
}
