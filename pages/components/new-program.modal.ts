import type { Page } from '@playwright/test';

export class NewProgramModal {
  readonly dialog;
  readonly programNameInput;
  readonly descriptionInput;
  readonly createButton;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.programNameInput = this.dialog.getByLabel('Program Name');
    this.descriptionInput = this.dialog.getByLabel('Description');
    this.createButton = this.dialog.getByRole('button', { name: 'Create', exact: true });
  }

  async fillName(name: string) {
    await this.programNameInput.fill(name);
  }

  async fillDescription(description: string) {
    await this.descriptionInput.fill(description);
  }

  async submit() {
    await this.createButton.click();
  }
}
