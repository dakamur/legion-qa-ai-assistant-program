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

function openEditDialog(page: import('@playwright/test').Page, programName: string) {
  const row = page.getByRole('row').filter({ hasText: programName });
  return row.getByRole('button', { name: '✏️' }).click();
}

function deleteProgram(page: import('@playwright/test').Page, programName: string) {
  const row = page.getByRole('row').filter({ hasText: programName });
  return row.getByRole('button', { name: '🗑' }).click();
}

test.describe('DS-3: Name Validation & Duplicate Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToPrograms(page);
  });

  test('TC-001: Program name with special characters is accepted', async ({ page }) => {
    const programName = `Informatique & IA - Niveau 2 ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Special characters acceptance test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-002: Program name with accented and unicode characters is accepted', async ({ page }) => {
    const programName = `Éducation Spécialisée — Côte d'Ivoire ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Unicode acceptance test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-003: Program name with ampersand, dash, and numeric characters is accepted', async ({ page }) => {
    const programName = `CS & Math - Level 2 (2026) ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Mixed characters test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-004: Whitespace-only program name is rejected', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Program' }).click();

    await page.getByLabel('Program Name').fill('   ');
    await page.getByLabel('Description').fill('Whitespace test');

    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-005: Tab-only program name is rejected', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Program' }).click();

    await page.getByLabel('Program Name').fill('\t');
    await page.getByLabel('Description').fill('Tab test');

    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  // BUG: App allows duplicate program names — no uniqueness validation exists
  test.fail('TC-006: Duplicate program name is rejected with error message', async ({ page }) => {
    const programName = `DupCheck ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('First creation');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Duplicate attempt');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  });

  // BUG: App allows duplicate names regardless of casing — no case-insensitive check
  test.fail('TC-007: Duplicate name with different casing is handled', async ({ page }) => {
    const programName = `CaseCheck ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Original');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName.toLowerCase());
    await page.getByLabel('Description').fill('Lowercase duplicate');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  });

  // BUG: App does not trim before duplicate check — padded duplicates slip through
  test.fail('TC-008: Duplicate name with leading/trailing whitespace is rejected', async ({ page }) => {
    const programName = `TrimDup ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Original');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(`  ${programName}  `);
    await page.getByLabel('Description').fill('Padded duplicate');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  });

  test('TC-009: Empty program name is rejected', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Program' }).click();

    await page.getByLabel('Description').fill('Empty name test');

    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-010: Program name with HTML/script tags is sanitized and not executed', async ({ page }) => {
    const xssPayload = `<script>alert('xss')</script> ${Date.now()}`;
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(xssPayload);
    await page.getByLabel('Description').fill('XSS test');

    const createBtn = page.getByRole('button', { name: 'Create' });
    if (await createBtn.isEnabled()) {
      await createBtn.click();
    }

    expect(dialogFired).toBe(false);
  });

  test('TC-011: Program name with only punctuation is accepted', async ({ page }) => {
    const programName = `--- ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Punctuation only test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  // BUG: App allows duplicate names on edit — no uniqueness validation on save
  test.fail('TC-012: Duplicate check applies during edit as well as create', async ({ page }) => {
    const programA = `ProgA-${Date.now()}`;
    const programB = `ProgB-${Date.now()}`;
    await createProgram(page, programA, 'da');
    await createProgram(page, programB, 'db');

    await openEditDialog(page, programB);

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByLabel('Program Name').clear();
    await dialog.getByLabel('Program Name').fill(programA);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeVisible();
  });

  test('TC-013: Name with leading/trailing whitespace is trimmed on create', async ({ page }) => {
    const baseName = `TrimTest ${Date.now()}`;
    const paddedName = `  ${baseName}  `;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(paddedName);
    await page.getByLabel('Description').fill('Trim test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(baseName)).toBeVisible();
  });

  test('TC-014: Reusing a deleted program name succeeds', async ({ page }) => {
    const programName = `Reuse ${Date.now()}`;
    await createProgram(page, programName, 'Will be deleted');

    page.on('dialog', async (d) => { await d.accept(); });

    await deleteProgram(page, programName);
    await expect(page.getByRole('row').filter({ hasText: programName })).toHaveCount(0);

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Reused after delete');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });
});
