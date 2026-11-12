import { zeroState } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S8-TC01",
    "precondition": "Apply fixture ZERO. Start signed out. New account 3333333333 must not exist. B (2222222222) exists with password 1234, balance 200 and 1 setup-deposit record.",
    "accountState": zeroState,
    "scenario": 8,
    "tags": ["@demo", "@registration-journey"],
    "title": "Complete a successful registration-to-transfer journey",
    "inputs": {
      "Register Account Number": "3333333333",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son",
      "Transfer Target": "2222222222",
      "Amount": "300"
    },
    "message": null,
    "expected": "Register succeeds and shows the specified 'success' message, then Login. A new account stores the supplied account ID and full name. Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. New sender balance: 0 -> 1000 -> 800 -> 500. Recipient B: 200 -> 500. Sender has 3 records: deposit 1000 (balance 1000), withdraw 200 (balance 800), transfer to B 300 (balance 500). B gains 1 transfer-from record for 3333333333, amount 300, balance 500. Refresh and confirm the same balances and transaction records. Check action, target, amount, resulting balance, and a plausible execution timestamp.",
    "notes": "Static review: Register displays \"Registration successful!\", while the specification names \"success\". Verify the UI and report the text discrepancy separately from successful registration."
  },
  {
    "id": "S8-TC02",
    "precondition": "Apply fixture ZERO. Start signed out. New account 0333333333 must not exist. B (2222222222) exists with password 1234, balance 200 and 1 setup-deposit record.",
    "accountState": zeroState,
    "scenario": 8,
    "tags": ["@variant", "@registration-journey"],
    "title": "Accept a 30-character name and preserve leading zeros",
    "inputs": {
      "Register Account Number": "0333333333",
      "Password": "0123",
      "Firstname": "ABCDEFGHIJKLMNO",
      "Lastname": "ABCDEFGHIJKLMN",
      "Transfer Target": "2222222222",
      "Amount": "300"
    },
    "message": null,
    "expected": "Register succeeds and shows the specified 'success' message, then Login. A new account stores the supplied account ID and full name. Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. New sender balance: 0 -> 1000 -> 800 -> 500. Recipient B: 200 -> 500. Sender has 3 records: deposit 1000 (balance 1000), withdraw 200 (balance 800), transfer to B 300 (balance 500). B gains 1 transfer-from record for 0333333333, amount 300, balance 500. Refresh and confirm the same balances and transaction records. Check action, target, amount, resulting balance, and a plausible execution timestamp.",
    "notes": "15 + 1 + 14 = 30 characters. Keep account and password as strings, preserving leading zeros. This is an additional valid/boundary representative, not a new EQ class."
  }
];
