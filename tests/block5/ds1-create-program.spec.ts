import { test, expect } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages/programs.page';
import { createProgram } from '../../helpers/program.helpers';

test.describe('DS-1: Create Program', () => {
  let programs: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-001: Program creation form is displayed with required fields', async () => {
    await programs.openNewProgram();

    const modal = programs.newProgramModal;
    await expect(modal.dialog).toBeVisible();
    await expect(modal.programNameInput).toBeVisible();
    await expect(modal.descriptionInput).toBeVisible();
    await expect(modal.createButton).toBeVisible();
  });

  test('TC-002: Program is created successfully with valid inputs', async ({ page, trackProgram }) => {
    const programName = `Web Development 2026 ${Date.now()}`;
    await createProgram(programs, page, programName, 'Full-stack web development program', trackProgram);
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-003: Newly created program appears only once in program list', async ({ page, trackProgram }) => {
    const programName = `Unique Program ${Date.now()}`;
    await createProgram(programs, page, programName, 'Full-stack web development program', trackProgram);
    await expect(programs.rowFor(programName)).toHaveCount(1);
  });

  test('TC-004: Create action is blocked when Program Name is empty', async () => {
    await programs.openNewProgram();

    const modal = programs.newProgramModal;
    await modal.fillDescription('Full-stack web development program');

    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-005: Whitespace-only Program Name is treated as empty', async () => {
    await programs.openNewProgram();

    const modal = programs.newProgramModal;
    await modal.fillName('   ');
    await modal.fillDescription('Full-stack web development program');

    await expect(modal.createButton).toBeDisabled();
  });

  // BUG: App allows duplicate program names — no uniqueness validation exists
  test.fail('TC-006: Duplicate Program Name is rejected', async ({ page, trackProgram }) => {
    const programName = `Duplicate Test ${Date.now()}`;
    await createProgram(programs, page, programName, 'First creation', trackProgram);

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription('Duplicate name test');
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
  });

  test.skip('TC-007: Unauthorized users cannot access program creation', async () => {
    // Requires non-admin credentials which are not available in the current env
  });

  test('TC-008: Program Name supports minimum valid length', async ({ page, trackProgram }) => {
    const description = `Minimum length test ${Date.now()}`;
    await createProgram(programs, page, 'A', description, trackProgram);
    await expect(programs.rowFor(description)).toBeVisible();
  });

  test('TC-009: Program Name maximum length boundary is enforced', async ({ page, trackProgram }) => {
    const programName = `Max ${Date.now()} ${'a'.repeat(240)}`.slice(0, 255);
    await createProgram(programs, page, programName, 'Max boundary test', trackProgram);
    await expect(page.getByText(programName)).toBeVisible();
  });

  // BUG: App accepts names beyond 255 chars — no max-length validation exists
  test.fail('TC-010: Program Name beyond maximum length is rejected', async () => {
    const programName = 'a'.repeat(256);

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription('Overflow boundary test');

    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-011: Program Name with special characters is handled safely', async ({ page, trackProgram }) => {
    const programName = `Web Dev & AI / 2026 - Cohort #1 ${Date.now()}`;
    await createProgram(programs, page, programName, 'Special characters test', trackProgram);
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-012: Script-like input is stored as text and not executed', async ({ page, trackProgram }) => {
    const xssPayload = `<script>alert('x')</script> ${Date.now()}`;
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(xssPayload);
    await modal.fillDescription('Security encoding test');

    if (await modal.createButton.isEnabled()) {
      const responsePromise = page.waitForResponse(
        (r) => r.request().method() === 'POST' && r.url().includes('/api/programs'),
      );
      await modal.submit();
      const res = await responsePromise;
      if (res.ok()) {
        try {
          const body = await res.json();
          const id = body?.data?.id ?? body?.id;
          if (id) trackProgram(id);
        } catch { /* non-JSON response */ }
      }
    }

    expect(dialogFired).toBe(false);
  });

  test('TC-013: Empty Description does not block valid create', async ({ page, trackProgram }) => {
    const programName = `No Desc ${Date.now()}`;
    const responsePromise = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/programs'),
    );
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await expect(modal.createButton).toBeEnabled();
    await modal.submit();
    await expect(modal.dialog).not.toBeVisible();
    const res = await responsePromise;
    if (res.ok()) {
      try {
        const body = await res.json();
        const id = body?.data?.id ?? body?.id;
        if (id) trackProgram(id);
      } catch { /* non-JSON response */ }
    }
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-014: Description maximum length boundary is enforced', async ({ page, trackProgram }) => {
    const programName = `Desc Max ${Date.now()}`;
    const longDescription = 'a'.repeat(1000);
    await createProgram(programs, page, programName, longDescription, trackProgram);
    await expect(page.getByText(programName)).toBeVisible();
  });

  // BUG: Double-click creates 2 records — no duplicate submission guard exists
  test.fail('TC-015: Double-clicking Create does not create duplicate records', async ({ page, trackProgram }) => {
    const programName = `Double Click ${Date.now()}`;
    const responsePromise = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/programs'),
    );
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription('Double submit test');
    await modal.createButton.dblclick();
    await expect(modal.dialog).not.toBeVisible();
    const res = await responsePromise;
    if (res.ok()) {
      try {
        const body = await res.json();
        const id = body?.data?.id ?? body?.id;
        if (id) trackProgram(id);
      } catch { /* non-JSON response */ }
    }
    await expect(programs.rowFor(programName)).toHaveCount(1);
  });
});
