import type { Page } from '@playwright/test';
import { test } from './fixtures';
import { clearAccounts } from './database';
import { expectAccountPage, login, register, transact } from './ui';
import { depositHistory, expectedAccountsFor } from '../data/account-outcome';
import type { AccountPrecondition } from '../data/account-state';
import type { TestCase } from '../data/test-case';

/**
 * Brings the system to the case's pre-condition through the UI only:
 * empty database -> Register -> Login -> Deposit(s), once per account that must exist.
 * Accounts marked `exists: false` are left absent.
 */
export async function prepareAccounts({
  openSession,
  testCase,
}: {
  openSession: () => Promise<Page>;
  testCase: Pick<TestCase, 'precondition' | 'postcondition'>;
}) {
  const { precondition, postcondition } = testCase;
  await test.info().attach('account-preconditions', {
    body: JSON.stringify(precondition, null, 2),
    contentType: 'application/json',
  });
  await test.info().attach('account-outcome', {
    body: JSON.stringify(
      {
        kind: postcondition.kind,
        accounts: expectedAccountsFor({ precondition, postcondition }),
      },
      null,
      2,
    ),
    contentType: 'application/json',
  });
  await clearAccounts();
  for (const account of Object.values(precondition.accounts)) {
    if (account.exists !== false)
      await seedAccount({ page: await openSession(), precondition: account });
  }
}

async function seedAccount({
  page,
  precondition,
}: {
  page: Page;
  precondition: AccountPrecondition;
}) {
  const { account, balance, deposits } = precondition;
  await register({ page, account });
  await login({ page, account });
  await expectAccountPage({ page }).toHaveBalance({ balance: 0 });
  await expectAccountPage({ page }).toHaveHistoryCount({ count: 0 });
  const history = depositHistory({ deposits });
  for (const [index, deposit] of history.entries()) {
    await transact({
      page,
      action: 'deposit',
      amount: deposit.amount,
      balance: deposit.balance,
      historyCount: index + 1,
    });
  }
  await expectAccountPage({ page }).toHaveBalance({ balance });
  await expectAccountPage({ page }).toHaveHistoryCount({ count: history.length });
  await expectAccountPage({ page }).toHaveHistory({ transactions: history });
  await expectAccountPage({ page }).toHaveName({
    name: `${account.firstName} ${account.lastName}`,
  });
}
