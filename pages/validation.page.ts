import { BasePage } from './base.page';

export class ValidationPage extends BasePage {
  readonly heading;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Validation' });
  }

  async goto() {
    await this.page.goto(`${this.baseUrl}/validation`);
  }
}
