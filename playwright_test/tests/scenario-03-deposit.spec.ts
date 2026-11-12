import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-03-deposit';
import { test, testFor } from '../support/fixtures';
import { expectTransactionRejected } from '../support/rejections';
import { enterAmount, expectAccount, login } from '../support/ui';
test.beforeEach(({ page: nativePage, accountState }) =>
  Effect.gen(function* () {
    const page = Playwright.makePage(nativePage);
    const sender = accountState.accounts.find((account) => account.accountId === '1111111111')!;
    yield* login(page, sender.accountId, sender.password);
    yield* expectAccount(page, sender.balance, sender.deposits.length);
  }).pipe(Effect.scoped, Effect.runPromise),
);
for (const example of cases) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const amount = page.getByTestId('d1');
      yield* enterAmount(amount, example.inputs['Deposit Amount']);
      yield* expectTransactionRejected(
        page,
        expectedAccounts['1111111111'],
        {
          amount,
          confirm: page.getByTestId('dc'),
          error: page.getByTestId('deposite-error-mes'),
        },
        { kind: 'message', message: example.message! },
      );
    }),
  );
}
