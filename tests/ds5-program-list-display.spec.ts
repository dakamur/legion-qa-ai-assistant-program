import { test, expect } from '../fixtures/cleanup.fixture';

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

async function createProgram(
  page: Page,
  name: string,
  description: string,
  trackFn: (uuid: string) => void,
) {
  const responsePromise = page.waitForResponse(
    (r) => r.request().method() === 'POST' && r.url().includes('/api/programs'),
  );
  await page.getByRole('button', { name: '+ New Program' }).click();
  await page.getByLabel('Program Name').fill(name);
  if (description) {
    await page.getByLabel('Description').fill(description);
  }
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).not.toBeVisible();
  const res = await responsePromise;
  if (res.ok()) {
    try {
      const body = await res.json();
      const id = body?.data?.id ?? body?.id;
      if (id) trackFn(id);
    } catch { /* non-JSON response */ }
  }
}

test.describe('DS-5: Program List Display', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToPrograms(page);
  });

  // --- Positive Flows ---

  test('TC-001: Programs page displays each program with name and description', async ({ page, trackProgram }) => {
    test.slow();
    const suffix = Date.now();
    const programs = [
      { name: `Onboarding ${suffix}`, desc: 'Initial training for new hires' },
      { name: `Leadership ${suffix}`, desc: 'Management development program' },
      { name: `Compliance ${suffix}`, desc: 'Annual compliance refresher' },
    ];

    for (const p of programs) {
      await createProgram(page, p.name, p.desc, trackProgram);
    }

    await expect(page.getByRole('table')).toBeVisible();

    for (const p of programs) {
      const row = page.getByRole('row').filter({ hasText: p.name });
      await expect(row).toBeVisible();
      await expect(row.getByText(p.desc)).toBeVisible();
    }
  });

  test.skip('TC-002: Empty-state message when no programs exist', async () => {
    // Requires 0 programs in the system — destructive to shared test environment
  });

  test('TC-003: Program details are correctly mapped per row', async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programA = { name: `Security Essentials ${suffix}`, desc: 'Security policy and awareness' };
    const programB = { name: `Data Literacy ${suffix}`, desc: 'Intro to metrics and dashboards' };
    await createProgram(page, programA.name, programA.desc, trackProgram);
    await createProgram(page, programB.name, programB.desc, trackProgram);

    const rowA = page.getByRole('row').filter({ hasText: programA.name });
    await expect(rowA.getByText(programA.desc)).toBeVisible();
    await expect(rowA.getByText(programB.desc)).not.toBeVisible();

    const rowB = page.getByRole('row').filter({ hasText: programB.name });
    await expect(rowB.getByText(programB.desc)).toBeVisible();
    await expect(rowB.getByText(programA.desc)).not.toBeVisible();
  });

  // --- Negative Flows ---

  test('TC-004: Empty-state UI does not appear when program exists', async ({ page, trackProgram }) => {
    const programName = `No Empty State ${Date.now()}`;
    await createProgram(page, programName, 'Should prevent empty state', trackProgram);

    await expect(page.getByRole('row').filter({ hasText: programName })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('TC-005: Program list does not show raw null/undefined values', async ({ page, trackProgram }) => {
    const programName = `Data Governance ${Date.now()}`;
    await createProgram(page, programName, '', trackProgram);

    const row = page.getByRole('row').filter({ hasText: programName });
    await expect(row).toBeVisible();
    await expect(row.getByText('null', { exact: true })).not.toBeVisible();
    await expect(row.getByText('undefined', { exact: true })).not.toBeVisible();
    await expect(row.getByText('[object Object]', { exact: true })).not.toBeVisible();
  });

  test('TC-006: Program list does not execute HTML/JS from name or description', async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const xssName = `<script>alert('x')</script> Security ${suffix}`;
    const xssDesc = `<b>Bold</b> and <img src=x onerror=alert(1)>`;

    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    await createProgram(page, xssName, xssDesc, trackProgram);

    const row = page.getByRole('row').filter({ hasText: suffix.toString() });
    await expect(row).toBeVisible();
    expect(dialogFired).toBe(false);
  });

  test('TC-007: Program list does not duplicate entries after navigation', async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programA = `Nav DupA ${suffix}`;
    const programB = `Nav DupB ${suffix}`;
    await createProgram(page, programA, 'Leadership Track', trackProgram);
    await createProgram(page, programB, 'Compliance Basics', trackProgram);

    const countBefore = await page.getByRole('row').filter({ hasText: suffix.toString() }).count();

    await page.getByRole('button', { name: '📊 Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await navigateToPrograms(page);

    const countAfter = await page.getByRole('row').filter({ hasText: suffix.toString() }).count();
    expect(countAfter).toBe(countBefore);

    await page.reload();
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();

    const countReload = await page.getByRole('row').filter({ hasText: suffix.toString() }).count();
    expect(countReload).toBe(countBefore);
  });

  // --- Edge Cases ---

  test('TC-008: Program with empty description displays gracefully', async ({ page, trackProgram }) => {
    const programName = `Empty Desc Display ${Date.now()}`;
    await createProgram(page, programName, '', trackProgram);

    const row = page.getByRole('row').filter({ hasText: programName });
    await expect(row).toBeVisible();

    const cells = row.getByRole('cell');
    await expect(cells.first()).toBeVisible();
  });

  test('TC-009: Special characters and Unicode display correctly', async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `R&D / QA - Café #1 ${suffix}`;
    const description = 'Supports symbols: % & / ? + = and non-Latin: 日本語, العربية';
    await createProgram(page, programName, description, trackProgram);

    const row = page.getByRole('row').filter({ hasText: programName });
    await expect(row).toBeVisible();
    await expect(row.getByText(description)).toBeVisible();
  });

  test('TC-010: Max-length name and description render without page crash', async ({ page, trackProgram }) => {
    const programName = `MaxDisplay ${Date.now()} ${'a'.repeat(230)}`.slice(0, 255);
    const longDescription = 'word '.repeat(400);
    await createProgram(page, programName, longDescription, trackProgram);

    const row = page.getByRole('row').filter({ hasText: programName.slice(0, 50) });
    await expect(row).toBeVisible();

    await expect(page.getByRole('table')).toBeVisible();
    const otherRows = page.getByRole('row');
    expect(await otherRows.count()).toBeGreaterThan(1);
  });

  test('TC-011: Duplicate program names are distinguishable via description', async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programName = `Onboarding ${suffix}`;
    const descA = `North America cohort ${suffix}`;
    const descB = `EMEA cohort ${suffix}`;
    await createProgram(page, programName, descA, trackProgram);
    await createProgram(page, programName, descB, trackProgram);

    const rows = page.getByRole('row').filter({ hasText: programName });
    await expect(rows).toHaveCount(2);

    await expect(page.getByRole('row').filter({ hasText: descA })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: descB })).toBeVisible();
  });

  test.skip('TC-012: Whitespace-only name display behavior', async () => {
    // Cannot create a whitespace-only program name via UI — Create button is disabled
  });

  test.skip('TC-013: Empty-state persists across refresh with zero programs', async () => {
    // Requires 0 programs in the system — destructive to shared test environment
  });
});
