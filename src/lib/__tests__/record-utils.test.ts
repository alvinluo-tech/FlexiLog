import { describe, it, expect } from 'vitest'
import { getRecordLabel, getRecordUnit } from '../record-utils'

describe('getRecordLabel', () => {
  it('returns Chinese label for max_weight', () => {
    expect(getRecordLabel('max_weight')).toBe('最大重量')
  })

  it('returns Chinese label for max_volume', () => {
    expect(getRecordLabel('max_volume')).toBe('最大训练量')
  })

  it('returns Chinese label for max_reps', () => {
    expect(getRecordLabel('max_reps')).toBe('最大次数')
  })

  it('returns Chinese label for estimated_1rm', () => {
    expect(getRecordLabel('estimated_1rm')).toBe('预估1RM')
  })
})

describe('getRecordUnit', () => {
  it('returns kg for weight types', () => {
    expect(getRecordUnit('max_weight')).toBe('kg')
    expect(getRecordUnit('estimated_1rm')).toBe('kg')
    expect(getRecordUnit('max_volume')).toBe('kg')
  })

  it('returns 次 for max_reps', () => {
    expect(getRecordUnit('max_reps')).toBe('次')
  })
})
