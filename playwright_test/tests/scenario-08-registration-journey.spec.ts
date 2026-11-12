import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-08-registration-journey';
import { test, expect, testFor } from '../support/fixtures';
import { expectAccount, expectHistory, expectSignedOut, login, register, transact } from '../support/ui';
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
        yield* page.use((native) => expect(native).toHaveURL(/\/$/));
        yield* expectSignedOut(page);
        yield* login(page, sender.accountId, sender.password);
        yield* expectAccount(page, 0, 0);
        yield* page
          .locator('article')
          .first()
          .getByRole('heading', { name: senderResult.name, exact: true })
          .use((native) => expect(native).toBeVisible());
        yield* transact(page, 'deposit', 1000, 1000, 1);
        yield* transact(page, 'withdraw', 200, 800, 2);
        const recipientContext = yield* browser.newContext({ baseURL });
        const recipientPage = yield* recipientContext.newPage;
        yield* login(recipientPage, recipient.accountId, recipient.password);
        yield* expectAccount(recipientPage, recipient.balance, recipient.deposits.length);
        yield* page.getByTestId('t1').fill(recipient.accountId);
        yield* page.getByTestId('t2').fill(example.inputs.Amount);
        yield* page.getByTestId('tc').click();

        yield* expectAccount(page, senderResult.balance, senderResult.transactions.length);
        yield* expectHistory(page, senderResult.transactions);
        yield* recipientPage.reload();
        yield* expectAccount(recipientPage, recipientResult.balance, recipientResult.transactions.length);
        yield* expectHistory(recipientPage, recipientResult.transactions);
        yield* page.reload();
        yield* recipientPage.reload();
        yield* expectAccount(page, senderResult.balance, senderResult.transactions.length);
        yield* expectHistory(page, senderResult.transactions);
        yield* expectAccount(recipientPage, recipientResult.balance, recipientResult.transactions.length);
        yield* expectHistory(recipientPage, recipientResult.transactions);
      }),
  );
}
