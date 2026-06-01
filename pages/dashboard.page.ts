import { BasePage } from './base.page';
import { AppNavigation } from './components/app-navigation';

export class DashboardPage extends BasePage {
  readonly nav: AppNavigation;
  readonly heading;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
  }

  async goto() {
    await this.page.goto(this.baseUrl);
  }
}
