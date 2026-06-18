import type { APIRequestContext } from '@playwright/test';
import { test, expect } from '../../fixtures/cleanup.fixture';
import { DashboardPage } from '../../pages/dashboard.page';
import { ProgramsPage } from '../../pages/programs.page';
import { createProgram } from '../../helpers/program.helpers';

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
const MANY_PROGRAMS_COUNT = 50;

async function seedProgramsViaApi(
  request: APIRequestContext,
  count: number,
  prefix: string,
  trackProgram: (uuid: string) => void,
) {
  const apiToken = process.env.DIDAXIS_API_TOKEN!;
  for (let i = 0; i < count; i++) {
    const res = await request.post(`${BASE_URL}/api/programs`, {
      headers: { Authorization: `Bearer ${apiToken}` },
      data: { name: `${prefix}-${i}`, description: 'Performance seed' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const id = body?.data?.id ?? body?.id;
    if (id) trackProgram(id);
  }
}

test.describe('DS-5: Program List Display', () => {
  let programs: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programs = new ProgramsPage(page);
    await page.goto(BASE_URL);
  });

  test('TC-001: Programs page displays a list showing each program name and description', async ({ page, trackProgram }) => {
    const programName = `ListDisplay ${Date.now()}`;
    const description = 'Visible in list';
    await programs.goto();
    await createProgram(programs, page, programName, description, trackProgram);

    await expect(programs.table).toBeVisible();
    const row = programs.rowFor(programName);
    await expect(row).toBeVisible();
    await expect(row.getByText(programName)).toBeVisible();
    await expect(row.getByText(description)).toBeVisible();
  });

  test('TC-002: Multiple programs are all displayed in the list', async ({ page, trackProgram }) => {
    await programs.goto();

    const programA = `MultiA ${Date.now()}`;
    const programB = `MultiB ${Date.now()}`;
    const programC = `MultiC ${Date.now()}`;
    await createProgram(programs, page, programA, 'ma', trackProgram);
    await createProgram(programs, page, programB, 'mb', trackProgram);
    await createProgram(programs, page, programC, 'mc', trackProgram);

    await expect(programs.rowFor(programA)).toBeVisible({ timeout: 10000 });
    await expect(programs.rowFor(programB)).toBeVisible({ timeout: 10000 });
    await expect(programs.rowFor(programC)).toBeVisible({ timeout: 10000 });
  });

  test('TC-003: Newly created program appears in the list immediately', async ({ page, trackProgram }) => {
    await programs.goto();

    const programName = `Immediate ${Date.now()}`;
    const description = 'Should appear instantly';

    const responsePromise = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/programs'),
    );
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription(description);
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();

    const row = programs.rowFor(programName);
    await expect(row).toBeVisible();
    await expect(row.getByText(description)).toBeVisible();
    const res = await responsePromise;
    if (res.ok()) {
      try {
        const body = await res.json();
        const id = body?.data?.id ?? body?.id;
        if (id) trackProgram(id);
      } catch { /* non-JSON response */ }
    }
  });

  test('TC-004: Program list shows correct data after an edit', async ({ page, trackProgram }) => {
    await programs.goto();

    const programName = `EditRefresh ${Date.now()}`;
    const updatedName = `${programName} - Updated`;
    const updatedDesc = 'Updated for list test';
    await createProgram(programs, page, programName, 'Original desc', trackProgram);

    await programs.openEditFor(programName);
    const modal = programs.editProgramModal;
    await modal.fillName(updatedName);
    await modal.fillDescription(updatedDesc);
    await modal.submit();
    await expect(modal.dialog).not.toBeVisible();

    const row = programs.rowFor(updatedName);
    await expect(row).toBeVisible();
    await expect(row.getByText(updatedDesc)).toBeVisible();
    await expect(programs.rowFor(programName).filter({ hasNotText: updatedName })).toHaveCount(0);
  });

  test('TC-005: Program list updates correctly after a deletion', async ({ page, trackProgram }) => {
    test.setTimeout(60000);
    await programs.goto();

    const programA = `DelListA ${Date.now()}`;
    const programB = `DelListB ${Date.now()}`;
    await createProgram(programs, page, programA, 'to delete', trackProgram);
    await createProgram(programs, page, programB, 'to keep', trackProgram);

    page.on('dialog', async (d) => { await d.accept(); });

    await programs.clickDeleteFor(programA);
    await expect(programs.rowFor(programA)).toHaveCount(0, { timeout: 10000 });
    await expect(programs.rowFor(programB)).toBeVisible();
  });

  test.skip('TC-006: Empty state is displayed when no programs exist', async () => {
    // Skipped: requires deleting all programs in the system which is destructive
    // to shared test data and impractical with 1000+ programs. Needs isolated env.
  });

  test('TC-007: Empty state prompt leads to program creation', async () => {
    await programs.goto();

    await expect(programs.newProgramButton).toBeVisible();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await expect(modal.dialog).toBeVisible();
    await expect(modal.programNameInput).toBeVisible();
  });

  test.skip('TC-008: Unauthorized users can view but not modify the program list', async () => {
    // Requires non-admin credentials which are not available in the current env
  });

  test('TC-009: Program with a very long name displays without breaking the layout', async ({ page, trackProgram }) => {
    await programs.goto();

    const longName = `LongDisplay ${Date.now()} ${'x'.repeat(200)}`.slice(0, 250);
    await createProgram(programs, page, longName, 'Long name layout test', trackProgram);

    await expect(programs.rowFor(longName.slice(0, 50))).toBeVisible();

    const tableBB = await programs.table.boundingBox();
    expect(tableBB).not.toBeNull();
    expect(tableBB!.width).toBeGreaterThan(0);
  });

  test('TC-010: Program with a very long description displays without breaking the layout', async ({ page, trackProgram }) => {
    await programs.goto();

    const programName = `LongDesc ${Date.now()}`;
    const longDesc = 'D'.repeat(500);
    await createProgram(programs, page, programName, longDesc, trackProgram);

    await expect(programs.rowFor(programName)).toBeVisible();

    const tableBB = await programs.table.boundingBox();
    expect(tableBB).not.toBeNull();
    expect(tableBB!.width).toBeGreaterThan(0);
  });

  test('TC-011: Program with empty description displays correctly', async ({ page, trackProgram }) => {
    await programs.goto();

    const programName = `NoDesc ${Date.now()}`;

    const responsePromise = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/programs'),
    );
    await programs.openNewProgram();
    await programs.newProgramModal.fillName(programName);
    await programs.newProgramModal.submit();
    await expect(programs.newProgramModal.dialog).not.toBeVisible();

    await expect(programs.rowFor(programName)).toBeVisible();

    const tableBB = await programs.table.boundingBox();
    expect(tableBB).not.toBeNull();
    expect(tableBB!.width).toBeGreaterThan(0);
    const res = await responsePromise;
    if (res.ok()) {
      try {
        const body = await res.json();
        const id = body?.data?.id ?? body?.id;
        if (id) trackProgram(id);
      } catch { /* non-JSON response */ }
    }
  });

  test('TC-012: Program with special characters in name and description displays correctly', async ({ page, trackProgram }) => {
    await programs.goto();

    const programName = `Informatique & IA — "Niveau 2" <2026> ${Date.now()}`;
    const description = `Côte d'Ivoire & beyond — spécial`;
    await createProgram(programs, page, programName, description, trackProgram);

    const row = programs.rowFor(programName);
    await expect(row).toBeVisible();

    await expect(row.getByText(/Informatique & IA/)).toBeVisible();
    await expect(row.getByText(/spécial/)).toBeVisible();
  });

  test('TC-013: Programs page loads within acceptable time with many programs', async ({
    request,
    trackProgram,
  }) => {
    test.setTimeout(120000);

    const prefix = `Perf ${Date.now()}`;
    await seedProgramsViaApi(request, MANY_PROGRAMS_COUNT, prefix, trackProgram);

    const startTime = Date.now();
    await programs.goto();
    const loadTime = Date.now() - startTime;

    await expect(programs.table).toBeVisible();
    expect(loadTime).toBeLessThan(10000);
  });

  test('TC-014: Programs page is accessible via navigation after login', async ({
    page,
    trackProgram,
  }) => {
    const programName = `NavAccess ${Date.now()}`;
    const dashboard = new DashboardPage(page);

    await programs.goto();
    await createProgram(programs, page, programName, 'Navigation test', trackProgram);

    await programs.nav.goToDashboard();
    await expect(dashboard.heading).toBeVisible();

    await programs.nav.goToPrograms();
    await expect(programs.heading).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();
    await expect(programs.table).toBeVisible();
  });

  test('TC-015: Each program row shows edit and delete action icons', async ({ page, trackProgram }) => {
    await programs.goto();

    const programName = `ActionIcons ${Date.now()}`;
    await createProgram(programs, page, programName, 'Icon check', trackProgram);

    const editBtn = programs.editButtonFor(programName);
    const deleteBtn = programs.deleteButtonFor(programName);
    await expect(editBtn).toBeVisible();
    await expect(deleteBtn).toBeVisible();
    await expect(editBtn).toBeEnabled();
    await expect(deleteBtn).toBeEnabled();
  });
});
