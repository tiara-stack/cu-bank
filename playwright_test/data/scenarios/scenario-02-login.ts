import { loginState } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S2-TC01",
    "precondition": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist.",
    "accountState": loginState,
    "scenario": 2,
    "tags": ["@demo", "@login-rejection"],
    "title": "Reject an incorrect 4-digit password",
    "inputs": {
      "Account Number": "1111111111",
      "Password": "9999"
    },
    "message": "Incorrect password. Please try again.",
    "expected": "Login is rejected. Expected message: Incorrect password. Please try again. Remain on Login; Register and LOG IN remain visible; no authenticated session is created.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S2-TC02",
    "precondition": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist.",
    "accountState": loginState,
    "scenario": 2,
    "tags": ["@variant", "@login-rejection"],
    "title": "Reject a nonnumeric account number",
    "inputs": {
      "Account Number": "111111111A",
      "Password": "1234"
    },
    "message": "Your account ID should contain numbers only.",
    "expected": "Login is rejected. Expected message: Your account ID should contain numbers only. Remain on Login; Register and LOG IN remain visible; no authenticated session is created.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S2-TC03",
    "precondition": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist.",
    "accountState": loginState,
    "scenario": 2,
    "tags": ["@variant", "@login-rejection"],
    "title": "Reject a 9-digit account number",
    "inputs": {
      "Account Number": "111111111",
      "Password": "1234"
    },
    "message": "Your account ID must be exactly 10 digits long.",
    "expected": "Login is rejected. Expected message: Your account ID must be exactly 10 digits long. Remain on Login; Register and LOG IN remain visible; no authenticated session is created.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S2-TC04",
    "precondition": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist.",
    "accountState": loginState,
    "scenario": 2,
    "tags": ["@variant", "@login-rejection"],
    "title": "Reject an 11-digit account number",
    "inputs": {
      "Account Number": "11111111111",
      "Password": "1234"
    },
    "message": "Your account ID must be exactly 10 digits long.",
    "expected": "Login is rejected. Expected message: Your account ID must be exactly 10 digits long. Remain on Login; Register and LOG IN remain visible; no authenticated session is created.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S2-TC05",
    "precondition": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist.",
    "accountState": loginState,
    "scenario": 2,
    "tags": ["@variant", "@login-rejection"],
    "title": "Reject an account that does not exist",
    "inputs": {
      "Account Number": "9999999999",
      "Password": "1234"
    },
    "message": "User not found. Please check your account ID.",
    "expected": "Login is rejected. Expected message: User not found. Please check your account ID. Remain on Login; Register and LOG IN remain visible; no authenticated session is created.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S2-TC06",
    "precondition": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist.",
    "accountState": loginState,
    "scenario": 2,
    "tags": ["@variant", "@login-rejection"],
    "title": "Reject a nonnumeric password",
    "inputs": {
      "Account Number": "1111111111",
      "Password": "12A4"
    },
    "message": "Your password should contain numbers only.",
    "expected": "Login is rejected. Expected message: Your password should contain numbers only. Remain on Login; Register and LOG IN remain visible; no authenticated session is created.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S2-TC07",
    "precondition": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist.",
    "accountState": loginState,
    "scenario": 2,
    "tags": ["@variant", "@login-rejection"],
    "title": "Reject a 3-digit password",
    "inputs": {
      "Account Number": "1111111111",
      "Password": "123"
    },
    "message": "Your password must be exactly 4 digits long.",
    "expected": "Login is rejected. Expected message: Your password must be exactly 4 digits long. Remain on Login; Register and LOG IN remain visible; no authenticated session is created.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S2-TC08",
    "precondition": "Fresh signed-out browser. A (1111111111) exists with password 1234. N (9999999999) does not exist.",
    "accountState": loginState,
    "scenario": 2,
    "tags": ["@variant", "@login-rejection"],
    "title": "Reject a 5-digit password",
    "inputs": {
      "Account Number": "1111111111",
      "Password": "12345"
    },
    "message": "Your password must be exactly 4 digits long.",
    "expected": "Login is rejected. Expected message: Your password must be exactly 4 digits long. Remain on Login; Register and LOG IN remain visible; no authenticated session is created.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  }
];
