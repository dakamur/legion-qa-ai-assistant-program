import { test, expect } from '../../fixtures/cleanup.fixture';
import { DashboardPage } from '../../pages/dashboard.page';
import { ProgramsPage } from '../../pages/programs.page';
import { CalendarPage } from '../../pages/calendar.page';
import { ValidationPage } from '../../pages/validation.page';
import { AiAssistPage } from '../../pages/ai-assist.page';

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

test.describe('DS-119: Dashboard displaying the right components', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await page.goto(BASE_URL);
  });

  test('TC-001: Navigate to the Dashboard', async () => {
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.programsCard).toBeVisible();
    await expect(dashboard.calendarCard).toBeVisible();
    await expect(dashboard.validationCard).toBeVisible();
    await expect(dashboard.aiAssistCard).toBeVisible();
  });

  test('TC-002: Successfully navigate to Program Page from dashboard card', async ({ page }) => {
    const programs = new ProgramsPage(page);

    await dashboard.clickProgramsCard();

    await expect(page).toHaveURL(/\/programs/);
    await expect(programs.heading).toBeVisible();
  });

  test('TC-003: Successfully navigate to Calendar Page from dashboard card', async ({ page }) => {
    const calendar = new CalendarPage(page);

    await dashboard.clickCalendarCard();

    await expect(page).toHaveURL(/\/calendar/);
    await expect(calendar.heading).toBeVisible();
  });

  test('TC-004: Successfully navigate to Validation Page from dashboard card', async ({ page }) => {
    const validation = new ValidationPage(page);

    await dashboard.clickValidationCard();

    await expect(page).toHaveURL(/\/validation/);
    await expect(validation.heading).toBeVisible();
  });

  test('TC-005: Successfully navigate to AI Assist Page from dashboard card', async ({ page }) => {
    const aiAssist = new AiAssistPage(page);

    await dashboard.clickAiAssistCard();

    await expect(page).toHaveURL(/\/cli/);
    await expect(aiAssist.heading).toBeVisible();
  });

  test('TC-006: Dashboard does not show unrelated module cards as primary blocks', async () => {
    await expect(dashboard.schedulerPrimaryBlock()).not.toBeVisible();
    await expect(dashboard.exportPrimaryBlock()).not.toBeVisible();
  });

  test('TC-007: Dashboard cards remain visible after returning from Programs', async ({ page }) => {
    await dashboard.clickProgramsCard();
    await expect(page).toHaveURL(/\/programs/);

    await dashboard.nav.goToDashboard();

    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.programsCard).toBeVisible();
    await expect(dashboard.calendarCard).toBeVisible();
  });

  test('TC-008: Dashboard welcome message is visible on load', async () => {
    await expect(dashboard.welcomeMessage).toBeVisible();
    await expect(dashboard.connectedStatus).toBeVisible();
  });
});
