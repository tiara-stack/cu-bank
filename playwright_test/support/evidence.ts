import type { Locator, Page } from '@playwright/test';
import { test } from './fixtures';

/**
 * Attaches a screenshot of what the user sees right now; the report shows it as the Actual Output.
 * When `highlight` is given and visible, its position is attached too, so the report can frame it.
 * The page itself is not altered.
 */
export async function captureActualOutput(page: Page, highlight?: Locator) {
  await test.info().attach('actual-output', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  if (!highlight) return;
  try {
    const box = await highlight.boundingBox({ timeout: 500 });
    const viewport = page.viewportSize();
    if (box && viewport) {
      await test.info().attach('actual-output-highlight', {
        body: JSON.stringify({ ...box, viewportWidth: viewport.width, viewportHeight: viewport.height }),
        contentType: 'application/json',
      });
    }
  } catch {
    // Framing is optional. Keep the screenshot and allow post-condition checks to continue.
  }
}

/**
 * Runs a check, then captures the evidence whether the check passed or failed.
 * If the check fails its error is kept, even when capturing fails as well.
 */
export async function withActualOutput(page: Page, check: () => Promise<void>, highlight?: Locator) {
  try {
    await check();
  } catch (error) {
    // No highlight here: the element the check waited for may not exist.
    await captureActualOutput(page).catch(() => {
      // The check's failure is more useful than a secondary screenshot or attachment error.
    });
    throw error;
  }
  await captureActualOutput(page, highlight);
}
