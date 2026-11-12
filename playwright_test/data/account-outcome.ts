import type { AccountState } from './account-state';

export type TransactionExpectation = {
  title: string;
  target: string;
  amount: number;
  balance: number;
};

export type AccountExpectation = {
  name: string;
  balance: number;
  transactions: ReadonlyArray<TransactionExpectation>;
};

export type ExpectedAccount = AccountExpectation & { accountId: string };

export type ExpectedAccounts = Readonly<Record<string, ExpectedAccount>>;

export type AccountOutcome = {
  kind: 'unchanged' | 'updated';
  accounts: Readonly<Record<string, AccountExpectation>>;
};

export const unchangedAccountOutcome: AccountOutcome = { kind: 'unchanged', accounts: {} };

export function depositHistory(deposits: ReadonlyArray<number>): TransactionExpectation[] {
  const history: TransactionExpectation[] = [];
  let balance = 0;
  for (const amount of deposits) {
    balance += amount;
    history.push({ title: 'deposit', target: '', amount, balance });
  }
  return history;
}

export function expectedAccountsFor(state: AccountState, outcome: AccountOutcome): ExpectedAccounts {
  const expected: Record<string, ExpectedAccount> = {};
  for (const [role, account] of Object.entries(state.accounts)) {
    if (account.exists === false) continue;
    expected[role] = {
      accountId: account.accountId,
      name: `${account.firstName} ${account.lastName}`,
      balance: account.balance,
      transactions: depositHistory(account.deposits),
    };
  }
  for (const [role, result] of Object.entries(outcome.accounts)) {
    const account = state.accounts[role];
    if (!account) throw new Error(`Account outcome refers to undefined role "${role}".`);
    expected[role] = { accountId: account.accountId, ...result };
  }
  return expected;
}
