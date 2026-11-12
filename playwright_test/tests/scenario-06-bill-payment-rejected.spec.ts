import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-06-bill-payment-rejected';
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
for (const example of cases.filter((item) => item.details.tag.includes('@bill-category-selected'))) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      yield* page.getByTestId('b1').check();
      const amount = page.getByTestId('b4');
      yield* enterAmount(amount, example.inputs.Amount);
      yield* expectTransactionRejected(
        page,
        expectedAccounts['1111111111'],
        {
          amount,
          confirm: page.getByTestId('bc'),
          error: page.getByTestId('billpayment-error-mes'),
        },
        { kind: 'message', message: example.message! },
      );
    }),
  );
}
for (const example of cases.filter((item) => item.details.tag.includes('@bill-category-required'))) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const amount = page.getByTestId('b4');
      yield* enterAmount(amount, example.inputs.Amount);
      yield* expectTransactionRejected(
        page,
        expectedAccounts['1111111111'],
        {
          amount,
          confirm: page.getByTestId('bc'),
          error: page.getByTestId('billpayment-error-mes'),
        },
        { kind: 'required-field', input: page.getByTestId('b1') },
      );
    }),
  );
}
