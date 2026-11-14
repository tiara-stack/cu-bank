import { test as base, type BrowserContext, type Page } from '@playwright/test';

/**
 * `openSession()` opens a page in a fresh browser context (separate cookies and
 * localStorage), so one test can act as several bank customers at once.
 * Every session is closed when the test ends.
 */
export const test = base.extend<{ openSession: () => Promise<Page> }>({
  openSession: async ({ browser, baseURL }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async () => {
      const context = await browser.newContext({ baseURL });
      contexts.push(context);
      return context.newPage();
    });
    for (const context of contexts) await context.close();
  },
});

export { expect } from '@playwright/test';
