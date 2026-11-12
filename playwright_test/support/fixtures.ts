import { test as base, type Browser } from '@playwright/test';
import { expect, makeMethods } from 'effect-playwright/test';
import { Effect, Option, Schema } from 'effect';
import { Playwright } from 'effect-playwright';
import { Collection, Db, FindCursor, MongoClient } from 'effect-mongodb';
import type { AccountPrecondition, AccountState } from '../data/account-state';
import { expectAccount, expectHistory, login, register, transact } from './ui';

const TransactionSchema = Schema.StructWithRest(
  Schema.Struct({
    title: Schema.String,
    target: Schema.String,
    amount: Schema.Number,
    balance: Schema.Number,
    date: Schema.Date,
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

const AccountSchema = Schema.StructWithRest(
  Schema.Struct({
    accountId: Schema.String,
    name: Schema.String,
    balance: Schema.Number,
    password: Schema.String,
    transactions: Schema.Array(TransactionSchema),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
);

export type Bank = Collection.Collection<typeof AccountSchema.Type>;

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
        const client = yield* MongoClient.connectScoped(uri);
        const users = Db.collection(MongoClient.db(client), 'users', AccountSchema);
        yield* Effect.promise(() =>
          testInfo.attach('account-preconditions', {
            body: JSON.stringify(accountState, null, 2),
            contentType: 'application/json',
          }),
        );
        yield* Collection.deleteMany(users, {});
        for (const account of accountState.accounts) {
          const history = yield* Effect.scoped(seedAccount(browser, baseURL, account));
          const stored = Option.getOrThrow(
            yield* Collection.findOne(users, { accountId: account.accountId }),
          );
          expect(stored, `Required account ${account.accountId}`).toMatchObject({
            accountId: account.accountId,
            name: `${account.firstName} ${account.lastName}`,
            balance: account.balance,
            transactions: history,
          });
          expect(stored.transactions).toHaveLength(account.deposits.length);
        }
        expect(yield* Collection.countDocuments(users)).toBe(accountState.accounts.length);
        for (const accountId of accountState.absentAccountIds) {
          expect(
            Option.isNone(yield* Collection.findOne(users, { accountId })),
            `Account ${accountId} must be absent`,
          ).toBe(true);
        }
        yield* Effect.promise(() => use(users));
        const accounts = yield* Collection.find(users).pipe(FindCursor.toArray);
        const redacted = accounts.map(({ password: _password, ...account }) => account);
        yield* Effect.promise(() =>
          testInfo.attach('persisted-accounts', {
            body: JSON.stringify(redacted, null, 2),
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
