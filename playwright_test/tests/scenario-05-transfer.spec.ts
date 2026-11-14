// Scenario 5: login, deposit and withdrawal succeed, then a transfer is rejected.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-05-transfer';
import { test } from '../support/fixtures';
import { fillTransferForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { submitExpectingRejection } from '../support/rejections';
import { expectAccountPage, expectAccountUnchanged, login, transact } from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender, recipient } = testCase.accountState.accounts;
    const expected = expectedAccountsFor(testCase.accountState, testCase.accountOutcome);

    await test.step('Pre-condition: seed accounts', () => prepareAccounts(openSession, testCase));

    await test.step('Input: login (must succeed)', async () => {
      await login(page, sender.accountId, sender.password);
      await expectAccountPage(page).toHaveBalance(sender.balance);
      await expectAccountPage(page).toHaveHistoryCount(sender.deposits.length);
    });

    await test.step('Input: deposit 1000 (must succeed)', () =>
      transact(page, 'deposit', 1000, sender.balance + 1000, sender.deposits.length + 1),
    );

    await test.step('Input: withdraw 200 (must succeed)', () =>
      transact(page, 'withdraw', 200, sender.balance + 800, sender.deposits.length + 2),
    );

    const amount = await fillTransferForm(page, {
      recipientAccountId: testCase.inputs['Transfer Target'],
      amount: testCase.inputs['Transfer Amount'],
    });
    const historyBefore = await page.locator('.history-list').innerText();

    await test.step('Input and expected output: transfer is rejected with the specified message', () =>
      submitExpectingRejection(page, {
        field: amount,
        confirm: 'tc',
        error: 'transfer-error-mes',
        message: testCase.message,
      }),
    );

    await test.step('Post-condition: sender unchanged', () =>
      expectAccountUnchanged(page, expected.sender, historyBefore),
    );

    await test.step('Post-condition: recipient received nothing', async () => {
      const recipientPage = await openSession();
      await login(recipientPage, recipient.accountId, recipient.password);
      await expectAccountPage(recipientPage).toHaveBalance(recipient.balance);
      await expectAccountPage(recipientPage).toHaveHistoryCount(recipient.deposits.length);
      await recipientPage.reload();
      await expectAccountPage(recipientPage).toHaveBalance(recipient.balance);
      await expectAccountPage(recipientPage).toHaveHistoryCount(recipient.deposits.length);
    });
  });
}
