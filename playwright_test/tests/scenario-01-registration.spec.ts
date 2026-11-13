import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-01-registration';
import { expect, testFor } from '../support/fixtures';
import { expectSignedOut, login, expectAccountPage } from '../support/ui';
for (const example of cases) {
  testFor(example).effect(
    `${example.id} ${example.title}`,
    example.details,
    ({ expectedAccounts, accountState, baseURL }) =>
      Effect.gen(function* () {
        const page = yield* Playwright.Page;
        yield* page.goto('/register');
        yield* expectSignedOut(page);
        const dialogs: string[] = [];
        yield* page.use(async (native) => {
          native.on('dialog', async (dialog) => {
            dialogs.push(dialog.message());
            await dialog.dismiss();
          });
        });
        yield* page.getByTestId('r1').fill(example.inputs['Account Number']);
        yield* page.getByTestId('r2').fill(example.inputs.Password);
        yield* page.getByTestId('r3').fill(example.inputs.Firstname);
        yield* page.getByTestId('r4').fill(example.inputs.Lastname);
        yield* page.getByTestId('rc').click();
        const error = page.getByTestId('register-error-mes');
        yield* Effect.promise(() => expect(error).toBeVisible());
        yield* Effect.promise(() => expect.soft(error).toHaveText(example.message!));
        yield* Effect.promise(() => expect(page).toHaveURL(/\/register$/));
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
        yield* senderPage.reload();
        yield* expectAccountPage(senderPage).toHaveBalance(senderResult.balance);
        yield* expectAccountPage(senderPage).toHaveHistoryCount(senderResult.transactions.length);
        yield* expectAccountPage(senderPage).toHaveHistory(senderResult.transactions);
      }),
  );
}
