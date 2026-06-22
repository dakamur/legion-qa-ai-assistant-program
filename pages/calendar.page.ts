import { BasePage } from './base.page';

export class CalendarPage extends BasePage {
  readonly heading;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Calendar' });
  }

  async goto() {
    await this.page.goto(`${this.baseUrl}/calendar`);
  }
}
