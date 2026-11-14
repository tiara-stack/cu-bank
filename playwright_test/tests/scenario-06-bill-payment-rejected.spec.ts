// Scenario 6: login succeeds, then a bill payment is rejected.
import { expectedAccountsFor } from '../data/account-outcome';
import { cases } from '../data/scenarios/scenario-06-bill-payment-rejected';
import { captureActualOutput } from '../support/evidence';
import { expect, test } from '../support/fixtures';
import { fillBillPaymentForm } from '../support/forms';
import { prepareAccounts } from '../support/preconditions';
import { expectRejection, submitForm } from '../support/rejections';
import { expectAccountPage, expectAccountUnchanged, login } from '../support/ui';

for (const testCase of cases) {
  test(`${testCase.id} ${testCase.title}`, testCase.details, async ({ page, openSession }) => {
    const { sender } = testCase.accountState.accounts;
    const expected = expectedAccountsFor(testCase.accountState, testCase.accountOutcome);
    const categoryIsSelected = testCase.details.tag.includes('@bill-category-selected');
    const waterCharge = page.getByTestId('b1');

    await test.step('Pre-condition: seed accounts', () => prepareAccounts(openSession, testCase));

    await test.step('Input: login (must succeed)', async () => {
      await login(page, sender.account.id, sender.account.password);
      await expectAccountPage(page).toHaveBalance(sender.balance);
      await expectAccountPage(page).toHaveHistoryCount(sender.deposits.length);
    });

    const historyBefore = await page.locator('.history-list').innerText();

    const submission = await test.step('Input: submit the bill payment form', async () => {
      if (categoryIsSelected) await waterCharge.check();
      const amount = await fillBillPaymentForm(page, { amount: testCase.inputs.Amount });
      // Without a category the browser stops at the category field, so that is the field to inspect.
      return submitForm(page, { field: categoryIsSelected ? amount : waterCharge, confirm: 'bc' });
    });

    if (categoryIsSelected) {
      await test.step('Expected output: bill payment is rejected with the specified message', () =>
        expectRejection(page, submission, { error: 'billpayment-error-mes', message: testCase.message }),
      );
    } else {
      // The specification gives no message for a missing category (N/A): the browser must block it.
      await test.step('Expected output: the browser blocks the form at the missing category', async () => {
        const { validation } = submission;
        await captureActualOutput(page, waterCharge);
        expect(validation.valid).toBe(false);
        expect(validation.valueMissing).toBe(true);
        await expect(waterCharge).toBeFocused();
        expect(validation.validationMessage).not.toBe('');
      });
    }

    await test.step('Post-condition: balance and history unchanged', () =>
      expectAccountUnchanged(page, expected.sender, historyBefore),
    );
  });
}
