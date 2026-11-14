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
  for (const [role, precondition] of Object.entries(state.accounts)) {
    if (precondition.exists === false) continue;
    const { account, balance, deposits } = precondition;
    expected[role] = {
      accountId: account.id,
      name: `${account.firstName} ${account.lastName}`,
      balance,
      transactions: depositHistory(deposits),
    };
  }
  for (const [role, result] of Object.entries(outcome.accounts)) {
    const precondition = state.accounts[role];
    if (!precondition) throw new Error(`Account outcome refers to undefined role "${role}".`);
    expected[role] = { accountId: precondition.account.id, ...result };
  }
  return expected;
}
