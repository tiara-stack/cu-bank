import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { expect, test } from '@playwright/test';
import type { TransactionExpectation } from '../data/account-outcome';

export const expectSignedOut = Effect.fn('expectSignedOut')(function* (page: Playwright.Page) {
  yield* page
    .getByRole('link', { name: 'LOG IN', exact: true })
    .use((locator) => expect(locator).toBeVisible());
  yield* page
    .getByRole('link', { name: 'Register', exact: true })
    .use((locator) => expect(locator).toBeVisible());
  yield* page
    .getByRole('link', { name: 'LOG OUT', exact: true })
    .use((locator) => expect(locator).toHaveCount(0));
});

export const register = Effect.fn('register')(function* (
  page: Playwright.Page,
  account: { accountId: string; password: string; firstName: string; lastName: string },
) {
  yield* page.goto('/register');
  yield* page.getByTestId('r1').fill(account.accountId);
  yield* page.getByTestId('r2').fill(account.password);
  yield* page.getByTestId('r3').fill(account.firstName);
  yield* page.getByTestId('r4').fill(account.lastName);
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
  yield* page.use((native) => expect(native).toHaveURL(/\/$/));
  return dialogInfo.message;
});

export const login = Effect.fn('login')(function* (
  page: Playwright.Page,
  accountId = '1111111111',
  password = '1234',
) {
  yield* page.goto('/');
  yield* page.getByTestId('l1').fill(accountId);
  yield* page.getByTestId('l2').fill(password);
  yield* page.getByTestId('lc').click();
  yield* page.use((native) => expect(native).toHaveURL(/\/account\/?$/));
  yield* page
    .getByRole('link', { name: 'Account', exact: true })
    .use((locator) => expect(locator).toBeVisible());
  yield* page
    .getByRole('link', { name: 'LOG OUT', exact: true })
    .use((locator) => expect(locator).toBeVisible());
  yield* page
    .getByRole('link', { name: 'LOG IN', exact: true })
    .use((locator) => expect(locator).toHaveCount(0));
  yield* page
    .getByRole('link', { name: 'Register', exact: true })
    .use((locator) => expect(locator).toHaveCount(0));
  yield* page.getByText('Loading...', { exact: true }).use((locator) => expect(locator).toHaveCount(0));
});

export function expectAccountPage(page: Playwright.Page) {
  const summary = page.locator('article').first();
  return {
    toHaveBalance: Effect.fn('expectAccountPage.toHaveBalance')(function* (balance: number) {
      yield* summary
        .getByRole('heading', { name: 'Balance:', exact: true })
        .use((locator) => expect(locator).toBeVisible());
      yield* summary
        .getByRole('heading', { level: 1 })
        .nth(2)
        .use((locator) => expect(locator).toHaveText(String(balance)));
    }),
    toHaveHistoryCount: Effect.fn('expectAccountPage.toHaveHistoryCount')(function* (count: number) {
      yield* page
        .locator('.history-list p')
        .filter({ hasText: /^amount: / })
        .use((locator) => expect(locator).toHaveCount(count));
    }),
    toHaveHistory: Effect.fn('expectAccountPage.toHaveHistory')(function* (
      transactions: ReadonlyArray<TransactionExpectation>,
    ) {
      const records = page.locator('.history-list > .account-form > div');
      yield* records.use((locator) => expect(locator).toHaveCount(transactions.length));
      for (const [index, transaction] of transactions.entries()) {
        const record = records.nth(index);
        yield* record.getByRole('heading').use((locator) => expect(locator).toHaveText(transaction.title));
        yield* record
          .getByText(`target: ${transaction.target}`, { exact: true })
          .use((locator) => expect(locator).toBeVisible());
        yield* record
          .getByText(`amount: ${transaction.amount}`, { exact: true })
          .use((locator) => expect(locator).toBeVisible());
        yield* record
          .getByText(`balance: ${transaction.balance}`, { exact: true })
          .use((locator) => expect(locator).toBeVisible());
        yield* expectHistoryDate(record);
      }
    }),
    toHaveName: Effect.fn('expectAccountPage.toHaveName')(function* (name: string) {
      yield* summary
        .getByRole('heading', { name, exact: true })
        .use((locator) => expect(locator).toBeVisible());
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
  const [input, confirm] = action === 'deposit' ? ['d1', 'dc'] : ['w1', 'wc'];
  yield* page.getByTestId(input).fill(String(amount));
  yield* page.getByTestId(confirm).click();
  yield* expectAccountPage(page).toHaveBalance(balance);
  yield* expectAccountPage(page).toHaveHistoryCount(count);
  const record = page.locator('.history-list > .account-form > div').last();
  yield* record.getByRole('heading').use((locator) => expect(locator).toHaveText(action));
  yield* record
    .getByText(`amount: ${amount}`, { exact: true })
    .use((locator) => expect(locator).toBeVisible());
  yield* record
    .getByText(`balance: ${balance}`, { exact: true })
    .use((locator) => expect(locator).toBeVisible());
  yield* expectHistoryDate(record);
});

export const enterAmount = Effect.fn('enterAmount')(function* (input: Playwright.Locator, amount: string) {
  yield* input.fill('');
  // Ordinary keyboard input preserves the browser's number/step constraints.
  yield* input.pressSequentially(amount);
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
