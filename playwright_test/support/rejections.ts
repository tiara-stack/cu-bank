import type { Locator, Page } from '@playwright/test';
import { captureActualOutput, withActualOutput } from './evidence';
import { expect, test } from './fixtures';

/** Reads the browser's own (HTML5) validation state of a field and attaches it to the report. */
async function recordNativeValidation(input: Locator) {
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

/** What the browser thought of the field at the moment Confirm was clicked. */
export type Submission = { field: Locator; validation: Awaited<ReturnType<typeof recordNativeValidation>> };

/** Input: records the browser's validation state of the field, then clicks Confirm. */
export async function submitForm(page: Page, form: { field: Locator; confirm: string }): Promise<Submission> {
  const validation = await recordNativeValidation(form.field);
  await page.getByTestId(form.confirm).click();
  return { field: form.field, validation };
}

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
