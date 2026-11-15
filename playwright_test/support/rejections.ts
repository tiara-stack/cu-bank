import type { Page } from '@playwright/test';
import { captureActualOutput, withActualOutput } from './evidence';
import { expect, test } from './fixtures';
import type { Submission } from './forms';

/**
 * Expected output: the submitted form shows the specified error message.
 *
 * The message check is soft: a wording mismatch is reported, and the test still goes on to
 * verify that the rejected action changed nothing. When the browser blocks the submission
 * itself, the application message never appears; that is recorded and reported as a mismatch.
 */
export async function expectRejection(
  page: Page,
  { field, validation }: Submission,
  expected: { error: string; message: string | null },
) {
  if (expected.message === null) throw new Error('This case declares no expected rejection message.');
  const error = page.getByTestId(expected.error);

  if (validation.valid) {
    await expect.soft(error).toHaveText(expected.message);
    await captureActualOutput(page, error);
    return;
  }
  await withActualOutput(page, () => expect(field).toBeFocused(), field);
  test.info().annotations.push({
    type: 'native validation',
    description: `Browser blocked submission. ${validation.validationMessage}`,
  });
  expect
    .soft(
      (await error.allTextContents()).join(''),
      'Workbook application message was not observed because native validation blocked submission',
    )
    .toBe(expected.message);
}
