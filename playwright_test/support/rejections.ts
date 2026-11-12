import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { expect, test } from '@playwright/test';
import type { Bank } from './fixtures';
import { expectAccount, recordNativeValidation } from './ui';

export const expectTransactionRejected = Effect.fn('expectTransactionRejected')(function* (
  page: Playwright.Page,
  bank: Bank,
  form: { amount: Playwright.Locator; confirm: Playwright.Locator; error: Playwright.Locator },
  message: string | null,
  validationInput = form.amount,
) {
  const before = yield* Effect.tryPromise(() => bank.find().sort({ accountId: 1 }).toArray());
  const validation = yield* recordNativeValidation(validationInput);
  const mutations: string[] = [];
  yield* page.use(async (native) => {
    native.on('request', (request) => {
      if (request.method() === 'PUT') mutations.push(request.url());
    });
  });
  yield* form.confirm.click();

  if (message === null) {
    expect(validation.valid).toBe(false);
    expect(validation.valueMissing).toBe(true);
    expect(validation.validationMessage).not.toBe('');
  } else if (!validation.valid) {
    test.info().annotations.push({
      type: 'native validation',
      description: `Browser blocked submission. ${validation.validationMessage}`,
    });
    expect
      .soft(
        (yield* form.error.allTextContents()).join(''),
        'Workbook application message was not observed because native validation blocked submission',
      )
      .toBe(message);
  } else {
    yield* form.error.use((locator) => expect.soft(locator).toHaveText(message));
  }
  if (!validation.valid) expect(mutations).toEqual([]);

  yield* page.reload();
  yield* page.getByText('Loading...', { exact: true }).use((locator) => expect(locator).toHaveCount(0));
  expect
    .soft(
      yield* Effect.tryPromise(() => bank.find().sort({ accountId: 1 }).toArray()),
      'Rejected actions must preserve every account, credential and transaction',
    )
    .toEqual(before);
  const sender = before.find((account) => account.accountId === '1111111111')!;
  yield* expectAccount(page, sender.balance, sender.transactions.length);
  yield* page
    .getByRole('link', { name: 'LOG OUT', exact: true })
    .use((locator) => expect(locator).toBeVisible());
});
