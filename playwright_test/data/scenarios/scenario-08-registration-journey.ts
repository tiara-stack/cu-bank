import { accountB, newCustomer, boundaryCustomer } from '../account';
import { boundaryCustomerAndRecipient, newCustomerAndRecipient } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S8-TC01",
    "accountState": newCustomerAndRecipient,
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
              "target": newCustomer.id,
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
              "target": accountB.id,
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
        { "type": "precondition", "description": `Reset: no accounts exist; new browser, signed out. Setup: B (${accountB.id} / 1234) registered, balance 200, 1 history record. This case needs: ${newCustomer.id} not registered; B at 200, to show that it rises to 500.` },
        { "type": "workbook note", "description": "Static review: Register displays \"Registration successful!\", while the specification names \"success\". Verify the UI and report the text discrepancy separately from successful registration." }
      ]
    },
    "title": "Complete a successful registration-to-transfer journey",
    "inputs": {
      "Register Account Number": newCustomer.id,
      "Password": newCustomer.password,
      "Firstname": newCustomer.firstName,
      "Lastname": newCustomer.lastName,
      "Transfer Target": accountB.id,
      "Amount": "300"
    },
    "message": null
  },
  {
    "id": "S8-TC02",
    "accountState": boundaryCustomerAndRecipient,
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
              "target": boundaryCustomer.id,
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
              "target": accountB.id,
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
        { "type": "precondition", "description": `Reset: no accounts exist; new browser, signed out. Setup: B (${accountB.id} / 1234) registered, balance 200, 1 history record. This case needs: ${boundaryCustomer.id} not registered; B at 200, to show that it rises to 500.` },
        { "type": "workbook note", "description": "15 + 1 + 14 = 30 characters. Keep account and password as strings, preserving leading zeros. This is an additional valid/boundary representative, not a new EQ class." }
      ]
    },
    "title": "Accept a 30-character name and preserve leading zeros",
    "inputs": {
      "Register Account Number": boundaryCustomer.id,
      "Password": boundaryCustomer.password,
      "Firstname": boundaryCustomer.firstName,
      "Lastname": boundaryCustomer.lastName,
      "Transfer Target": accountB.id,
      "Amount": "300"
    },
    "message": null
  }
];
