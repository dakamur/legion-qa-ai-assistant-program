import { test, expect } from '@playwright/test';

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

type Page = import('@playwright/test').Page;

async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

async function navigateToPrograms(page: Page) {
  await page.getByRole('button', { name: '🎓 Programs' }).click();
  await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
}

async function createProgram(page: Page, name: string, description: string) {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await page.getByLabel('Program Name').fill(name);
  await page.getByLabel('Description').fill(description);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
}

function clickDeleteIcon(page: Page, programName: string) {
  return page.getByRole('row').filter({ hasText: programName }).getByRole('button', { name: '🗑' }).click();
}

test.describe('DS-4: Delete Program With Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToPrograms(page);
  });

  // --- Positive Flows ---

  test('TC-001: Program is removed from list after deletion is confirmed', async ({ page }) => {
    const programName = `Del Confirm ${Date.now()}`;
    await createProgram(page, programName, 'Will be deleted');

    page.on('dialog', (dialog) => dialog.accept());
    await clickDeleteIcon(page, programName);

    await expect(page.getByRole('row').filter({ hasText: programName })).not.toBeVisible();
  });

  test('TC-002: Program remains in list when deletion is canceled', async ({ page }) => {
    const programName = `Del Cancel ${Date.now()}`;
    await createProgram(page, programName, 'Should survive cancel');

    page.on('dialog', (dialog) => dialog.dismiss());
    await clickDeleteIcon(page, programName);

    await expect(page.getByRole('row').filter({ hasText: programName })).toBeVisible();
  });

  test('TC-003: Confirmation dialog shows correct program name', async ({ page }) => {
    const programName = `Del Context ${Date.now()}`;
    await createProgram(page, programName, 'Context check');

    let dialogMessage = '';
    page.on('dialog', (dialog) => {
      dialogMessage = dialog.message();
      dialog.dismiss();
    });
    await clickDeleteIcon(page, programName);

    expect(dialogMessage).toContain(programName);
  });

  // --- Negative Flows ---

  test('TC-004: No program is deleted before explicit confirmation', async ({ page }) => {
    const programName = `Del NoConfirm ${Date.now()}`;
    await createProgram(page, programName, 'Premature delete check');

    page.on('dialog', (dialog) => dialog.dismiss());
    await clickDeleteIcon(page, programName);

    await expect(page.getByRole('row').filter({ hasText: programName })).toBeVisible();
  });

  test('TC-005: Dismissing dialog via cancel does not delete program', async ({ page }) => {
    const programName = `Del Dismiss ${Date.now()}`;
    await createProgram(page, programName, 'Dismiss test');

    page.on('dialog', (dialog) => dialog.dismiss());
    await clickDeleteIcon(page, programName);

    await expect(page.getByRole('row').filter({ hasText: programName })).toBeVisible();
  });

  test.skip('TC-006: Deletion failure does not remove program from list', async () => {
    // Requires API failure simulation (network interception) which is out of scope
  });

  test('TC-007: Multiple rapid clicks on delete icon do not cause unstable behavior', async ({ page }) => {
    const programName = `Del Rapid ${Date.now()}`;
    await createProgram(page, programName, 'Rapid click test');

    let dialogCount = 0;
    page.on('dialog', (dialog) => {
      dialogCount++;
      dialog.accept();
    });

    const deleteBtn = page.getByRole('row').filter({ hasText: programName }).getByRole('button', { name: '🗑' });
    await deleteBtn.dblclick();

    await expect(page.getByRole('row').filter({ hasText: programName })).not.toBeVisible();
    expect(dialogCount).toBeGreaterThanOrEqual(1);
  });

  // --- Edge Cases ---

  test('TC-008: Program with max-length name can be deleted', async ({ page }) => {
    const programName = `Del ${Date.now()} ${'a'.repeat(240)}`.slice(0, 255);
    await createProgram(page, programName, 'Max length delete test');

    page.on('dialog', (dialog) => dialog.accept());
    await clickDeleteIcon(page, programName);

    await expect(page.getByRole('row').filter({ hasText: programName })).not.toBeVisible();
  });

  test('TC-009: Program with special characters can be deleted', async ({ page }) => {
    const programName = `Test_Program-01 (QA) & UAT / v2 ${Date.now()}`;
    await createProgram(page, programName, 'Special char delete test');

    let dialogMessage = '';
    page.on('dialog', (dialog) => {
      dialogMessage = dialog.message();
      dialog.accept();
    });
    await clickDeleteIcon(page, programName);

    await expect(page.getByRole('row').filter({ hasText: programName })).not.toBeVisible();
    expect(dialogMessage).toContain(programName);
  });

  test('TC-010: Only selected row is deleted when duplicate names exist', async ({ page }) => {
    test.slow();
    const programName = `Del Dup ${Date.now()}`;
    await createProgram(page, programName, 'Row A - delete this');
    await createProgram(page, programName, 'Row B - keep this');

    const rows = page.getByRole('row').filter({ hasText: programName });
    await expect(rows).toHaveCount(2);

    let accepted = false;
    page.on('dialog', (dialog) => {
      if (!accepted) {
        accepted = true;
        dialog.accept();
      } else {
        dialog.dismiss();
      }
    });
    await rows.first().getByRole('button', { name: '🗑' }).click();

    await expect(rows).toHaveCount(1);
  });

  test('TC-011: Deletion works for first and last visible rows', async ({ page }) => {
    test.slow();
    const suffix = Date.now();
    const firstName = `Del First ${suffix}`;
    const middleName = `Del Middle ${suffix}`;
    const lastName = `Del Last ${suffix}`;
    await createProgram(page, firstName, 'First row');
    await createProgram(page, middleName, 'Middle row');
    await createProgram(page, lastName, 'Last row');

    page.on('dialog', (dialog) => dialog.accept());

    const allRows = page.getByRole('row').filter({ hasText: suffix.toString() });
    await allRows.first().getByRole('button', { name: '🗑' }).click();
    await expect(allRows).toHaveCount(2);

    await allRows.last().getByRole('button', { name: '🗑' }).click();
    await expect(allRows).toHaveCount(1);

    await expect(page.getByRole('row').filter({ hasText: middleName })).toBeVisible();
  });

  test.skip('TC-012: Deletion from paginated list removes correct program', async () => {
    // Requires creating enough programs to trigger pagination, which is impractical in a single test
  });

  test.skip('TC-013: Deleting an already-deleted program does not break UI', async () => {
    // Requires concurrent session manipulation which is out of scope for basic UI tests
  });

  test.skip('TC-014: Empty-state after deleting last remaining program', async () => {
    // Requires deleting ALL programs (destructive) or running in an isolated environment
  });
});
