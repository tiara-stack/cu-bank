import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/cases';
import { test, expect } from '../support/fixtures';
import { expectSignedOut } from '../support/ui';
test.describe('Scenario 1', () => {
  test.beforeEach(({ page: nativePage }) =>
    Effect.gen(function* () {
      const page = Playwright.makePage(nativePage);
      yield* page.goto('/register');
      yield* expectSignedOut(page);
    }).pipe(Effect.scoped, Effect.runPromise),
  );
  for (const example of cases.filter((item) => item.scenario === 1)) {
    test.describe(example.id, () => {
      test.use({ accountState: example.accountState });
      test.effect(
        example.title,
        {
          tag: example.demo ? '@demo' : '@variant',
          annotation: [
            { type: 'expected', description: example.expected },
            { type: 'precondition', description: example.precondition },
            { type: 'workbook note', description: example.notes },
          ],
        },
        ({ bank }) =>
          Effect.gen(function* () {
            const page = yield* Playwright.Page;
            const before = yield* Effect.tryPromise(() => bank.find().sort({ accountId: 1 }).toArray());
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
            expect(yield* Effect.tryPromise(() => bank.find().sort({ accountId: 1 }).toArray())).toEqual(
              before,
            );
          }),
      );
    });
  }
});
