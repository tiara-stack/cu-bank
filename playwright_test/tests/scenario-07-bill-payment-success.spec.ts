// Scenario 7: login succeeds, then a bill payment succeeds.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-07-bill-payment-success';
import { withActualOutput } from '../support/evidence';
import { expect, test } from '../support/fixtures';
import { fillBillPaymentForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { expectAccountPage, login } from '../support/ui';

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

    await test.step('Pre-condition: seed accounts', () => prepareAccounts(openSession, testCase));

    await test.step('Input: login (must succeed)', async () => {
      await login(page, sender.accountId, sender.password);
      await expectAccountPage(page).toHaveBalance(sender.balance);
      await expectAccountPage(page).toHaveHistoryCount(sender.deposits.length);
    });

    await test.step('Input: choose exactly one category and pay', async () => {
      await page.getByTestId(selected).check();
      for (const radio of Object.values(categoryRadio)) {
        await expect(page.getByTestId(radio)).toBeChecked({ checked: radio === selected });
      }
      await fillBillPaymentForm(page, { amount: testCase.inputs.Amount });
      await page.getByTestId('bc').click();
    });

    await test.step('Expected output: balance reduced, one new history record', async () => {
      await withActualOutput(page, () => expectAccountPage(page).toShow(expected.sender));
    });

    await test.step('Post-condition: the result survives a reload', async () => {
      await page.reload();
      await expectAccountPage(page).toShow(expected.sender);
    });
  });
}
