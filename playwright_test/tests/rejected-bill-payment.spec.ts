import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/cases';
import { test } from '../support/fixtures';
import { expectTransactionRejected } from '../support/rejections';
import { enterAmount, expectAccount, login } from '../support/ui';
test.describe('Scenario 6', () => {
  test.beforeEach(({ page: nativePage, accountState }) =>
    Effect.gen(function* () {
      const page = Playwright.makePage(nativePage);
      const sender = accountState.accounts.find((account) => account.accountId === '1111111111')!;
      yield* login(page, sender.accountId, sender.password);
      yield* expectAccount(page, sender.balance, sender.deposits.length);
    }).pipe(Effect.scoped, Effect.runPromise),
  );
  for (const example of cases.filter((item) => item.scenario === 6 && item.message !== null)) {
    test.describe(example.id, () => {
      test.use({ accountState: example.accountState });
      test.effect(
        example.title,
        {
          tag: example.demo ? '@demo' : '@variant',
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
              example.message,
            );
          }),
      );
    });
  }
  const missingCategory = cases.find((item) => item.id === 'S6-TC07')!;
  test.describe(missingCategory.id, () => {
    test.use({ accountState: missingCategory.accountState });
    test.effect(
      missingCategory.title,
      {
        tag: '@variant',
        annotation: [
          { type: 'expected', description: missingCategory.expected },
          { type: 'precondition', description: missingCategory.precondition },
          { type: 'workbook note', description: missingCategory.notes },
        ],
      },
      ({ bank }) =>
        Effect.gen(function* () {
          const page = yield* Playwright.Page;
          const amount = page.getByTestId('b4');
          yield* enterAmount(amount, missingCategory.inputs.Amount);
          yield* expectTransactionRejected(
            page,
            bank,
            {
              amount,
              confirm: page.getByTestId('bc'),
              error: page.getByTestId('billpayment-error-mes'),
            },
            null,
            page.getByTestId('b1'),
          );
        }),
    );
  });
});
