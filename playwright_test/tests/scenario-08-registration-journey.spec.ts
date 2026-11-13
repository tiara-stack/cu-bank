import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-08-registration-journey';
import { test, expect, testFor } from '../support/fixtures';
import { fillTransferForm } from '../support/forms';
import { expectAccountPage, expectSignedOut, login, register, transact } from '../support/ui';
for (const example of cases) {
  testFor(example).effect(
    `${example.id} ${example.title}`,
    example.details,
    ({ expectedAccounts, accountState, baseURL }) =>
      Effect.gen(function* () {
        const page = yield* Playwright.Page;
        const browser = yield* Playwright.Browser;
        const sender = accountState.accounts.sender;
        const recipient = accountState.accounts.recipient;
        const senderResult = expectedAccounts.sender;
        const recipientResult = expectedAccounts.recipient;
        const message = yield* register(page, sender);
        yield* Effect.promise(() =>
          test.info().attach('registration-alert', { body: message, contentType: 'text/plain' }),
        );
        expect.soft(message, 'Workbook registration success wording').toBe('success');
        yield* Effect.promise(() => expect(page).toHaveURL(/\/$/));
        yield* expectSignedOut(page);
        yield* login(page, sender.accountId, sender.password);
        yield* expectAccountPage(page).toHaveBalance(0);
        yield* expectAccountPage(page).toHaveHistoryCount(0);
        yield* expectAccountPage(page).toHaveName(senderResult.name);
        yield* transact(page, 'deposit', 1000, 1000, 1);
        yield* transact(page, 'withdraw', 200, 800, 2);
        const recipientContext = yield* browser.newContext({ baseURL });
        const recipientPage = yield* recipientContext.newPage;
        yield* login(recipientPage, recipient.accountId, recipient.password);
        yield* expectAccountPage(recipientPage).toHaveBalance(recipient.balance);
        yield* expectAccountPage(recipientPage).toHaveHistoryCount(recipient.deposits.length);
        yield* fillTransferForm(page, {
          recipientAccountId: recipient.accountId,
          amount: example.inputs.Amount,
        });
        yield* page.getByTestId('tc').click();

        yield* expectAccountPage(page).toHaveBalance(senderResult.balance);
        yield* expectAccountPage(page).toHaveHistoryCount(senderResult.transactions.length);
        yield* expectAccountPage(page).toHaveHistory(senderResult.transactions);
        yield* recipientPage.reload();
        yield* expectAccountPage(recipientPage).toHaveBalance(recipientResult.balance);
        yield* expectAccountPage(recipientPage).toHaveHistoryCount(recipientResult.transactions.length);
        yield* expectAccountPage(recipientPage).toHaveHistory(recipientResult.transactions);
        yield* page.reload();
        yield* expectAccountPage(page).toHaveBalance(senderResult.balance);
        yield* expectAccountPage(page).toHaveHistoryCount(senderResult.transactions.length);
        yield* expectAccountPage(page).toHaveHistory(senderResult.transactions);
      }),
  );
}
