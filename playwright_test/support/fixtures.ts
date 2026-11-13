import { test as base, type Browser } from '@playwright/test';
import { expect, makeMethods } from 'effect-playwright/test';
import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { Db, DocumentCollection, MongoClient } from 'effect-mongodb';
import type { AccountPrecondition, AccountState } from '../data/account-state';
import type { TestCase } from '../data/test-case';
import {
  depositHistory,
  expectedAccountsFor,
  unchangedAccountOutcome,
  type AccountOutcome,
  type ExpectedAccounts,
} from '../data/account-outcome';
import { expectAccount, expectHistory, login, register, transact } from './ui';

const clearAccounts = Effect.fn('clearAccounts')(function* () {
  const uri = process.env.PLAYWRIGHT_MONGO_URI;
  if (!uri) throw new Error('The isolated database was not started by global setup.');
  const client = yield* MongoClient.connectScoped(uri);
  yield* DocumentCollection.deleteMany(Db.documentCollection(MongoClient.db(client), 'users'), {});
});

const fundAccount = Effect.fn('fundAccount')(function* (
  page: Playwright.Page,
  deposits: AccountPrecondition['deposits'],
) {
  const history = depositHistory(deposits);
  for (const [index, transaction] of history.entries()) {
    yield* transact(page, 'deposit', transaction.amount, transaction.balance, index + 1);
  }
  return history;
});

const seedAccount = Effect.fn('seedAccount')(function* (
  browser: Browser,
  baseURL: string | undefined,
  account: AccountPrecondition,
) {
  const context = yield* Playwright.makeBrowser(browser).newContext({ baseURL });
  const page = yield* context.newPage;
  yield* register(page, account);
  yield* login(page, account.accountId, account.password);
  yield* expectAccount(page, { balance: 0, historyCount: 0 });
  const history = yield* fundAccount(page, account.deposits);
  yield* expectAccount(page, { balance: account.balance, historyCount: history.length });
  yield* expectHistory(page, { transactions: history });
  yield* page
    .locator('article')
    .first()
    .getByRole('heading', {
      name: `${account.firstName} ${account.lastName}`,
      exact: true,
    })
    .use((native) => expect(native).toBeVisible());
});

const prepareAccounts = Effect.fn('prepareAccounts')(function* ({
  browser,
  baseURL,
  accountState,
}: {
  browser: Browser;
  baseURL: string | undefined;
  accountState: AccountState;
}) {
  yield* Effect.scoped(clearAccounts());
  for (const account of Object.values(accountState.accounts)) {
    if (account.exists !== false) yield* Effect.scoped(seedAccount(browser, baseURL, account));
  }
});

const fixtures = base.extend<{
  accountState: AccountState;
  accountOutcome: AccountOutcome;
  expectedAccounts: ExpectedAccounts;
  _prepareAccounts: void;
}>({
  accountState: [{ accounts: {}, absentAccountIds: [] }, { option: true }],
  accountOutcome: [unchangedAccountOutcome, { option: true }],
  _prepareAccounts: [
    async ({ browser, baseURL, accountState }, use, testInfo) => {
      await testInfo.attach('account-preconditions', {
        body: JSON.stringify(accountState, null, 2),
        contentType: 'application/json',
      });
      await Effect.runPromise(prepareAccounts({ browser, baseURL, accountState }));
      await use();
    },
    { auto: true },
  ],
  expectedAccounts: async ({ accountState, accountOutcome }, use, testInfo) => {
    const expected = expectedAccountsFor(accountState, accountOutcome);
    await testInfo.attach('account-outcome', {
      body: JSON.stringify({ kind: accountOutcome.kind, accounts: expected }, null, 2),
      contentType: 'application/json',
    });
    await use(expected);
  },
});

export const test = makeMethods(fixtures);

export function testFor(example: Pick<TestCase, 'accountState' | 'accountOutcome'>) {
  return makeMethods(
    fixtures.extend({
      accountState: example.accountState,
      accountOutcome: example.accountOutcome,
    }),
  );
}

export { expect };
