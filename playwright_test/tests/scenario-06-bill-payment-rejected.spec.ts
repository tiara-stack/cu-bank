import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-06-bill-payment-rejected';
import { test, expect, testFor } from '../support/fixtures';
import { expectRejectionMessage } from '../support/rejections';
import { enterAmount, expectAccount, login, expectHistory, recordNativeValidation } from '../support/ui';
test.beforeEach(({ page: nativePage, accountState }) =>
  Effect.gen(function* () {
    const page = Playwright.makePage(nativePage);
    const sender = accountState.accounts.sender;
    yield* login(page, sender.accountId, sender.password);
    yield* expectAccount(page, sender.balance, sender.deposits.length);
  }).pipe(Effect.scoped, Effect.runPromise),
);
for (const example of cases.filter((item) => item.details.tag.includes('@bill-category-selected'))) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      yield* page.getByTestId('b1').check();
      const amount = page.getByTestId('b4');
      yield* enterAmount(amount, example.inputs.Amount);
      const historyBefore = yield* page.locator('.history-list').innerText();
      const validation = yield* recordNativeValidation(amount);
      yield* page.getByTestId('bc').click();
      if (!validation.valid) yield* amount.use((native) => expect(native).toBeFocused());
      yield* expectRejectionMessage(page.getByTestId('billpayment-error-mes'), example.message!, validation);

      yield* page.reload();
      yield* page.getByText('Loading...', { exact: true }).use((locator) => expect(locator).toHaveCount(0));
      yield* expectAccount(
        page,
        expectedAccounts.sender.balance,
        expectedAccounts.sender.transactions.length,
      );
      yield* expectHistory(page, expectedAccounts.sender.transactions);
      yield* page
        .locator('.history-list')
        .use((native) => expect(native).toHaveText(historyBefore, { useInnerText: true }));
      yield* page
        .getByRole('link', { name: 'LOG OUT', exact: true })
        .use((locator) => expect(locator).toBeVisible());
    }),
  );
}
for (const example of cases.filter((item) => item.details.tag.includes('@bill-category-required'))) {
  testFor(example).effect(`${example.id} ${example.title}`, example.details, ({ expectedAccounts }) =>
    Effect.gen(function* () {
      const page = yield* Playwright.Page;
      const amount = page.getByTestId('b4');
      yield* enterAmount(amount, example.inputs.Amount);
      const historyBefore = yield* page.locator('.history-list').innerText();
      const validation = yield* recordNativeValidation(page.getByTestId('b1'));
      yield* page.getByTestId('bc').click();
      expect(validation.valid).toBe(false);
      expect(validation.valueMissing).toBe(true);
      yield* page.getByTestId('b1').use((native) => expect(native).toBeFocused());
      expect(validation.validationMessage).not.toBe('');

      yield* page.reload();
      yield* page.getByText('Loading...', { exact: true }).use((locator) => expect(locator).toHaveCount(0));
      yield* expectAccount(
        page,
        expectedAccounts.sender.balance,
        expectedAccounts.sender.transactions.length,
      );
      yield* expectHistory(page, expectedAccounts.sender.transactions);
      yield* page
        .locator('.history-list')
        .use((native) => expect(native).toHaveText(historyBefore, { useInnerText: true }));
      yield* page
        .getByRole('link', { name: 'LOG OUT', exact: true })
        .use((locator) => expect(locator).toBeVisible());
    }),
  );
}
