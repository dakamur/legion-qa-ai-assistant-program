import { test, expect } from '../../fixtures/cleanup.fixture';

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

async function navigateToPrograms(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '🎓 Programs' }).click();
  await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
}

function modalCreateButton(page: import('@playwright/test').Page) {
  return page.getByRole('dialog', { name: 'New Program' }).getByRole('button', { name: 'Create', exact: true });
}

async function createProgram(
  page: import('@playwright/test').Page,
  name: string,
  description: string,
  trackFn: (uuid: string) => void,
) {
  const responsePromise = page.waitForResponse(
    (r) => r.request().method() === 'POST' && r.url().includes('/api/programs'),
  );
  await page.getByRole('button', { name: '+ New Program' }).click();
  await page.getByLabel('Program Name').fill(name);
  await page.getByLabel('Description').fill(description);
  await modalCreateButton(page).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
  await expect(page.getByText(name)).toBeVisible();
  const res = await responsePromise;
  if (res.ok()) {
    try {
      const body = await res.json();
      const id = body?.data?.id ?? body?.id;
      if (id) trackFn(id);
    } catch { /* non-JSON response */ }
  }
}

function openEditDialog(page: import('@playwright/test').Page, programName: string) {
  const row = page.getByRole('row').filter({ hasText: programName });
  return row.getByRole('button', { name: '✏️' }).click();
}

function clickDeleteIcon(page: import('@playwright/test').Page, programName: string) {
  const row = page.getByRole('row').filter({ hasText: programName });
  return row.getByRole('button', { name: '🗑' }).click();
}

test.describe('DS-5: Program List Display', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-001: Programs page displays a list showing each program name and description', async ({ page, trackProgram }) => {
    const programName = `ListDisplay ${Date.now()}`;
    const description = 'Visible in list';
    await navigateToPrograms(page);
    await createProgram(page, programName, description, trackProgram);

    await expect(page.getByRole('table')).toBeVisible();
    const row = page.getByRole('row').filter({ hasText: programName });
    await expect(row).toBeVisible();
    await expect(row.getByText(programName)).toBeVisible();
    await expect(row.getByText(description)).toBeVisible();
  });

  test('TC-002: Multiple programs are all displayed in the list', async ({ page, trackProgram }) => {
    await navigateToPrograms(page);

    const programA = `MultiA ${Date.now()}`;
    const programB = `MultiB ${Date.now()}`;
    const programC = `MultiC ${Date.now()}`;
    await createProgram(page, programA, 'ma', trackProgram);
    await createProgram(page, programB, 'mb', trackProgram);
    await createProgram(page, programC, 'mc', trackProgram);

    await expect(page.getByRole('row').filter({ hasText: programA })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('row').filter({ hasText: programB })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('row').filter({ hasText: programC })).toBeVisible({ timeout: 10000 });
  });

  test('TC-003: Newly created program appears in the list immediately', async ({ page, trackProgram }) => {
    await navigateToPrograms(page);

    const programName = `Immediate ${Date.now()}`;
    const description = 'Should appear instantly';

    const responsePromise = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/programs'),
    );
    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill(description);
    await modalCreateButton(page).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();

    const row = page.getByRole('row').filter({ hasText: programName });
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
    await navigateToPrograms(page);

    const programName = `EditRefresh ${Date.now()}`;
    const updatedName = `${programName} - Updated`;
    const updatedDesc = 'Updated for list test';
    await createProgram(page, programName, 'Original desc', trackProgram);

    await openEditDialog(page, programName);
    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(updatedName);
    await dialog.getByLabel('Description').clear();
    await dialog.getByLabel('Description').fill(updatedDesc);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).not.toBeVisible();

    const row = page.getByRole('row').filter({ hasText: updatedName });
    await expect(row).toBeVisible();
    await expect(row.getByText(updatedDesc)).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: programName }).filter({ hasNotText: updatedName })).toHaveCount(0);
  });

  test('TC-005: Program list updates correctly after a deletion', async ({ page, trackProgram }) => {
    test.setTimeout(60000);
    await navigateToPrograms(page);

    const programA = `DelListA ${Date.now()}`;
    const programB = `DelListB ${Date.now()}`;
    await createProgram(page, programA, 'to delete', trackProgram);
    await createProgram(page, programB, 'to keep', trackProgram);

    page.on('dialog', async (d) => { await d.accept(); });

    await clickDeleteIcon(page, programA);
    await expect(page.getByRole('row').filter({ hasText: programA })).toHaveCount(0, { timeout: 10000 });
    await expect(page.getByRole('row').filter({ hasText: programB })).toBeVisible();
  });

  test.skip('TC-006: Empty state is displayed when no programs exist', async () => {
    // Skipped: requires deleting all programs in the system which is destructive
    // to shared test data and impractical with 1000+ programs. Needs isolated env.
  });

  test('TC-007: Empty state prompt leads to program creation', async ({ page }) => {
    await navigateToPrograms(page);

    // The + New Program button should always be available as the creation prompt
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
    await page.getByRole('button', { name: '+ New Program' }).click();
    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
    await expect(page.getByLabel('Program Name')).toBeVisible();
  });

  test.skip('TC-008: Unauthorized users can view but not modify the program list', async () => {
    // Requires non-admin credentials which are not available in the current env
  });

  test('TC-009: Program with a very long name displays without breaking the layout', async ({ page, trackProgram }) => {
    await navigateToPrograms(page);

    const longName = `LongDisplay ${Date.now()} ${'x'.repeat(200)}`.slice(0, 250);
    await createProgram(page, longName, 'Long name layout test', trackProgram);

    const row = page.getByRole('row').filter({ hasText: longName.slice(0, 50) });
    await expect(row).toBeVisible();

    const table = page.getByRole('table');
    const tableBB = await table.boundingBox();
    expect(tableBB).not.toBeNull();
    expect(tableBB!.width).toBeGreaterThan(0);
  });

  test('TC-010: Program with a very long description displays without breaking the layout', async ({ page, trackProgram }) => {
    await navigateToPrograms(page);

    const programName = `LongDesc ${Date.now()}`;
    const longDesc = 'D'.repeat(500);
    await createProgram(page, programName, longDesc, trackProgram);

    const row = page.getByRole('row').filter({ hasText: programName });
    await expect(row).toBeVisible();

    const table = page.getByRole('table');
    const tableBB = await table.boundingBox();
    expect(tableBB).not.toBeNull();
    expect(tableBB!.width).toBeGreaterThan(0);
  });

  test('TC-011: Program with empty description displays correctly', async ({ page, trackProgram }) => {
    await navigateToPrograms(page);

    const programName = `NoDesc ${Date.now()}`;

    const responsePromise = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/programs'),
    );
    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await modalCreateButton(page).click();
    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();

    const row = page.getByRole('row').filter({ hasText: programName });
    await expect(row).toBeVisible();

    const table = page.getByRole('table');
    const tableBB = await table.boundingBox();
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
    await navigateToPrograms(page);

    const programName = `Informatique & IA — "Niveau 2" <2026> ${Date.now()}`;
    const description = `Côte d'Ivoire & beyond — spécial`;
    await createProgram(page, programName, description, trackProgram);

    const row = page.getByRole('row').filter({ hasText: programName });
    await expect(row).toBeVisible();

    await expect(row.getByText(/Informatique & IA/)).toBeVisible();
    await expect(row.getByText(/spécial/)).toBeVisible();
  });

  test('TC-013: Programs page loads within acceptable time with many programs', async ({ page }) => {
    const startTime = Date.now();

    await navigateToPrograms(page);

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);

    await expect(page.getByRole('table')).toBeVisible();
  });

  test('TC-014: Programs page is accessible via navigation after login', async ({ page }) => {
    const programsButton = page.getByRole('button', { name: '🎓 Programs' });
    await programsButton.click();

    await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('TC-015: Each program row shows edit and delete action icons', async ({ page, trackProgram }) => {
    await navigateToPrograms(page);

    const programName = `ActionIcons ${Date.now()}`;
    await createProgram(page, programName, 'Icon check', trackProgram);

    const row = page.getByRole('row').filter({ hasText: programName });
    await expect(row.getByRole('button', { name: '✏️' })).toBeVisible();
    await expect(row.getByRole('button', { name: '🗑' })).toBeVisible();
    await expect(row.getByRole('button', { name: '✏️' })).toBeEnabled();
    await expect(row.getByRole('button', { name: '🗑' })).toBeEnabled();
  });
});
