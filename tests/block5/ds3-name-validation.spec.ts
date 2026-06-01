import { test, expect } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages/programs.page';
import { createProgram } from '../../helpers/program.helpers';

test.describe('DS-3: Name Validation & Duplicate Prevention', () => {
  let programs: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-001: Program name with special characters is accepted', async () => {
    const programName = `Informatique & IA - Niveau 2 ${Date.now()}`;

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription('Special characters acceptance test');
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();
    await expect(programs.rowFor(programName)).toBeVisible();
  });

  test('TC-002: Program name with accented and unicode characters is accepted', async () => {
    const programName = `Éducation Spécialisée — Côte d'Ivoire ${Date.now()}`;

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription('Unicode acceptance test');
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();
    await expect(programs.rowFor(programName)).toBeVisible();
  });

  test('TC-003: Program name with ampersand, dash, and numeric characters is accepted', async () => {
    const programName = `CS & Math - Level 2 (2026) ${Date.now()}`;

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription('Mixed characters test');
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();
    await expect(programs.rowFor(programName)).toBeVisible();
  });

  test('TC-004: Whitespace-only program name is rejected', async () => {
    await programs.openNewProgram();

    const modal = programs.newProgramModal;
    await modal.fillName('   ');
    await modal.fillDescription('Whitespace test');

    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-005: Tab-only program name is rejected', async () => {
    await programs.openNewProgram();

    const modal = programs.newProgramModal;
    await modal.fillName('\t');
    await modal.fillDescription('Tab test');

    await expect(modal.createButton).toBeDisabled();
  });

  // BUG: App allows duplicate program names — no uniqueness validation exists
  test.fail('TC-006: Duplicate program name is rejected with error message', async () => {
    const programName = `DupCheck ${Date.now()}`;

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription('First creation');
    await modal.submit();
    await expect(modal.dialog).not.toBeVisible();

    await programs.openNewProgram();
    await modal.fillName(programName);
    await modal.fillDescription('Duplicate attempt');
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
  });

  // BUG: App allows duplicate names regardless of casing — no case-insensitive check
  test.fail('TC-007: Duplicate name with different casing is handled', async () => {
    const programName = `CaseCheck ${Date.now()}`;

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription('Original');
    await modal.submit();
    await expect(modal.dialog).not.toBeVisible();

    await programs.openNewProgram();
    await modal.fillName(programName.toLowerCase());
    await modal.fillDescription('Lowercase duplicate');
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
  });

  // BUG: App does not trim before duplicate check — padded duplicates slip through
  test.fail('TC-008: Duplicate name with leading/trailing whitespace is rejected', async () => {
    const programName = `TrimDup ${Date.now()}`;

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription('Original');
    await modal.submit();
    await expect(modal.dialog).not.toBeVisible();

    await programs.openNewProgram();
    await modal.fillName(`  ${programName}  `);
    await modal.fillDescription('Padded duplicate');
    await modal.submit();

    await expect(modal.dialog).toBeVisible();
  });

  test('TC-009: Empty program name is rejected', async () => {
    await programs.openNewProgram();

    const modal = programs.newProgramModal;
    await modal.fillDescription('Empty name test');

    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-010: Program name with HTML/script tags is sanitized and not executed', async ({ page }) => {
    const xssPayload = `<script>alert('xss')</script> ${Date.now()}`;
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(xssPayload);
    await modal.fillDescription('XSS test');

    if (await modal.createButton.isEnabled()) {
      await modal.submit();
    }

    expect(dialogFired).toBe(false);
  });

  test('TC-011: Program name with only punctuation is accepted', async () => {
    const programName = `--- ${Date.now()}`;

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(programName);
    await modal.fillDescription('Punctuation only test');
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();
    await expect(programs.rowFor(programName)).toBeVisible();
  });

  // BUG: App allows duplicate names on edit — no uniqueness validation on save
  test.fail('TC-012: Duplicate check applies during edit as well as create', async ({ page, trackProgram }) => {
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

  test('TC-013: Name with leading/trailing whitespace is trimmed on create', async ({ page }) => {
    const baseName = `TrimTest ${Date.now()}`;
    const paddedName = `  ${baseName}  `;

    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(paddedName);
    await modal.fillDescription('Trim test');
    await modal.submit();

    await expect(modal.dialog).not.toBeVisible();
    await expect(page.getByText(baseName)).toBeVisible();
  });

  test('TC-014: Reusing a deleted program name succeeds', async ({ page, trackProgram }) => {
    const programName = `Reuse ${Date.now()}`;
    await createProgram(programs, page, programName, 'Will be deleted', trackProgram);

    page.on('dialog', async (d) => { await d.accept(); });

    await programs.clickDeleteFor(programName);
    await expect(programs.rowFor(programName)).toHaveCount(0);

    await createProgram(programs, page, programName, 'Reused after delete', trackProgram);
    await expect(page.getByText(programName)).toBeVisible();
  });
});
