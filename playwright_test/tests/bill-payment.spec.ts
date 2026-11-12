import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { cases } from '../data/cases';
import { test, expect } from '../support/fixtures';
import { expectAccount, expectHistory, login } from '../support/ui';
test.beforeEach(({ page: nativePage, accountState }) =>
  Effect.gen(function* () {
    const page = Playwright.makePage(nativePage);
    const sender = accountState.accounts.find((account) => account.accountId === '1111111111')!;
    yield* login(page, sender.accountId, sender.password);
    yield* expectAccount(page, sender.balance, sender.deposits.length);
  }).pipe(Effect.scoped, Effect.runPromise),
);
const categories: Record<
  string,
  {
    cid: string;
    target: string;
  }
> = {
  'Water Charge': { cid: 'b1', target: 'water' },
  'Electric Charge': { cid: 'b2', target: 'electric' },
  'Phone Charge': { cid: 'b3', target: 'phone' },
};
for (const example of cases.filter((item) => item.scenario === 7)) {
  test.describe(example.id, () => {
    test.use({ accountState: example.accountState });
    test.effect(
      example.title,
      {
        tag: example.demo ? '@demo' : '@variant',
        annotation: [
          { type: 'precondition', description: example.precondition },
          { type: 'expected', description: example.expected },
        ],
      },
      ({ bank }) =>
        Effect.gen(function* () {
          const page = yield* Playwright.Page;
          const before = yield* Effect.tryPromise(() => bank.findOne({ accountId: '1111111111' }));
          const category = categories[example.inputs['Target Payment']];
          const amount = Number(example.inputs.Amount);
          const balance = before!.balance - amount;
          yield* page.getByTestId(category.cid).check();
          for (const choice of Object.values(categories)) {
            yield* page
              .getByTestId(choice.cid)
              .use((native) => expect(native).toBeChecked({ checked: choice.cid === category.cid }));
          }
          yield* page.getByTestId('b4').fill(String(amount));
          const startedAt = Date.now();
          const response = yield* page.use(async (native) => {
            const pending = native.waitForResponse(
              (result) => result.url().endsWith('/transactions/') && result.request().method() === 'PUT',
            );
            await native.getByTestId('bc').click();
            return pending;
          });
          expect(response.ok()).toBe(true);
          const history = [
            ...before!.transactions,
            { title: 'billpayment', target: category.target, amount, balance },
          ];
          yield* expectAccount(page, balance, history.length);
          yield* expectHistory(page, history);
          yield* page.reload();
          yield* expectAccount(page, balance, history.length);
          yield* expectHistory(page, history);
          const after = yield* Effect.tryPromise(() => bank.findOne({ accountId: '1111111111' }));
          expect(after!.transactions.slice(0, before!.transactions.length)).toEqual(before!.transactions);
          const payment = after!.transactions.at(-1)!;
          expect(payment).toMatchObject(history.at(-1)!);
          expect(payment.date.getTime()).toBeGreaterThanOrEqual(startedAt);
          expect(payment.date.getTime()).toBeLessThanOrEqual(Date.now());
        }),
    );
  });
}
