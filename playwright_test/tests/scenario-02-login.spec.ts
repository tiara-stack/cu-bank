import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-02-login';
import { expect, testFor } from '../support/fixtures';
import { fillLoginForm } from '../support/forms';
import { expectSignedOut, login, expectAccountPage } from '../support/ui';
for (const example of cases) {
  testFor(example).effect(
    `${example.id} ${example.title}`,
    example.details,
    ({ expectedAccounts, accountState, baseURL }) =>
      Effect.gen(function* () {
        const page = yield* Playwright.Page;
        yield* page.goto('/');
        yield* expectSignedOut(page);
        const dialogs: string[] = [];
        yield* page.use(async (native) => {
          native.on('dialog', async (dialog) => {
            dialogs.push(dialog.message());
            await dialog.dismiss();
          });
        });
        yield* fillLoginForm(page, {
          accountId: example.inputs['Account Number'],
          password: example.inputs.Password,
        });
        yield* page.getByTestId('lc').click();
        const error = page.getByTestId('login-error-mes');
        yield* expect(error).toBeVisible();
        yield* expect.soft(error).toHaveText(example.message!);
        yield* expect(page).toHaveURL(/\/$/);
        yield* expectSignedOut(page);
        expect(dialogs).toEqual([]);
        yield* page.reload();
        yield* expectSignedOut(page);
        const browser = yield* Playwright.Browser;
        const sender = accountState.accounts.sender;
        const senderResult = expectedAccounts.sender;
        const senderContext = yield* browser.newContext({ baseURL });
        const senderPage = yield* senderContext.newPage;
        yield* login(senderPage, sender.accountId, sender.password);
        yield* expectAccountPage(senderPage).toHaveBalance(senderResult.balance);
        yield* expectAccountPage(senderPage).toHaveHistoryCount(senderResult.transactions.length);
        yield* expectAccountPage(senderPage).toHaveHistory(senderResult.transactions);
        yield* expectAccountPage(senderPage).toHaveName(senderResult.name);
      }),
  );
}
