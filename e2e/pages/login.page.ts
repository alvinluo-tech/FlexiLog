import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByPlaceholder(/email/i)
    this.passwordInput = page.getByPlaceholder(/password/i)
    this.submitButton = page.getByRole('button', { name: /登录|sign in|login/i })
    this.errorMessage = page.locator('[data-testid="error-message"], .text-red-500, .text-destructive')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectError(message: string | RegExp) {
    await this.page.waitForSelector(`text=${message}`)
  }
}
