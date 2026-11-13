import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-06-bill-payment-rejected';
import { expect, testFor } from '../support/fixtures';
import { expectRejectionMessage } from '../support/rejections';
import { enterAmount, expectAccount, login, expectHistory, recordNativeValidation } from '../support/ui';
for (const example of cases.filter((item) => item.details.tag.includes('@bill-category-selected'))) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts, accountState }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const sender = accountState.accounts.sender;
      yield* login(page, sender.accountId, sender.password);
      yield* expectAccount(page, { balance: sender.balance, historyCount: sender.deposits.length });
      yield* page.getByTestId('b1').check();
      const amount = page.getByTestId('b4');
      yield* enterAmount(amount, example.inputs.Amount);
      const historyBefore = yield* page.locator('.history-list').innerText();
      const validation = yield* recordNativeValidation(amount);
      yield* page.getByTestId('bc').click();
      if (!validation.valid) yield* amount.use((native) => expect(native).toBeFocused());
      yield* expectRejectionMessage(page.getByTestId('billpayment-error-mes'), {
        message: example.message!,
        validation,
      });

      yield* page.reload();
      yield* page.getByText('Loading...', { exact: true }).use((locator) => expect(locator).toHaveCount(0));
      yield* expectAccount(page, {
        balance: expectedAccounts.sender.balance,
        historyCount: expectedAccounts.sender.transactions.length,
      });
      yield* expectHistory(page, { transactions: expectedAccounts.sender.transactions });
      yield* page
        .locator('.history-list')
        .use((native) => expect(native).toHaveText(historyBefore, { useInnerText: true }));
      yield* page
        .getByRole('link', { name: 'LOG OUT', exact: true })
        .use((locator) => expect(locator).toBeVisible());
    }),
  );
}
for (const example of cases.filter((item) => item.details.tag.includes('@bill-category-required'))) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts, accountState }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const sender = accountState.accounts.sender;
      yield* login(page, sender.accountId, sender.password);
      yield* expectAccount(page, { balance: sender.balance, historyCount: sender.deposits.length });
      const amount = page.getByTestId('b4');
      yield* enterAmount(amount, example.inputs.Amount);
      const historyBefore = yield* page.locator('.history-list').innerText();
      const validation = yield* recordNativeValidation(page.getByTestId('b1'));
      yield* page.getByTestId('bc').click();
      expect(validation.valid).toBe(false);
      expect(validation.valueMissing).toBe(true);
      yield* page.getByTestId('b1').use((native) => expect(native).toBeFocused());
      expect(validation.validationMessage).not.toBe('');

      yield* page.reload();
      yield* page.getByText('Loading...', { exact: true }).use((locator) => expect(locator).toHaveCount(0));
      yield* expectAccount(page, {
        balance: expectedAccounts.sender.balance,
        historyCount: expectedAccounts.sender.transactions.length,
      });
      yield* expectHistory(page, { transactions: expectedAccounts.sender.transactions });
      yield* page
        .locator('.history-list')
        .use((native) => expect(native).toHaveText(historyBefore, { useInnerText: true }));
      yield* page
        .getByRole('link', { name: 'LOG OUT', exact: true })
        .use((locator) => expect(locator).toBeVisible());
    }),
  );
}
