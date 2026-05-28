import { describe, it, expect } from 'vitest'
import {
  DEFAULT_REST_SECONDS,
  MIN_REST_SECONDS,
  MAX_REST_SECONDS,
  AI_REQUEST_TIMEOUT_MS,
  AI_MAX_TOKENS,
  AI_MODEL_NAME,
  MAX_REPS,
  MIN_AGE,
  MAX_AGE,
  MIN_HEIGHT_CM,
  MAX_HEIGHT_CM,
  MIN_WEIGHT_KG,
  MAX_WEIGHT_KG,
} from '../constants'

describe('workout defaults', () => {
  it('rest seconds are within valid range', () => {
    expect(DEFAULT_REST_SECONDS).toBeGreaterThanOrEqual(MIN_REST_SECONDS)
    expect(DEFAULT_REST_SECONDS).toBeLessThanOrEqual(MAX_REST_SECONDS)
  })

  it('min < max for rest seconds', () => {
    expect(MIN_REST_SECONDS).toBeLessThan(MAX_REST_SECONDS)
  })
})

describe('AI constants', () => {
  it('has reasonable timeout', () => {
    expect(AI_REQUEST_TIMEOUT_MS).toBeGreaterThan(0)
    expect(AI_REQUEST_TIMEOUT_MS).toBeLessThanOrEqual(60000)
  })

  it('has reasonable max tokens', () => {
    expect(AI_MAX_TOKENS).toBeGreaterThan(0)
    expect(AI_MAX_TOKENS).toBeLessThanOrEqual(32000)
  })

  it('has model name defined', () => {
    expect(AI_MODEL_NAME).toBeTruthy()
    expect(typeof AI_MODEL_NAME).toBe('string')
  })
})

describe('validation ranges', () => {
  it('age range is valid', () => {
    expect(MIN_AGE).toBeGreaterThan(0)
    expect(MAX_AGE).toBeGreaterThan(MIN_AGE)
  })

  it('height range is valid', () => {
    expect(MIN_HEIGHT_CM).toBeGreaterThan(0)
    expect(MAX_HEIGHT_CM).toBeGreaterThan(MIN_HEIGHT_CM)
  })

  it('weight range is valid', () => {
    expect(MIN_WEIGHT_KG).toBeGreaterThan(0)
    expect(MAX_WEIGHT_KG).toBeGreaterThan(MIN_WEIGHT_KG)
  })

  it('max reps is reasonable', () => {
    expect(MAX_REPS).toBeGreaterThan(0)
    expect(MAX_REPS).toBeLessThanOrEqual(9999)
  })
})
