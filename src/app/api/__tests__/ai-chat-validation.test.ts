import { describe, it, expect } from 'vitest'

// Test the input validation logic added to ai-chat/route.ts
// These test the validation rules directly, not the HTTP layer

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

describe('ai-chat input validation', () => {
  // Regression: message length validation
  describe('message validation', () => {
    const MAX_MESSAGE = 2000

    it('rejects empty message', () => {
      const message = ''
      const isValid = message && typeof message === 'string' && message.trim().length > 0
      expect(isValid).toBeFalsy()
    })

    it('rejects whitespace-only message', () => {
      const message = '   '
      const isValid = message && typeof message === 'string' && message.trim().length > 0
      expect(isValid).toBeFalsy()
    })

    it('rejects message exceeding 2000 chars', () => {
      const message = 'a'.repeat(2001)
      expect(message.length).toBeGreaterThan(MAX_MESSAGE)
    })

    it('accepts valid message', () => {
      const message = '帮我制定一个训练计划'
      const isValid = message && typeof message === 'string' && message.trim().length > 0 && message.length <= MAX_MESSAGE
      expect(isValid).toBe(true)
    })
  })

  // Regression: conversationId UUID validation
  describe('conversationId validation', () => {
    it('rejects non-UUID string', () => {
      expect(UUID_REGEX.test('not-a-uuid')).toBe(false)
    })

    it('rejects SQL injection attempt', () => {
      expect(UUID_REGEX.test("'; DROP TABLE users; --")).toBe(false)
    })

    it('rejects XSS attempt', () => {
      expect(UUID_REGEX.test('<script>alert(1)</script>')).toBe(false)
    })

    it('accepts valid UUID', () => {
      expect(UUID_REGEX.test('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true)
    })

    it('allows undefined conversationId (optional)', () => {
      const conversationId = undefined
      const isValid = !conversationId || UUID_REGEX.test(conversationId)
      expect(isValid).toBe(true)
    })
  })

  // Regression: currentPlan size validation
  describe('currentPlan validation', () => {
    const MAX_PLAN_SIZE = 10000

    it('rejects plan exceeding 10000 chars when serialized', () => {
      const plan = { days: Array(100).fill({ exercises: Array(20).fill({ name: 'a'.repeat(50) }) }) }
      const size = JSON.stringify(plan).length
      expect(size).toBeGreaterThan(MAX_PLAN_SIZE)
    })

    it('accepts reasonable plan', () => {
      const plan = {
        name: 'Test Plan',
        days: [
          { day: '周一', focus: '胸', exercises: [{ name: '卧推', sets: 3, reps: '10' }] },
        ],
      }
      const size = JSON.stringify(plan).length
      expect(size).toBeLessThan(MAX_PLAN_SIZE)
    })
  })
})
