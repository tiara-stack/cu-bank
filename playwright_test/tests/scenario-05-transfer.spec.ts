import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-05-transfer';
import { expect, testFor } from '../support/fixtures';
import { fillTransferForm } from '../support/forms';
import { expectRejection } from '../support/rejections';
import { expectAccountPage, login, transact, recordNativeValidation } from '../support/ui';
for (const example of cases) {
  testFor(example).effect(
    `${example.id} ${example.title}`,
    example.details,
    ({ expectedAccounts, baseURL, accountState }) =>
      Effect.gen(function* () {
        const page = yield* Playwright.Page;
        const sender = accountState.accounts.sender;
        yield* login(page, sender.accountId, sender.password);
        yield* expectAccountPage(page).toHaveBalance(sender.balance);
        yield* expectAccountPage(page).toHaveHistoryCount(sender.deposits.length);
        yield* transact(page, 'deposit', 1000, sender.balance + 1000, sender.deposits.length + 1);
        yield* transact(page, 'withdraw', 200, sender.balance + 800, sender.deposits.length + 2);
        const browser = yield* Playwright.Browser;
        const amount = yield* fillTransferForm(page, {
          recipientAccountId: example.inputs['Transfer Target'],
          amount: example.inputs['Transfer Amount'],
        });
        const historyBefore = yield* page.locator('.history-list').innerText();
        const validation = yield* recordNativeValidation(amount);
        yield* page.getByTestId('tc').click();
        if (!validation.valid) yield* Effect.promise(() => expect(amount).toBeFocused());
        yield* expectRejection(page.getByTestId('transfer-error-mes'), {
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
        const recipientContext = yield* browser.newContext({ baseURL });
        const recipient = accountState.accounts.recipient;
        const recipientPage = yield* recipientContext.newPage;
        yield* login(recipientPage, recipient.accountId, recipient.password);
        yield* expectAccountPage(recipientPage).toHaveBalance(recipient.balance);
        yield* expectAccountPage(recipientPage).toHaveHistoryCount(recipient.deposits.length);
        yield* recipientPage.reload();
        yield* expectAccountPage(recipientPage).toHaveBalance(recipient.balance);
        yield* expectAccountPage(recipientPage).toHaveHistoryCount(recipient.deposits.length);
      }),
  );
}
