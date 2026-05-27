'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates periodically
        registration.update()

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // Optionally notify user of new version
              if (document.visibilityState === 'visible') {
                window.dispatchEvent(new CustomEvent('sw-updated'))
              }
            }
          })
        })
      })
      .catch(console.error)

    // Listen for controlling SW changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // New SW took over — reload to get fresh assets
      window.location.reload()
    })
  }, [])

  return null
}
