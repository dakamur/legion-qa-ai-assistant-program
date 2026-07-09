import { BasePage } from './base.page';
import { AppNavigation } from './components/app-navigation';
import { NewProgramModal } from './components/new-program.modal';
import { EditProgramModal } from './components/edit-program.modal';

export class ProgramsPage extends BasePage {
  readonly nav: AppNavigation;
  readonly newProgramButton;
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;
  readonly table;
  readonly heading;
  readonly emptyStateMessage;
  readonly createFirstProgramButton;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.nav = new AppNavigation(page);
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.emptyStateMessage = page.getByText(/no programs/i);
    this.createFirstProgramButton = page.getByRole('button', { name: 'Create Program' });
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
    this.table = page.getByRole('table');
    this.heading = page.getByRole('heading', { name: 'Programs' });
  }

  async goto() {
    await this.page.goto(this.baseUrl);
    await this.nav.goToPrograms();
  }

  async openNewProgram() {
    await this.newProgramButton.click();
  }

  rowFor(text: string) {
    return this.page.getByRole('row').filter({ hasText: text });
  }

  editButtonFor(programName: string) {
    return this.rowFor(programName).getByRole('button', { name: /^Edittt\b/ });
  }

  deleteButtonFor(programName: string) {
    return this.rowFor(programName).getByRole('button', { name: /^Delete\b/ });
  }

  async openEditFor(programName: string) {
    await this.editButtonFor(programName).click();
  }

  async clickDeleteFor(programName: string) {
    await this.deleteButtonFor(programName).click();
  }

  allRows() {
    return this.page.getByRole('row');
  }
}
