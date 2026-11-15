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

export type ExpectedAccount = AccountExpectation & {
  accountId: string;
};

export type ExpectedAccounts = Readonly<Record<string, ExpectedAccount>>;

export type AccountOutcome = {
  kind: 'unchanged' | 'updated';
  accounts: Readonly<Record<string, AccountExpectation>>;
};

export const unchangedAccountOutcome: AccountOutcome = { kind: 'unchanged', accounts: {} };

export function depositHistory({
  deposits,
}: {
  deposits: ReadonlyArray<number>;
}): TransactionExpectation[] {
  const history: TransactionExpectation[] = [];
  let balance = 0;
  for (const amount of deposits) {
    balance += amount;
    history.push({ title: 'deposit', target: '', amount, balance });
  }
  return history;
}

export function expectedAccountsFor({
  precondition,
  postcondition,
}: {
  precondition: AccountState;
  postcondition: AccountOutcome;
}): ExpectedAccounts {
  const expected: Record<string, ExpectedAccount> = {};
  for (const [role, accountPrecondition] of Object.entries(precondition.accounts)) {
    if (accountPrecondition.exists === false) continue;
    const { account, balance, deposits } = accountPrecondition;
    expected[role] = {
      accountId: account.id,
      name: `${account.firstName} ${account.lastName}`,
      balance,
      transactions: depositHistory({ deposits }),
    };
  }
  for (const [role, result] of Object.entries(postcondition.accounts)) {
    const accountPrecondition = precondition.accounts[role];
    if (!accountPrecondition)
      throw new Error(`Account outcome refers to undefined role "${role}".`);
    expected[role] = { accountId: accountPrecondition.account.id, ...result };
  }
  return expected;
}
