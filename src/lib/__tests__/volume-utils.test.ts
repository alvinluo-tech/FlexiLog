import { describe, it, expect } from 'vitest'
import { calculateSessionVolume, calculateTotalVolume } from '../volume-utils'

describe('calculateSessionVolume', () => {
  it('calculates volume for a single set', () => {
    expect(calculateSessionVolume([{ weight_kg: 100, reps: 5 }])).toBe(500)
  })

  it('calculates volume for multiple sets', () => {
    const sets = [
      { weight_kg: 100, reps: 5 },
      { weight_kg: 80, reps: 8 },
    ]
    expect(calculateSessionVolume(sets)).toBe(500 + 640)
  })

  it('returns 0 for empty sets', () => {
    expect(calculateSessionVolume([])).toBe(0)
  })

  it('handles zero weight gracefully', () => {
    expect(calculateSessionVolume([{ weight_kg: 0, reps: 10 }])).toBe(0)
  })

  it('handles zero reps gracefully', () => {
    expect(calculateSessionVolume([{ weight_kg: 100, reps: 0 }])).toBe(0)
  })

  it('handles non-numeric weight_kg (coerced to 0)', () => {
    expect(calculateSessionVolume([{ weight_kg: NaN, reps: 5 }])).toBe(0)
  })
})

describe('calculateTotalVolume', () => {
  it('calculates total volume across sessions', () => {
    const sessions = [
      { workout_sets: [{ weight_kg: 100, reps: 5 }] },
      { workout_sets: [{ weight_kg: 80, reps: 8 }] },
    ]
    expect(calculateTotalVolume(sessions)).toBe(500 + 640)
  })

  it('handles sessions with no sets', () => {
    const sessions = [
      { workout_sets: undefined },
      { workout_sets: [] },
    ]
    expect(calculateTotalVolume(sessions)).toBe(0)
  })

  it('returns 0 for empty sessions array', () => {
    expect(calculateTotalVolume([])).toBe(0)
  })
})
