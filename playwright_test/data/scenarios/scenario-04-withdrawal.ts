import { accountA } from '../account';
import type { AccountOutcome } from '../account-outcome';
import { senderOnly } from '../account-state';
import type { TestCase } from '../test-case';

// The successful deposit prefix runs before the rejected withdrawal.
const accountOutcome: AccountOutcome = {
  "kind": "unchanged",
  "accounts": {
    "sender": {
      "name": "Sam Son",
      "balance": 1000,
      "transactions": [
        {
          "title": "deposit",
          "target": "",
          "amount": 1000,
          "balance": 1000
        }
      ]
    }
  }
};

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S4-TC01",
    "accountState": senderOnly,
    "accountOutcome": accountOutcome,
    "scenario": 4,
    "details": {
      "tag": ["@demo", "@withdrawal-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: Your balance is not enough to complete the withdrawal. A balance stays 1000; History contains only the successful deposit." },
        { "type": "precondition", "description": `Reset: no accounts exist; new browser, signed out. Setup: A (${accountA.id} / 1234) registered, balance 0, 0 history records. This case needs: A at 0 before the deposit, so the balance is exactly 1000.` },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject withdrawal above the balance",
    "inputs": {
      "Withdraw Amount": "1001"
    },
    "message": "Your balance is not enough to complete the withdrawal."
  },
  {
    "id": "S4-TC02",
    "accountState": senderOnly,
    "accountOutcome": accountOutcome,
    "scenario": 4,
    "details": {
      "tag": ["@variant", "@withdrawal-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: Your balance is not enough to complete the withdrawal. A balance stays 1000; History contains only the successful deposit." },
        { "type": "precondition", "description": `Reset: no accounts exist; new browser, signed out. Setup: A (${accountA.id} / 1234) registered, balance 0, 0 history records. This case needs: A at 0 before the deposit, so the balance is exactly 1000.` },
        { "type": "workbook note", "description": "Specification pp. 3-4 says amount must be LESS THAN the balance. This case expects rejection at equality. The supplied code permits equality. Confirm the intended rule with the instructor before final defect classification." }
      ]
    },
    "title": "Reject withdrawal equal to the balance under the literal specification",
    "inputs": {
      "Withdraw Amount": "1000"
    },
    "message": "Your balance is not enough to complete the withdrawal."
  },
  {
    "id": "S4-TC03",
    "accountState": senderOnly,
    "accountOutcome": accountOutcome,
    "scenario": 4,
    "details": {
      "tag": ["@variant", "@withdrawal-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A balance stays 1000; History contains only the successful deposit." },
        { "type": "precondition", "description": `Reset: no accounts exist; new browser, signed out. Setup: A (${accountA.id} / 1234) registered, balance 0, 0 history records.` },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a zero withdrawal",
    "inputs": {
      "Withdraw Amount": "0"
    },
    "message": "The amount must be greater than 0. Please enter a positive number."
  },
  {
    "id": "S4-TC04",
    "accountState": senderOnly,
    "accountOutcome": accountOutcome,
    "scenario": 4,
    "details": {
      "tag": ["@variant", "@withdrawal-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A balance stays 1000; History contains only the successful deposit." },
        { "type": "precondition", "description": `Reset: no accounts exist; new browser, signed out. Setup: A (${accountA.id} / 1234) registered, balance 0, 0 history records.` },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a negative withdrawal",
    "inputs": {
      "Withdraw Amount": "-1"
    },
    "message": "The amount must be greater than 0. Please enter a positive number."
  },
  {
    "id": "S4-TC05",
    "accountState": senderOnly,
    "accountOutcome": accountOutcome,
    "scenario": 4,
    "details": {
      "tag": ["@variant", "@withdrawal-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: Invalid balance amount. Please enter a valid number. A balance stays 1000; History contains only the successful deposit." },
        { "type": "precondition", "description": `Reset: no accounts exist; new browser, signed out. Setup: A (${accountA.id} / 1234) registered, balance 0, 0 history records.` },
        { "type": "workbook note", "description": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised." }
      ]
    },
    "title": "Reject a nonnumeric withdrawal",
    "inputs": {
      "Withdraw Amount": "abc"
    },
    "message": "Invalid balance amount. Please enter a valid number."
  },
  {
    "id": "S4-TC06",
    "accountState": senderOnly,
    "accountOutcome": accountOutcome,
    "scenario": 4,
    "details": {
      "tag": ["@variant", "@withdrawal-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: The balance amount must be a whole number with no decimals. A balance stays 1000; History contains only the successful deposit." },
        { "type": "precondition", "description": `Reset: no accounts exist; new browser, signed out. Setup: A (${accountA.id} / 1234) registered, balance 0, 0 history records.` },
        { "type": "workbook note", "description": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised." }
      ]
    },
    "title": "Reject a fractional withdrawal",
    "inputs": {
      "Withdraw Amount": "100.5"
    },
    "message": "The balance amount must be a whole number with no decimals."
  }
];
