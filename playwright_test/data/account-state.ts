/** One account as it must be before a case starts. `exists: false` means it must not be registered yet. */
export type AccountPrecondition = {
  accountId: string;
  password: string;
  firstName: string;
  lastName: string;
  balance: number;
  deposits: ReadonlyArray<number>;
  exists?: boolean;
};

/**
 * The pre-condition of a case: the accounts that exist, keyed by the role they play in the scenario
 * (`sender` acts, `recipient` receives transfers), and the account numbers that must not be registered.
 */
export type AccountState = {
  accounts: Readonly<Record<string, AccountPrecondition>>;
  absentAccountIds: ReadonlyArray<string>;
};

/** Account A: the customer who acts in scenarios 1-7. */
const accountA: AccountPrecondition = {
  accountId: '1111111111',
  password: '1234',
  firstName: 'Sam',
  lastName: 'Son',
  balance: 0,
  deposits: [],
};

/**
 * Account B: the transfer recipient. It starts at 200 with one history record, not at 0, so that
 * "unchanged" and "increased by the transfer" can be told apart from an empty account.
 */
const accountB: AccountPrecondition = {
  accountId: '2222222222',
  password: '1234',
  firstName: 'Jane',
  lastName: 'Doe',
  balance: 200,
  deposits: [200],
};

/** Scenarios 1-4: A exists with balance 0 and no history. */
export const senderOnly: AccountState = {
  accounts: { sender: accountA },
  absentAccountIds: ['3333333333', '9999999999'],
};

/** Scenario 5: A as above, plus recipient B with balance 200. */
export const senderAndRecipient: AccountState = {
  accounts: { sender: accountA, recipient: accountB },
  absentAccountIds: ['9999999999'],
};

/** Scenarios 6-7: A with balance 1000 from one deposit. */
export const fundedSender: AccountState = {
  accounts: { sender: { ...accountA, balance: 1000, deposits: [1000] } },
  absentAccountIds: [],
};

/** Scenario 8: recipient B exists; the new customer's account must not exist yet. */
export function newCustomerAndRecipient(
  newSender: Pick<AccountPrecondition, 'accountId' | 'password' | 'firstName' | 'lastName'>,
): AccountState {
  return {
    accounts: {
      recipient: accountB,
      sender: { ...newSender, balance: 0, deposits: [], exists: false },
    },
    absentAccountIds: [newSender.accountId],
  };
}
