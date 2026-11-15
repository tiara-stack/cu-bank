import type { Locator, Page } from '@playwright/test';
import type { Account } from '../data/account';
import { test } from './fixtures';

type LoginFields = Pick<Account, 'id' | 'password'>;
type AmountFields = { amount: string };
type TransferFields = AmountFields & { recipientAccountId: string };
type BillPaymentFields = AmountFields & { category?: string };
type Form = { field: Locator; confirm: Locator };

// Selectors are the application's own `cid` attributes (see testIdAttribute in playwright.config.ts).

async function enterAmount(input: Locator, amount: string) {
  await input.fill('');
  // Typing key by key keeps the browser's number/step constraints in play.
  await input.pressSequentially(amount);
  return input;
}

/** Fills the fields and returns the form for a separate submitForm call. */
export async function fillRegistrationForm(page: Page, fields: Account): Promise<Form> {
  const field = page.getByTestId('r1');
  await field.fill(fields.id);
  await page.getByTestId('r2').fill(fields.password);
  await page.getByTestId('r3').fill(fields.firstName);
  await page.getByTestId('r4').fill(fields.lastName);
  return { field, confirm: page.getByTestId('rc') };
}

export async function fillLoginForm(page: Page, fields: LoginFields): Promise<Form> {
  const field = page.getByTestId('l1');
  await field.fill(fields.id);
  await page.getByTestId('l2').fill(fields.password);
  return { field, confirm: page.getByTestId('lc') };
}

export async function fillDepositForm(page: Page, { amount }: AmountFields): Promise<Form> {
  const field = await enterAmount(page.getByTestId('d1'), amount);
  return { field, confirm: page.getByTestId('dc') };
}

export async function fillWithdrawalForm(page: Page, { amount }: AmountFields): Promise<Form> {
  const field = await enterAmount(page.getByTestId('w1'), amount);
  return { field, confirm: page.getByTestId('wc') };
}

export async function fillTransferForm(page: Page, { recipientAccountId, amount }: TransferFields): Promise<Form> {
  await page.getByTestId('t1').fill(recipientAccountId);
  const field = await enterAmount(page.getByTestId('t2'), amount);
  return { field, confirm: page.getByTestId('tc') };
}

export async function fillBillPaymentForm(page: Page, { amount, category }: BillPaymentFields): Promise<Form> {
  if (category) await page.getByTestId(category).check();
  const amountField = await enterAmount(page.getByTestId('b4'), amount);
  // Without a category the browser stops at the required radio before validating the amount.
  const field = category ? amountField : page.getByTestId('b1');
  return { field, confirm: page.getByTestId('bc') };
}

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

/** Records validation and clicks Confirm, returning observations for expected-output checks. */
export async function submitForm(form: Form): Promise<Submission> {
  const validation = await recordNativeValidation(form.field);
  await form.confirm.click();
  return { field: form.field, validation };
}
