const CACHE_NAME = 'flexilog-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/exercises',
  '/workout/live',
  '/ai-coach',
  '/profile',
  '/manifest.json',
]

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API calls
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone()
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        
        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response
          }
          // Fallback to offline page
          if (event.request.destination === 'document') {
            return caches.match('/')
          }
        })
      })
  )
})

// Background sync for offline workout data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(syncWorkoutData())
  }
})

async function syncWorkoutData() {
  // Get pending workouts from IndexedDB
  const db = await openDB()
  const tx = db.transaction('pending-workouts', 'readonly')
  const store = tx.objectStore('pending-workouts')
  const workouts = await store.getAll()

  for (const workout of workouts) {
    try {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout),
      })
      
      // Remove from pending after successful sync
      const deleteTx = db.transaction('pending-workouts', 'readwrite')
      await deleteTx.objectStore('pending-workouts').delete(workout.id)
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
