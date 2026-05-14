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

async function openCreateModal(page: Page) {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
}

test.describe('DS-3: Program Name Validation & Duplicate Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToPrograms(page);
  });

  // --- Positive Flows ---

  test('TC-001: Program Name with valid letters, symbols, and accents is accepted', async ({ page }) => {
    const programName = `Informatique & IA - Niveau 2 ${Date.now()}`;

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Programme bilingue axe sur IA appliquee.');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-002: Leading/trailing spaces are trimmed on save', async ({ page }) => {
    const suffix = Date.now();
    const paddedName = `  Data Science 101 ${suffix}  `;
    const expectedName = paddedName.trim();

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(paddedName);
    await page.getByLabel('Description').fill('Trim validation test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(expectedName)).toBeVisible();
  });

  test('TC-003: Mixed alphanumeric and allowed punctuation is accepted', async ({ page }) => {
    const programName = `QA/Test_Automation-2026 ${Date.now()}`;

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Punctuation acceptance test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  // --- Negative Flows ---

  test('TC-004: Whitespace-only Program Name blocks submission', async ({ page }) => {
    await openCreateModal(page);

    await page.getByLabel('Program Name').fill('   ');
    await page.getByLabel('Description').fill('Whitespace only test');

    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  // BUG: App allows duplicate program names — no uniqueness validation exists
  test.fail('TC-005: Exact duplicate Program Name is rejected', async ({ page }) => {
    test.slow();
    const programName = `Dup Exact ${Date.now()}`;

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('First creation');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Duplicate attempt');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  });

  // BUG: App allows duplicate names even with leading/trailing spaces
  test.fail('TC-006: Duplicate with leading/trailing spaces is rejected after trim', async ({ page }) => {
    test.slow();
    const programName = `Dup Padded ${Date.now()}`;

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('First creation');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(`  ${programName}  `);
    await page.getByLabel('Description').fill('Padded duplicate attempt');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  });

  test('TC-007: Empty Program Name blocks submission', async ({ page }) => {
    await openCreateModal(page);

    await page.getByLabel('Description').fill('Empty name test');

    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-008: UI stays on form when whitespace-only name validation fails', async ({ page }) => {
    await openCreateModal(page);

    await page.getByLabel('Program Name').fill('   ');
    await page.getByLabel('Description').fill('Retained description value');

    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
    await expect(page.getByLabel('Description')).toHaveValue('Retained description value');
  });

  // --- Edge Cases ---

  test('TC-009: Minimum 1-character name is accepted', async ({ page }) => {
    const description = `Min char test ${Date.now()}`;

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill('A');
    await page.getByLabel('Description').fill(description);
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: description })).toBeVisible();
  });

  test('TC-010: Maximum allowed Program Name length (255) is accepted', async ({ page }) => {
    const programName = `Max ${Date.now()} ${'a'.repeat(240)}`.slice(0, 255);

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Max length boundary test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  // BUG: App accepts names beyond 255 chars — no max-length validation exists
  test.fail('TC-011: Program Name exceeding max length is rejected', async ({ page }) => {
    await openCreateModal(page);

    await page.getByLabel('Program Name').fill('a'.repeat(256));
    await page.getByLabel('Description').fill('Over max length test');

    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  // BUG: App allows case-variant duplicates — no case-insensitive duplicate check
  test.fail('TC-012: Case-variant duplicate is rejected', async ({ page }) => {
    test.slow();
    const programName = `Dup Case ${Date.now()}`;

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Original casing');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(programName.toLowerCase());
    await page.getByLabel('Description').fill('Lowercase variant');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  });

  // BUG: App allows whitespace-variant duplicates — no internal space normalization
  test.fail('TC-013: Internal whitespace variant duplicate is rejected', async ({ page }) => {
    test.slow();
    const suffix = Date.now();
    const programName = `Web Development ${suffix}`;

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Normal spacing');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(`Web  Development   ${suffix}`);
    await page.getByLabel('Description').fill('Extra internal spaces');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  });

  test('TC-014: International Unicode characters are accepted', async ({ page }) => {
    const programName = `Ingénierie des Données - Édition ${Date.now()}`;

    await openCreateModal(page);
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Unicode acceptance test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });
});
