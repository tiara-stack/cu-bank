import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-04-withdrawal';
import { expect, testFor } from '../support/fixtures';
import { expectRejection } from '../support/rejections';
import { enterAmount, expectAccountPage, login, transact, recordNativeValidation } from '../support/ui';
for (const example of cases) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts, accountState }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const sender = accountState.accounts.sender;
      yield* login(page, sender.accountId, sender.password);
      yield* expectAccountPage(page).toHaveBalance(sender.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(sender.deposits.length);
      yield* transact(page, 'deposit', 1000, sender.balance + 1000, sender.deposits.length + 1);
      const amount = page.getByTestId('w1');
      yield* enterAmount(amount, example.inputs['Withdraw Amount']);
      const historyBefore = yield* page.locator('.history-list').innerText();
      const validation = yield* recordNativeValidation(amount);
      yield* page.getByTestId('wc').click();
      if (!validation.valid) yield* amount.use((native) => expect(native).toBeFocused());
      yield* expectRejection(page.getByTestId('withdraw-error-mes'), {
        validation,
      }).toHaveMessage(example.message!);

      yield* page.reload();
      yield* page.getByText('Loading...', { exact: true }).use((locator) => expect(locator).toHaveCount(0));
      yield* expectAccountPage(page).toHaveBalance(expectedAccounts.sender.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(expectedAccounts.sender.transactions.length);
      yield* expectAccountPage(page).toHaveHistory(expectedAccounts.sender.transactions);
      yield* page
        .locator('.history-list')
        .use((native) => expect(native).toHaveText(historyBefore, { useInnerText: true }));
      yield* page
        .getByRole('link', { name: 'LOG OUT', exact: true })
        .use((locator) => expect(locator).toBeVisible());
    }),
  );
}
