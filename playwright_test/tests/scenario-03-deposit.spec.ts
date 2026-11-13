import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-03-deposit';
import { expect, testFor } from '../support/fixtures';
import { fillDepositForm } from '../support/forms';
import { expectRejection } from '../support/rejections';
import { expectAccountPage, login, recordNativeValidation } from '../support/ui';
for (const example of cases) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts, accountState }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const sender = accountState.accounts.sender;
      yield* login(page, sender.accountId, sender.password);
      yield* expectAccountPage(page).toHaveBalance(sender.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(sender.deposits.length);
      const amount = yield* fillDepositForm(page, { amount: example.inputs['Deposit Amount'] });
      const historyBefore = yield* page.locator('.history-list').innerText();
      const validation = yield* recordNativeValidation(amount);
      yield* page.getByTestId('dc').click();
      if (!validation.valid) yield* Effect.promise(() => expect(amount).toBeFocused());
      yield* expectRejection(page.getByTestId('deposite-error-mes'), {
        validation,
      }).toHaveMessage(example.message!);

      yield* page.reload();
      yield* Effect.promise(() => expect(page.getByText('Loading...', { exact: true })).toHaveCount(0));
      yield* expectAccountPage(page).toHaveBalance(expectedAccounts.sender.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(expectedAccounts.sender.transactions.length);
      yield* expectAccountPage(page).toHaveHistory(expectedAccounts.sender.transactions);
      yield* Effect.promise(() =>
        expect(page.locator('.history-list')).toHaveText(historyBefore, { useInnerText: true }),
      );
      yield* Effect.promise(() =>
        expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toBeVisible(),
      );
    }),
  );
}
