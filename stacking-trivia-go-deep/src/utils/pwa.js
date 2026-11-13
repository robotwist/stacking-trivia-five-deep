// PWA Service Worker Registration and Mobile Utilities

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        console.log('[PWA] Service Worker registered successfully:', registration.scope)

        // Never reload on our own: a player could be mid-question. Offer a refresh instead.
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotification()
              }
            })
          }
        })
        
        return registration
        
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error)
      }
    })
  }
}

// Show update notification to user
const showUpdateNotification = () => {
  const notification = document.createElement('div')
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1f2937;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: system-ui;
      max-width: 300px;
    ">
      <div style="margin-bottom: 0.5rem; font-weight: bold;">
        🎮 Update Available
      </div>
      <div style="margin-bottom: 1rem; font-size: 0.9rem;">
        New stacks and fixes are ready. Refresh when you finish this question.
      </div>
      <button id="update-app" style="
        background: #f59e0b;
        color: #1f2937;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        margin-right: 0.5rem;
      ">
        Refresh
      </button>
      <button id="dismiss-update" style="
        background: transparent;
        color: #d1d5db;
        border: 1px solid #374151;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      ">
        Later
      </button>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // Handle update button
  notification.querySelector('#update-app').addEventListener('click', () => {
    window.location.reload()
  })
  
  // Handle dismiss button
  notification.querySelector('#dismiss-update').addEventListener('click', () => {
    notification.remove()
  })
}

// Install prompt: captured as early as possible, surfaced by <InstallAppButton />
export const INSTALL_AVAILABLE_EVENT = 'deepstack:install-available'
export const APP_INSTALLED_EVENT = 'deepstack:app-installed'

let deferredInstallPrompt = null

export const getDeferredInstallPrompt = () => deferredInstallPrompt

export const promptInstall = async () => {
  if (!deferredInstallPrompt) return 'unavailable'
  deferredInstallPrompt.prompt()
  const { outcome } = await deferredInstallPrompt.userChoice
  deferredInstallPrompt = null
  return outcome
}

export const isRunningStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

export const handleInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredInstallPrompt = e
    window.dispatchEvent(new Event(INSTALL_AVAILABLE_EVENT))
  })

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null
    window.dispatchEvent(new Event(APP_INSTALLED_EVENT))
    if (window.gtag) {
      window.gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'PWA Installation'
      })
    }
  })
}

// Mobile-specific optimizations
export const initMobileOptimizations = () => {
  // Handle device orientation changes
  let orientationTimeout
  window.addEventListener('orientationchange', () => {
    clearTimeout(orientationTimeout)
    orientationTimeout = setTimeout(() => {
      // Force repaint to handle orientation bugs
      document.body.style.height = '99%'
      requestAnimationFrame(() => {
        document.body.style.height = '100%'
      })
    }, 100)
  })
  
  // Add haptic feedback for supported devices
  if ('vibrate' in navigator) {
    window.hapticFeedback = {
      light: () => navigator.vibrate(50),
      medium: () => navigator.vibrate([50, 50, 50]),
      heavy: () => navigator.vibrate([100, 100, 100]),
      success: () => navigator.vibrate([50, 0, 50, 0, 100]),
      error: () => navigator.vibrate([100, 50, 100, 50, 100])
    }
  } else {
    window.hapticFeedback = {
      light: () => {},
      medium: () => {},
      heavy: () => {},
      success: () => {},
      error: () => {}
    }
  }
}

// Network status detection
export const initNetworkStatus = () => {
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline'
    document.body.classList.toggle('offline', !navigator.onLine)
    
    // Show/hide offline indicator
    let offlineIndicator = document.getElementById('offline-indicator')
    
    if (!navigator.onLine && !offlineIndicator) {
      offlineIndicator = document.createElement('div')
      offlineIndicator.id = 'offline-indicator'
      offlineIndicator.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #dc2626;
          color: white;
          padding: 0.5rem;
          text-align: center;
          font-size: 0.9rem;
          z-index: 10000;
          font-family: system-ui;
        ">
          📵 You're offline - Some features may be limited
        </div>
      `
      document.body.appendChild(offlineIndicator)
    } else if (navigator.onLine && offlineIndicator) {
      offlineIndicator.remove()
    }
    
    console.log('[PWA] Network status:', status)
  }
  
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  // Initial check
  updateOnlineStatus()
}

// Initialize all PWA features
export const initPWA = () => {
  registerServiceWorker()
  handleInstallPrompt()
  initMobileOptimizations()
  initNetworkStatus()
  
  console.log('[PWA] All PWA features initialized')
}
