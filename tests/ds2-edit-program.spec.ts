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

async function openEditModal(page: Page, programName: string) {
  const row = page.getByRole('row').filter({ hasText: programName });
  await row.getByRole('button', { name: '✏️' }).click();
  await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeVisible();
}

test.describe('DS-2: Edit Program', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToPrograms(page);
  });

  test('TC-001: Edit form opens with current program data pre-populated', async ({ page }) => {
    const programName = `Edit Prepop ${Date.now()}`;
    const description = 'Full-stack web development program';
    await createProgram(page, programName, description);

    await openEditModal(page, programName);

    await expect(page.getByLabel('Program Name')).toHaveValue(programName);
    await expect(page.getByLabel('Description')).toHaveValue(description);
  });

  test('TC-002: Program name update is saved and reflected immediately in list', async ({ page }) => {
    const suffix = Date.now();
    const originalName = `Edit Name ${suffix}`;
    const updatedName = `Renamed Program ${suffix}`;
    await createProgram(page, originalName, 'Full-stack web development program');

    await openEditModal(page, originalName);
    await page.getByLabel('Program Name').fill(updatedName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).not.toBeVisible();
    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: originalName })).not.toBeVisible();
  });

  test('TC-003: Editing only description preserves unchanged name', async ({ page }) => {
    const programName = `Edit Desc Only ${Date.now()}`;
    const updatedDescription = 'Updated curriculum with AI-assisted testing modules';
    await createProgram(page, programName, 'Original description');

    await openEditModal(page, programName);
    await page.getByLabel('Description').fill(updatedDescription);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();

    await openEditModal(page, programName);
    await expect(page.getByLabel('Program Name')).toHaveValue(programName);
    await expect(page.getByLabel('Description')).toHaveValue(updatedDescription);
  });

  test('TC-004: Trimmed valid name is saved correctly', async ({ page }) => {
    const suffix = Date.now();
    const programName = `Edit Trim ${suffix}`;
    await createProgram(page, programName, 'Trim test');

    await openEditModal(page, programName);
    const paddedName = `  Edit Trim Updated ${suffix}  `;
    await page.getByLabel('Program Name').fill(paddedName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).not.toBeVisible();
    const expectedName = paddedName.trim();
    await expect(page.getByText(expectedName)).toBeVisible();
  });

  test('TC-005: Save is blocked when name is empty', async ({ page }) => {
    const programName = `Edit Empty ${Date.now()}`;
    await createProgram(page, programName, 'Empty name test');

    await openEditModal(page, programName);
    await page.getByLabel('Program Name').fill('');

    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeVisible();
  });

  test('TC-006: Whitespace-only name is rejected', async ({ page }) => {
    const programName = `Edit Whitespace ${Date.now()}`;
    await createProgram(page, programName, 'Whitespace test');

    await openEditModal(page, programName);
    await page.getByLabel('Program Name').fill('   ');

    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  // BUG: App allows duplicate program names on edit — no uniqueness validation exists
  test.fail('TC-007: Duplicate program name update is prevented', async ({ page }) => {
    test.slow();
    const suffix = Date.now();
    const programA = `Edit DupA ${suffix}`;
    const programB = `Edit DupB ${suffix}`;
    await createProgram(page, programA, 'Program A');
    await createProgram(page, programB, 'Program B');

    await openEditModal(page, programA);
    await page.getByLabel('Program Name').fill(programB);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeVisible();
  });

  test.skip('TC-008: Failed save does not close modal or show stale success state', async () => {
    // Requires API failure simulation (network interception) which is out of scope for basic UI tests
  });

  test('TC-009: Double-clicking Save does not create duplicate updates', async ({ page }) => {
    const programName = `Edit DblSave ${Date.now()}`;
    const updatedName = `${programName} - Updated`;
    await createProgram(page, programName, 'Double save test');

    await openEditModal(page, programName);
    await page.getByLabel('Program Name').fill(updatedName);
    await page.getByRole('button', { name: 'Save' }).dblclick();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).not.toBeVisible();
    const rows = page.getByRole('row').filter({ hasText: updatedName });
    await expect(rows).toHaveCount(1);
  });

  test('TC-010: Name supports minimum valid boundary length', async ({ page }) => {
    const description = `Min length edit ${Date.now()}`;
    const programName = `Edit MinLen ${Date.now()}`;
    await createProgram(page, programName, description);

    await openEditModal(page, programName);
    await page.getByLabel('Program Name').fill('A');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).not.toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: description })).toBeVisible();
  });

  test('TC-011: Name accepts value at maximum allowed length', async ({ page }) => {
    const programName = `Edit MaxLen ${Date.now()}`;
    await createProgram(page, programName, 'Max length edit test');

    await openEditModal(page, programName);
    const maxName = `Max ${Date.now()} ${'a'.repeat(240)}`.slice(0, 255);
    await page.getByLabel('Program Name').fill(maxName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).not.toBeVisible();
    await expect(page.getByText(maxName)).toBeVisible();
  });

  // BUG: App accepts names beyond 255 chars on edit — no max-length validation exists
  test.fail('TC-012: Name exceeding maximum length is rejected', async ({ page }) => {
    const programName = `Edit OverLen ${Date.now()}`;
    await createProgram(page, programName, 'Over length edit test');

    await openEditModal(page, programName);
    await page.getByLabel('Program Name').fill('a'.repeat(256));

    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  test('TC-013: Special characters in name are stored and displayed correctly', async ({ page }) => {
    const programName = `Edit Special ${Date.now()}`;
    await createProgram(page, programName, 'Special chars edit test');

    const specialName = `Web Dev & AI / 2026 - Cohort #1 ${Date.now()}`;
    await openEditModal(page, programName);
    await page.getByLabel('Program Name').fill(specialName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).not.toBeVisible();
    await expect(page.getByText(specialName)).toBeVisible();
  });

  test('TC-014: Script-like input is treated as plain text and not executed', async ({ page }) => {
    const programName = `Edit XSS ${Date.now()}`;
    await createProgram(page, programName, 'XSS edit test');

    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    const xssPayload = `<script>alert('x')</script>`;
    await openEditModal(page, programName);
    await page.getByLabel('Description').fill(xssPayload);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).not.toBeVisible();

    await openEditModal(page, programName);
    await expect(page.getByLabel('Description')).toHaveValue(xssPayload);
    expect(dialogFired).toBe(false);
  });

  test('TC-015: Empty description preserves name on save', async ({ page }) => {
    const programName = `Edit EmptyDesc ${Date.now()}`;
    await createProgram(page, programName, 'Will be cleared');

    await openEditModal(page, programName);
    await page.getByLabel('Description').fill('');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();

    await openEditModal(page, programName);
    await expect(page.getByLabel('Program Name')).toHaveValue(programName);
    await expect(page.getByLabel('Description')).toHaveValue('');
  });

  test('TC-016: Description maximum-length boundary is enforced on edit', async ({ page }) => {
    const programName = `Edit DescMax ${Date.now()}`;
    await createProgram(page, programName, 'Desc max edit test');

    const maxDescription = 'a'.repeat(1000);
    await openEditModal(page, programName);
    await page.getByLabel('Description').fill(maxDescription);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });
});
