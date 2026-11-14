// Scenario 2: login is rejected.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-02-login';
import { captureActualOutput } from '../support/evidence';
import { expect, test } from '../support/fixtures';
import { fillLoginForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { expectAccountPage, expectSignedOut, login, recordDialogs } from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender } = testCase.accountState.accounts;
    const expected = expectedAccountsFor(testCase.accountState, testCase.accountOutcome);

    await test.step('Pre-condition: account A exists, visitor is signed out on Login', async () => {
      await prepareAccounts(openSession, testCase);
      await page.goto('/');
      await expectSignedOut(page);
    });
    const dialogs = recordDialogs(page);

    await test.step('Input: submit the login form', async () => {
      await fillLoginForm(page, {
        accountId: testCase.inputs['Account Number'],
        password: testCase.inputs.Password,
      });
      await page.getByTestId('lc').click();
    });

    await test.step('Expected output: error message, still on Login', async () => {
      const error = page.getByTestId('login-error-mes');
      await captureActualOutput(page);
      await expect(error).toBeVisible();
      await expect.soft(error).toHaveText(testCase.message!);
      await expect(page).toHaveURL(/\/$/);
      await expectSignedOut(page);
      expect(dialogs).toEqual([]);
    });

    await test.step('Post-condition: still signed out, account A unchanged', async () => {
      await page.reload();
      await expectSignedOut(page);
      const senderPage = await openSession();
      await login(senderPage, sender.accountId, sender.password);
      await expectAccountPage(senderPage).toShow(expected.sender);
      await expectAccountPage(senderPage).toHaveName(expected.sender.name);
    });
  });
}
