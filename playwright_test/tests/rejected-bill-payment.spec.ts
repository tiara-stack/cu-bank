import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/cases';
import { test } from '../support/fixtures';
import { expectTransactionRejected } from '../support/rejections';
import { enterAmount, expectAccount, login } from '../support/ui';

const billPaymentCases = cases.filter((item) => item.tags.includes('@bill-payment-rejection'));

test.describe('Scenario 6', () => {
  test.beforeEach(({ page: nativePage, accountState }) =>
    Effect.gen(function* () {
      const page = Playwright.makePage(nativePage);
      const sender = accountState.accounts.find((account) => account.accountId === '1111111111')!;
      yield* login(page, sender.accountId, sender.password);
      yield* expectAccount(page, sender.balance, sender.deposits.length);
    }).pipe(Effect.scoped, Effect.runPromise),
  );

  for (const example of billPaymentCases.filter((item) => item.tags.includes('@bill-category-selected'))) {
    test.describe(example.id, () => {
      test.use({ accountState: example.accountState });
      test.effect(
        example.title,
        {
          tag: [...example.tags],
          annotation: [
            { type: 'expected', description: example.expected },
            { type: 'precondition', description: example.precondition },
            { type: 'workbook note', description: example.notes },
          ],
        },
        ({ bank }) =>
          Effect.gen(function* () {
            const page = yield* Playwright.Page;
            yield* page.getByTestId('b1').check();
            const amount = page.getByTestId('b4');
            yield* enterAmount(amount, example.inputs.Amount);
            yield* expectTransactionRejected(
              page,
              bank,
              {
                amount,
                confirm: page.getByTestId('bc'),
                error: page.getByTestId('billpayment-error-mes'),
              },
              { kind: 'message', message: example.message! },
            );
          }),
      );
    });
  }

  for (const example of billPaymentCases.filter((item) => item.tags.includes('@bill-category-required'))) {
    test.describe(example.id, () => {
      test.use({ accountState: example.accountState });
      test.effect(
        example.title,
        {
          tag: [...example.tags],
          annotation: [
            { type: 'expected', description: example.expected },
            { type: 'precondition', description: example.precondition },
            { type: 'workbook note', description: example.notes },
          ],
        },
        ({ bank }) =>
          Effect.gen(function* () {
            const page = yield* Playwright.Page;
            const amount = page.getByTestId('b4');
            yield* enterAmount(amount, example.inputs.Amount);
            yield* expectTransactionRejected(
              page,
              bank,
              {
                amount,
                confirm: page.getByTestId('bc'),
                error: page.getByTestId('billpayment-error-mes'),
              },
              { kind: 'required-field', input: page.getByTestId('b1') },
            );
          }),
      );
    });
  }
});
