import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('main pages are accessible', async ({ page }) => {
    const pages = ['/', '/login']

    for (const path of pages) {
      const response = await page.goto(path)
      expect(response?.status()).toBeLessThan(500)
    }
  })

  test('404 for non-existent routes', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-xyz')
    // Next.js returns 404 for non-existent pages
    expect(response?.status()).toBe(404)
  })

  test('security headers are present', async ({ page }) => {
    const response = await page.goto('/')
    const headers = response?.headers()

    // Regression: security headers added in audit
    if (headers) {
      expect(headers['x-content-type-options']).toBe('nosniff')
      expect(headers['x-frame-options']).toBe('DENY')
      expect(headers['referrer-policy']).toBeTruthy()
    }
  })
})
