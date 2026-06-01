import type { Page } from '@playwright/test';

export class AppNavigation {
  readonly dashboardButton;
  readonly programsButton;

  constructor(private readonly page: Page) {
    this.dashboardButton = page.getByRole('button', { name: '📊 Dashboard' });
    this.programsButton = page.getByRole('button', { name: '🎓 Programs' });
  }

  async goToDashboard() {
    await this.dashboardButton.click();
  }

  async goToPrograms() {
    await this.programsButton.click();
  }
}
