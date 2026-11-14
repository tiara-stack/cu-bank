import type { Page } from '@playwright/test';
import { test } from './fixtures';

/** Attaches a screenshot of what the user sees right now; the report shows it as the Actual Output. */
export async function captureActualOutput(page: Page) {
  await test.info().attach('actual-output', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
}

/** Captures evidence after a check, preserving its error if capturing also fails. */
export async function withActualOutput(page: Page, check: () => Promise<void>) {
  try {
    await check();
  } catch (error) {
    await captureActualOutput(page).catch(() => {
      // The check's failure is more useful than a secondary screenshot or attachment error.
    });
    throw error;
  }
  await captureActualOutput(page);
}
