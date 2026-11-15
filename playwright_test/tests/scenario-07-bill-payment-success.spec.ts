// Scenario 7: login succeeds, then a bill payment succeeds.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-07-bill-payment-success';
import { withActualOutput } from '../support/evidence';
import { expect, test } from '../support/fixtures';
import { fillLoginForm, fillBillPaymentForm, submitForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { expectAccountPage, expectLoggedIn, expectSignedOut } from '../support/ui';

const categoryRadio: Record<string, string> = {
  'Water Charge': 'b1',
  'Electric Charge': 'b2',
  'Phone Charge': 'b3',
};

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender } = testCase.accountState.accounts;
    const expected = expectedAccountsFor(testCase.accountState, testCase.accountOutcome);
    const selected = categoryRadio[testCase.inputs['Target Payment']];

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

    const billPaymentForm = await test.step('Input: fill the bill payment form', () =>
      fillBillPaymentForm(page, { category: selected, amount: testCase.inputs.Amount }),
    );

    await test.step('Expected output: exactly one bill category is selected', async () => {
      for (const radio of Object.values(categoryRadio)) {
        await expect(page.getByTestId(radio)).toBeChecked({ checked: radio === selected });
      }
    });

    await test.step('Input: submit the bill payment form', () => submitForm(billPaymentForm));

    await test.step('Expected output: balance reduced, one new history record', async () => {
      await withActualOutput(page, () => expectAccountPage(page).toShow(expected.sender));
    });

    await test.step('Post-condition: the result survives a reload', async () => {
      await page.reload();
      await expectAccountPage(page).toShow(expected.sender);
    });
  });
}
