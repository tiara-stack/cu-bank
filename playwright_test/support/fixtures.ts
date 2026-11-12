import { test as base, type Browser } from '@playwright/test';
import { expect, makeMethods } from 'effect-playwright/test';
import { Effect } from 'effect';
import { Playwright } from 'effect-playwright';
import { MongoClient, type Collection } from 'mongodb';
import type { AccountPrecondition, AccountState } from '../data/account-state';
import { expectAccount, expectHistory, login, register, transact } from './ui';

type Transaction = {
  title: string;
  target: string;
  amount: number;
  balance: number;
  date: Date;
};

type Account = {
  accountId: string;
  name: string;
  balance: number;
  password: string;
  transactions: Transaction[];
};

export type Bank = Collection<Account>;

const seedAccount = Effect.fn('seedAccount')(function* (
  browser: Browser,
  baseURL: string | undefined,
  account: AccountPrecondition,
) {
  const context = yield* Playwright.makeBrowser(browser).newContext({ baseURL });
  const page = yield* context.newPage;
  yield* register(page, account);
  yield* login(page, account.accountId, account.password);
  yield* expectAccount(page, 0, 0);
  let balance = 0;
  const history = [];
  for (const amount of account.deposits) {
    balance += amount;
    yield* transact(page, 'deposit', amount, balance, history.length + 1);
    history.push({ title: 'deposit', target: '', amount, balance });
  }
  yield* expectAccount(page, account.balance, account.deposits.length);
  yield* expectHistory(page, history);
  return history;
});

const fixtures = base.extend<{
  accountState: AccountState;
  bank: Bank;
}>({
  accountState: [{ accounts: [], absentAccountIds: [] }, { option: true }],
  bank: [
    async ({ browser, baseURL, accountState }, use, testInfo) => {
      const program = Effect.gen(function* () {
        const uri = process.env.PLAYWRIGHT_MONGO_URI;
        if (!uri) throw new Error('The isolated database was not started by global setup.');
        const client = yield* Effect.acquireRelease(
          Effect.tryPromise(() => MongoClient.connect(uri)),
          (client) => Effect.promise(() => client.close()),
        );
        const users = client.db().collection<Account>('users');
        yield* Effect.promise(() =>
          testInfo.attach('account-preconditions', {
            body: JSON.stringify(accountState, null, 2),
            contentType: 'application/json',
          }),
        );
        yield* Effect.tryPromise(() => users.deleteMany({}));
        for (const account of accountState.accounts) {
          const history = yield* Effect.scoped(seedAccount(browser, baseURL, account));
          const stored = yield* Effect.tryPromise(() => users.findOne({ accountId: account.accountId }));
          expect(stored, `Required account ${account.accountId}`).toMatchObject({
            accountId: account.accountId,
            name: `${account.firstName} ${account.lastName}`,
            balance: account.balance,
            transactions: history,
          });
          expect(stored!.transactions).toHaveLength(account.deposits.length);
        }
        expect(yield* Effect.tryPromise(() => users.countDocuments())).toBe(accountState.accounts.length);
        for (const accountId of accountState.absentAccountIds) {
          expect(
            yield* Effect.tryPromise(() => users.findOne({ accountId })),
            `Account ${accountId} must be absent`,
          ).toBeNull();
        }
        yield* Effect.promise(() => use(users));
        const accounts = yield* Effect.tryPromise(() =>
          users.find({}, { projection: { password: 0 } }).toArray(),
        );
        yield* Effect.promise(() =>
          testInfo.attach('persisted-accounts', {
            body: JSON.stringify(accounts, null, 2),
            contentType: 'application/json',
          }),
        );
      });
      await Effect.runPromise(Effect.scoped(program));
    },
    { auto: true },
  ],
});

export const test = makeMethods(fixtures);

export { expect };
