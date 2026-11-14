import { type Account, accountA, accountB, boundaryCustomer, newCustomer, unregisteredAccount } from './account';

/** One account's state before a case. `exists: false` leaves its registration to the test. */
export type AccountPrecondition = {
  account: Account;
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

const emptySender: AccountPrecondition = { account: accountA, balance: 0, deposits: [] };

/**
 * Account B: the transfer recipient. It starts at 200 with one history record, not at 0, so that
 * "unchanged" and "increased by the transfer" can be told apart from an empty account.
 */
const recipient: AccountPrecondition = { account: accountB, balance: 200, deposits: [200] };

/** Scenarios 1-4: A exists with balance 0 and no history. */
export const senderOnly: AccountState = {
  accounts: { sender: emptySender },
  absentAccountIds: [newCustomer.id, unregisteredAccount.id],
};

/** Scenario 5: A as above, plus recipient B with balance 200. */
export const senderAndRecipient: AccountState = {
  accounts: { sender: emptySender, recipient },
  absentAccountIds: [unregisteredAccount.id],
};

/** Scenarios 6-7: A with balance 1000 from one deposit. */
export const fundedSender: AccountState = {
  accounts: { sender: { account: accountA, balance: 1000, deposits: [1000] } },
  absentAccountIds: [],
};

/** Scenario 8: recipient B exists; the new customer's account must not exist yet. */
export const newCustomerAndRecipient: AccountState = {
  accounts: {
    recipient,
    sender: { account: newCustomer, balance: 0, deposits: [], exists: false },
  },
  absentAccountIds: [newCustomer.id],
};

export const boundaryCustomerAndRecipient: AccountState = {
  accounts: {
    recipient,
    sender: { account: boundaryCustomer, balance: 0, deposits: [], exists: false },
  },
  absentAccountIds: [boundaryCustomer.id],
};
