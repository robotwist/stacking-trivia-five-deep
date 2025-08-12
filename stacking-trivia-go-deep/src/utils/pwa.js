// PWA Service Worker Registration and Mobile Utilities

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        console.log('[PWA] Service Worker registered successfully:', registration.scope)
        
        // Auto-reload when a new service worker takes control
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return
          refreshing = true
          window.location.reload()
        })

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available; prefer auto-reload via controllerchange
                // showUpdateNotification()
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
        A new version of Deeply Trivial is available!
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
        Update
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
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 10000)
}

// Install prompt for PWA
export const handleInstallPrompt = () => {
  let deferredPrompt
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    
    // Show custom install button
    showInstallButton(deferredPrompt)
  })
  
  // Handle successful installation
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App was installed successfully')
    hideInstallButton()
    
    // Track installation
    if (window.gtag) {
      window.gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'PWA Installation'
      })
    }
  })
}

const showInstallButton = (prompt) => {
  // Only show if not already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return
  }
  
  const installBanner = document.createElement('div')
  installBanner.id = 'pwa-install-banner'
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #1f2937;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
      z-index: 10000;
      font-family: system-ui;
      text-align: center;
      max-width: 90vw;
      animation: slideUp 0.3s ease-out;
    ">
      <style>
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      </style>
      <div style="margin-bottom: 0.5rem; font-weight: bold; font-size: 1.1rem;">
        📱 Install Deeply Trivial
      </div>
      <div style="margin-bottom: 1rem; font-size: 0.9rem; opacity: 0.8;">
        Play offline and get the full app experience
      </div>
      <button id="install-pwa" style="
        background: #1f2937;
        color: #f59e0b;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        margin-right: 0.5rem;
        font-size: 1rem;
      ">
        Install App
      </button>
      <button id="dismiss-install" style="
        background: transparent;
        color: #1f2937;
        border: 1px solid #1f2937;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        opacity: 0.7;
      ">
        Not Now
      </button>
    </div>
  `
  
  document.body.appendChild(installBanner)
  
  // Handle install button
  installBanner.querySelector('#install-pwa').addEventListener('click', async () => {
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      console.log('[PWA] User choice:', outcome)
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt')
      }
    }
    installBanner.remove()
  })
  
  // Handle dismiss button
  installBanner.querySelector('#dismiss-install').addEventListener('click', () => {
    installBanner.remove()
  })
}

const hideInstallButton = () => {
  const banner = document.getElementById('pwa-install-banner')
  if (banner) {
    banner.remove()
  }
}

// Mobile-specific optimizations
export const initMobileOptimizations = () => {
  // Prevent zoom on input focus (iOS Safari)
  const meta = document.createElement('meta')
  meta.name = 'viewport'
  meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
  document.head.appendChild(meta)
  
  // Add iOS-specific meta tags
  const appleMobileCapable = document.createElement('meta')
  appleMobileCapable.name = 'apple-mobile-web-app-capable'
  appleMobileCapable.content = 'yes'
  document.head.appendChild(appleMobileCapable)
  
  const appleStatusBar = document.createElement('meta')
  appleStatusBar.name = 'apple-mobile-web-app-status-bar-style'
  appleStatusBar.content = 'black-translucent'
  document.head.appendChild(appleStatusBar)
  
  const appleTitle = document.createElement('meta')
  appleTitle.name = 'apple-mobile-web-app-title'
  appleTitle.content = 'Deeply Trivial'
  document.head.appendChild(appleTitle)
  
  // Add touch icons for iOS
  const touchIcon = document.createElement('link')
  touchIcon.rel = 'apple-touch-icon'
  touchIcon.href = '/pwa-icons/icon-192x192.png'
  document.head.appendChild(touchIcon)
  
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
