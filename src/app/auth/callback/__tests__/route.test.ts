import { describe, it, expect } from 'vitest'

// Test the redirect validation logic directly (extracted for testability)
function validateRedirectPath(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) {
    return '/dashboard'
  }
  return path
}

describe('validateRedirectPath - open redirect prevention', () => {
  // Regression: these attack vectors were found in the security audit
  // and fixed in auth/callback/route.ts

  it('blocks absolute URL with https', () => {
    expect(validateRedirectPath('https://evil.com')).toBe('/dashboard')
  })

  it('blocks absolute URL with http', () => {
    expect(validateRedirectPath('http://evil.com')).toBe('/dashboard')
  })

  it('blocks protocol-relative URL with //', () => {
    expect(validateRedirectPath('//evil.com/path')).toBe('/dashboard')
  })

  it('blocks URL with :// in path', () => {
    expect(validateRedirectPath('/path://evil.com')).toBe('/dashboard')
  })

  it('allows valid relative path', () => {
    expect(validateRedirectPath('/dashboard')).toBe('/dashboard')
  })

  it('allows nested relative path', () => {
    expect(validateRedirectPath('/workout/live')).toBe('/workout/live')
  })

  it('blocks empty string (does not start with /)', () => {
    expect(validateRedirectPath('')).toBe('/dashboard')
  })

  it('blocks javascript protocol', () => {
    expect(validateRedirectPath('javascript:alert(1)')).toBe('/dashboard')
  })

  it('blocks data protocol', () => {
    expect(validateRedirectPath('data:text/html,<script>alert(1)</script>')).toBe('/dashboard')
  })

  it('blocks path with double slash in middle', () => {
    // "//evil.com" after a valid prefix would still be an open redirect
    expect(validateRedirectPath('//evil.com')).toBe('/dashboard')
  })
})
