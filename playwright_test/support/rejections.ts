import { Collection, FindCursor } from 'effect-mongodb';
import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { expect, test } from '@playwright/test';
import type { Bank } from './fixtures';
import { expectAccount, recordNativeValidation } from './ui';

type RejectionExpectation =
  | { kind: 'message'; message: string }
  | { kind: 'required-field'; input: Playwright.Locator };

export const expectTransactionRejected = Effect.fn('expectTransactionRejected')(function* (
  page: Playwright.Page,
  bank: Bank,
  form: { amount: Playwright.Locator; confirm: Playwright.Locator; error: Playwright.Locator },
  expectation: RejectionExpectation,
) {
  const before = yield* Collection.find(bank).pipe(FindCursor.sort({ accountId: 1 }), FindCursor.toArray);
  const validation = yield* recordNativeValidation(
    expectation.kind === 'required-field' ? expectation.input : form.amount,
  );
  const mutations: string[] = [];
  yield* page.use(async (native) => {
    native.on('request', (request) => {
      if (request.method() === 'PUT') mutations.push(request.url());
    });
  });
  yield* form.confirm.click();

  if (expectation.kind === 'required-field') {
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
      .toBe(expectation.message);
  } else {
    yield* form.error.use((locator) => expect.soft(locator).toHaveText(expectation.message));
  }
  if (!validation.valid) expect(mutations).toEqual([]);

  yield* page.reload();
  yield* page.getByText('Loading...', { exact: true }).use((locator) => expect(locator).toHaveCount(0));
  expect
    .soft(
      yield* Collection.find(bank).pipe(FindCursor.sort({ accountId: 1 }), FindCursor.toArray),
      'Rejected actions must preserve every account, credential and transaction',
    )
    .toEqual(before);
  const sender = before.find((account) => account.accountId === '1111111111')!;
  yield* expectAccount(page, sender.balance, sender.transactions.length);
  yield* page
    .getByRole('link', { name: 'LOG OUT', exact: true })
    .use((locator) => expect(locator).toBeVisible());
});
