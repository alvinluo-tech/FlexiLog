import { Page, Locator } from '@playwright/test'

export class WorkoutPage {
  readonly page: Page
  readonly startButton: Locator
  readonly exerciseCards: Locator
  readonly timer: Locator
  readonly finishButton: Locator

  constructor(page: Page) {
    this.page = page
    this.startButton = page.getByRole('button', { name: /开始|start/i })
    this.exerciseCards = page.locator('[data-testid="exercise-card"], .exercise-item')
    this.timer = page.locator('[data-testid="timer"], .timer')
    this.finishButton = page.getByRole('button', { name: /完成|finish|结束/i })
  }

  async goto() {
    await this.page.goto('/workout')
  }

  async gotoLive() {
    await this.page.goto('/workout/live')
  }
}
