import { registrationJourneyState } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S8-TC01",
    "accountState": registrationJourneyState({
      "accountId": "3333333333",
      "password": "1234",
      "firstName": "Sam",
      "lastName": "Son"
    }),
    "accountOutcome": {
      "kind": "updated",
      "accounts": {
        "recipient": {
          "name": "Jane Doe",
          "balance": 500,
          "transactions": [
            {
              "title": "deposit",
              "target": "",
              "amount": 200,
              "balance": 200
            },
            {
              "title": "transfer from",
              "target": "3333333333",
              "amount": 300,
              "balance": 500
            }
          ]
        },
        "sender": {
          "name": "Sam Son",
          "balance": 500,
          "transactions": [
            {
              "title": "deposit",
              "target": "",
              "amount": 1000,
              "balance": 1000
            },
            {
              "title": "withdraw",
              "target": "",
              "amount": 200,
              "balance": 800
            },
            {
              "title": "transfer to",
              "target": "2222222222",
              "amount": 300,
              "balance": 500
            }
          ]
        }
      }
    },
    "scenario": 8,
    "details": {
      "tag": ["@demo", "@registration-journey"],
      "annotation": [
        { "type": "expected", "description": "Register succeeds and shows the specified 'success' message, then Login. A new account stores the supplied account ID and full name. Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. New sender balance: 0 -> 1000 -> 800 -> 500. Recipient B: 200 -> 500. Sender has 3 records: deposit 1000 (balance 1000), withdraw 200 (balance 800), transfer to B 300 (balance 500). B gains 1 transfer-from record for 3333333333, amount 300, balance 500. Refresh and confirm the same balances and transaction records. Check action, target, amount, resulting balance, and a plausible execution timestamp." },
        { "type": "precondition", "description": "Apply fixture ZERO. Start signed out. New account 3333333333 must not exist. B (2222222222) exists with password 1234, balance 200 and 1 setup-deposit record." },
        { "type": "workbook note", "description": "Static review: Register displays \"Registration successful!\", while the specification names \"success\". Verify the UI and report the text discrepancy separately from successful registration." }
      ]
    },
    "title": "Complete a successful registration-to-transfer journey",
    "inputs": {
      "Register Account Number": "3333333333",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son",
      "Transfer Target": "2222222222",
      "Amount": "300"
    },
    "message": null
  },
  {
    "id": "S8-TC02",
    "accountState": registrationJourneyState({
      "accountId": "0333333333",
      "password": "0123",
      "firstName": "ABCDEFGHIJKLMNO",
      "lastName": "ABCDEFGHIJKLMN"
    }),
    "accountOutcome": {
      "kind": "updated",
      "accounts": {
        "recipient": {
          "name": "Jane Doe",
          "balance": 500,
          "transactions": [
            {
              "title": "deposit",
              "target": "",
              "amount": 200,
              "balance": 200
            },
            {
              "title": "transfer from",
              "target": "0333333333",
              "amount": 300,
              "balance": 500
            }
          ]
        },
        "sender": {
          "name": "ABCDEFGHIJKLMNO ABCDEFGHIJKLMN",
          "balance": 500,
          "transactions": [
            {
              "title": "deposit",
              "target": "",
              "amount": 1000,
              "balance": 1000
            },
            {
              "title": "withdraw",
              "target": "",
              "amount": 200,
              "balance": 800
            },
            {
              "title": "transfer to",
              "target": "2222222222",
              "amount": 300,
              "balance": 500
            }
          ]
        }
      }
    },
    "scenario": 8,
    "details": {
      "tag": ["@variant", "@registration-journey"],
      "annotation": [
        { "type": "expected", "description": "Register succeeds and shows the specified 'success' message, then Login. A new account stores the supplied account ID and full name. Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. New sender balance: 0 -> 1000 -> 800 -> 500. Recipient B: 200 -> 500. Sender has 3 records: deposit 1000 (balance 1000), withdraw 200 (balance 800), transfer to B 300 (balance 500). B gains 1 transfer-from record for 0333333333, amount 300, balance 500. Refresh and confirm the same balances and transaction records. Check action, target, amount, resulting balance, and a plausible execution timestamp." },
        { "type": "precondition", "description": "Apply fixture ZERO. Start signed out. New account 0333333333 must not exist. B (2222222222) exists with password 1234, balance 200 and 1 setup-deposit record." },
        { "type": "workbook note", "description": "15 + 1 + 14 = 30 characters. Keep account and password as strings, preserving leading zeros. This is an additional valid/boundary representative, not a new EQ class." }
      ]
    },
    "title": "Accept a 30-character name and preserve leading zeros",
    "inputs": {
      "Register Account Number": "0333333333",
      "Password": "0123",
      "Firstname": "ABCDEFGHIJKLMNO",
      "Lastname": "ABCDEFGHIJKLMN",
      "Transfer Target": "2222222222",
      "Amount": "300"
    },
    "message": null
  }
];
