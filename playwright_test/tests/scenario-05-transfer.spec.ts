// Scenario 5: login, deposit and withdrawal succeed, then a transfer is rejected.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-05-transfer';
import { test } from '../support/fixtures';
import {
  fillDepositForm,
  fillLoginForm,
  fillTransferForm,
  fillWithdrawalForm,
  submitForm,
} from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { expectRejection } from '../support/rejections';
import {
  expectAccountPage,
  expectLoggedIn,
  expectSignedOut,
  expectAccountUnchanged,
  login,
  expectTransaction,
} from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender, recipient } = testCase.accountState.accounts;
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

    const depositForm = await test.step('Input: fill the deposit form with 1000', () =>
      fillDepositForm({ page, amount: '1000' }));

    await test.step('Input: submit the deposit form', () => submitForm({ form: depositForm }));

    await test.step('Expected output: deposit succeeds', () =>
      expectTransaction({
        page,
        action: 'deposit',
        amount: 1000,
        balance: sender.balance + 1000,
        historyCount: sender.deposits.length + 1,
      }));

    const withdrawalForm = await test.step('Input: fill the withdrawal form with 200', () =>
      fillWithdrawalForm({ page, amount: '200' }));

    await test.step('Input: submit the withdrawal form', () =>
      submitForm({ form: withdrawalForm }));

    await test.step('Expected output: withdrawal succeeds', () =>
      expectTransaction({
        page,
        action: 'withdraw',
        amount: 200,
        balance: sender.balance + 800,
        historyCount: sender.deposits.length + 2,
      }));

    const historyBefore = await page.locator('.history-list').innerText();
    const transferForm = await test.step('Input: fill the transfer form', () =>
      fillTransferForm({
        page,
        recipientAccountId: testCase.inputs['Transfer Target'],
        amount: testCase.inputs['Transfer Amount'],
      }));

    const submission = await test.step('Input: submit the transfer form', () =>
      submitForm({ form: transferForm }));

    await test.step('Expected output: transfer is rejected with the specified message', () =>
      expectRejection({
        page,
        submission,
        expected: { error: 'transfer-error-mes', message: testCase.message },
      }));

    await test.step('Post-condition: sender unchanged', () =>
      expectAccountUnchanged({ page, account: expected.sender, historyBefore }));

    await test.step('Post-condition: recipient received nothing', async () => {
      const recipientPage = await openSession();
      await login({ page: recipientPage, account: recipient.account });
      await expectAccountPage({ page: recipientPage }).toHaveBalance({
        balance: recipient.balance,
      });
      await expectAccountPage({ page: recipientPage }).toHaveHistoryCount({
        count: recipient.deposits.length,
      });
      await recipientPage.reload();
      await expectAccountPage({ page: recipientPage }).toHaveBalance({
        balance: recipient.balance,
      });
      await expectAccountPage({ page: recipientPage }).toHaveHistoryCount({
        count: recipient.deposits.length,
      });
    });
  });
}
