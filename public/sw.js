const CACHE_NAME = 'flexilog-v2'
const STATIC_CACHE = 'flexilog-static-v2'
const PAGE_CACHE = 'flexilog-pages-v2'
const API_CACHE = 'flexilog-api-v2'

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
]

// App shell pages to pre-cache
const PRECACHE_PAGES = [
  '/',
  '/dashboard',
  '/exercises',
  '/workout/live',
  '/ai-coach',
  '/profile',
]

// Install — pre-cache static assets and app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS)),
      caches.open(PAGE_CACHE).then((cache) => cache.addAll(PRECACHE_PAGES)),
    ])
  )
  self.skipWaiting()
})

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  const validCaches = new Set([CACHE_NAME, STATIC_CACHE, PAGE_CACHE, API_CACHE])
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !validCaches.has(name))
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

// Fetch — strategy depends on request type
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Skip cross-origin requests (e.g. Supabase CDN, Google Fonts)
  if (url.origin !== self.location.origin) return

  // API calls — network-first with short-lived cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  // Static assets (JS, CSS, images, fonts) — cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Navigation / page requests — network-first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }

  // Everything else — stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, PAGE_CACHE))
})

// --- Strategies ---

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return caches.match('/offline.html')
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached)

  return cached || fetchPromise
}

// --- Helpers ---

function isStaticAsset(pathname) {
  return /\.(js|css|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|avif|ico|wasm)(\?.*)?$/.test(pathname)
}

// --- Background Sync ---

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(syncWorkoutData())
  }
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

async function syncWorkoutData() {
  const db = await openDB()
  const tx = db.transaction('pending-workouts', 'readonly')
  const store = tx.objectStore('pending-workouts')
  const workouts = await store.getAll()

  for (const workout of workouts) {
    try {
      const response = await fetch('/api/workouts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout.data),
      })

      if (response.ok) {
        const deleteTx = db.transaction('pending-workouts', 'readwrite')
        await deleteTx.objectStore('pending-workouts').delete(workout.id)
      }
    } catch (error) {
      console.error('Failed to sync workout:', error)
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('flexilog-db', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pending-workouts')) {
        db.createObjectStore('pending-workouts', { keyPath: 'id' })
      }
    }
  })
}
