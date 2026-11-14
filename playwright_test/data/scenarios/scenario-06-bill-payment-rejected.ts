import { unchangedAccountOutcome } from '../account-outcome';
import { fundedSender } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S6-TC01",
    "accountState": fundedSender,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 6,
    "details": {
      "tag": ["@demo", "@bill-payment-rejection", "@bill-category-selected"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: Your balance is not enough to complete the bill payment. A remains 1000 with only its 1 setup deposit." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 1000, 1 history record. This case needs: A at exactly 1000." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a bill payment above the balance",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "1001"
    },
    "message": "Your balance is not enough to complete the bill payment."
  },
  {
    "id": "S6-TC02",
    "accountState": fundedSender,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 6,
    "details": {
      "tag": ["@variant", "@bill-payment-rejection", "@bill-category-selected"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: Your balance is not enough to complete the bill payment. A remains 1000 with only its 1 setup deposit." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 1000, 1 history record. This case needs: A at exactly 1000." },
        { "type": "workbook note", "description": "Specification pp. 3-4 says amount must be LESS THAN the balance. This case expects rejection at equality. The supplied code permits equality. Confirm the intended rule with the instructor before final defect classification." }
      ]
    },
    "title": "Reject a bill payment equal to the balance under the literal specification",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "1000"
    },
    "message": "Your balance is not enough to complete the bill payment."
  },
  {
    "id": "S6-TC03",
    "accountState": fundedSender,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 6,
    "details": {
      "tag": ["@variant", "@bill-payment-rejection", "@bill-category-selected"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A remains 1000 with only its 1 setup deposit." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 1000, 1 history record." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a zero bill payment",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "0"
    },
    "message": "The amount must be greater than 0. Please enter a positive number."
  },
  {
    "id": "S6-TC04",
    "accountState": fundedSender,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 6,
    "details": {
      "tag": ["@variant", "@bill-payment-rejection", "@bill-category-selected"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A remains 1000 with only its 1 setup deposit." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 1000, 1 history record." },
        { "type": "workbook note", "description": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh." }
      ]
    },
    "title": "Reject a negative bill payment",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "-1"
    },
    "message": "The amount must be greater than 0. Please enter a positive number."
  },
  {
    "id": "S6-TC05",
    "accountState": fundedSender,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 6,
    "details": {
      "tag": ["@variant", "@bill-payment-rejection", "@bill-category-selected"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: Invalid balance amount. Please enter a valid number. A remains 1000 with only its 1 setup deposit." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 1000, 1 history record." },
        { "type": "workbook note", "description": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised." }
      ]
    },
    "title": "Reject a nonnumeric bill payment",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "abc"
    },
    "message": "Invalid balance amount. Please enter a valid number."
  },
  {
    "id": "S6-TC06",
    "accountState": fundedSender,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 6,
    "details": {
      "tag": ["@variant", "@bill-payment-rejection", "@bill-category-selected"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: The balance amount must be a whole number with no decimals. A remains 1000 with only its 1 setup deposit." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 1000, 1 history record." },
        { "type": "workbook note", "description": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised." }
      ]
    },
    "title": "Reject a fractional bill payment",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "100.5"
    },
    "message": "The balance amount must be a whole number with no decimals."
  },
  {
    "id": "S6-TC07",
    "accountState": fundedSender,
    "accountOutcome": unchangedAccountOutcome,
    "scenario": 6,
    "details": {
      "tag": ["@variant", "@bill-payment-rejection", "@bill-category-required"],
      "annotation": [
        { "type": "expected", "description": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. The form requires one category. The specification gives no exact error text (N/A); capture the actual required-field validation. A remains 1000 with only its 1 setup deposit." },
        { "type": "precondition", "description": "Reset: no accounts exist; new browser, signed out. Setup: A (1111111111 / 1234) registered, balance 1000, 1 history record. This case needs: no bill category selected after login." },
        { "type": "workbook note", "description": "Use a fresh page; a previously selected radio must not carry over. No exact message is asserted because the specification says N/A." }
      ]
    },
    "title": "Reject a bill payment without a selected category",
    "inputs": {
      "Target Payment": "None",
      "Amount": "300"
    },
    "message": null
  }
];
