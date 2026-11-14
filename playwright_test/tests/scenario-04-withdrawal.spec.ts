// Scenario 4: login succeeds, a deposit succeeds, then a withdrawal is rejected.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-04-withdrawal';
import { test } from '../support/fixtures';
import { fillWithdrawalForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { submitExpectingRejection } from '../support/rejections';
import { expectAccountPage, expectAccountUnchanged, login, transact } from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender } = testCase.accountState.accounts;
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

    const amount = await fillWithdrawalForm(page, { amount: testCase.inputs['Withdraw Amount'] });
    const historyBefore = await page.locator('.history-list').innerText();

    await test.step('Input and expected output: withdrawal is rejected with the specified message', () =>
      submitExpectingRejection(page, {
        field: amount,
        confirm: 'wc',
        error: 'withdraw-error-mes',
        message: testCase.message,
      }),
    );

    await test.step('Post-condition: balance and history unchanged', () =>
      expectAccountUnchanged(page, expected.sender, historyBefore),
    );
  });
}
