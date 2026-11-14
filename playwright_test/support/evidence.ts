import type { Page } from '@playwright/test';
import { test } from './fixtures';

/** Attaches a screenshot of what the user sees right now; the report shows it as the Actual Output. */
export async function captureActualOutput(page: Page) {
  await test.info().attach('actual-output', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
}
