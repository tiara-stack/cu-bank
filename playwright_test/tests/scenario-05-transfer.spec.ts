import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-05-transfer';
import { test } from '../support/fixtures';
import { expectTransactionRejected } from '../support/rejections';
import { enterAmount, expectAccount, login, transact } from '../support/ui';
test.describe('Scenario 5', () => {
  test.beforeEach(({ page: nativePage, accountState }) =>
    Effect.gen(function* () {
      const page = Playwright.makePage(nativePage);
      const sender = accountState.accounts.find((account) => account.accountId === '1111111111')!;
      yield* login(page, sender.accountId, sender.password);
      yield* expectAccount(page, sender.balance, sender.deposits.length);
      yield* transact(page, 'deposit', 1000, sender.balance + 1000, sender.deposits.length + 1);
      yield* transact(page, 'withdraw', 200, sender.balance + 800, sender.deposits.length + 2);
    }).pipe(Effect.scoped, Effect.runPromise),
  );
  for (const example of cases) {
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
        ({ bank, baseURL, accountState }) =>
          Effect.gen(function* () {
            const page = yield* Playwright.Page;
            const browser = yield* Playwright.Browser;
            yield* page.getByTestId('t1').fill(example.inputs['Transfer Target']);
            const amount = page.getByTestId('t2');
            yield* enterAmount(amount, example.inputs['Transfer Amount']);
            yield* expectTransactionRejected(
              page,
              bank,
              {
                amount,
                confirm: page.getByTestId('tc'),
                error: page.getByTestId('transfer-error-mes'),
              },
              { kind: 'message', message: example.message! },
            );
            const recipient = yield* browser.newContext({ baseURL });
            const recipientState = accountState.accounts.find(
              (account) => account.accountId === '2222222222',
            )!;
            const recipientPage = yield* recipient.newPage;
            yield* login(recipientPage, recipientState.accountId, recipientState.password);
            yield* expectAccount(recipientPage, recipientState.balance, recipientState.deposits.length);
            yield* recipientPage.reload();
            yield* expectAccount(recipientPage, recipientState.balance, recipientState.deposits.length);
          }),
      );
    });
  }
});
