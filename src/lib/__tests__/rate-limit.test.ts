import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimit } from '../rate-limit'

describe('rateLimit', () => {
  // Clear the rate limit map before each test by using unique keys
  const testKey = () => `test-${Date.now()}-${Math.random()}`

  it('allows first request', () => {
    expect(rateLimit(testKey(), 5, 60000)).toBe(true)
  })

  it('allows requests within limit', () => {
    const key = testKey()
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60000)).toBe(true)
    }
  })

  it('blocks requests exceeding limit', () => {
    const key = testKey()
    for (let i = 0; i < 5; i++) {
      rateLimit(key, 5, 60000)
    }
    expect(rateLimit(key, 5, 60000)).toBe(false)
  })

  it('resets after window expires', () => {
    const key = testKey()
    // Exhaust the limit with a very short window
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 1) // 1ms window
    }
    expect(rateLimit(key, 3, 1)).toBe(false)

    // Wait for window to expire
    return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
      expect(rateLimit(key, 3, 60000)).toBe(true)
    })
  })

  it('tracks different keys independently', () => {
    const key1 = testKey()
    const key2 = testKey()

    // Exhaust key1
    for (let i = 0; i < 3; i++) {
      rateLimit(key1, 3, 60000)
    }
    expect(rateLimit(key1, 3, 60000)).toBe(false)

    // key2 should still be allowed
    expect(rateLimit(key2, 3, 60000)).toBe(true)
  })
})
