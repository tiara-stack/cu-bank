import { Collection } from 'effect-mongodb';
import { Effect, Option } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/scenarios/scenario-08-registration-journey';
import { test, expect } from '../support/fixtures';
import { expectAccount, expectHistory, expectSignedOut, login, register, transact } from '../support/ui';
for (const example of cases) {
  test.describe(example.id, () => {
    test.use({ accountState: example.accountState });
    test.effect(
      example.title,
      {
        tag: [...example.tags],
        annotation: [
          { type: 'expected', description: example.expected },
          { type: 'precondition', description: example.precondition },
          { type: 'workbook note', description: example.notes },
        ],
      },
      ({ bank, baseURL }) =>
        Effect.gen(function* () {
          const page = yield* Playwright.Page;
          const browser = yield* Playwright.Browser;
          const accountId = example.inputs['Register Account Number'];
          const password = example.inputs.Password;
          const name = `${example.inputs.Firstname} ${example.inputs.Lastname}`;
          const recipientBefore = Option.getOrThrow(
            yield* Collection.findOne(bank, { accountId: '2222222222' }),
          );
          expect(Option.isNone(yield* Collection.findOne(bank, { accountId }))).toBe(true);
          const message = yield* register(page, {
            accountId,
            password,
            firstName: example.inputs.Firstname,
            lastName: example.inputs.Lastname,
          });
          yield* Effect.promise(() =>
            test.info().attach('registration-alert', { body: message, contentType: 'text/plain' }),
          );
          expect.soft(message, 'Workbook registration success wording').toBe('success');
          yield* page.use((native) => expect(native).toHaveURL(/\/$/));
          yield* expectSignedOut(page);
          expect(Option.getOrThrow(yield* Collection.findOne(bank, { accountId }))).toMatchObject({
            accountId,
            name,
            balance: 0,
            transactions: [],
          });
          yield* login(page, accountId, password);
          yield* expectAccount(page, 0, 0);
          yield* page
            .locator('article')
            .first()
            .getByRole('heading', { name, exact: true })
            .use((native) => expect(native).toBeVisible());
          const startedAt = Date.now();
          yield* transact(page, 'deposit', 1000, 1000, 1);
          yield* transact(page, 'withdraw', 200, 800, 2);
          const recipient = yield* browser.newContext({ baseURL });
          const recipientPage = yield* recipient.newPage;
          yield* login(recipientPage, '2222222222');
          yield* expectAccount(recipientPage, 200, 1);
          yield* page.getByTestId('t1').fill(example.inputs['Transfer Target']);
          yield* page.getByTestId('t2').fill('300');
          const response = yield* page.use(async (native) => {
            const pending = native.waitForResponse(
              (result) => result.url().endsWith('/transactions/') && result.request().method() === 'PUT',
            );
            await native.getByTestId('tc').click();
            return pending;
          });
          expect(response.ok()).toBe(true);
          const senderHistory = [
            { title: 'deposit', target: '', amount: 1000, balance: 1000 },
            { title: 'withdraw', target: '', amount: 200, balance: 800 },
            { title: 'transfer to', target: '2222222222', amount: 300, balance: 500 },
          ];
          const recipientHistory = [
            { title: 'deposit', target: '', amount: 200, balance: 200 },
            { title: 'transfer from', target: accountId, amount: 300, balance: 500 },
          ];
          yield* expectAccount(page, 500, 3);
          yield* expectHistory(page, senderHistory);
          yield* recipientPage.reload();
          yield* expectAccount(recipientPage, 500, 2);
          yield* expectHistory(recipientPage, recipientHistory);
          yield* page.reload();
          yield* recipientPage.reload();
          yield* expectAccount(page, 500, 3);
          yield* expectHistory(page, senderHistory);
          yield* expectAccount(recipientPage, 500, 2);
          yield* expectHistory(recipientPage, recipientHistory);
          const senderAfter = Option.getOrThrow(yield* Collection.findOne(bank, { accountId }));
          const recipientAfter = Option.getOrThrow(
            yield* Collection.findOne(bank, { accountId: '2222222222' }),
          );
          expect(senderAfter.transactions).toMatchObject(senderHistory);
          expect(recipientAfter.transactions).toMatchObject(recipientHistory);
          expect(recipientAfter.transactions[0]).toEqual(recipientBefore.transactions[0]);
          for (const transaction of [...senderAfter.transactions, recipientAfter.transactions[1]]) {
            expect(transaction.date.getTime()).toBeGreaterThanOrEqual(startedAt);
            expect(transaction.date.getTime()).toBeLessThanOrEqual(Date.now());
          }
          expect(senderAfter.balance + recipientAfter.balance).toBe(1000);
        }),
    );
  });
}
