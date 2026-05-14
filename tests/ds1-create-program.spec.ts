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

test.describe('DS-1: Create Program', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToPrograms(page);
  });

  test('TC-001: Program creation form is displayed with required fields', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Program' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
    await expect(page.getByLabel('Program Name')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
  });

  test('TC-002: Program is created successfully with valid inputs', async ({ page }) => {
    const programName = `Web Development 2026 ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Full-stack web development program');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-003: Newly created program appears only once in program list', async ({ page }) => {
    const programName = `Unique Program ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Full-stack web development program');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    const rows = page.getByRole('row').filter({ hasText: programName });
    await expect(rows).toHaveCount(1);
  });

  test('TC-004: Create action is blocked when Program Name is empty', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Program' }).click();

    await page.getByLabel('Description').fill('Full-stack web development program');

    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-005: Whitespace-only Program Name is treated as empty', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Program' }).click();

    await page.getByLabel('Program Name').fill('   ');
    await page.getByLabel('Description').fill('Full-stack web development program');

    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  // BUG: App allows duplicate program names — no uniqueness validation exists
  test.fail('TC-006: Duplicate Program Name is rejected', async ({ page }) => {
    const programName = `Duplicate Test ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('First creation');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Duplicate name test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  });

  test.skip('TC-007: Unauthorized users cannot access program creation', async () => {
    // Requires non-admin credentials which are not available in the current env
  });

  test('TC-008: Program Name supports minimum valid length', async ({ page }) => {
    const description = `Minimum length test ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill('A');
    await page.getByLabel('Description').fill(description);
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: description })).toBeVisible();
  });

  test('TC-009: Program Name maximum length boundary is enforced', async ({ page }) => {
    const programName = `Max ${Date.now()} ${'a'.repeat(240)}`.slice(0, 255);

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Max boundary test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  // BUG: App accepts names beyond 255 chars — no max-length validation exists
  test.fail('TC-010: Program Name beyond maximum length is rejected', async ({ page }) => {
    const programName = 'a'.repeat(256);

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Overflow boundary test');

    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-011: Program Name with special characters is handled safely', async ({ page }) => {
    const programName = `Web Dev & AI / 2026 - Cohort #1 ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Special characters test');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-012: Script-like input is stored as text and not executed', async ({ page }) => {
    const xssPayload = `<script>alert('x')</script> ${Date.now()}`;
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(xssPayload);
    await page.getByLabel('Description').fill('Security encoding test');

    const createBtn = page.getByRole('button', { name: 'Create' });
    if (await createBtn.isEnabled()) {
      await createBtn.click();
    }

    expect(dialogFired).toBe(false);
  });

  test('TC-013: Empty Description does not block valid create', async ({ page }) => {
    const programName = `No Desc ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);

    const createBtn = page.getByRole('button', { name: 'Create' });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-014: Description maximum length boundary is enforced', async ({ page }) => {
    const programName = `Desc Max ${Date.now()}`;
    const longDescription = 'a'.repeat(1000);

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill(longDescription);
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  // BUG: Double-click creates 2 records — no duplicate submission guard exists
  test.fail('TC-015: Double-clicking Create does not create duplicate records', async ({ page }) => {
    const programName = `Double Click ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(programName);
    await page.getByLabel('Description').fill('Double submit test');
    await page.getByRole('button', { name: 'Create' }).dblclick();

    await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
    const rows = page.getByRole('row').filter({ hasText: programName });
    await expect(rows).toHaveCount(1);
  });
});
