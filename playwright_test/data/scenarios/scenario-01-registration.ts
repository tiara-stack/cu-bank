import { unchangedAccountOutcome } from '../account-outcome';
import { senderOnly } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S1-TC01",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 1,
    "details": {
      "tag": ["@demo", "@registration-rejection"],
      "annotation": [
        { "type": "expected", "description": "Registration is rejected. Expected message: Your account ID should contain numbers only Remain on Register; no success alert; no new account is created." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records." },
        { "type": "workbook note", "description": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording." }
      ]
    },
    "title": "Reject a nonnumeric account number",
    "inputs": {
      "Account Number": "123456789A",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your account ID should contain numbers only"
  },
  {
    "id": "S1-TC02",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 1,
    "details": {
      "tag": ["@variant", "@registration-rejection"],
      "annotation": [
        { "type": "expected", "description": "Registration is rejected. Expected message: Your account ID must be exactly 10 digits long Remain on Register; no success alert; no new account is created." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records." },
        { "type": "workbook note", "description": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording." }
      ]
    },
    "title": "Reject a 9-digit account number",
    "inputs": {
      "Account Number": "123456789",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your account ID must be exactly 10 digits long"
  },
  {
    "id": "S1-TC03",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 1,
    "details": {
      "tag": ["@variant", "@registration-rejection"],
      "annotation": [
        { "type": "expected", "description": "Registration is rejected. Expected message: Your account ID must be exactly 10 digits long Remain on Register; no success alert; no new account is created." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records." },
        { "type": "workbook note", "description": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording." }
      ]
    },
    "title": "Reject an 11-digit account number",
    "inputs": {
      "Account Number": "12345678901",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your account ID must be exactly 10 digits long"
  },
  {
    "id": "S1-TC04",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 1,
    "details": {
      "tag": ["@variant", "@registration-rejection"],
      "annotation": [
        { "type": "expected", "description": "Registration is rejected. Expected message: This account ID is already in use. Please choose another. Remain on Register; no success alert; no new account is created." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records. This case needs: A already registered, so 1111111111 is a duplicate." },
        { "type": "workbook note", "description": "Static review: backend duplicate message uses \"Please use a different account ID.\" instead of the specified \"Please choose another.\" Verify actual UI text." }
      ]
    },
    "title": "Reject a duplicate account number",
    "inputs": {
      "Account Number": "1111111111",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "This account ID is already in use. Please choose another."
  },
  {
    "id": "S1-TC05",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 1,
    "details": {
      "tag": ["@variant", "@registration-rejection"],
      "annotation": [
        { "type": "expected", "description": "Registration is rejected. Expected message: Your password should contain numbers only Remain on Register; no success alert; no new account is created." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records. This case needs: 3333333333 not registered, so a duplicate cannot be the reason for the rejection." },
        { "type": "workbook note", "description": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording." }
      ]
    },
    "title": "Reject a nonnumeric password",
    "inputs": {
      "Account Number": "3333333333",
      "Password": "12A4",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your password should contain numbers only"
  },
  {
    "id": "S1-TC06",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 1,
    "details": {
      "tag": ["@variant", "@registration-rejection"],
      "annotation": [
        { "type": "expected", "description": "Registration is rejected. Expected message: Your password must be exactly 4 digits long Remain on Register; no success alert; no new account is created." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records. This case needs: 3333333333 not registered, so a duplicate cannot be the reason for the rejection." },
        { "type": "workbook note", "description": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording." }
      ]
    },
    "title": "Reject a 3-digit password",
    "inputs": {
      "Account Number": "3333333333",
      "Password": "123",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your password must be exactly 4 digits long"
  },
  {
    "id": "S1-TC07",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 1,
    "details": {
      "tag": ["@variant", "@registration-rejection"],
      "annotation": [
        { "type": "expected", "description": "Registration is rejected. Expected message: Your password must be exactly 4 digits long Remain on Register; no success alert; no new account is created." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records. This case needs: 3333333333 not registered, so a duplicate cannot be the reason for the rejection." },
        { "type": "workbook note", "description": "Expected Register wording follows p. 1, including its missing final punctuation on the numeric/length messages. Do not silently substitute source-code wording." }
      ]
    },
    "title": "Reject a 5-digit password",
    "inputs": {
      "Account Number": "3333333333",
      "Password": "12345",
      "Firstname": "Sam",
      "Lastname": "Son"
    },
    "message": "Your password must be exactly 4 digits long"
  },
  {
    "id": "S1-TC08",
    "accountState": senderOnly,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 1,
    "details": {
      "tag": ["@variant", "@registration-rejection"],
      "annotation": [
        { "type": "expected", "description": "Registration is rejected. Expected message: Your fullname must be 30 characters or less, including spaces. Remain on Register; no success alert; no new account is created." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 0, 0 history records. This case needs: 3333333333 not registered, so a duplicate cannot be the reason for the rejection." },
        { "type": "workbook note", "description": "15 + 1 separating space + 15 = 31. Static review: frontend full-name error differs from the specified message." }
      ]
    },
    "title": "Reject a 31-character full name",
    "inputs": {
      "Account Number": "3333333333",
      "Password": "1234",
      "Firstname": "ABCDEFGHIJKLMNO",
      "Lastname": "ABCDEFGHIJKLMNO"
    },
    "message": "Your fullname must be 30 characters or less, including spaces."
  }
];
