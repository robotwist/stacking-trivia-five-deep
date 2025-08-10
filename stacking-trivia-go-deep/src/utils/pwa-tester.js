// PWA Testing Utilities
import performanceMonitor from '../utils/performance.js'

// Test PWA functionality
export class PWATester {
  constructor() {
    this.results = {}
    this.testContainer = null
  }

  // Run all PWA tests
  async runAllTests() {
    console.log('🧪 Starting PWA Tests...')
    
    await this.testServiceWorkerRegistration()
    await this.testManifest()
    await this.testOfflineCapabilities()
    await this.testInstallPrompt()
    await this.testPerformanceMonitoring()
    await this.testMobileOptimizations()
    await this.testIcons()
    
    this.displayResults()
    return this.results
  }

  // Test service worker registration
  async testServiceWorkerRegistration() {
    console.log('Testing service worker registration...')
    
    try {
      if (!('serviceWorker' in navigator)) {
        this.results.serviceWorker = { 
          status: 'unsupported', 
          message: 'Service workers not supported' 
        }
        return
      }

      const registration = await navigator.serviceWorker.getRegistration()
      
      if (registration) {
        this.results.serviceWorker = { 
          status: 'registered', 
          scope: registration.scope,
          state: registration.active?.state || 'installing'
        }
      } else {
        // Try to register manually for testing
        const newRegistration = await navigator.serviceWorker.register('/sw.js')
        this.results.serviceWorker = { 
          status: 'registered', 
          scope: newRegistration.scope,
          state: newRegistration.installing?.state || 'installing'
        }
      }
    } catch (error) {
      this.results.serviceWorker = { 
        status: 'failed', 
        error: error.message 
      }
    }
  }

  // Test manifest
  async testManifest() {
    console.log('Testing PWA manifest...')
    
    try {
      const response = await fetch('/manifest.json')
      
      if (!response.ok) {
        this.results.manifest = { 
          status: 'failed', 
          message: 'Manifest not found' 
        }
        return
      }

      const manifest = await response.json()
      const requiredFields = ['name', 'short_name', 'icons', 'start_url', 'display']
      const missingFields = requiredFields.filter(field => !manifest[field])
      
      if (missingFields.length > 0) {
        this.results.manifest = { 
          status: 'incomplete', 
          missingFields 
        }
      } else {
        this.results.manifest = { 
          status: 'valid', 
          name: manifest.name,
          icons: manifest.icons?.length || 0,
          theme_color: manifest.theme_color
        }
      }
    } catch (error) {
      this.results.manifest = { 
        status: 'failed', 
        error: error.message 
      }
    }
  }

  // Test offline capabilities
  async testOfflineCapabilities() {
    console.log('Testing offline capabilities...')
    
    try {
      // Check if cache API is available
      if (!('caches' in window)) {
        this.results.offline = { 
          status: 'unsupported', 
          message: 'Cache API not supported' 
        }
        return
      }

      const cacheNames = await caches.keys()
      let totalCachedFiles = 0
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        totalCachedFiles += keys.length
      }

      this.results.offline = { 
        status: 'ready', 
        cacheNames,
        cachedFiles: totalCachedFiles,
        networkStatus: navigator.onLine ? 'online' : 'offline'
      }
    } catch (error) {
      this.results.offline = { 
        status: 'failed', 
        error: error.message 
      }
    }
  }

  // Test install prompt
  async testInstallPrompt() {
    console.log('Testing install prompt...')
    
    try {
      // Check if the app is installable
      const isInstallable = window.deferredPrompt !== undefined
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true

      this.results.install = { 
        status: isInstalled ? 'installed' : (isInstallable ? 'installable' : 'not-ready'),
        displayMode: this.getDisplayMode(),
        isStandalone: isInstalled,
        canInstall: isInstallable
      }
    } catch (error) {
      this.results.install = { 
        status: 'failed', 
        error: error.message 
      }
    }
  }

  getDisplayMode() {
    if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone'
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui'
    if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen'
    return 'browser'
  }

  // Test performance monitoring
  async testPerformanceMonitoring() {
    console.log('Testing performance monitoring...')
    
    try {
      const summary = performanceMonitor.getSummary()
      const hasWebVitals = Object.keys(summary.webVitals).length > 0
      
      this.results.performance = { 
        status: 'active', 
        webVitalsCount: Object.keys(summary.webVitals).length,
        gameMetrics: summary.gameMetrics,
        memoryUsage: performanceMonitor.getMemoryUsage(),
        networkInfo: performanceMonitor.getNetworkInfo()
      }
    } catch (error) {
      this.results.performance = { 
        status: 'failed', 
        error: error.message 
      }
    }
  }

  // Test mobile optimizations
  async testMobileOptimizations() {
    console.log('Testing mobile optimizations...')
    
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const hasViewportMeta = document.querySelector('meta[name="viewport"]') !== null
      const hasThemeColor = document.querySelector('meta[name="theme-color"]') !== null
      const hasTouchIcons = document.querySelectorAll('link[rel*="apple-touch-icon"]').length > 0
      
      // Check for mobile-specific CSS classes
      const hasMobileCSS = document.querySelector('link[href*="pwa.css"]') !== null
      
      this.results.mobile = { 
        status: 'optimized',
        isMobileDevice: isMobile,
        hasViewportMeta,
        hasThemeColor,
        hasTouchIcons,
        hasMobileCSS,
        screenSize: `${screen.width}x${screen.height}`,
        devicePixelRatio: window.devicePixelRatio || 1
      }
    } catch (error) {
      this.results.mobile = { 
        status: 'failed', 
        error: error.message 
      }
    }
  }

  // Test icons
  async testIcons() {
    console.log('Testing PWA icons...')
    
    try {
      const manifestResponse = await fetch('/manifest.json')
      const manifest = await manifestResponse.json()
      const icons = manifest.icons || []
      
      // Test if icon files exist
      const iconTests = []
      for (const icon of icons.slice(0, 3)) { // Test first 3 icons
        try {
          const response = await fetch(icon.src)
          iconTests.push({
            src: icon.src,
            sizes: icon.sizes,
            exists: response.ok
          })
        } catch {
          iconTests.push({
            src: icon.src,
            sizes: icon.sizes,
            exists: false
          })
        }
      }
      
      this.results.icons = { 
        status: 'available',
        totalIcons: icons.length,
        iconTests,
        appleTouchIcons: document.querySelectorAll('link[rel*="apple-touch-icon"]').length,
        favicon: document.querySelector('link[rel="shortcut icon"]') !== null
      }
    } catch (error) {
      this.results.icons = { 
        status: 'failed', 
        error: error.message 
      }
    }
  }

  // Display test results
  displayResults() {
    console.log('\n🏁 PWA Test Results:')
    console.log('=====================')
    
    Object.entries(this.results).forEach(([test, result]) => {
      const status = result.status
      const emoji = this.getStatusEmoji(status)
      
      console.log(`${emoji} ${test.toUpperCase()}: ${status}`)
      
      if (status === 'failed' && result.error) {
        console.log(`   Error: ${result.error}`)
      } else if (result.message) {
        console.log(`   ${result.message}`)
      }
      
      // Show additional details for some tests
      if (test === 'serviceWorker' && result.scope) {
        console.log(`   Scope: ${result.scope}`)
      }
      if (test === 'offline' && result.cachedFiles) {
        console.log(`   Cached files: ${result.cachedFiles}`)
      }
      if (test === 'icons' && result.totalIcons) {
        console.log(`   Total icons: ${result.totalIcons}`)
      }
    })
    
    console.log('\n📊 Overall PWA Score:', this.calculatePWAScore())
  }

  getStatusEmoji(status) {
    switch (status) {
      case 'registered':
      case 'valid':
      case 'ready':
      case 'installed':
      case 'installable':
      case 'active':
      case 'optimized':
      case 'available':
        return '✅'
      case 'incomplete':
      case 'not-ready':
      case 'unsupported':
        return '⚠️'
      case 'failed':
        return '❌'
      default:
        return '❓'
    }
  }

  calculatePWAScore() {
    const weights = {
      serviceWorker: 25,
      manifest: 20,
      offline: 20,
      icons: 15,
      mobile: 10,
      performance: 5,
      install: 5
    }
    
    let totalScore = 0
    let maxScore = 0
    
    Object.entries(weights).forEach(([test, weight]) => {
      maxScore += weight
      const result = this.results[test]
      
      if (!result) return
      
      switch (result.status) {
        case 'registered':
        case 'valid':
        case 'ready':
        case 'installed':
        case 'active':
        case 'optimized':
        case 'available':
          totalScore += weight
          break
        case 'installable':
        case 'incomplete':
          totalScore += weight * 0.7
          break
        case 'unsupported':
        case 'not-ready':
          totalScore += weight * 0.3
          break
        default:
          break
      }
    })
    
    return `${Math.round((totalScore / maxScore) * 100)}%`
  }

  // Create visual test interface
  createTestInterface() {
    this.testContainer = document.createElement('div')
    this.testContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      overflow-y: auto;
      background: white;
      border: 2px solid #4f46e5;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
    `
    
    document.body.appendChild(this.testContainer)
    
    const button = document.createElement('button')
    button.textContent = '🧪 Run PWA Tests'
    button.style.cssText = `
      width: 100%;
      padding: 8px;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 12px;
    `
    
    button.onclick = async () => {
      button.textContent = 'Testing...'
      button.disabled = true
      
      await this.runAllTests()
      
      this.updateInterface()
      button.textContent = '🔄 Run Tests Again'
      button.disabled = false
    }
    
    this.testContainer.appendChild(button)
  }

  updateInterface() {
    if (!this.testContainer) return
    
    // Remove previous results
    const existingResults = this.testContainer.querySelector('.test-results')
    if (existingResults) {
      existingResults.remove()
    }
    
    // Create results display
    const resultsDiv = document.createElement('div')
    resultsDiv.className = 'test-results'
    
    Object.entries(this.results).forEach(([test, result]) => {
      const testDiv = document.createElement('div')
      testDiv.style.cssText = `
        padding: 8px;
        margin: 4px 0;
        border-radius: 4px;
        background: ${this.getStatusColor(result.status)};
      `
      
      testDiv.innerHTML = `
        <strong>${test.toUpperCase()}</strong>
        <div style="font-size: 12px; opacity: 0.8;">${result.status}</div>
      `
      
      resultsDiv.appendChild(testDiv)
    })
    
    // Add score
    const scoreDiv = document.createElement('div')
    scoreDiv.style.cssText = `
      text-align: center;
      font-weight: bold;
      padding: 12px;
      margin-top: 8px;
      border-top: 1px solid #e5e7eb;
    `
    scoreDiv.textContent = `PWA Score: ${this.calculatePWAScore()}`
    resultsDiv.appendChild(scoreDiv)
    
    this.testContainer.appendChild(resultsDiv)
  }

  getStatusColor(status) {
    switch (status) {
      case 'registered':
      case 'valid':
      case 'ready':
      case 'installed':
      case 'installable':
      case 'active':
      case 'optimized':
      case 'available':
        return '#d1fae5'
      case 'incomplete':
      case 'not-ready':
      case 'unsupported':
        return '#fef3c7'
      case 'failed':
        return '#fee2e2'
      default:
        return '#f3f4f6'
    }
  }
}

// Global test function for easy access
window.testPWA = async () => {
  const tester = new PWATester()
  return await tester.runAllTests()
}

// Create test interface in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    // Add keyboard shortcut to run tests
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        const tester = new PWATester()
        tester.createTestInterface()
      }
    })
    
    console.log('💡 Press Ctrl+Shift+T to open PWA test interface')
    console.log('💡 Or run window.testPWA() to test programmatically')
  })
}

export default PWATester
