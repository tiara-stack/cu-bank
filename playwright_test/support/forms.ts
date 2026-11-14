import type { Locator, Page } from '@playwright/test';
import type { AccountPrecondition } from '../data/account-state';

type RegistrationFields = Pick<AccountPrecondition, 'accountId' | 'password' | 'firstName' | 'lastName'>;
type LoginFields = Pick<AccountPrecondition, 'accountId' | 'password'>;
type AmountFields = { amount: string };
type TransferFields = AmountFields & { recipientAccountId: string };

// Selectors are the application's own `cid` attributes (see testIdAttribute in playwright.config.ts).

async function enterAmount(input: Locator, amount: string) {
  await input.fill('');
  // Typing key by key keeps the browser's number/step constraints in play.
  await input.pressSequentially(amount);
  return input;
}

export async function fillRegistrationForm(page: Page, fields: RegistrationFields) {
  await page.getByTestId('r1').fill(fields.accountId);
  await page.getByTestId('r2').fill(fields.password);
  await page.getByTestId('r3').fill(fields.firstName);
  await page.getByTestId('r4').fill(fields.lastName);
}

export async function fillLoginForm(page: Page, fields: LoginFields) {
  await page.getByTestId('l1').fill(fields.accountId);
  await page.getByTestId('l2').fill(fields.password);
}

/** The amount helpers return the amount field so callers can inspect its validation and focus. */
export function fillDepositForm(page: Page, { amount }: AmountFields) {
  return enterAmount(page.getByTestId('d1'), amount);
}

export function fillWithdrawalForm(page: Page, { amount }: AmountFields) {
  return enterAmount(page.getByTestId('w1'), amount);
}

export async function fillTransferForm(page: Page, { recipientAccountId, amount }: TransferFields) {
  await page.getByTestId('t1').fill(recipientAccountId);
  return enterAmount(page.getByTestId('t2'), amount);
}

export function fillBillPaymentForm(page: Page, { amount }: AmountFields) {
  return enterAmount(page.getByTestId('b4'), amount);
}
