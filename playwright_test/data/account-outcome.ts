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

export type ExpectedAccounts = Readonly<Record<string, AccountExpectation>>;

export type AccountOutcome = {
  kind: 'unchanged' | 'updated';
  accounts: ExpectedAccounts;
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
  const seeded = Object.fromEntries(
    state.accounts.map((account) => [
      account.accountId,
      {
        name: `${account.firstName} ${account.lastName}`,
        balance: account.balance,
        transactions: depositHistory(account.deposits),
      },
    ]),
  );
  return { ...seeded, ...outcome.accounts };
}
