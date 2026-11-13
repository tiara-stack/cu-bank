import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-07-bill-payment-success';
import { expect, testFor } from '../support/fixtures';
import { fillBillPaymentForm } from '../support/forms';
import { expectAccountPage, login } from '../support/ui';
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
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts, accountState }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const sender = accountState.accounts.sender;
      yield* login(page, sender.accountId, sender.password);
      yield* expectAccountPage(page).toHaveBalance(sender.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(sender.deposits.length);
      const expected = expectedAccounts.sender;
      const category = categories[example.inputs['Target Payment']];
      yield* page.getByTestId(category.cid).check();
      for (const choice of Object.values(categories)) {
        yield* expect(page.getByTestId(choice.cid)).toBeChecked({ checked: choice.cid === category.cid });
      }
      yield* fillBillPaymentForm(page, { amount: example.inputs.Amount });
      yield* page.getByTestId('bc').click();

      yield* expectAccountPage(page).toHaveBalance(expected.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(expected.transactions.length);
      yield* expectAccountPage(page).toHaveHistory(expected.transactions);
      yield* page.reload();
      yield* expectAccountPage(page).toHaveBalance(expected.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(expected.transactions.length);
      yield* expectAccountPage(page).toHaveHistory(expected.transactions);
    }),
  );
}
