// Scenario 1: registration is rejected.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-01-registration';
import { withActualOutput } from '../support/evidence';
import { expect, test } from '../support/fixtures';
import { fillRegistrationForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { expectAccountPage, expectSignedOut, login, recordDialogs } from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender } = testCase.accountState.accounts;
    const expected = expectedAccountsFor(testCase.accountState, testCase.accountOutcome);

    await test.step('Pre-condition: account A exists, visitor is signed out on Register', async () => {
      await prepareAccounts(openSession, testCase);
      await page.goto('/register');
      await expectSignedOut(page);
    });
    const dialogs = recordDialogs(page);

    await test.step('Input: submit the registration form', async () => {
      await fillRegistrationForm(page, {
        id: testCase.inputs['Account Number'],
        password: testCase.inputs.Password,
        firstName: testCase.inputs.Firstname,
        lastName: testCase.inputs.Lastname,
      });
      await page.getByTestId('rc').click();
    });

    await test.step('Expected output: error message, still on Register, no success alert', async () => {
      const error = page.getByTestId('register-error-mes');
      // Wait for the message before the screenshot, so the evidence shows it.
      await withActualOutput(page, () => expect(error).toBeVisible(), error);
      await expect.soft(error).toHaveText(testCase.message!);
      await expect(page).toHaveURL(/\/register$/);
      await expectSignedOut(page);
      expect(dialogs).toEqual([]);
    });

    await test.step('Post-condition: still signed out, account A unchanged', async () => {
      await page.reload();
      await expectSignedOut(page);
      const senderPage = await openSession();
      await login(senderPage, sender.account.id, sender.account.password);
      await expectAccountPage(senderPage).toShow(expected.sender);
      await expectAccountPage(senderPage).toHaveName(expected.sender.name);
    });
  });
}
