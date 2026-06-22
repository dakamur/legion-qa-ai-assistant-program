import { BasePage } from './base.page';
import { AppNavigation } from './components/app-navigation';

export class DashboardPage extends BasePage {
  readonly nav: AppNavigation;
  readonly heading;
  readonly welcomeMessage;
  readonly connectedStatus;
  readonly mainArea;
  readonly programsCard;
  readonly calendarCard;
  readonly validationCard;
  readonly aiAssistCard;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.welcomeMessage = page.getByText('Welcome to Didaxis Studio');
    this.connectedStatus = page.getByText('Connected');
    this.mainArea = page.getByRole('main');
    this.programsCard = this.mainArea.getByText('Manage academic programs');
    this.calendarCard = this.mainArea.getByText('Schedule & drag-drop');
    this.validationCard = this.mainArea.getByText('Check for conflicts');
    this.aiAssistCard = this.mainArea.getByText('AI-powered editing');
  }

  async goto() {
    await this.page.goto(this.baseUrl);
  }

  schedulerPrimaryBlock() {
    return this.mainArea.getByText('Scheduler', { exact: true });
  }

  exportPrimaryBlock() {
    return this.mainArea.getByText('Export', { exact: true });
  }

  async clickProgramsCard() {
    await this.programsCard.click();
  }

  async clickCalendarCard() {
    await this.calendarCard.click();
  }

  async clickValidationCard() {
    await this.validationCard.click();
  }

  async clickAiAssistCard() {
    await this.aiAssistCard.click();
  }
}
