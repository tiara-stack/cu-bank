import type { AccountState } from './account-state';
import type { AccountOutcome } from './account-outcome';

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

export type CaseDetails = {
  tag: CaseTag[];
  annotation: Array<{ type: string; description: string }>;
};

export type TestCase = {
  id: string;
  scenario: number;
  details: CaseDetails;
  title: string;
  accountState: AccountState;
  accountOutcome: AccountOutcome;
  inputs: Readonly<Record<string, string>>;
  message: string | null;
};
