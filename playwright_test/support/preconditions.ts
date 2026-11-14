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
export async function prepareAccounts(
  openSession: () => Promise<Page>,
  testCase: Pick<TestCase, 'accountState' | 'accountOutcome'>,
) {
  const { accountState, accountOutcome } = testCase;
  await test.info().attach('account-preconditions', {
    body: JSON.stringify(accountState, null, 2),
    contentType: 'application/json',
  });
  await test.info().attach('account-outcome', {
    body: JSON.stringify(
      { kind: accountOutcome.kind, accounts: expectedAccountsFor(accountState, accountOutcome) },
      null,
      2,
    ),
    contentType: 'application/json',
  });

  await clearAccounts();
  for (const account of Object.values(accountState.accounts)) {
    if (account.exists !== false) await seedAccount(await openSession(), account);
  }
}

async function seedAccount(page: Page, { account, balance, deposits }: AccountPrecondition) {
  await register(page, account);
  await login(page, account.id, account.password);
  await expectAccountPage(page).toHaveBalance(0);
  await expectAccountPage(page).toHaveHistoryCount(0);

  const history = depositHistory(deposits);
  for (const [index, deposit] of history.entries()) {
    await transact(page, 'deposit', deposit.amount, deposit.balance, index + 1);
  }

  await expectAccountPage(page).toHaveBalance(balance);
  await expectAccountPage(page).toHaveHistoryCount(history.length);
  await expectAccountPage(page).toHaveHistory(history);
  await expectAccountPage(page).toHaveName(`${account.firstName} ${account.lastName}`);
}
