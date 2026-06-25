import { BasePage } from './base.page';

export class AiAssistPage extends BasePage {
  readonly heading;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'AI Assist' });
  }

  async goto() {
    await this.page.goto(`${this.baseUrl}/cli`);
  }
}
