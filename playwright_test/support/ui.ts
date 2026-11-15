import type { Locator, Page } from '@playwright/test';
import { expect } from './fixtures';
import type { Account } from '../data/account';
import type { AccountExpectation, TransactionExpectation } from '../data/account-outcome';
import {
  fillDepositForm,
  fillLoginForm,
  fillRegistrationForm,
  fillWithdrawalForm,
  submitForm,
} from './forms';

export async function expectSignedOut({ page }: { page: Page }) {
  await expect(page.getByRole('link', { name: 'LOG IN', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toHaveCount(0);
}

/** Records every native dialog's type and message, dismissing each one. */
export function recordDialogs({ page }: { page: Page }) {
  const dialogs: Array<{
    type: string;
    message: string;
  }> = [];
  page.on('dialog', async (dialog) => {
    dialogs.push({ type: dialog.type(), message: dialog.message() });
    await dialog.dismiss();
  });
  return dialogs;
}

/** Registers successfully and returns the text of the confirmation alert. */
export async function register({ page, account }: { page: Page; account: Account }) {
  await page.goto('/register');
  const form = await fillRegistrationForm({ page, account });
  // Start listening before the click: the alert blocks the click until it is accepted.
  const dialogOpened = page.waitForEvent('dialog');
  const submission = submitForm({ form });
  const dialog = await dialogOpened;
  const message = dialog.message();
  expect(dialog.type()).toBe('alert');
  await dialog.accept();
  await submission;
  await expect(page).toHaveURL(/\/$/);
  return message;
}

/** Logs in and checks the specified outputs: Account page, no LOG IN / Register, LOG OUT shown. */
export async function login({
  page,
  account,
}: {
  page: Page;
  account: Pick<Account, 'id' | 'password'>;
}) {
  await page.goto('/');
  const form = await fillLoginForm({ page, account });
  await submitForm({ form });
  await expectLoggedIn({ page });
}

export async function expectLoggedIn({ page }: { page: Page }) {
  await expect(page).toHaveURL(/\/account\/?$/);
  await expect(page.getByRole('link', { name: 'Account', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'LOG IN', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Register', exact: true })).toHaveCount(0);
  await expectLoaded({ page });
}

function expectLoaded({ page }: { page: Page }) {
  return expect(page.getByText('Loading...', { exact: true })).toHaveCount(0);
}

const historyRecords = ({ page }: { page: Page }) =>
  page.locator('.history-list > .account-form > div');

export function expectAccountPage({ page }: { page: Page }) {
  // The summary shows three <h1> values in order: account ID, name, balance.
  const summary = page.locator('article').first();
  return {
    async toHaveBalance({ balance }: { balance: number }) {
      await expect(summary.getByRole('heading', { name: 'Balance:', exact: true })).toBeVisible();
      await expect(summary.getByRole('heading', { level: 1 }).nth(2)).toHaveText(String(balance));
    },
    async toHaveName({ name }: { name: string }) {
      await expect(summary.getByRole('heading', { name, exact: true })).toBeVisible();
    },
    async toHaveHistoryCount({ count }: { count: number }) {
      await expect(page.locator('.history-list p').filter({ hasText: /^amount: / })).toHaveCount(
        count,
      );
    },
    async toHaveHistory({ transactions }: { transactions: ReadonlyArray<TransactionExpectation> }) {
      await expect(historyRecords({ page })).toHaveCount(transactions.length);
      for (const [index, transaction] of transactions.entries()) {
        const record = historyRecords({ page }).nth(index);
        await expect(record.getByRole('heading')).toHaveText(transaction.title);
        await expect(
          record.getByText(`target: ${transaction.target}`, { exact: true }),
        ).toBeVisible();
        await expect(
          record.getByText(`amount: ${transaction.amount}`, { exact: true }),
        ).toBeVisible();
        await expect(
          record.getByText(`balance: ${transaction.balance}`, { exact: true }),
        ).toBeVisible();
        await expectHistoryDate({ record });
      }
    },
    /** Balance, number of history records and every record's content. */
    async toShow({ account }: { account: Pick<AccountExpectation, 'balance' | 'transactions'> }) {
      await this.toHaveBalance({ balance: account.balance });
      await this.toHaveHistoryCount({ count: account.transactions.length });
      await this.toHaveHistory({ transactions: account.transactions });
    },
  };
}

async function expectHistoryDate({ record }: { record: Locator }) {
  const text = await record.getByText(/^date:/).innerText();
  const timestamp = Date.parse(text.replace(/^date:\s*/, ''));
  expect(Number.isFinite(timestamp), 'Displayed transaction date').toBe(true);
  expect(timestamp, 'Displayed transaction date').toBeLessThanOrEqual(Date.now());
}

/** A deposit or withdrawal that must succeed: new balance and one new history record. */
type TransactionOptions = {
  page: Page;
  action: 'deposit' | 'withdraw';
  amount: number;
  balance: number;
  historyCount: number;
};

export async function transact({
  page,
  action,
  amount,
  balance,
  historyCount,
}: TransactionOptions) {
  if (action === 'deposit') {
    const form = await fillDepositForm({ page, amount: String(amount) });
    await submitForm({ form });
  } else {
    const form = await fillWithdrawalForm({ page, amount: String(amount) });
    await submitForm({ form });
  }
  await expectTransaction({ page, action, amount, balance, historyCount });
}

/** Checks a successful deposit or withdrawal, including the newly appended history record. */
export async function expectTransaction({
  page,
  action,
  amount,
  balance,
  historyCount,
}: TransactionOptions) {
  await expectAccountPage({ page }).toHaveBalance({ balance });
  await expectAccountPage({ page }).toHaveHistoryCount({ count: historyCount });
  const record = historyRecords({ page }).last();
  await expect(record.getByRole('heading')).toHaveText(action);
  await expect(record.getByText(`amount: ${amount}`, { exact: true })).toBeVisible();
  await expect(record.getByText(`balance: ${balance}`, { exact: true })).toBeVisible();
  await expectHistoryDate({ record });
}

/** Post-condition of a rejected action: after a reload, balance and history are what they were. */
export async function expectAccountUnchanged({
  page,
  account,
  historyBefore,
}: {
  page: Page;
  account: Pick<AccountExpectation, 'balance' | 'transactions'>;
  historyBefore: string;
}) {
  await page.reload();
  await expectLoaded({ page });
  await expectAccountPage({ page }).toShow({ account });
  await expect(page.locator('.history-list')).toHaveText(historyBefore, { useInnerText: true });
  await expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toBeVisible();
}
