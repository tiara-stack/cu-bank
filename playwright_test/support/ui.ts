import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { expect, test } from '@playwright/test';

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
  expect(yield* page.evaluate(() => localStorage.getItem('user'))).toBeNull();
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
  const message = yield* page.use(async (native) => {
    const dialogPromise = native.waitForEvent('dialog');
    const submission = native.getByTestId('rc').click();
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();
    await submission;
    return message;
  });
  yield* page.use((native) => expect(native).toHaveURL(/\/$/));
  return message;
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

export const expectAccount = Effect.fn('expectAccount')(function* (
  page: Playwright.Page,
  balance: number,
  historyCount: number,
) {
  const summary = page.locator('article').first();
  yield* summary
    .getByRole('heading', { name: 'Balance:', exact: true })
    .use((locator) => expect(locator).toBeVisible());
  yield* summary
    .getByRole('heading', { level: 1 })
    .nth(2)
    .use((locator) => expect(locator).toHaveText(String(balance)));
  yield* page
    .locator('.history-list p')
    .filter({ hasText: /^amount: / })
    .use((locator) => expect(locator).toHaveCount(historyCount));
});

export const expectHistory = Effect.fn('expectHistory')(function* (
  page: Playwright.Page,
  history: ReadonlyArray<{ title: string; target: string; amount: number; balance: number }>,
) {
  const records = page.locator('.history-list > .account-form > div');
  yield* records.use((locator) => expect(locator).toHaveCount(history.length));
  for (const [index, transaction] of history.entries()) {
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
  }
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
  const response = yield* page.use(async (native) => {
    const response = native.waitForResponse(
      (result) =>
        result.url() === 'http://localhost:4000/api/v1/transactions/' && result.request().method() === 'PUT',
    );
    await native.getByTestId(confirm).click();
    return response;
  });
  expect(response.ok()).toBe(true);
  yield* expectAccount(page, balance, count);
  const record = page.locator('.history-list > .account-form > div').last();
  yield* record.getByRole('heading').use((locator) => expect(locator).toHaveText(action));
  yield* record
    .getByText(`amount: ${amount}`, { exact: true })
    .use((locator) => expect(locator).toBeVisible());
  yield* record
    .getByText(`balance: ${balance}`, { exact: true })
    .use((locator) => expect(locator).toBeVisible());
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
