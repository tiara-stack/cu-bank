/** Account identity and registration details, independent of its balance or existence before a case. */
export type Account = {
  id: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** Account A: the customer who acts in scenarios 1-7. */
export const accountA: Account = {
  id: '1111111111',
  password: '1234',
  firstName: 'Sam',
  lastName: 'Son',
};

/** Account B: the transfer recipient. */
export const accountB: Account = {
  id: '2222222222',
  password: '1234',
  firstName: 'Jane',
  lastName: 'Doe',
};

export const newCustomer: Account = { ...accountA, id: '3333333333' };

/** A 30-character full name, with leading zeros in both the ID and password. */
export const boundaryCustomer: Account = {
  id: '0333333333',
  password: '0123',
  firstName: 'ABCDEFGHIJKLMNO',
  lastName: 'ABCDEFGHIJKLMN',
};

export const unregisteredAccount: Account = { ...accountA, id: '9999999999' };
