import type { Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly baseUrl: string;

  constructor(protected readonly page: Page) {
    this.baseUrl = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
  }
}
