import { test, expect } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages/programs.page';
import { createProgram } from '../../helpers/program.helpers';

test.describe('DS-2: Edit Program', () => {
  let programs: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-001: Edit form opens pre-populated with current program data', async ({ page, trackProgram }) => {
    const programName = `EditPrepop ${Date.now()}`;
    const description = 'Pre-populated check';
    await createProgram(programs, page, programName, description, trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await expect(modal.dialog).toBeVisible();
    await expect(modal.programNameInput).toHaveValue(programName);
    await expect(modal.descriptionInput).toHaveValue(description);
  });

  test('TC-002: Program name is updated successfully', async ({ page, trackProgram }) => {
    const originalName = `EditName ${Date.now()}`;
    const updatedName = `${originalName} - Updated`;
    await createProgram(programs, page, originalName, 'Original description', trackProgram);

    await programs.openEditFor(originalName);

    const modal = programs.editProgramModal;
    await modal.fillName(updatedName);
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test('TC-003: Program description is updated successfully', async ({ page, trackProgram }) => {
    const programName = `EditDesc ${Date.now()}`;
    const updatedDescription = 'Updated description for testing';
    await createProgram(programs, page, programName, 'Original description', trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.fillDescription(updatedDescription);
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();

    await programs.openEditFor(programName);
    await expect(modal.programNameInput).toHaveValue(programName);
    await expect(modal.descriptionInput).toHaveValue(updatedDescription);
  });

  test('TC-004: Editing only Description preserves the Name', async ({ page, trackProgram }) => {
    const programName = `PreserveN ${Date.now()}`;
    const originalDesc = 'Original desc';
    const updatedDesc = 'Preservation test description';
    await createProgram(programs, page, programName, originalDesc, trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.fillDescription(updatedDesc);
    await modal.submit();
    await expect(modal.dialog).not.toBeVisible();

    await programs.openEditFor(programName);
    await expect(modal.programNameInput).toHaveValue(programName);
    await expect(modal.descriptionInput).toHaveValue(updatedDesc);
  });

  test('TC-005: Editing only Name preserves the Description', async ({ page, trackProgram }) => {
    const originalName = `PreserveD ${Date.now()}`;
    const updatedName = `${originalName} Renamed`;
    const description = 'Should stay intact';
    await createProgram(programs, page, originalName, description, trackProgram);

    await programs.openEditFor(originalName);

    const modal = programs.editProgramModal;
    await modal.fillName(updatedName);
    await modal.submit();
    await expect(modal.dialog).not.toBeVisible();

    await programs.openEditFor(updatedName);
    await expect(modal.programNameInput).toHaveValue(updatedName);
    await expect(modal.descriptionInput).toHaveValue(description);
  });

  test('TC-006: Save is blocked when Program Name is cleared to empty', async ({ page, trackProgram }) => {
    const programName = `EmptyName ${Date.now()}`;
    await createProgram(programs, page, programName, 'Some description', trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.clearName();

    await expect(modal.saveButton).toBeDisabled();
  });

  test('TC-007: Whitespace-only Program Name is treated as empty', async ({ page, trackProgram }) => {
    const programName = `WsName ${Date.now()}`;
    await createProgram(programs, page, programName, 'Some description', trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.fillName('   ');

    await expect(modal.saveButton).toBeDisabled();
  });

  test('TC-008: Editing to a duplicate Program Name is rejected', async ({ page, trackProgram }) => {
    test.fail(true, 'Known demo bug — duplicate program names are allowed on rename.');

    const programA = `ProgA-${Date.now()}`;
    const programB = `ProgB-${Date.now()}`;
    await createProgram(programs, page, programA, 'da', trackProgram);
    await createProgram(programs, page, programB, 'db', trackProgram);

    await programs.openEditFor(programB);

    const modal = programs.editProgramModal;
    await modal.fillName(programA);
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
  });

  test('TC-009: Cancelling the edit form discards all changes', async ({ page, trackProgram }) => {
    const programName = `CancelTest ${Date.now()}`;
    const description = 'Original cancel desc';
    await createProgram(programs, page, programName, description, trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.fillName('Should Not Save');
    await modal.fillDescription('Discarded description');
    await modal.cancel();

    await expect(modal.dialog).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();

    await programs.openEditFor(programName);
    await expect(modal.programNameInput).toHaveValue(programName);
    await expect(modal.descriptionInput).toHaveValue(description);
  });

  test.skip('TC-010: Unauthorized users cannot edit programs', async () => {
    // Requires non-admin credentials which are not available in the current env
  });

  test('TC-011: Saving with no changes does not cause errors', async ({ page, trackProgram }) => {
    const programName = `NoChange ${Date.now()}`;
    const description = 'Unchanged desc';
    await createProgram(programs, page, programName, description, trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();
    await expect(page.getByText(programName)).toBeVisible();
  });

  test('TC-012: Edited Program Name with special characters is handled safely', async ({ page, trackProgram }) => {
    const programName = `SpecChar ${Date.now()}`;
    const specialName = `Web Dev & AI / 2026 - Cohort #1 ${Date.now()}`;
    await createProgram(programs, page, programName, 'Special char test', trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.fillName(specialName);
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();
    await expect(page.getByText(specialName)).toBeVisible();
  });

  test('TC-013: Script-like input is stored as text and not executed', async ({ page, trackProgram }) => {
    const programName = `XssEdit ${Date.now()}`;
    const xssPayload = `<script>alert('x')</script> ${Date.now()}`;
    await createProgram(programs, page, programName, 'XSS test', trackProgram);

    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.fillName(xssPayload);

    try {
      await expect(modal.saveButton).toBeEnabled();
      await modal.submit();
    } catch {
      // Save stays disabled for rejected script-like input
    }

    expect(dialogFired).toBe(false);
  });

  test('TC-014: Program Name maximum length boundary is enforced on edit', async ({ page, trackProgram }) => {
    test.setTimeout(60000);
    const programName = `MaxLen ${Date.now()}`;
    const maxName = `Max ${Date.now()} ${'a'.repeat(240)}`.slice(0, 255);
    await createProgram(programs, page, programName, 'Max boundary test', trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.fillName(maxName);
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();
    await expect(page.getByText(maxName)).toBeVisible();
  });

  // BUG: App accepts names beyond 255 chars on edit — no max-length validation exists
  test.fail('TC-015: Program Name beyond maximum length is rejected on edit', async ({ page, trackProgram }) => {
    const programName = `OverLen ${Date.now()}`;
    const overflowName = 'a'.repeat(256);
    await createProgram(programs, page, programName, 'Overflow test', trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.fillName(overflowName);

    await expect(modal.saveButton).toBeDisabled();
  });

  test('TC-016: Double-clicking Save does not create duplicate updates', async ({ page, trackProgram }) => {
    const programName = `DblSave ${Date.now()}`;
    const updatedName = `DblSave Updated ${Date.now()}`;
    await createProgram(programs, page, programName, 'Double save test', trackProgram);

    await programs.openEditFor(programName);

    const modal = programs.editProgramModal;
    await modal.fillName(updatedName);
    await modal.saveButton.dblclick();

    await expect(modal.dialog).not.toBeVisible();
    await expect(programs.rowFor(updatedName)).toHaveCount(1);
  });

  test('TC-017: Edit form reflects latest data after a previous edit', async ({ page, trackProgram }) => {
    const programName = `Stale ${Date.now()}`;
    const firstUpdate = `${programName} v2`;
    await createProgram(programs, page, programName, 'First version', trackProgram);

    await programs.openEditFor(programName);
    const modal = programs.editProgramModal;
    await modal.fillName(firstUpdate);
    await modal.fillDescription('Second version');
    await modal.submit();
    await expect(modal.dialog).not.toBeVisible();

    await programs.openEditFor(firstUpdate);
    await expect(modal.programNameInput).toHaveValue(firstUpdate);
    await expect(modal.descriptionInput).toHaveValue('Second version');
  });
});
