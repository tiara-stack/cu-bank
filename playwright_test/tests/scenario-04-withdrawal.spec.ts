import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-04-withdrawal';
import { test, testFor } from '../support/fixtures';
import { expectTransactionRejected } from '../support/rejections';
import { enterAmount, expectAccount, login, transact } from '../support/ui';
test.beforeEach(({ page: nativePage, accountState }) =>
  Effect.gen(function* () {
    const page = Playwright.makePage(nativePage);
    const sender = accountState.accounts.find((account) => account.accountId === '1111111111')!;
    yield* login(page, sender.accountId, sender.password);
    yield* expectAccount(page, sender.balance, sender.deposits.length);
    yield* transact(page, 'deposit', 1000, sender.balance + 1000, sender.deposits.length + 1);
  }).pipe(Effect.scoped, Effect.runPromise),
);
for (const example of cases) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const amount = page.getByTestId('w1');
      yield* enterAmount(amount, example.inputs['Withdraw Amount']);
      yield* expectTransactionRejected(
        page,
        expectedAccounts['1111111111'],
        {
          amount,
          confirm: page.getByTestId('wc'),
          error: page.getByTestId('withdraw-error-mes'),
        },
        { kind: 'message', message: example.message! },
      );
    }),
  );
}
