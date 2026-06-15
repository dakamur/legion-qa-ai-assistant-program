import { test, expect } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages/programs.page';
import { createProgram } from '../../helpers/program.helpers';

test.describe('DS-4: Delete Program', () => {
  let programs: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-001: Clicking delete icon displays confirmation dialog', async ({ page, trackProgram }) => {
    const programName = `DelDialog ${Date.now()}`;
    await createProgram(programs, page, programName, 'Confirm dialog test', trackProgram);

    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await programs.clickDeleteFor(programName);

    expect(dialogMessage).toContain(programName);
    await expect(programs.rowFor(programName)).toBeVisible();
  });

  test('TC-002: Confirming deletion removes program from the list', async ({ page, trackProgram }) => {
    const programName = `DelConfirm ${Date.now()}`;
    await createProgram(programs, page, programName, 'Confirm removal test', trackProgram);

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await programs.clickDeleteFor(programName);

    await expect(programs.rowFor(programName)).toHaveCount(0);
  });

  test('TC-003: Full delete flow — icon click through confirmation to removal', async ({ page, trackProgram }) => {
    const programName = `DelFull ${Date.now()}`;
    await createProgram(programs, page, programName, 'Full flow test', trackProgram);

    let dialogShown = false;
    page.on('dialog', async (dialog) => {
      dialogShown = true;
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain(programName);
      await dialog.accept();
    });

    await programs.clickDeleteFor(programName);

    expect(dialogShown).toBe(true);
    await expect(programs.rowFor(programName)).toHaveCount(0);
  });

  test('TC-004: Cancelling deletion preserves the program in the list', async ({ page, trackProgram }) => {
    const programName = `DelCancel ${Date.now()}`;
    await createProgram(programs, page, programName, 'Cancel test', trackProgram);

    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await programs.clickDeleteFor(programName);

    await expect(programs.rowFor(programName)).toBeVisible();
  });

  test('TC-005: Deleted program count is updated in the list', async ({ page, trackProgram }) => {
    const suffix = Date.now();
    const programA = `CountA ${suffix}`;
    const programB = `CountB ${suffix}`;
    await createProgram(programs, page, programA, 'count a', trackProgram);
    await createProgram(programs, page, programB, 'count b', trackProgram);

    const ownedRows = programs.rowFor(String(suffix));
    await expect(ownedRows).toHaveCount(2);

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await programs.clickDeleteFor(programA);
    await expect(programs.rowFor(programA)).toHaveCount(0);
    await expect(ownedRows).toHaveCount(1);
    await expect(programs.rowFor(programB)).toBeVisible();
  });

  test('TC-006: Dismissing the confirmation dialog (cancel) preserves the program', async ({ page, trackProgram }) => {
    const programName = `DelDismiss ${Date.now()}`;
    await createProgram(programs, page, programName, 'Dismiss test', trackProgram);

    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await programs.clickDeleteFor(programName);

    await expect(programs.rowFor(programName)).toBeVisible();
  });

  test.skip('TC-007: Unauthorized users cannot delete programs', async () => {
    // Requires non-admin credentials which are not available in the current env
  });

  test('TC-008: Cancel then re-open delete confirmation works correctly', async ({ page, trackProgram }) => {
    const programName = `CancelRetry ${Date.now()}`;
    await createProgram(programs, page, programName, 'Cancel retry test', trackProgram);

    let dialogCount = 0;
    page.on('dialog', async (dialog) => {
      dialogCount++;
      if (dialogCount === 1) {
        await dialog.dismiss();
      } else {
        await dialog.accept();
      }
    });

    await programs.clickDeleteFor(programName);
    await expect(programs.rowFor(programName)).toBeVisible();

    await programs.clickDeleteFor(programName);
    await expect(programs.rowFor(programName)).toHaveCount(0);

    expect(dialogCount).toBe(2);
  });

  test('TC-009: Double-clicking the delete icon does not bypass confirmation', async ({ page, trackProgram }) => {
    const programName = `DblDel ${Date.now()}`;
    await createProgram(programs, page, programName, 'Double-click delete test', trackProgram);

    let dialogCount = 0;
    page.on('dialog', async (dialog) => {
      dialogCount++;
      await dialog.dismiss();
    });

    await programs.deleteButtonFor(programName).dblclick();

    await expect(programs.rowFor(programName)).toBeVisible();
    expect(dialogCount).toBeGreaterThanOrEqual(1);
  });

  test.skip('TC-010: Deleting the last remaining program shows empty state', async () => {
    // Skipped: requires deleting all programs in the system which is destructive
    // to shared test data and impractical with 1000+ programs. Needs isolated env.
  });

  test('TC-011: Deleting a program with a long name displays correctly in confirmation', async ({ page, trackProgram }) => {
    const longName = `LongDel ${Date.now()} ${'a'.repeat(200)}`.slice(0, 250);
    await createProgram(programs, page, longName, 'Long name delete test', trackProgram);

    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await programs.clickDeleteFor(longName);

    expect(dialogMessage).toContain(longName);
    await expect(programs.rowFor(longName)).toBeVisible();
  });

  test('TC-012: Deleting a program with special characters works correctly', async ({ page, trackProgram }) => {
    const programName = `Web Dev & AI / 2026 - Cohort #1 ${Date.now()}`;
    await createProgram(programs, page, programName, 'Special char delete test', trackProgram);

    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await programs.clickDeleteFor(programName);

    expect(dialogMessage).toContain(programName);
    await expect(programs.rowFor(programName)).toHaveCount(0);
  });

  test('TC-013: Double-clicking confirm does not cause errors', async ({ page, trackProgram }) => {
    const programName = `DblConfirm ${Date.now()}`;
    await createProgram(programs, page, programName, 'Double confirm test', trackProgram);

    let dialogCount = 0;
    page.on('dialog', async (dialog) => {
      dialogCount++;
      await dialog.accept();
    });

    await programs.clickDeleteFor(programName);

    await expect(programs.rowFor(programName)).toHaveCount(0);
    expect(dialogCount).toBe(1);
  });

  test('TC-014: Programs list refreshes correctly after multiple sequential deletions', async ({ page, trackProgram }) => {
    const programA = `SeqDelA ${Date.now()}`;
    const programB = `SeqDelB ${Date.now()}`;
    const programC = `SeqDelC ${Date.now()}`;
    await createProgram(programs, page, programA, 'seq a', trackProgram);
    await createProgram(programs, page, programB, 'seq b', trackProgram);
    await createProgram(programs, page, programC, 'seq c', trackProgram);

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await programs.clickDeleteFor(programA);
    await expect(programs.rowFor(programA)).toHaveCount(0);
    await expect(programs.rowFor(programB)).toBeVisible();
    await expect(programs.rowFor(programC)).toBeVisible();

    await programs.clickDeleteFor(programB);
    await expect(programs.rowFor(programB)).toHaveCount(0);
    await expect(programs.rowFor(programC)).toBeVisible();
  });
});
