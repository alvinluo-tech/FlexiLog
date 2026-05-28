import { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly heading: Locator
  readonly workoutButton: Locator
  readonly historyLink: Locator
  readonly aiCoachLink: Locator
  readonly feedLink: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /dashboard|仪表盘|训练/i })
    this.workoutButton = page.getByRole('link', { name: /开始训练|workout|new workout/i })
    this.historyLink = page.getByRole('link', { name: /历史|history/i })
    this.aiCoachLink = page.getByRole('link', { name: /AI|教练|coach/i })
    this.feedLink = page.getByRole('link', { name: /动态|feed|社区/i })
  }

  async goto() {
    await this.page.goto('/dashboard')
  }

  async expectLoaded() {
    await this.page.waitForURL(/\/dashboard/)
  }
}
