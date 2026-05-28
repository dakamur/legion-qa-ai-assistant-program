import { test as base, expect } from '@playwright/test';

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
const API_TOKEN = process.env.DIDAXIS_API_TOKEN!;

async function deleteProgram(uuid: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/programs/${uuid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (res.ok || res.status === 404) return;
  console.warn(`Cleanup failed for ${uuid}: ${res.status} ${res.statusText}`);
}

type CleanupFixtures = {
  trackProgram: (uuid: string) => void;
};

export { expect };

export const test = base.extend<CleanupFixtures>({
  trackProgram: [async ({ page }, use) => {
    const tracked = new Set<string>();

    page.on('response', async (response) => {
      if (response.request().method() !== 'POST') return;
      if (!response.url().includes('/api/programs')) return;
      if (!response.ok()) return;

      try {
        const body = await response.json();
        const id: string | undefined = body?.data?.id ?? body?.id;
        if (id) tracked.add(id);
      } catch {
        /* non-JSON response — nothing to track */
      }
    });

    await use((uuid: string) => {
      tracked.add(uuid);
    });

    for (const uuid of tracked) {
      await deleteProgram(uuid);
    }
  }, { auto: true }],
});
