import { Page, Locator } from '@playwright/test'

export class AICoachPage {
  readonly page: Page
  readonly chatInput: Locator
  readonly sendButton: Locator
  readonly messages: Locator
  readonly generateButton: Locator
  readonly planDisplay: Locator

  constructor(page: Page) {
    this.page = page
    this.chatInput = page.getByPlaceholder(/输入|message|消息/i)
    this.sendButton = page.getByRole('button', { name: /发送|send/i })
    this.messages = page.locator('[data-testid="chat-message"], .chat-message')
    this.generateButton = page.getByRole('button', { name: /生成|generate/i })
    this.planDisplay = page.locator('[data-testid="plan-display"], .plan-display')
  }

  async goto() {
    await this.page.goto('/ai-coach')
  }

  async sendMessage(text: string) {
    await this.chatInput.fill(text)
    await this.sendButton.click()
  }
}
