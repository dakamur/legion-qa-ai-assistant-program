import type { Page } from '@playwright/test';

export class EditProgramModal {
  readonly dialog;
  readonly programNameInput;
  readonly descriptionInput;
  readonly saveButton;
  readonly cancelButton;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Edit Program' });
    this.programNameInput = this.dialog.getByLabel('Program Name');
    this.descriptionInput = this.dialog.getByLabel('Description');
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async fillName(name: string) {
    await this.programNameInput.clear();
    await this.programNameInput.fill(name);
  }

  async fillDescription(description: string) {
    await this.descriptionInput.clear();
    await this.descriptionInput.fill(description);
  }

  async clearName() {
    await this.programNameInput.clear();
  }

  async clearDescription() {
    await this.descriptionInput.clear();
  }

  async submit() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
