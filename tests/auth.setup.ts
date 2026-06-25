import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(process.env.DIDAXIS_EMAIL!, process.env.DIDAXIS_PASSWORD!);

  const dashboard = new DashboardPage(page);
  await expect(dashboard.heading).toBeVisible();

  await page.context().storageState({ path: authFile });
});
