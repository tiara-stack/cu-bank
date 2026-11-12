import { unchangedAccountOutcome } from '../account-outcome';
import { loginState } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S2-TC01",
    "accountState": loginState,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 2,
    "details": {
      "tag": ["@demo", "@login-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login is rejected. Expected message: Incorrect password. Please try again. Remain on Login; Register and LOG IN remain visible; no authenticated session is created." },
        { "type": "precondition", "description": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject an incorrect 4-digit password",
    "inputs": {
      "Account Number": "1111111111",
      "Password": "9999"
    },
    "message": "Incorrect password. Please try again."
  },
  {
    "id": "S2-TC02",
    "accountState": loginState,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 2,
    "details": {
      "tag": ["@variant", "@login-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login is rejected. Expected message: Your account ID should contain numbers only. Remain on Login; Register and LOG IN remain visible; no authenticated session is created." },
        { "type": "precondition", "description": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a nonnumeric account number",
    "inputs": {
      "Account Number": "111111111A",
      "Password": "1234"
    },
    "message": "Your account ID should contain numbers only."
  },
  {
    "id": "S2-TC03",
    "accountState": loginState,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 2,
    "details": {
      "tag": ["@variant", "@login-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login is rejected. Expected message: Your account ID must be exactly 10 digits long. Remain on Login; Register and LOG IN remain visible; no authenticated session is created." },
        { "type": "precondition", "description": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a 9-digit account number",
    "inputs": {
      "Account Number": "111111111",
      "Password": "1234"
    },
    "message": "Your account ID must be exactly 10 digits long."
  },
  {
    "id": "S2-TC04",
    "accountState": loginState,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 2,
    "details": {
      "tag": ["@variant", "@login-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login is rejected. Expected message: Your account ID must be exactly 10 digits long. Remain on Login; Register and LOG IN remain visible; no authenticated session is created." },
        { "type": "precondition", "description": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject an 11-digit account number",
    "inputs": {
      "Account Number": "11111111111",
      "Password": "1234"
    },
    "message": "Your account ID must be exactly 10 digits long."
  },
  {
    "id": "S2-TC05",
    "accountState": loginState,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 2,
    "details": {
      "tag": ["@variant", "@login-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login is rejected. Expected message: User not found. Please check your account ID. Remain on Login; Register and LOG IN remain visible; no authenticated session is created." },
        { "type": "precondition", "description": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject an account that does not exist",
    "inputs": {
      "Account Number": "9999999999",
      "Password": "1234"
    },
    "message": "User not found. Please check your account ID."
  },
  {
    "id": "S2-TC06",
    "accountState": loginState,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 2,
    "details": {
      "tag": ["@variant", "@login-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login is rejected. Expected message: Your password should contain numbers only. Remain on Login; Register and LOG IN remain visible; no authenticated session is created." },
        { "type": "precondition", "description": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a nonnumeric password",
    "inputs": {
      "Account Number": "1111111111",
      "Password": "12A4"
    },
    "message": "Your password should contain numbers only."
  },
  {
    "id": "S2-TC07",
    "accountState": loginState,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 2,
    "details": {
      "tag": ["@variant", "@login-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login is rejected. Expected message: Your password must be exactly 4 digits long. Remain on Login; Register and LOG IN remain visible; no authenticated session is created." },
        { "type": "precondition", "description": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a 3-digit password",
    "inputs": {
      "Account Number": "1111111111",
      "Password": "123"
    },
    "message": "Your password must be exactly 4 digits long."
  },
  {
    "id": "S2-TC08",
    "accountState": loginState,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 2,
    "details": {
      "tag": ["@variant", "@login-rejection"],
      "annotation": [
        { "type": "expected", "description": "Login is rejected. Expected message: Your password must be exactly 4 digits long. Remain on Login; Register and LOG IN remain visible; no authenticated session is created." },
        { "type": "precondition", "description": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a 5-digit password",
    "inputs": {
      "Account Number": "1111111111",
      "Password": "12345"
    },
    "message": "Your password must be exactly 4 digits long."
  }
];
