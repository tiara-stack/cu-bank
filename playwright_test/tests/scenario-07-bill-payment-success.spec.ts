import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-07-bill-payment-success';
import { test, expect, testFor } from '../support/fixtures';
import { expectAccount, expectHistory, login } from '../support/ui';
test.beforeEach(({ page: nativePage, accountState }) =>
  Effect.gen(function* () {
    const page = Playwright.makePage(nativePage);
    const sender = accountState.accounts.sender;
    yield* login(page, sender.accountId, sender.password);
    yield* expectAccount(page, sender.balance, sender.deposits.length);
  }).pipe(Effect.scoped, Effect.runPromise),
);
const categories: Record<
  string,
  {
    cid: string;
  }
> = {
  'Water Charge': { cid: 'b1' },
  'Electric Charge': { cid: 'b2' },
  'Phone Charge': { cid: 'b3' },
};
for (const example of cases) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const expected = expectedAccounts.sender;
      const category = categories[example.inputs['Target Payment']];
      yield* page.getByTestId(category.cid).check();
      for (const choice of Object.values(categories)) {
        yield* page
          .getByTestId(choice.cid)
          .use((native) => expect(native).toBeChecked({ checked: choice.cid === category.cid }));
      }
      yield* page.getByTestId('b4').fill(example.inputs.Amount);
      yield* page.getByTestId('bc').click();

      yield* expectAccount(page, expected.balance, expected.transactions.length);
      yield* expectHistory(page, expected.transactions);
      yield* page.reload();
      yield* expectAccount(page, expected.balance, expected.transactions.length);
      yield* expectHistory(page, expected.transactions);
    }),
  );
}
