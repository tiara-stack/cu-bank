import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-05-transfer';
import { expect, testFor } from '../support/fixtures';
import { expectRejectionMessage } from '../support/rejections';
import {
  enterAmount,
  expectAccount,
  login,
  transact,
  expectHistory,
  recordNativeValidation,
} from '../support/ui';
for (const example of cases) {
  testFor(example).effect(
    `${example.id} ${example.title}`,
    example.details,
    ({ expectedAccounts, baseURL, accountState }) =>
      Effect.gen(function* () {
        const page = yield* Playwright.Page;
        const sender = accountState.accounts.sender;
        yield* login(page, sender.accountId, sender.password);
        yield* expectAccount(page, { balance: sender.balance, historyCount: sender.deposits.length });
        yield* transact(page, 'deposit', 1000, sender.balance + 1000, sender.deposits.length + 1);
        yield* transact(page, 'withdraw', 200, sender.balance + 800, sender.deposits.length + 2);
        const browser = yield* Playwright.Browser;
        yield* page.getByTestId('t1').fill(example.inputs['Transfer Target']);
        const amount = page.getByTestId('t2');
        yield* enterAmount(amount, example.inputs['Transfer Amount']);
        const historyBefore = yield* page.locator('.history-list').innerText();
        const validation = yield* recordNativeValidation(amount);
        yield* page.getByTestId('tc').click();
        if (!validation.valid) yield* amount.use((native) => expect(native).toBeFocused());
        yield* expectRejectionMessage(page.getByTestId('transfer-error-mes'), {
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
        const recipientContext = yield* browser.newContext({ baseURL });
        const recipient = accountState.accounts.recipient;
        const recipientPage = yield* recipientContext.newPage;
        yield* login(recipientPage, recipient.accountId, recipient.password);
        yield* expectAccount(recipientPage, {
          balance: recipient.balance,
          historyCount: recipient.deposits.length,
        });
        yield* recipientPage.reload();
        yield* expectAccount(recipientPage, {
          balance: recipient.balance,
          historyCount: recipient.deposits.length,
        });
      }),
  );
}
