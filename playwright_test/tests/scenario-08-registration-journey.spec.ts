// Scenario 8 (our own): a new customer registers, logs in, deposits, withdraws and transfers.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-08-registration-journey';
import { withActualOutput } from '../support/evidence';
import { expect, test } from '../support/fixtures';
import { fillTransferForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { expectAccountPage, expectSignedOut, login, register, transact } from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender, recipient } = testCase.accountState.accounts;
    const expected = expectedAccountsFor(testCase.accountState, testCase.accountOutcome);

    await test.step('Pre-condition: recipient exists, the new account does not', () =>
      prepareAccounts(openSession, testCase),
    );

    const alertMessage = await test.step('Input: submit the registration form', () => register(page, sender));

    await test.step('Expected output: alert "success", then the Login page', async () => {
      await test.info().attach('registration-alert', { body: alertMessage, contentType: 'text/plain' });
      expect.soft(alertMessage, 'Workbook registration success wording').toBe('success');
      await expect(page).toHaveURL(/\/$/);
      await expectSignedOut(page);
    });

    await test.step('Input: login (must succeed, empty account)', async () => {
      await login(page, sender.accountId, sender.password);
      await expectAccountPage(page).toHaveBalance(0);
      await expectAccountPage(page).toHaveHistoryCount(0);
      await expectAccountPage(page).toHaveName(expected.sender.name);
    });

    await test.step('Input: deposit 1000 (must succeed)', () => transact(page, 'deposit', 1000, 1000, 1));
    await test.step('Input: withdraw 200 (must succeed)', () => transact(page, 'withdraw', 200, 800, 2));

    const recipientPage = await openSession();
    await test.step('Pre-condition check: recipient has the seeded balance', async () => {
      await login(recipientPage, recipient.accountId, recipient.password);
      await expectAccountPage(recipientPage).toHaveBalance(recipient.balance);
      await expectAccountPage(recipientPage).toHaveHistoryCount(recipient.deposits.length);
    });

    await test.step('Input: submit the transfer form', async () => {
      await fillTransferForm(page, {
        recipientAccountId: recipient.accountId,
        amount: testCase.inputs.Amount,
      });
      await page.getByTestId('tc').click();
    });

    await test.step('Expected output: transfer succeeds, sender balance reduced', async () => {
      await withActualOutput(page, () => expectAccountPage(page).toShow(expected.sender));
    });

    await test.step('Post-condition: both accounts updated, also after a reload', async () => {
      await recipientPage.reload();
      await expectAccountPage(recipientPage).toShow(expected.recipient);
      await page.reload();
      await expectAccountPage(page).toShow(expected.sender);
    });
  });
}
