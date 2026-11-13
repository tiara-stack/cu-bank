import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { test } from '@playwright/test';
import { expect } from './matchers';
import type { TransactionExpectation } from '../data/account-outcome';
import { fillDepositForm, fillLoginForm, fillRegistrationForm, fillWithdrawalForm } from './forms';

export const expectSignedOut = Effect.fn('expectSignedOut')(function* (page: Playwright.Page) {
  yield* Effect.promise(() => expect(page.getByRole('link', { name: 'LOG IN', exact: true })).toBeVisible());
  yield* Effect.promise(() =>
    expect(page.getByRole('link', { name: 'Register', exact: true })).toBeVisible(),
  );
  yield* Effect.promise(() =>
    expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toHaveCount(0),
  );
});

export const register = Effect.fn('register')(function* (
  page: Playwright.Page,
  account: { accountId: string; password: string; firstName: string; lastName: string },
) {
  yield* page.goto('/register');
  yield* fillRegistrationForm(page, account);
  // Arm the listener before clicking, then accept the dialog before awaiting the click.
  const dialogInfo = yield* page.use(async (native) => {
    const dialogPromise = native.waitForEvent('dialog');
    const submission = native.getByTestId('rc').click();
    const dialog = await dialogPromise;
    const message = dialog.message();
    const type = dialog.type();
    await dialog.accept();
    await submission;
    return { message, type };
  });
  expect(dialogInfo.type).toBe('alert');
  yield* Effect.promise(() => expect(page).toHaveURL(/\/$/));
  return dialogInfo.message;
});

export const login = Effect.fn('login')(function* (
  page: Playwright.Page,
  accountId = '1111111111',
  password = '1234',
) {
  yield* page.goto('/');
  yield* fillLoginForm(page, { accountId, password });
  yield* page.getByTestId('lc').click();
  yield* Effect.promise(() => expect(page).toHaveURL(/\/account\/?$/));
  yield* Effect.promise(() => expect(page.getByRole('link', { name: 'Account', exact: true })).toBeVisible());
  yield* Effect.promise(() => expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toBeVisible());
  yield* Effect.promise(() => expect(page.getByRole('link', { name: 'LOG IN', exact: true })).toHaveCount(0));
  yield* Effect.promise(() =>
    expect(page.getByRole('link', { name: 'Register', exact: true })).toHaveCount(0),
  );
  yield* Effect.promise(() => expect(page.getByText('Loading...', { exact: true })).toHaveCount(0));
});

export function expectAccountPage(page: Playwright.Page) {
  const summary = page.locator('article').first();
  return {
    toHaveBalance: Effect.fn('expectAccountPage.toHaveBalance')(function* (balance: number) {
      yield* Effect.promise(() =>
        expect(summary.getByRole('heading', { name: 'Balance:', exact: true })).toBeVisible(),
      );
      yield* Effect.promise(() =>
        expect(summary.getByRole('heading', { level: 1 }).nth(2)).toHaveText(String(balance)),
      );
    }),
    toHaveHistoryCount: Effect.fn('expectAccountPage.toHaveHistoryCount')(function* (count: number) {
      yield* Effect.promise(() =>
        expect(page.locator('.history-list p').filter({ hasText: /^amount: / })).toHaveCount(count),
      );
    }),
    toHaveHistory: Effect.fn('expectAccountPage.toHaveHistory')(function* (
      transactions: ReadonlyArray<TransactionExpectation>,
    ) {
      const records = page.locator('.history-list > .account-form > div');
      yield* Effect.promise(() => expect(records).toHaveCount(transactions.length));
      for (const [index, transaction] of transactions.entries()) {
        const record = records.nth(index);
        yield* Effect.promise(() => expect(record.getByRole('heading')).toHaveText(transaction.title));
        yield* Effect.promise(() =>
          expect(record.getByText(`target: ${transaction.target}`, { exact: true })).toBeVisible(),
        );
        yield* Effect.promise(() =>
          expect(record.getByText(`amount: ${transaction.amount}`, { exact: true })).toBeVisible(),
        );
        yield* Effect.promise(() =>
          expect(record.getByText(`balance: ${transaction.balance}`, { exact: true })).toBeVisible(),
        );
        yield* expectHistoryDate(record);
      }
    }),
    toHaveName: Effect.fn('expectAccountPage.toHaveName')(function* (name: string) {
      yield* Effect.promise(() => expect(summary.getByRole('heading', { name, exact: true })).toBeVisible());
    }),
  };
}

const expectHistoryDate = Effect.fn('expectHistoryDate')(function* (record: Playwright.Locator) {
  const text = yield* record.getByText(/^date:/).innerText();
  const timestamp = Date.parse(text.replace(/^date:\s*/, ''));
  expect(Number.isFinite(timestamp), 'Displayed transaction date').toBe(true);
  expect(timestamp, 'Displayed transaction date').toBeLessThanOrEqual(Date.now());
});

export const transact = Effect.fn('transact')(function* (
  page: Playwright.Page,
  action: 'deposit' | 'withdraw',
  amount: number,
  balance: number,
  count: number,
) {
  const form =
    action === 'deposit'
      ? { fill: fillDepositForm, confirm: 'dc' }
      : { fill: fillWithdrawalForm, confirm: 'wc' };
  yield* form.fill(page, { amount: String(amount) });
  yield* page.getByTestId(form.confirm).click();
  yield* expectAccountPage(page).toHaveBalance(balance);
  yield* expectAccountPage(page).toHaveHistoryCount(count);
  const record = page.locator('.history-list > .account-form > div').last();
  yield* Effect.promise(() => expect(record.getByRole('heading')).toHaveText(action));
  yield* Effect.promise(() => expect(record.getByText(`amount: ${amount}`, { exact: true })).toBeVisible());
  yield* Effect.promise(() => expect(record.getByText(`balance: ${balance}`, { exact: true })).toBeVisible());
  yield* expectHistoryDate(record);
});

export const recordNativeValidation = Effect.fn('recordNativeValidation')(function* (
  input: Playwright.Locator,
) {
  const validation = yield* input.evaluate((element) => {
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
  yield* Effect.promise(() =>
    test.info().attach('native-validation', {
      body: JSON.stringify(validation, null, 2),
      contentType: 'application/json',
    }),
  );
  return validation;
});
