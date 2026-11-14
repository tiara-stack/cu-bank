import { unchangedAccountOutcome } from '../account-outcome';
import { senderOnly } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S3-TC01",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 3,
    "details": {
      "tag": ["@demo", "@deposit-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A balance remains 0 and History remains empty." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a zero deposit",
    "inputs": {
      "Deposit Amount": "0"
    },
    "message": "The amount must be greater than 0. Please enter a positive number."
  },
  {
    "id": "S3-TC02",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 3,
    "details": {
      "tag": ["@variant", "@deposit-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A balance remains 0 and History remains empty." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a negative deposit",
    "inputs": {
      "Deposit Amount": "-1"
    },
    "message": "The amount must be greater than 0. Please enter a positive number."
  },
  {
    "id": "S3-TC03",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 3,
    "details": {
      "tag": ["@variant", "@deposit-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit is rejected. Expected message: Invalid balance amount. Please enter a valid number. A balance remains 0 and History remains empty." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records." },
        { "type": "workbook note", "description": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised." }
      ]
    },
    "title": "Reject a nonnumeric deposit",
    "inputs": {
      "Deposit Amount": "abc"
    },
    "message": "Invalid balance amount. Please enter a valid number."
  },
  {
    "id": "S3-TC04",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 3,
    "details": {
      "tag": ["@variant", "@deposit-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit is rejected. Expected message: The balance amount must be a whole number with no decimals. A balance remains 0 and History remains empty." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records." },
        { "type": "workbook note", "description": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised." }
      ]
    },
    "title": "Reject a fractional deposit",
    "inputs": {
      "Deposit Amount": "100.5"
    },
    "message": "The balance amount must be a whole number with no decimals."
  }
];
