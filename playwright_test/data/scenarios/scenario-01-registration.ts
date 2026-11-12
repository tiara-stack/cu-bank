import { registrationState } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S1-TC01",
    "precondition": "Fresh signed-out browser. Account A (1111111111) exists. C (3333333333) and every other attempted new account are absent.",
    "accountState": registrationState,
    "scenario": 1,
    "tags": ["@demo", "@registration-rejection"],
    "title": "Reject a nonnumeric account number",
    "inputs": {
      "Account Number": "123456789A",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your account ID should contain numbers only",
    "expected": "Registration is rejected. Expected message: Your account ID should contain numbers only Remain on Register; no success alert; no new account is created.",
    "notes": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording."
  },
  {
    "id": "S1-TC02",
    "precondition": "Fresh signed-out browser. Account A (1111111111) exists. C (3333333333) and every other attempted new account are absent.",
    "accountState": registrationState,
    "scenario": 1,
    "tags": ["@variant", "@registration-rejection"],
    "title": "Reject a 9-digit account number",
    "inputs": {
      "Account Number": "123456789",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your account ID must be exactly 10 digits long",
    "expected": "Registration is rejected. Expected message: Your account ID must be exactly 10 digits long Remain on Register; no success alert; no new account is created.",
    "notes": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording."
  },
  {
    "id": "S1-TC03",
    "precondition": "Fresh signed-out browser. Account A (1111111111) exists. C (3333333333) and every other attempted new account are absent.",
    "accountState": registrationState,
    "scenario": 1,
    "tags": ["@variant", "@registration-rejection"],
    "title": "Reject an 11-digit account number",
    "inputs": {
      "Account Number": "12345678901",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your account ID must be exactly 10 digits long",
    "expected": "Registration is rejected. Expected message: Your account ID must be exactly 10 digits long Remain on Register; no success alert; no new account is created.",
    "notes": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording."
  },
  {
    "id": "S1-TC04",
    "precondition": "Fresh signed-out browser. Account A (1111111111) exists. C (3333333333) and every other attempted new account are absent.",
    "accountState": registrationState,
    "scenario": 1,
    "tags": ["@variant", "@registration-rejection"],
    "title": "Reject a duplicate account number",
    "inputs": {
      "Account Number": "1111111111",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "This account ID is already in use. Please choose another.",
    "expected": "Registration is rejected. Expected message: This account ID is already in use. Please choose another. Remain on Register; no success alert; no new account is created.",
    "notes": "Static review: backend duplicate message uses \"Please use a different account ID.\" instead of the specified \"Please choose another.\" Verify actual UI text."
  },
  {
    "id": "S1-TC05",
    "precondition": "Fresh signed-out browser. Account A (1111111111) exists. C (3333333333) and every other attempted new account are absent.",
    "accountState": registrationState,
    "scenario": 1,
    "tags": ["@variant", "@registration-rejection"],
    "title": "Reject a nonnumeric password",
    "inputs": {
      "Account Number": "3333333333",
      "Password": "12A4",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your password should contain numbers only",
    "expected": "Registration is rejected. Expected message: Your password should contain numbers only Remain on Register; no success alert; no new account is created.",
    "notes": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording."
  },
  {
    "id": "S1-TC06",
    "precondition": "Fresh signed-out browser. Account A (1111111111) exists. C (3333333333) and every other attempted new account are absent.",
    "accountState": registrationState,
    "scenario": 1,
    "tags": ["@variant", "@registration-rejection"],
    "title": "Reject a 3-digit password",
    "inputs": {
      "Account Number": "3333333333",
      "Password": "123",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your password must be exactly 4 digits long",
    "expected": "Registration is rejected. Expected message: Your password must be exactly 4 digits long Remain on Register; no success alert; no new account is created.",
    "notes": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording."
  },
  {
    "id": "S1-TC07",
    "precondition": "Fresh signed-out browser. Account A (1111111111) exists. C (3333333333) and every other attempted new account are absent.",
    "accountState": registrationState,
    "scenario": 1,
    "tags": ["@variant", "@registration-rejection"],
    "title": "Reject a 5-digit password",
    "inputs": {
      "Account Number": "3333333333",
      "Password": "12345",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your password must be exactly 4 digits long",
    "expected": "Registration is rejected. Expected message: Your password must be exactly 4 digits long Remain on Register; no success alert; no new account is created.",
    "notes": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording."
  },
  {
    "id": "S1-TC08",
    "precondition": "Fresh signed-out browser. Account A (1111111111) exists. C (3333333333) and every other attempted new account are absent.",
    "accountState": registrationState,
    "scenario": 1,
    "tags": ["@variant", "@registration-rejection"],
    "title": "Reject a 31-character full name",
    "inputs": {
      "Account Number": "3333333333",
      "Password": "1234",
      "Firstname": "ABCDEFGHIJKLMNO",
      "Lastname": "ABCDEFGHIJKLMNO"
    },
    "message": "Your fullname must be 30 characters or less, including spaces.",
    "expected": "Registration is rejected. Expected message: Your fullname must be 30 characters or less, including spaces. Remain on Register; no success alert; no new account is created.",
    "notes": "15 + 1 separating space + 15 = 31. Static review: frontend full-name error differs from the specified message."
  }
];
