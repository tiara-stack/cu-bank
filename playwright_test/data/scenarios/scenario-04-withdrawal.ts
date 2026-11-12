import { zeroState } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S4-TC01",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@demo", "@withdrawal-rejection"],
    "title": "Reject withdrawal above the balance",
    "inputs": {
      "Withdraw Amount": "1001"
    },
    "message": "Your balance is not enough to complete the withdrawal.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: Your balance is not enough to complete the withdrawal. A balance stays 1000; History contains only the successful deposit.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S4-TC02",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@variant", "@withdrawal-rejection"],
    "title": "Reject withdrawal equal to the balance under the literal specification",
    "inputs": {
      "Withdraw Amount": "1000"
    },
    "message": "Your balance is not enough to complete the withdrawal.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: Your balance is not enough to complete the withdrawal. A balance stays 1000; History contains only the successful deposit.",
    "notes": "Specification pp. 3-4 says amount must be LESS THAN the balance. This case expects rejection at equality. The supplied code permits equality. Confirm the intended rule with the instructor before final defect classification."
  },
  {
    "id": "S4-TC03",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@variant", "@withdrawal-rejection"],
    "title": "Reject a zero withdrawal",
    "inputs": {
      "Withdraw Amount": "0"
    },
    "message": "The amount must be greater than 0. Please enter a positive number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A balance stays 1000; History contains only the successful deposit.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S4-TC04",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@variant", "@withdrawal-rejection"],
    "title": "Reject a negative withdrawal",
    "inputs": {
      "Withdraw Amount": "-1"
    },
    "message": "The amount must be greater than 0. Please enter a positive number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A balance stays 1000; History contains only the successful deposit.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S4-TC05",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@variant", "@withdrawal-rejection"],
    "title": "Reject a nonnumeric withdrawal",
    "inputs": {
      "Withdraw Amount": "abc"
    },
    "message": "Invalid balance amount. Please enter a valid number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: Invalid balance amount. Please enter a valid number. A balance stays 1000; History contains only the successful deposit.",
    "notes": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised."
  },
  {
    "id": "S4-TC06",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@variant", "@withdrawal-rejection"],
    "title": "Reject a fractional withdrawal",
    "inputs": {
      "Withdraw Amount": "100.5"
    },
    "message": "The balance amount must be a whole number with no decimals.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: The balance amount must be a whole number with no decimals. A balance stays 1000; History contains only the successful deposit.",
    "notes": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised."
  }
];
