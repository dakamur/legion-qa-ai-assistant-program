import 'dotenv/config';
import type { FullConfig } from '@playwright/test';
import { deleteProgramsByIds, getAllPrograms } from './delete-program';

async function globalTeardown(_config: FullConfig): Promise<void> {
  const programs = await getAllPrograms();
  if (programs.length === 0) {
    console.log('[global-teardown] Nothing left to clean up.');
    return;
  }

  console.log(`[global-teardown] Safety-net sweep: deleting ${programs.length} leftover program(s).`);
  const results = await deleteProgramsByIds(programs.map((program) => program.id));
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.warn(`[global-teardown] ${failed.length} program(s) could not be deleted.`);
    for (const result of failed) {
      console.warn(`- ${result.id}: ${result.status} ${result.message}`);
    }
  }
}

export default globalTeardown;
