export type AccountPrecondition = {
  accountId: string;
  password: string;
  firstName: string;
  lastName: string;
  balance: number;
  deposits: ReadonlyArray<number>;
};

export type AccountState = {
  accounts: ReadonlyArray<AccountPrecondition>;
  absentAccountIds: ReadonlyArray<string>;
};

const sender: AccountPrecondition = {
  accountId: '1111111111', password: '1234',
  firstName: 'Sam', lastName: 'Son', balance: 0, deposits: [],
};

const recipient: AccountPrecondition = {
  accountId: '2222222222', password: '1234',
  firstName: 'Jane', lastName: 'Doe', balance: 200, deposits: [200],
};

export const registrationState: AccountState = {
  accounts: [sender],
  absentAccountIds: ['3333333333', '0333333333', '9999999999'],
};

export const loginState: AccountState = {
  accounts: [sender],
  absentAccountIds: ['9999999999'],
};

export const zeroState: AccountState = {
  accounts: [sender, recipient],
  absentAccountIds: ['3333333333', '0333333333', '9999999999'],
};

export const fundedState: AccountState = {
  accounts: [{ ...sender, balance: 1000, deposits: [1000] }],
  absentAccountIds: ['3333333333', '0333333333', '9999999999'],
};
