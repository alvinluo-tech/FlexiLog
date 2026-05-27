'use client'

import { useState, useEffect, useCallback } from 'react'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    loadPendingCount()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadPendingCount = async () => {
    try {
      const db = await openDB()
      const tx = db.transaction('pending-workouts', 'readonly')
      const countReq = tx.objectStore('pending-workouts').count()
      const count = await new Promise<number>((resolve) => {
        countReq.onsuccess = () => resolve(countReq.result)
        countReq.onerror = () => resolve(0)
      })
      setPendingCount(count)
    } catch {}
  }

  const saveForSync = useCallback(async (workout: any) => {
    try {
      const db = await openDB()
      const tx = db.transaction('pending-workouts', 'readwrite')
      await tx.objectStore('pending-workouts').put({
        id: `pending-${Date.now()}`,
        data: workout,
        timestamp: Date.now(),
      })
      setPendingCount(prev => prev + 1)

      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready
        await (reg as any).sync.register('sync-workouts')
      }
    } catch (error) {
      console.error('Failed to save for sync:', error)
    }
  }, [])

  const syncNow = useCallback(async () => {
    if (!isOnline) return

    try {
      const db = await openDB()
      const tx = db.transaction('pending-workouts', 'readonly')
      const allReq = tx.objectStore('pending-workouts').getAll()
      const workouts = await new Promise<any[]>((resolve) => {
        allReq.onsuccess = () => resolve(allReq.result)
        allReq.onerror = () => resolve([])
      })

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
            setPendingCount(prev => Math.max(0, prev - 1))
          }
        } catch {}
      }
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }, [isOnline])

  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncNow()
    }
  }, [isOnline, pendingCount, syncNow])

  return { isOnline, pendingCount, saveForSync, syncNow }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('flexilog-db', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('pending-workouts')) {
        db.createObjectStore('pending-workouts', { keyPath: 'id' })
      }
    }
  })
}
