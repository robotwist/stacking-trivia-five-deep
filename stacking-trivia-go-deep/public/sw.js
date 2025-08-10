const CACHE_NAME = 'deeply-trivial-v1.0.0'
const STATIC_CACHE = 'static-resources-v1'
const DYNAMIC_CACHE = 'dynamic-content-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  // Add built assets - these will be updated during build
]

// Trivia data to cache for offline play
const TRIVIA_ENDPOINTS = [
  '/api/health',
  // Trivia JSON files will be cached as they're requested
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[Service Worker] Static assets cached')
        self.skipWaiting()
      })
      .catch(err => {
        console.error('[Service Worker] Failed to cache static assets:', err)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cache)
            return caches.delete(cache)
          }
        })
      )
    }).then(() => {
      console.log('[Service Worker] Activated')
      self.clients.claim()
    })
  )
})

// Fetch event - implement cache strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network first, cache fallback
    event.respondWith(handleAPIRequest(request))
  } else if (url.pathname.endsWith('.json')) {
    // Trivia data - Cache first, network fallback
    event.respondWith(handleTriviaData(request))
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico)$/)) {
    // Static assets - Cache first
    event.respondWith(handleStaticAssets(request))
  } else {
    // HTML pages - Network first, cache fallback
    event.respondWith(handlePageRequest(request))
  }
})

// Network first strategy for API requests
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful API responses (except mutations)
      if (request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE)
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    }
    
    // If network fails, try cache
    throw new Error('Network response not ok')
    
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache for:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for API failures
    return new Response(JSON.stringify({ 
      error: 'Offline - this feature requires internet connection',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Cache first strategy for trivia data
async function handleTriviaData(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    console.log('[Service Worker] Serving trivia data from cache:', request.url)
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      console.log('[Service Worker] Cached trivia data:', request.url)
    }
    
    return networkResponse
    
  } catch (error) {
    console.error('[Service Worker] Failed to fetch trivia data:', request.url)
    
    // Return a basic error response for missing trivia data
    return new Response(JSON.stringify({
      title: "Offline Content",
      questions: [
        {
          q: "This content requires an internet connection. Please check your network and try again.",
          a: ["OK"]
        }
      ]
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Cache first strategy for static assets
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.error('[Service Worker] Failed to fetch static asset:', request.url)
    // Let the browser handle the failure
    return fetch(request)
  }
}

// Network first strategy for page requests
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[Service Worker] Network failed for page, trying cache:', request.url)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return cached index.html for SPA routing
    const indexResponse = await caches.match('/')
    if (indexResponse) {
      return indexResponse
    }
    
    // Fallback offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Deeply Trivial - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
              color: #f9fafb;
              text-align: center;
              padding: 2rem;
            }
            .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
            .offline-title { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; }
            .offline-message { font-size: 1.1rem; opacity: 0.8; max-width: 600px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="offline-icon">📱</div>
          <h1 class="offline-title">You're Offline</h1>
          <p class="offline-message">
            Deeply Trivial works best with an internet connection. 
            Check your network connection and try again to access all trivia categories and features.
          </p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Background sync for when connection is restored
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync triggered:', event.tag)
  
  if (event.tag === 'score-sync') {
    event.waitUntil(syncScores())
  }
})

// Sync pending scores when online
async function syncScores() {
  try {
    // Get pending scores from IndexedDB or localStorage
    const pendingScores = JSON.parse(localStorage.getItem('pendingScores') || '[]')
    
    for (const score of pendingScores) {
      try {
        await fetch('/api/game/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(score)
        })
        
        console.log('[Service Worker] Synced score:', score)
      } catch (error) {
        console.error('[Service Worker] Failed to sync score:', error)
      }
    }
    
    // Clear synced scores
    localStorage.removeItem('pendingScores')
    
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error)
  }
}

// Push notifications (future enhancement)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New trivia challenges available!',
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'play',
        title: 'Play Now',
        icon: '/pwa-icons/play-action.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/pwa-icons/close-action.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Deeply Trivial', options)
  )
})

console.log('[Service Worker] Loaded successfully')
