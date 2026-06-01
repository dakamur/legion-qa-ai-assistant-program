import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { ProgramsPage } from '../pages/programs.page';

export async function createProgram(
  programs: ProgramsPage,
  page: Page,
  name: string,
  description: string,
  trackFn: (uuid: string) => void,
) {
  const responsePromise = page.waitForResponse(
    (r) => r.request().method() === 'POST' && r.url().includes('/api/programs'),
  );
  await programs.openNewProgram();
  const modal = programs.newProgramModal;
  await modal.fillName(name);
  await modal.fillDescription(description);
  await modal.submit();
  await expect(modal.dialog).not.toBeVisible();
  await expect(programs.rowFor(name).first()).toBeVisible();
  const res = await responsePromise;
  if (res.ok()) {
    try {
      const body = await res.json();
      const id = body?.data?.id ?? body?.id;
      if (id) trackFn(id);
    } catch { /* non-JSON response */ }
  }
}
