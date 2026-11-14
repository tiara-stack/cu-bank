// Scenario 3: login succeeds, then a deposit is rejected.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-03-deposit';
import { test } from '../support/fixtures';
import { fillDepositForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { submitExpectingRejection } from '../support/rejections';
import { expectAccountPage, expectAccountUnchanged, login } from '../support/ui';

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

    const amount = await fillDepositForm(page, { amount: testCase.inputs['Deposit Amount'] });
    const historyBefore = await page.locator('.history-list').innerText();

    await test.step('Input and expected output: deposit is rejected with the specified message', () =>
      submitExpectingRejection(page, {
        field: amount,
        confirm: 'dc',
        error: 'deposite-error-mes',
        message: testCase.message,
      }),
    );

    await test.step('Post-condition: balance and history unchanged', () =>
      expectAccountUnchanged(page, expected.sender, historyBefore),
    );
  });
}
