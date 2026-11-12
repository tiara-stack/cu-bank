import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-02-login';
import { test, expect, testFor } from '../support/fixtures';
import { expectSignedOut } from '../support/ui';
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
    // Activates the fixture-owned account outcome checks after this UI-only case.
    ({ expectedAccounts: _expectedAccounts }) =>
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
      }),
  );
}
