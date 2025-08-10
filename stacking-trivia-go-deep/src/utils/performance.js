// Performance monitoring and analytics utilities
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.initialized = false
    this.debug = process.env.NODE_ENV === 'development'
  }

  init() {
    if (this.initialized) return
    
    this.initialized = true
    this.setupWebVitals()
    this.setupCustomMetrics()
    this.setupErrorTracking()
    this.setupUserTiming()
    
    if (this.debug) {
      console.log('[Performance] Monitoring initialized')
    }
  }

  // Core Web Vitals monitoring
  setupWebVitals() {
    const handleVital = (metric) => {
      this.metrics[metric.name] = metric.value
      this.sendMetric(metric)
      
      if (this.debug) {
        console.log(`[Performance] ${metric.name}:`, metric.value, metric.rating)
      }
    }

    onCLS(handleVital)
    onINP(handleVital)
    onFCP(handleVital)
    onLCP(handleVital)
    onTTFB(handleVital)
  }

  // Custom trivia game metrics
  setupCustomMetrics() {
    this.startTime = performance.now()
    this.gameMetrics = {
      questionsAnswered: 0,
      correctAnswers: 0,
      totalGameTime: 0,
      averageResponseTime: 0,
      stacksCompleted: 0,
      categoryDistribution: {}
    }
  }

  // Error tracking
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: Date.now()
      })
    })
  }

  // User timing API for custom measurements
  setupUserTiming() {
    if (!performance.mark || !performance.measure) {
      console.warn('[Performance] User Timing API not supported')
      return
    }

    // Mark key application events
    this.mark('app-start')
  }

  // Mark performance events
  mark(name, detail = null) {
    if (!performance.mark) return
    
    try {
      performance.mark(name, detail ? { detail } : undefined)
    } catch (error) {
      console.warn(`[Performance] Failed to mark ${name}:`, error)
    }
  }

  // Measure performance between marks
  measure(name, startMark, endMark) {
    if (!performance.measure) return

    try {
      const measurement = performance.measure(name, startMark, endMark)
      this.sendMetric({
        name: `custom-${name}`,
        value: measurement.duration,
        unit: 'milliseconds'
      })
      
      if (this.debug) {
        console.log(`[Performance] ${name}:`, measurement.duration, 'ms')
      }
      
      return measurement.duration
    } catch (error) {
      console.warn(`[Performance] Failed to measure ${name}:`, error)
    }
  }

  // Track game-specific metrics
  trackGameEvent(event, data = {}) {
    const timestamp = performance.now()
    
    switch (event) {
      case 'question-start':
        this.mark(`question-${data.questionId}-start`)
        break
        
      case 'question-answer':
        this.mark(`question-${data.questionId}-end`)
        const responseTime = this.measure(
          `question-${data.questionId}-response`,
          `question-${data.questionId}-start`,
          `question-${data.questionId}-end`
        )
        
        this.gameMetrics.questionsAnswered++
        if (data.correct) this.gameMetrics.correctAnswers++
        
        // Update average response time
        this.updateAverageResponseTime(responseTime)
        break
        
      case 'stack-complete':
        this.gameMetrics.stacksCompleted++
        this.gameMetrics.categoryDistribution[data.category] = 
          (this.gameMetrics.categoryDistribution[data.category] || 0) + 1
        break
        
      case 'game-complete':
        this.gameMetrics.totalGameTime = timestamp - this.startTime
        this.sendGameSummary()
        break
    }
  }

  updateAverageResponseTime(newTime) {
    if (!newTime) return
    
    const totalQuestions = this.gameMetrics.questionsAnswered
    const currentAverage = this.gameMetrics.averageResponseTime
    
    this.gameMetrics.averageResponseTime = 
      (currentAverage * (totalQuestions - 1) + newTime) / totalQuestions
  }

  // Track errors
  trackError(error) {
    this.sendMetric({
      name: 'error',
      type: error.type,
      message: error.message,
      filename: error.filename,
      timestamp: error.timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent
    })

    if (this.debug) {
      console.error('[Performance] Error tracked:', error)
    }
  }

  // Send metrics to analytics service
  sendMetric(metric) {
    // In development, just log
    if (this.debug) {
      console.log('[Performance] Metric:', metric)
      return
    }

    // In production, send to analytics service
    try {
      // Google Analytics 4 example
      if (typeof gtag !== 'undefined') {
        gtag('event', metric.name, {
          custom_parameter: metric.value,
          metric_type: metric.name,
          metric_value: metric.value,
          event_category: 'performance'
        })
      }

      // Send to your own analytics endpoint
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metric,
          timestamp: Date.now(),
          url: window.location.href,
          session: this.getSessionId()
        })
      }).catch(error => {
        console.warn('[Performance] Failed to send metric:', error)
      })
    } catch (error) {
      console.warn('[Performance] Error sending metric:', error)
    }
  }

  sendGameSummary() {
    const summary = {
      ...this.gameMetrics,
      accuracyRate: this.gameMetrics.correctAnswers / this.gameMetrics.questionsAnswered,
      gameEndTimestamp: Date.now(),
      webVitals: this.metrics
    }

    this.sendMetric({
      name: 'game-session-complete',
      ...summary
    })
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('performance-session-id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('performance-session-id', sessionId)
    }
    return sessionId
  }

  // Get current performance summary
  getSummary() {
    return {
      webVitals: this.metrics,
      gameMetrics: this.gameMetrics,
      timestamp: Date.now()
    }
  }

  // Manual performance measurement for React components
  measureComponent(componentName, fn) {
    const startMark = `${componentName}-start`
    const endMark = `${componentName}-end`
    
    this.mark(startMark)
    const result = fn()
    this.mark(endMark)
    
    this.measure(`${componentName}-render`, startMark, endMark)
    
    return result
  }

  // Memory usage tracking
  getMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSMemorySize: performance.memory.usedJSMemorySize,
        totalJSMemorySize: performance.memory.totalJSMemorySize,
        jsMemoryLimit: performance.memory.jsMemoryLimit
      }
    }
    return null
  }

  // Network information
  getNetworkInfo() {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      }
    }
    return null
  }

  // Device information
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: screen.width,
      screenHeight: screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor()

// React hook for component performance tracking
export const usePerformanceTracking = (componentName) => {
  const trackEvent = (event, data) => {
    performanceMonitor.trackGameEvent(event, { component: componentName, ...data })
  }

  const measure = (fn, operation = 'operation') => {
    return performanceMonitor.measureComponent(`${componentName}-${operation}`, fn)
  }

  return { trackEvent, measure }
}

// Export the monitor instance
export default performanceMonitor
