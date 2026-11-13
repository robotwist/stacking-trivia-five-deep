// Deeply Trivial service worker.
// At build time the Vite plugin in vite.config.js replaces BUILD_ID and PRECACHE_URLS
// with the hashed bundle, so the whole game (every stack is bundled JS) works offline
// after the first visit.
const BUILD_ID = '__BUILD_ID__'
const PRECACHE_URLS = /* __PRECACHE_URLS__ */ []

const SHELL_CACHE = `deeply-trivial-shell-${BUILD_ID}`
const RUNTIME_CACHE = `deeply-trivial-runtime-${BUILD_ID}`
const APP_SHELL_URL = '/'

// If any precache request fails, the install rejects and the browser retries on a later visit,
// so a half-cached build never takes over.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll([APP_SHELL_URL, ...PRECACHE_URLS]))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name !== SHELL_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }

  event.respondWith(cacheFirst(request))
})

// Fresh HTML when online; the cached app shell when offline. The SPA routes
// /play, /join, and /host itself, so every navigation can fall back to '/'.
async function handleNavigation(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE)
      cache.put(APP_SHELL_URL, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(APP_SHELL_URL, { ignoreVary: true })
    if (cached) return cached
    return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html' } })
  }
}

// ignoreVary: module scripts are requested with an Origin header the precache requests lacked,
// so a "Vary: Origin" response would otherwise never match and the app would load blank offline.
async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreVary: true })
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    return Response.error()
  }
}

const OFFLINE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Deeply Trivial — offline</title>
<style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#111827;color:#f9fafb;text-align:center;padding:2rem}h1{color:#fbbf24}</style>
</head><body><h1>You're offline</h1><p>Open Deeply Trivial once while connected and every stack will be ready to play offline after that.</p></body></html>`

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : "Today's stack is ready. How deep can you go?",
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: { url: '/play?daily=1' }
  }
  event.waitUntil(self.registration.showNotification('Deeply Trivial', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || '/'))
})
