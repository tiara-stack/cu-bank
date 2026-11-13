import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { test } from '@playwright/test';
import { expect } from './matchers';

export function expectRejection(
  error: Playwright.Locator,
  { validation }: { validation: { valid: boolean; validationMessage: string } },
) {
  return {
    toHaveMessage: Effect.fn('expectRejection.toHaveMessage')(function* (message: string) {
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
        yield* expect.soft(error).toHaveText(message);
      }
    }),
  };
}
