// Scenario 3: login succeeds, then a deposit is rejected.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-03-deposit';
import { test } from '../support/fixtures';
import { fillLoginForm, fillDepositForm, submitForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { expectRejection } from '../support/rejections';
import {
  expectAccountPage,
  expectLoggedIn,
  expectSignedOut,
  expectAccountUnchanged,
} from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender } = testCase.accountState.accounts;
    const expected = expectedAccountsFor({
      state: testCase.accountState,
      outcome: testCase.accountOutcome,
    });
    await test.step('Pre-condition: seed accounts, signed out on Login', async () => {
      await prepareAccounts({ openSession, testCase });
      await page.goto('/');
      await expectSignedOut({ page });
    });

    const loginForm = await test.step('Input: fill the login form', () =>
      fillLoginForm({ page, account: sender.account }));

    await test.step('Input: submit the login form', () => submitForm({ form: loginForm }));

    await test.step('Expected output: login succeeds with the seeded account', async () => {
      await expectLoggedIn({ page });
      await expectAccountPage({ page }).toHaveBalance({ balance: sender.balance });
      await expectAccountPage({ page }).toHaveHistoryCount({ count: sender.deposits.length });
    });

    const historyBefore = await page.locator('.history-list').innerText();
    const depositForm = await test.step('Input: fill the deposit form', () =>
      fillDepositForm({ page, amount: testCase.inputs['Deposit Amount'] }));

    const submission = await test.step('Input: submit the deposit form', () =>
      submitForm({ form: depositForm }));

    await test.step('Expected output: deposit is rejected with the specified message', () =>
      expectRejection({
        page,
        submission,
        expected: { error: 'deposite-error-mes', message: testCase.message },
      }));

    await test.step('Post-condition: balance and history unchanged', () =>
      expectAccountUnchanged({ page, account: expected.sender, historyBefore }));
  });
}
