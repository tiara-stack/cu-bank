import { test as base, type Browser } from '@playwright/test';
import { expect, makeMethods } from 'effect-playwright/test';
import { Effect, Option, Schema } from 'effect';
import { Playwright } from 'effect-playwright';
import { Collection, Db, FindCursor, MongoClient } from 'effect-mongodb';
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

type PersistedAccount = typeof AccountSchema.Type;

function accountMetadata(account: PersistedAccount) {
  const { balance: _balance, transactions: _transactions, ...metadata } = account;
  return metadata;
}

function verifyAccountOutcome(
  before: ReadonlyArray<PersistedAccount>,
  after: ReadonlyArray<PersistedAccount>,
  expected: ExpectedAccounts,
  outcome: AccountOutcome,
  startedAt: number,
) {
  if (outcome.kind === 'unchanged') {
    expect
      .soft(after, 'Rejected actions must preserve every account, credential and transaction')
      .toEqual(before);
  }
  expect
    .soft(
      after.map((account) => account.accountId),
      'Expected persisted account IDs',
    )
    .toEqual(Object.keys(expected).sort());
  const previous = new Map(before.map((account) => [account.accountId, account]));
  const persisted = new Map(after.map((account) => [account.accountId, account]));
  for (const [accountId, result] of Object.entries(expected)) {
    const actual = persisted.get(accountId);
    expect.soft(actual, `Persisted account ${accountId}`).toBeDefined();
    if (!actual) continue;
    expect.soft(actual, `Account outcome for ${accountId}`).toMatchObject({ accountId, ...result });
    expect
      .soft(actual.transactions, `Transaction count for ${accountId}`)
      .toHaveLength(result.transactions.length);
    const initial = previous.get(accountId);
    if (initial) {
      expect
        .soft(accountMetadata(actual), `Account metadata for ${accountId}`)
        .toEqual(accountMetadata(initial));
      expect
        .soft(actual.transactions.slice(0, initial.transactions.length), `Existing history for ${accountId}`)
        .toEqual(initial.transactions);
    }
    for (const transaction of actual.transactions.slice(initial?.transactions.length ?? 0)) {
      expect
        .soft(transaction.date.getTime(), `Transaction timestamp for ${accountId}`)
        .toBeGreaterThanOrEqual(startedAt);
      expect
        .soft(transaction.date.getTime(), `Transaction timestamp for ${accountId}`)
        .toBeLessThanOrEqual(Date.now());
    }
  }
}

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
  const history = depositHistory(account.deposits);
  for (const [index, transaction] of history.entries()) {
    yield* transact(page, 'deposit', transaction.amount, transaction.balance, index + 1);
  }
  yield* expectAccount(page, account.balance, history.length);
  yield* expectHistory(page, history);
  return history;
});

const fixtures = base.extend<{
  accountState: AccountState;
  accountOutcome: AccountOutcome;
  expectedAccounts: ExpectedAccounts;
  _accountStore: Collection.Collection<PersistedAccount>;
}>({
  accountState: [{ accounts: [], absentAccountIds: [] }, { option: true }],
  accountOutcome: [unchangedAccountOutcome, { option: true }],
  _accountStore: [
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
          expect(stored.transactions).toHaveLength(history.length);
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
  expectedAccounts: async ({ _accountStore, accountState, accountOutcome }, use, testInfo) => {
    const program = Effect.gen(function* () {
      // This fixture is requested by test bodies, after their beforeEach prefix steps.
      const before = yield* Collection.find(_accountStore).pipe(
        FindCursor.sort({ accountId: 1 }),
        FindCursor.toArray,
      );
      const expected = expectedAccountsFor(accountState, accountOutcome);
      yield* Effect.promise(() =>
        testInfo.attach('account-outcome', {
          body: JSON.stringify({ kind: accountOutcome.kind, accounts: expected }, null, 2),
          contentType: 'application/json',
        }),
      );
      const startedAt = Date.now();
      yield* Effect.promise(() => use(expected));
      const after = yield* Collection.find(_accountStore).pipe(
        FindCursor.sort({ accountId: 1 }),
        FindCursor.toArray,
      );
      verifyAccountOutcome(before, after, expected, accountOutcome, startedAt);
    });
    await Effect.runPromise(program);
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
