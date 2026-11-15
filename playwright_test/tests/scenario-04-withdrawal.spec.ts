// Scenario 4: login succeeds, a deposit succeeds, then a withdrawal is rejected.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-04-withdrawal';
import { test } from '../support/fixtures';
import { fillDepositForm, fillLoginForm, fillWithdrawalForm, submitForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { expectRejection } from '../support/rejections';
import {
  expectAccountPage,
  expectLoggedIn,
  expectSignedOut,
  expectAccountUnchanged,
  expectTransaction,
} from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender } = testCase.accountState.accounts;
    const expected = expectedAccountsFor(testCase.accountState, testCase.accountOutcome);

    await test.step('Pre-condition: seed accounts, signed out on Login', async () => {
      await prepareAccounts(openSession, testCase);
      await page.goto('/');
      await expectSignedOut(page);
    });

    const loginForm = await test.step('Input: fill the login form', () => fillLoginForm(page, sender.account));

    await test.step('Input: submit the login form', () => submitForm(loginForm));

    await test.step('Expected output: login succeeds with the seeded account', async () => {
      await expectLoggedIn(page);
      await expectAccountPage(page).toHaveBalance(sender.balance);
      await expectAccountPage(page).toHaveHistoryCount(sender.deposits.length);
    });

    const depositForm = await test.step('Input: fill the deposit form with 1000', () => fillDepositForm(page, { amount: '1000' }));

    await test.step('Input: submit the deposit form', () => submitForm(depositForm));

    await test.step('Expected output: deposit succeeds', () =>
      expectTransaction(page, 'deposit', 1000, sender.balance + 1000, sender.deposits.length + 1),
    );

    const historyBefore = await page.locator('.history-list').innerText();

    const withdrawalForm = await test.step('Input: fill the withdrawal form', () =>
      fillWithdrawalForm(page, { amount: testCase.inputs['Withdraw Amount'] }),
    );

    const submission = await test.step('Input: submit the withdrawal form', () => submitForm(withdrawalForm));

    await test.step('Expected output: withdrawal is rejected with the specified message', () =>
      expectRejection(page, submission, { error: 'withdraw-error-mes', message: testCase.message }),
    );

    await test.step('Post-condition: balance and history unchanged', () =>
      expectAccountUnchanged(page, expected.sender, historyBefore),
    );
  });
}
