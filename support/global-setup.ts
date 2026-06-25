import 'dotenv/config';
import type { FullConfig } from '@playwright/test';
import { deleteProgramsByIds, getAllPrograms } from './delete-program';

async function globalSetup(_config: FullConfig): Promise<void> {
  const missing = ['DIDAXIS_URL', 'DIDAXIS_EMAIL', 'DIDAXIS_PASSWORD'].filter(
    (key) => !process.env[key],
  );
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  const programs = await getAllPrograms();
  if (programs.length === 0) {
    console.log('[global-setup] Clean slate: no existing programs.');
    return;
  }

  console.log(`[global-setup] Clearing ${programs.length} pre-existing program(s).`);
  const results = await deleteProgramsByIds(programs.map((program) => program.id));
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.warn(`[global-setup] ${failed.length} program(s) could not be cleared before the run.`);
  }
}

export default globalSetup;
