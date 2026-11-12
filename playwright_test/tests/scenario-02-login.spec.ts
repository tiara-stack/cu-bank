import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-02-login';
import { test, expect, testFor } from '../support/fixtures';
import { expectSignedOut, login, expectAccount, expectHistory } from '../support/ui';
test.beforeEach(({ page: nativePage }) =>
  Effect.gen(function* () {
    const page = Playwright.makePage(nativePage);
    yield* page.goto('/');
    yield* expectSignedOut(page);
  }).pipe(Effect.scoped, Effect.runPromise),
);
for (const example of cases) {
  testFor(example).effect(
    `${example.id} ${example.title}`,
    example.details,
    ({ expectedAccounts, accountState, baseURL }) =>
      Effect.gen(function* () {
        const page = yield* Playwright.Page;
        const dialogs: string[] = [];
        yield* page.use(async (native) => {
          native.on('dialog', async (dialog) => {
            dialogs.push(dialog.message());
            await dialog.dismiss();
          });
        });
        yield* page.getByTestId('l1').fill(example.inputs['Account Number']);
        yield* page.getByTestId('l2').fill(example.inputs.Password);
        yield* page.getByTestId('lc').click();
        const error = page.getByTestId('login-error-mes');
        yield* error.use((native) => expect(native).toBeVisible());
        yield* error.use((native) => expect.soft(native).toHaveText(example.message!));
        yield* page.use((native) => expect(native).toHaveURL(/\/$/));
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
