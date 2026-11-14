import type { Locator, Page } from '@playwright/test';
import { expect } from './fixtures';
import type { AccountExpectation, TransactionExpectation } from '../data/account-outcome';
import { fillDepositForm, fillLoginForm, fillRegistrationForm, fillWithdrawalForm } from './forms';

export async function expectSignedOut(page: Page) {
  await expect(page.getByRole('link', { name: 'LOG IN', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toHaveCount(0);
}

/** Collects the text of every native dialog the page opens, dismissing each one. */
export function recordDialogs(page: Page) {
  const dialogs: string[] = [];
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  return dialogs;
}

/** Registers successfully and returns the text of the confirmation alert. */
export async function register(
  page: Page,
  account: { accountId: string; password: string; firstName: string; lastName: string },
) {
  await page.goto('/register');
  await fillRegistrationForm(page, account);
  // Start listening before the click: the alert blocks the click until it is accepted.
  const dialogOpened = page.waitForEvent('dialog');
  const submission = page.getByTestId('rc').click();
  const dialog = await dialogOpened;
  const message = dialog.message();
  expect(dialog.type()).toBe('alert');
  await dialog.accept();
  await submission;
  await expect(page).toHaveURL(/\/$/);
  return message;
}

/** Logs in and checks the specified outputs: Account page, no LOG IN / Register, LOG OUT shown. */
export async function login(page: Page, accountId: string, password: string) {
  await page.goto('/');
  await fillLoginForm(page, { accountId, password });
  await page.getByTestId('lc').click();
  await expect(page).toHaveURL(/\/account\/?$/);
  await expect(page.getByRole('link', { name: 'Account', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'LOG IN', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Register', exact: true })).toHaveCount(0);
  await expectLoaded(page);
}

function expectLoaded(page: Page) {
  return expect(page.getByText('Loading...', { exact: true })).toHaveCount(0);
}

const historyRecords = (page: Page) => page.locator('.history-list > .account-form > div');

export function expectAccountPage(page: Page) {
  // The summary shows three <h1> values in order: account ID, name, balance.
  const summary = page.locator('article').first();
  return {
    async toHaveBalance(balance: number) {
      await expect(summary.getByRole('heading', { name: 'Balance:', exact: true })).toBeVisible();
      await expect(summary.getByRole('heading', { level: 1 }).nth(2)).toHaveText(String(balance));
    },
    async toHaveName(name: string) {
      await expect(summary.getByRole('heading', { name, exact: true })).toBeVisible();
    },
    async toHaveHistoryCount(count: number) {
      await expect(page.locator('.history-list p').filter({ hasText: /^amount: / })).toHaveCount(count);
    },
    async toHaveHistory(transactions: ReadonlyArray<TransactionExpectation>) {
      await expect(historyRecords(page)).toHaveCount(transactions.length);
      for (const [index, transaction] of transactions.entries()) {
        const record = historyRecords(page).nth(index);
        await expect(record.getByRole('heading')).toHaveText(transaction.title);
        await expect(record.getByText(`target: ${transaction.target}`, { exact: true })).toBeVisible();
        await expect(record.getByText(`amount: ${transaction.amount}`, { exact: true })).toBeVisible();
        await expect(record.getByText(`balance: ${transaction.balance}`, { exact: true })).toBeVisible();
        await expectHistoryDate(record);
      }
    },
    /** Balance, number of history records and every record's content. */
    async toShow(account: Pick<AccountExpectation, 'balance' | 'transactions'>) {
      await this.toHaveBalance(account.balance);
      await this.toHaveHistoryCount(account.transactions.length);
      await this.toHaveHistory(account.transactions);
    },
  };
}

async function expectHistoryDate(record: Locator) {
  const text = await record.getByText(/^date:/).innerText();
  const timestamp = Date.parse(text.replace(/^date:\s*/, ''));
  expect(Number.isFinite(timestamp), 'Displayed transaction date').toBe(true);
  expect(timestamp, 'Displayed transaction date').toBeLessThanOrEqual(Date.now());
}

/** A deposit or withdrawal that must succeed: new balance and one new history record. */
export async function transact(
  page: Page,
  action: 'deposit' | 'withdraw',
  amount: number,
  balance: number,
  historyCount: number,
) {
  if (action === 'deposit') {
    await fillDepositForm(page, { amount: String(amount) });
    await page.getByTestId('dc').click();
  } else {
    await fillWithdrawalForm(page, { amount: String(amount) });
    await page.getByTestId('wc').click();
  }
  await expectAccountPage(page).toHaveBalance(balance);
  await expectAccountPage(page).toHaveHistoryCount(historyCount);
  const record = historyRecords(page).last();
  await expect(record.getByRole('heading')).toHaveText(action);
  await expect(record.getByText(`amount: ${amount}`, { exact: true })).toBeVisible();
  await expect(record.getByText(`balance: ${balance}`, { exact: true })).toBeVisible();
  await expectHistoryDate(record);
}

/** Post-condition of a rejected action: after a reload, balance and history are what they were. */
export async function expectAccountUnchanged(
  page: Page,
  account: Pick<AccountExpectation, 'balance' | 'transactions'>,
  historyBefore: string,
) {
  await page.reload();
  await expectLoaded(page);
  await expectAccountPage(page).toShow(account);
  await expect(page.locator('.history-list')).toHaveText(historyBefore, { useInnerText: true });
  await expect(page.getByRole('link', { name: 'LOG OUT', exact: true })).toBeVisible();
}
