import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-01-registration';
import { expect, testFor } from '../support/fixtures';
import { expectSignedOut, login, expectAccount, expectHistory } from '../support/ui';
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
        yield* error.use((native) => expect(native).toBeVisible());
        yield* error.use((native) => expect.soft(native).toHaveText(example.message!));
        yield* page.use((native) => expect(native).toHaveURL(/\/register$/));
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
        yield* expectAccount(senderPage, senderResult.balance, senderResult.transactions.length);
        yield* expectHistory(senderPage, senderResult.transactions);
        yield* senderPage
          .locator('article')
          .first()
          .getByRole('heading', { name: senderResult.name, exact: true })
          .use((native) => expect(native).toBeVisible());
        yield* senderPage.reload();
        yield* expectAccount(senderPage, senderResult.balance, senderResult.transactions.length);
        yield* expectHistory(senderPage, senderResult.transactions);
      }),
  );
}
