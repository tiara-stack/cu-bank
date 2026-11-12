import type { AccountState } from './account-state';

export type CaseTag =
  | '@demo'
  | '@variant'
  | '@registration-rejection'
  | '@login-rejection'
  | '@deposit-rejection'
  | '@withdrawal-rejection'
  | '@transfer-rejection'
  | '@bill-payment-rejection'
  | '@bill-payment-success'
  | '@registration-journey'
  | '@bill-category-selected'
  | '@bill-category-required';

export type TestCase = {
  id: string;
  scenario: number;
  tags: ReadonlyArray<CaseTag>;
  title: string;
  precondition: string;
  accountState: AccountState;
  inputs: Readonly<Record<string, string>>;
  message: string | null;
  expected: string;
  notes: string;
};
