import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { expect, test } from '@playwright/test';

export const expectRejectionMessage = Effect.fn('expectRejectionMessage')(function* (
  error: Playwright.Locator,
  message: string,
  validation: { valid: boolean; validationMessage: string },
) {
  if (!validation.valid) {
    test.info().annotations.push({
      type: 'native validation',
      description: `Browser blocked submission. ${validation.validationMessage}`,
    });
    expect
      .soft(
        (yield* error.allTextContents()).join(''),
        'Workbook application message was not observed because native validation blocked submission',
      )
      .toBe(message);
  } else {
    yield* error.use((locator) => expect.soft(locator).toHaveText(message));
  }
});
