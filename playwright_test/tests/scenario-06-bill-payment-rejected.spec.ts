import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-06-bill-payment-rejected';
import { expect, testFor } from '../support/fixtures';
import { fillBillPaymentForm } from '../support/forms';
import { expectRejection } from '../support/rejections';
import { expectAccountPage, login, recordNativeValidation } from '../support/ui';
for (const example of cases.filter((item) => item.details.tag.includes('@bill-category-selected'))) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts, accountState }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const sender = accountState.accounts.sender;
      yield* login(page, sender.accountId, sender.password);
      yield* expectAccountPage(page).toHaveBalance(sender.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(sender.deposits.length);
      yield* page.getByTestId('b1').check();
      const amount = yield* fillBillPaymentForm(page, { amount: example.inputs.Amount });
      const historyBefore = yield* page.locator('.history-list').innerText();
      const validation = yield* recordNativeValidation(amount);
      yield* page.getByTestId('bc').click();
      if (!validation.valid) yield* expect(amount).toBeFocused();
      yield* expectRejection(page.getByTestId('billpayment-error-mes'), {
        validation,
      }).toHaveMessage(example.message!);

      yield* page.reload();
      yield* expect(page.getByText('Loading...', { exact: true })).toHaveCount(0);
      yield* expectAccountPage(page).toHaveBalance(expectedAccounts.sender.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(expectedAccounts.sender.transactions.length);
      yield* expectAccountPage(page).toHaveHistory(expectedAccounts.sender.transactions);
      yield* expect(page.locator('.history-list')).toHaveText(historyBefore, { useInnerText: true });
      yield* expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toBeVisible();
    }),
  );
}
for (const example of cases.filter((item) => item.details.tag.includes('@bill-category-required'))) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts, accountState }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const sender = accountState.accounts.sender;
      yield* login(page, sender.accountId, sender.password);
      yield* expectAccountPage(page).toHaveBalance(sender.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(sender.deposits.length);
      yield* fillBillPaymentForm(page, { amount: example.inputs.Amount });
      const historyBefore = yield* page.locator('.history-list').innerText();
      const validation = yield* recordNativeValidation(page.getByTestId('b1'));
      yield* page.getByTestId('bc').click();
      expect(validation.valid).toBe(false);
      expect(validation.valueMissing).toBe(true);
      yield* expect(page.getByTestId('b1')).toBeFocused();
      expect(validation.validationMessage).not.toBe('');

      yield* page.reload();
      yield* expect(page.getByText('Loading...', { exact: true })).toHaveCount(0);
      yield* expectAccountPage(page).toHaveBalance(expectedAccounts.sender.balance);
      yield* expectAccountPage(page).toHaveHistoryCount(expectedAccounts.sender.transactions.length);
      yield* expectAccountPage(page).toHaveHistory(expectedAccounts.sender.transactions);
      yield* expect(page.locator('.history-list')).toHaveText(historyBefore, { useInnerText: true });
      yield* expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toBeVisible();
    }),
  );
}
