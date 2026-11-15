// Scenario 2: login is rejected.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-02-login';
import { withActualOutput } from '../support/evidence';
import { expect, test } from '../support/fixtures';
import { fillLoginForm, submitForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { expectAccountPage, expectSignedOut, login, recordDialogs } from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender } = testCase.precondition.accounts;
    const expected = expectedAccountsFor({
      precondition: testCase.precondition,
      postcondition: testCase.postcondition,
    });
    await test.step('Pre-condition: account A exists, visitor is signed out on Login', async () => {
      await prepareAccounts({ openSession, testCase });
      await page.goto('/');
      await expectSignedOut({ page });
    });

    const dialogs = recordDialogs({ page });
    const loginForm = await test.step('Input: fill the login form', () =>
      fillLoginForm({
        page,
        account: {
          id: testCase.inputs['Account Number'],
          password: testCase.inputs.Password,
        },
      }));

    await test.step('Input: submit the login form', () => submitForm({ form: loginForm }));

    await test.step('Expected output: error message, still on Login', async () => {
      const error = page.getByTestId('login-error-mes');
      // Wait for the message before the screenshot, so the evidence shows it.
      await withActualOutput({ page, check: () => expect(error).toBeVisible(), highlight: error });
      await expect.soft(error).toHaveText(testCase.message!);
      await expect(page).toHaveURL(/\/$/);
      await expectSignedOut({ page });
      expect(dialogs).toEqual([]);
    });

    await test.step('Post-condition: still signed out, account A unchanged', async () => {
      await page.reload();
      await expectSignedOut({ page });
      const senderPage = await openSession();
      await login({ page: senderPage, account: sender.account });
      await expectAccountPage({ page: senderPage }).toShow({ account: expected.sender });
      await expectAccountPage({ page: senderPage }).toHaveName({ name: expected.sender.name });
    });
  });
}
