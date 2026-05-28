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

test.describe('DS-2: Edit Program', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToPrograms(page);
  });

  test('TC-001: Edit form opens pre-populated with current program data', async ({ page, trackProgram }) => {
    const programName = `EditPrepop ${Date.now()}`;
    const description = 'Pre-populated check';
    await createProgram(page, programName, description, trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Program Name')).toHaveValue(programName);
    await expect(dialog.getByLabel('Description')).toHaveValue(description);
  });

  test('TC-002: Program name is updated successfully', async ({ page, trackProgram }) => {
    const originalName = `EditName ${Date.now()}`;
    const updatedName = `${originalName} - Updated`;
    await createProgram(page, originalName, 'Original description', trackProgram);

    await openEditDialog(page, originalName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(updatedName);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test('TC-003: Program description is updated successfully', async ({ page, trackProgram }) => {
    const programName = `EditDesc ${Date.now()}`;
    const updatedDescription = 'Updated description for testing';
    await createProgram(page, programName, 'Original description', trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Description').clear();
    await dialog.getByLabel('Description').fill(updatedDescription);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).not.toBeVisible();

    await openEditDialog(page, programName);
    await expect(dialog.getByLabel('Program Name')).toHaveValue(programName);
    await expect(dialog.getByLabel('Description')).toHaveValue(updatedDescription);
  });

  test('TC-004: Editing only Description preserves the Name', async ({ page, trackProgram }) => {
    const programName = `PreserveN ${Date.now()}`;
    const originalDesc = 'Original desc';
    const updatedDesc = 'Preservation test description';
    await createProgram(page, programName, originalDesc, trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Description').clear();
    await dialog.getByLabel('Description').fill(updatedDesc);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).not.toBeVisible();

    await openEditDialog(page, programName);
    await expect(dialog.getByLabel('Program Name')).toHaveValue(programName);
    await expect(dialog.getByLabel('Description')).toHaveValue(updatedDesc);
  });

  test('TC-005: Editing only Name preserves the Description', async ({ page, trackProgram }) => {
    const originalName = `PreserveD ${Date.now()}`;
    const updatedName = `${originalName} Renamed`;
    const description = 'Should stay intact';
    await createProgram(page, originalName, description, trackProgram);

    await openEditDialog(page, originalName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(updatedName);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).not.toBeVisible();

    await openEditDialog(page, updatedName);
    await expect(dialog.getByLabel('Program Name')).toHaveValue(updatedName);
    await expect(dialog.getByLabel('Description')).toHaveValue(description);
  });

  test('TC-006: Save is blocked when Program Name is cleared to empty', async ({ page, trackProgram }) => {
    const programName = `EmptyName ${Date.now()}`;
    await createProgram(page, programName, 'Some description', trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();

    await expect(dialog.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  test('TC-007: Whitespace-only Program Name is treated as empty', async ({ page, trackProgram }) => {
    const programName = `WsName ${Date.now()}`;
    await createProgram(page, programName, 'Some description', trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill('   ');

    await expect(dialog.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  // BUG: App allows duplicate program names — no uniqueness validation exists on edit
  test.fail('TC-008: Editing to a duplicate Program Name is rejected', async ({ page, trackProgram }) => {
    const programA = `ProgA-${Date.now()}`;
    const programB = `ProgB-${Date.now()}`;
    await createProgram(page, programA, 'da', trackProgram);
    await createProgram(page, programB, 'db', trackProgram);

    await openEditDialog(page, programB);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(programA);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeVisible();
  });

  test('TC-009: Cancelling the edit form discards all changes', async ({ page, trackProgram }) => {
    const programName = `CancelTest ${Date.now()}`;
    const description = 'Original cancel desc';
    await createProgram(page, programName, description, trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill('Should Not Save');
    await dialog.getByLabel('Description').clear();
    await dialog.getByLabel('Description').fill('Discarded description');
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();

    await openEditDialog(page, programName);
    await expect(dialog.getByLabel('Program Name')).toHaveValue(programName);
    await expect(dialog.getByLabel('Description')).toHaveValue(description);
  });

  test.skip('TC-010: Unauthorized users cannot edit programs', async () => {
    // Requires non-admin credentials which are not available in the current env
  });

  test('TC-011: Saving with no changes does not cause errors', async ({ page, trackProgram }) => {
    const programName = `NoChange ${Date.now()}`;
    const description = 'Unchanged desc';
    await createProgram(page, programName, description, trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-012: Edited Program Name with special characters is handled safely', async ({ page, trackProgram }) => {
    const programName = `SpecChar ${Date.now()}`;
    const specialName = `Web Dev & AI / 2026 - Cohort #1 ${Date.now()}`;
    await createProgram(page, programName, 'Special char test', trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(specialName);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(specialName)).toBeVisible();
  });

  test('TC-013: Script-like input is stored as text and not executed', async ({ page, trackProgram }) => {
    const programName = `XssEdit ${Date.now()}`;
    const xssPayload = `<script>alert('x')</script> ${Date.now()}`;
    await createProgram(page, programName, 'XSS test', trackProgram);

    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(xssPayload);

    const saveBtn = dialog.getByRole('button', { name: 'Save' });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
    }

    expect(dialogFired).toBe(false);
  });

  test('TC-014: Program Name maximum length boundary is enforced on edit', async ({ page, trackProgram }) => {
    test.setTimeout(60000);
    const programName = `MaxLen ${Date.now()}`;
    const maxName = `Max ${Date.now()} ${'a'.repeat(240)}`.slice(0, 255);
    await createProgram(page, programName, 'Max boundary test', trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(maxName);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(maxName)).toBeVisible();
  });

  // BUG: App accepts names beyond 255 chars on edit — no max-length validation exists
  test.fail('TC-015: Program Name beyond maximum length is rejected on edit', async ({ page, trackProgram }) => {
    const programName = `OverLen ${Date.now()}`;
    const overflowName = 'a'.repeat(256);
    await createProgram(page, programName, 'Overflow test', trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(overflowName);

    await expect(dialog.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  // BUG: Double-click Save applies duplicate updates — no submission guard exists
  test.fail('TC-016: Double-clicking Save does not create duplicate updates', async ({ page, trackProgram }) => {
    const programName = `DblSave ${Date.now()}`;
    const updatedName = `DblSave Updated ${Date.now()}`;
    await createProgram(page, programName, 'Double save test', trackProgram);

    await openEditDialog(page, programName);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(updatedName);
    await dialog.getByRole('button', { name: 'Save' }).dblclick();

    await expect(dialog).not.toBeVisible();
    const rows = page.getByRole('row').filter({ hasText: updatedName });
    await expect(rows).toHaveCount(1);
  });

  test('TC-017: Edit form reflects latest data after a previous edit', async ({ page, trackProgram }) => {
    const programName = `Stale ${Date.now()}`;
    const firstUpdate = `${programName} v2`;
    await createProgram(page, programName, 'First version', trackProgram);

    await openEditDialog(page, programName);
    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(firstUpdate);
    await dialog.getByLabel('Description').clear();
    await dialog.getByLabel('Description').fill('Second version');
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).not.toBeVisible();

    await openEditDialog(page, firstUpdate);
    await expect(dialog.getByLabel('Program Name')).toHaveValue(firstUpdate);
    await expect(dialog.getByLabel('Description')).toHaveValue('Second version');
  });
});
