import { Effect } from 'effect';
import type { Playwright } from 'effect-playwright';
import type { AccountPrecondition } from '../data/account-state';

type RegistrationFields = Pick<AccountPrecondition, 'accountId' | 'password' | 'firstName' | 'lastName'>;
type LoginFields = Pick<AccountPrecondition, 'accountId' | 'password'>;
type AmountFields = { amount: string };
type TransferFields = AmountFields & { recipientAccountId: string };

const enterAmount = Effect.fn('enterAmount')(function* (input: Playwright.Locator, amount: string) {
  yield* input.fill('');
  // Ordinary keyboard input preserves the browser's number/step constraints.
  yield* input.pressSequentially(amount);
  return input;
});

export const fillRegistrationForm = Effect.fn('fillRegistrationForm')(function* (
  page: Playwright.Page,
  fields: RegistrationFields,
) {
  yield* page.getByTestId('r1').fill(fields.accountId);
  yield* page.getByTestId('r2').fill(fields.password);
  yield* page.getByTestId('r3').fill(fields.firstName);
  yield* page.getByTestId('r4').fill(fields.lastName);
});

export const fillLoginForm = Effect.fn('fillLoginForm')(function* (
  page: Playwright.Page,
  fields: LoginFields,
) {
  yield* page.getByTestId('l1').fill(fields.accountId);
  yield* page.getByTestId('l2').fill(fields.password);
});

export const fillDepositForm = Effect.fn('fillDepositForm')(function* (
  page: Playwright.Page,
  { amount }: AmountFields,
) {
  return yield* enterAmount(page.getByTestId('d1'), amount);
});

export const fillWithdrawalForm = Effect.fn('fillWithdrawalForm')(function* (
  page: Playwright.Page,
  { amount }: AmountFields,
) {
  return yield* enterAmount(page.getByTestId('w1'), amount);
});

export const fillTransferForm = Effect.fn('fillTransferForm')(function* (
  page: Playwright.Page,
  { recipientAccountId, amount }: TransferFields,
) {
  yield* page.getByTestId('t1').fill(recipientAccountId);
  return yield* enterAmount(page.getByTestId('t2'), amount);
});

export const fillBillPaymentForm = Effect.fn('fillBillPaymentForm')(function* (
  page: Playwright.Page,
  { amount }: AmountFields,
) {
  return yield* enterAmount(page.getByTestId('b4'), amount);
});
