import type { Locator, Page } from '@playwright/test';
import { captureActualOutput } from './evidence';
import { expect, test } from './fixtures';

/** Reads the browser's own (HTML5) validation state of a field and attaches it to the report. */
export async function recordNativeValidation(input: Locator) {
  const validation = await input.evaluate((element) => {
    const field = element as HTMLInputElement;
    return {
      value: field.value,
      valid: field.validity.valid,
      valueMissing: field.validity.valueMissing,
      badInput: field.validity.badInput,
      stepMismatch: field.validity.stepMismatch,
      validationMessage: field.validationMessage,
    };
  });
  await test.info().attach('native-validation', {
    body: JSON.stringify(validation, null, 2),
    contentType: 'application/json',
  });
  return validation;
}

/**
 * Clicks Confirm on a form that must be rejected and checks the specified error message.
 *
 * The message check is soft: a wording mismatch is reported, and the test still goes on to
 * verify that the rejected action changed nothing. When the browser blocks the submission
 * itself, the application message never appears; that is recorded and reported as a mismatch.
 */
export async function submitExpectingRejection(
  page: Page,
  form: { field: Locator; confirm: string; error: string; message: string | null },
) {
  if (form.message === null) throw new Error('This case declares no expected rejection message.');
  const validation = await recordNativeValidation(form.field);
  await page.getByTestId(form.confirm).click();
  const error = page.getByTestId(form.error);

  if (validation.valid) {
    await expect.soft(error).toHaveText(form.message);
    await captureActualOutput(page);
    return;
  }
  await expect(form.field).toBeFocused();
  await captureActualOutput(page);
  test.info().annotations.push({
    type: 'native validation',
    description: `Browser blocked submission. ${validation.validationMessage}`,
  });
  expect
    .soft(
      (await error.allTextContents()).join(''),
      'Workbook application message was not observed because native validation blocked submission',
    )
    .toBe(form.message);
}
