// Scenario 8 (our own): a new customer registers, logs in, deposits, withdraws and transfers.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-08-registration-journey';
import { withActualOutput } from '../support/evidence';
import { expect, test } from '../support/fixtures';
import {
  fillDepositForm,
  fillLoginForm,
  fillRegistrationForm,
  fillTransferForm,
  fillWithdrawalForm,
  submitForm,
} from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import {
  expectAccountPage,
  expectLoggedIn,
  expectSignedOut,
  expectTransaction,
  login,
  recordDialogs,
} from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender, recipient } = testCase.precondition.accounts;
    const expected = expectedAccountsFor({
      precondition: testCase.precondition,
      postcondition: testCase.postcondition,
    });
    await test.step('Pre-condition: recipient exists, visitor is signed out on Register', async () => {
      await prepareAccounts({ openSession, testCase });
      await page.goto('/register');
      await expectSignedOut({ page });
    });

    const dialogs = recordDialogs({ page });
    const registrationForm = await test.step('Input: fill the registration form', () =>
      fillRegistrationForm({ page, account: sender.account }));

    await test.step('Input: submit the registration form', () =>
      submitForm({ form: registrationForm }));

    await test.step('Expected output: alert "success", then the Login page', async () => {
      await expect.poll(() => dialogs.length, { timeout: test.info().timeout }).toBe(1);
      const { type, message: alertMessage } = dialogs[0];
      expect(type).toBe('alert');
      await test
        .info()
        .attach('registration-alert', { body: alertMessage, contentType: 'text/plain' });
      expect.soft(alertMessage, 'Workbook registration success wording').toBe('success');
      await expect(page).toHaveURL(/\/$/);
      await expectSignedOut({ page });
    });

    const loginForm = await test.step('Input: fill the login form', () =>
      fillLoginForm({ page, account: sender.account }));

    await test.step('Input: submit the login form', () => submitForm({ form: loginForm }));

    await test.step('Expected output: login succeeds with an empty account', async () => {
      await expectLoggedIn({ page });
      await expectAccountPage({ page }).toHaveBalance({ balance: 0 });
      await expectAccountPage({ page }).toHaveHistoryCount({ count: 0 });
      await expectAccountPage({ page }).toHaveName({ name: expected.sender.name });
    });

    const depositForm = await test.step('Input: fill the deposit form with 1000', () =>
      fillDepositForm({ page, amount: '1000' }));

    await test.step('Input: submit the deposit form', () => submitForm({ form: depositForm }));

    await test.step('Expected output: deposit succeeds', () =>
      expectTransaction({ page, action: 'deposit', amount: 1000, balance: 1000, historyCount: 1 }));

    const withdrawalForm = await test.step('Input: fill the withdrawal form with 200', () =>
      fillWithdrawalForm({ page, amount: '200' }));

    await test.step('Input: submit the withdrawal form', () =>
      submitForm({ form: withdrawalForm }));

    await test.step('Expected output: withdrawal succeeds', () =>
      expectTransaction({ page, action: 'withdraw', amount: 200, balance: 800, historyCount: 2 }));

    const recipientPage = await openSession();
    await test.step('Pre-condition check: recipient has the seeded balance', async () => {
      await login({ page: recipientPage, account: recipient.account });
      await expectAccountPage({ page: recipientPage }).toHaveBalance({
        balance: recipient.balance,
      });
      await expectAccountPage({ page: recipientPage }).toHaveHistoryCount({
        count: recipient.deposits.length,
      });
    });

    const transferForm = await test.step('Input: fill the transfer form', () =>
      fillTransferForm({
        page,
        recipientAccountId: recipient.account.id,
        amount: testCase.inputs.Amount,
      }));

    await test.step('Input: submit the transfer form', () => submitForm({ form: transferForm }));

    await test.step('Expected output: transfer succeeds, sender balance reduced', async () => {
      await withActualOutput({
        page,
        check: () => expectAccountPage({ page }).toShow({ account: expected.sender }),
      });
    });

    await test.step('Post-condition: both accounts updated, also after a reload', async () => {
      await recipientPage.reload();
      await expectAccountPage({ page: recipientPage }).toShow({ account: expected.recipient });
      await page.reload();
      await expectAccountPage({ page }).toShow({ account: expected.sender });
    });
  });
}
