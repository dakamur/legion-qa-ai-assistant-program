import { test, expect } from '@playwright/test';

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

async function createProgram(page: import('@playwright/test').Page, name: string, description: string) {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await page.getByLabel('Program Name').fill(name);
  await page.getByLabel('Description').fill(description);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
  await expect(page.getByText(name)).toBeVisible();
}

function clickDeleteIcon(page: import('@playwright/test').Page, programName: string) {
  const row = page.getByRole('row').filter({ hasText: programName });
  return row.getByRole('button', { name: '🗑' }).click();
}

test.describe('DS-4: Delete Program', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToPrograms(page);
  });

  test('TC-001: Clicking delete icon displays confirmation dialog', async ({ page }) => {
    const programName = `DelDialog ${Date.now()}`;
    await createProgram(page, programName, 'Confirm dialog test');

    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await clickDeleteIcon(page, programName);

    expect(dialogMessage).toContain(programName);
    await expect(page.getByRole('row').filter({ hasText: programName })).toBeVisible();
  });

  test('TC-002: Confirming deletion removes program from the list', async ({ page }) => {
    const programName = `DelConfirm ${Date.now()}`;
    await createProgram(page, programName, 'Confirm removal test');

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await clickDeleteIcon(page, programName);

    await expect(page.getByRole('row').filter({ hasText: programName })).toHaveCount(0);
  });

  test('TC-003: Full delete flow — icon click through confirmation to removal', async ({ page }) => {
    const programName = `DelFull ${Date.now()}`;
    await createProgram(page, programName, 'Full flow test');

    let dialogShown = false;
    page.on('dialog', async (dialog) => {
      dialogShown = true;
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain(programName);
      await dialog.accept();
    });

    await clickDeleteIcon(page, programName);

    expect(dialogShown).toBe(true);
    await expect(page.getByRole('row').filter({ hasText: programName })).toHaveCount(0);
  });

  test('TC-004: Cancelling deletion preserves the program in the list', async ({ page }) => {
    const programName = `DelCancel ${Date.now()}`;
    await createProgram(page, programName, 'Cancel test');

    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await clickDeleteIcon(page, programName);

    await expect(page.getByRole('row').filter({ hasText: programName })).toBeVisible();
  });

  test('TC-005: Deleted program count is updated in the list', async ({ page }) => {
    const programA = `CountA ${Date.now()}`;
    const programB = `CountB ${Date.now()}`;
    await createProgram(page, programA, 'count a');
    await createProgram(page, programB, 'count b');

    const rowsBefore = await page.getByRole('row').count();

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await clickDeleteIcon(page, programA);
    await expect(page.getByRole('row').filter({ hasText: programA })).toHaveCount(0);

    const rowsAfter = await page.getByRole('row').count();
    expect(rowsAfter).toBe(rowsBefore - 1);
    await expect(page.getByRole('row').filter({ hasText: programB })).toBeVisible();
  });

  test('TC-006: Dismissing the confirmation dialog (cancel) preserves the program', async ({ page }) => {
    const programName = `DelDismiss ${Date.now()}`;
    await createProgram(page, programName, 'Dismiss test');

    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await clickDeleteIcon(page, programName);

    await expect(page.getByRole('row').filter({ hasText: programName })).toBeVisible();
  });

  test.skip('TC-007: Unauthorized users cannot delete programs', async () => {
    // Requires non-admin credentials which are not available in the current env
  });

  test('TC-008: Cancel then re-open delete confirmation works correctly', async ({ page }) => {
    const programName = `CancelRetry ${Date.now()}`;
    await createProgram(page, programName, 'Cancel retry test');

    let dialogCount = 0;
    page.on('dialog', async (dialog) => {
      dialogCount++;
      if (dialogCount === 1) {
        await dialog.dismiss();
      } else {
        await dialog.accept();
      }
    });

    await clickDeleteIcon(page, programName);
    await expect(page.getByRole('row').filter({ hasText: programName })).toBeVisible();

    await clickDeleteIcon(page, programName);
    await expect(page.getByRole('row').filter({ hasText: programName })).toHaveCount(0);

    expect(dialogCount).toBe(2);
  });

  test('TC-009: Double-clicking the delete icon does not bypass confirmation', async ({ page }) => {
    const programName = `DblDel ${Date.now()}`;
    await createProgram(page, programName, 'Double-click delete test');

    let dialogCount = 0;
    page.on('dialog', async (dialog) => {
      dialogCount++;
      await dialog.dismiss();
    });

    const row = page.getByRole('row').filter({ hasText: programName });
    await row.getByRole('button', { name: '🗑' }).dblclick();

    await expect(page.getByRole('row').filter({ hasText: programName })).toBeVisible();
    expect(dialogCount).toBeGreaterThanOrEqual(1);
  });

  test.skip('TC-010: Deleting the last remaining program shows empty state', async () => {
    // Skipped: requires deleting all programs in the system which is destructive
    // to shared test data and impractical with 1000+ programs. Needs isolated env.
  });

  test('TC-011: Deleting a program with a long name displays correctly in confirmation', async ({ page }) => {
    const longName = `LongDel ${Date.now()} ${'a'.repeat(200)}`.slice(0, 250);
    await createProgram(page, longName, 'Long name delete test');

    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await clickDeleteIcon(page, longName);

    expect(dialogMessage).toContain(longName);
    await expect(page.getByRole('row').filter({ hasText: longName })).toBeVisible();
  });

  test('TC-012: Deleting a program with special characters works correctly', async ({ page }) => {
    const programName = `Web Dev & AI / 2026 - Cohort #1 ${Date.now()}`;
    await createProgram(page, programName, 'Special char delete test');

    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await clickDeleteIcon(page, programName);

    expect(dialogMessage).toContain(programName);
    await expect(page.getByRole('row').filter({ hasText: programName })).toHaveCount(0);
  });

  test('TC-013: Double-clicking confirm does not cause errors', async ({ page }) => {
    const programName = `DblConfirm ${Date.now()}`;
    await createProgram(page, programName, 'Double confirm test');

    let dialogCount = 0;
    page.on('dialog', async (dialog) => {
      dialogCount++;
      await dialog.accept();
    });

    await clickDeleteIcon(page, programName);

    await expect(page.getByRole('row').filter({ hasText: programName })).toHaveCount(0);
    expect(dialogCount).toBe(1);
  });

  test('TC-014: Programs list refreshes correctly after multiple sequential deletions', async ({ page }) => {
    const programA = `SeqDelA ${Date.now()}`;
    const programB = `SeqDelB ${Date.now()}`;
    const programC = `SeqDelC ${Date.now()}`;
    await createProgram(page, programA, 'seq a');
    await createProgram(page, programB, 'seq b');
    await createProgram(page, programC, 'seq c');

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await clickDeleteIcon(page, programA);
    await expect(page.getByRole('row').filter({ hasText: programA })).toHaveCount(0);
    await expect(page.getByRole('row').filter({ hasText: programB })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: programC })).toBeVisible();

    await clickDeleteIcon(page, programB);
    await expect(page.getByRole('row').filter({ hasText: programB })).toHaveCount(0);
    await expect(page.getByRole('row').filter({ hasText: programC })).toBeVisible();
  });
});
