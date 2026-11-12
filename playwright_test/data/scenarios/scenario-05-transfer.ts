import { zeroState } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S5-TC01",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@demo", "@transfer-rejection"],
    "title": "Reject transfer to an account that does not exist",
    "inputs": {
      "Transfer Target": "9999999999",
      "Transfer Amount": "300"
    },
    "message": "We couldn't find the recipient's account. Please double-check the account ID.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: We couldn't find the recipient's account. Please double-check the account ID. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S5-TC02",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@variant", "@transfer-rejection"],
    "title": "Reject a nonnumeric recipient account",
    "inputs": {
      "Transfer Target": "222222222A",
      "Transfer Amount": "300"
    },
    "message": "Your account ID should contain numbers only.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: Your account ID should contain numbers only. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S5-TC03",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@variant", "@transfer-rejection"],
    "title": "Reject a 9-digit recipient account",
    "inputs": {
      "Transfer Target": "222222222",
      "Transfer Amount": "300"
    },
    "message": "Your account ID must be exactly 10 digits long.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: Your account ID must be exactly 10 digits long. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S5-TC04",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@variant", "@transfer-rejection"],
    "title": "Reject an 11-digit recipient account",
    "inputs": {
      "Transfer Target": "22222222222",
      "Transfer Amount": "300"
    },
    "message": "Your account ID must be exactly 10 digits long.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: Your account ID must be exactly 10 digits long. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S5-TC05",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@variant", "@transfer-rejection"],
    "title": "Reject a transfer to the sender account",
    "inputs": {
      "Transfer Target": "1111111111",
      "Transfer Amount": "300"
    },
    "message": "You cannot transfer to your own account.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: You cannot transfer to your own account. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S5-TC06",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@variant", "@transfer-rejection"],
    "title": "Reject a zero transfer",
    "inputs": {
      "Transfer Target": "2222222222",
      "Transfer Amount": "0"
    },
    "message": "The amount must be greater than 0. Please enter a positive number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S5-TC07",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@variant", "@transfer-rejection"],
    "title": "Reject a negative transfer",
    "inputs": {
      "Transfer Target": "2222222222",
      "Transfer Amount": "-1"
    },
    "message": "The amount must be greater than 0. Please enter a positive number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S5-TC08",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@variant", "@transfer-rejection"],
    "title": "Reject a nonnumeric transfer amount",
    "inputs": {
      "Transfer Target": "2222222222",
      "Transfer Amount": "abc"
    },
    "message": "Invalid balance amount. Please enter a valid number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: Invalid balance amount. Please enter a valid number. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised."
  },
  {
    "id": "S5-TC09",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@variant", "@transfer-rejection"],
    "title": "Reject a fractional transfer amount",
    "inputs": {
      "Transfer Target": "2222222222",
      "Transfer Amount": "100.5"
    },
    "message": "The balance amount must be a whole number with no decimals.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: The balance amount must be a whole number with no decimals. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised."
  },
  {
    "id": "S5-TC10",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@variant", "@transfer-rejection"],
    "title": "Reject transfer above the current balance",
    "inputs": {
      "Transfer Target": "2222222222",
      "Transfer Amount": "801"
    },
    "message": "Your balance is not enough to complete the transfer.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: Your balance is not enough to complete the transfer. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S5-TC11",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0, history = 0. B (2222222222) balance = 200, history = 1 seeded deposit. N (9999999999) is absent.",
    "accountState": zeroState,
    "scenario": 5,
    "tags": ["@variant", "@transfer-rejection"],
    "title": "Reject transfer equal to the balance under the literal specification",
    "inputs": {
      "Transfer Target": "2222222222",
      "Transfer Amount": "800"
    },
    "message": "Your balance is not enough to complete the transfer.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A 0 -> 1000. Withdrawal succeeds: A 1000 -> 800. Transfer is rejected. Expected message: Your balance is not enough to complete the transfer. A remains 800 with 2 records. B remains 200 with its 1 baseline record. No transfer record on either side.",
    "notes": "Specification pp. 3-4 says amount must be LESS THAN the balance. This case expects rejection at equality. The supplied code permits equality. Confirm the intended rule with the instructor before final defect classification."
  }
];
