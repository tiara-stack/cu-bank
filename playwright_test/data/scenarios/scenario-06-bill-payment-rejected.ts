import { fundedState } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S6-TC01",
    "precondition": "Apply fixture FUNDED. Start signed out. A balance = 1000; History has 1 setup deposit. Open a fresh Account page with no category selected.",
    "accountState": fundedState,
    "scenario": 6,
    "tags": ["@demo", "@bill-payment-rejection", "@bill-category-selected"],
    "title": "Reject a bill payment above the balance",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "1001"
    },
    "message": "Your balance is not enough to complete the bill payment.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: Your balance is not enough to complete the bill payment. A remains 1000 with only its 1 setup deposit.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S6-TC02",
    "precondition": "Apply fixture FUNDED. Start signed out. A balance = 1000; History has 1 setup deposit. Open a fresh Account page with no category selected.",
    "accountState": fundedState,
    "scenario": 6,
    "tags": ["@variant", "@bill-payment-rejection", "@bill-category-selected"],
    "title": "Reject a bill payment equal to the balance under the literal specification",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "1000"
    },
    "message": "Your balance is not enough to complete the bill payment.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: Your balance is not enough to complete the bill payment. A remains 1000 with only its 1 setup deposit.",
    "notes": "Specification pp. 3-4 says amount must be LESS THAN the balance. This case expects rejection at equality. The supplied code permits equality. Confirm the intended rule with the instructor before final defect classification."
  },
  {
    "id": "S6-TC03",
    "precondition": "Apply fixture FUNDED. Start signed out. A balance = 1000; History has 1 setup deposit. Open a fresh Account page with no category selected.",
    "accountState": fundedState,
    "scenario": 6,
    "tags": ["@variant", "@bill-payment-rejection", "@bill-category-selected"],
    "title": "Reject a zero bill payment",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "0"
    },
    "message": "The amount must be greater than 0. Please enter a positive number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A remains 1000 with only its 1 setup deposit.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S6-TC04",
    "precondition": "Apply fixture FUNDED. Start signed out. A balance = 1000; History has 1 setup deposit. Open a fresh Account page with no category selected.",
    "accountState": fundedState,
    "scenario": 6,
    "tags": ["@variant", "@bill-payment-rejection", "@bill-category-selected"],
    "title": "Reject a negative bill payment",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "-1"
    },
    "message": "The amount must be greater than 0. Please enter a positive number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A remains 1000 with only its 1 setup deposit.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S6-TC05",
    "precondition": "Apply fixture FUNDED. Start signed out. A balance = 1000; History has 1 setup deposit. Open a fresh Account page with no category selected.",
    "accountState": fundedState,
    "scenario": 6,
    "tags": ["@variant", "@bill-payment-rejection", "@bill-category-selected"],
    "title": "Reject a nonnumeric bill payment",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "abc"
    },
    "message": "Invalid balance amount. Please enter a valid number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: Invalid balance amount. Please enter a valid number. A remains 1000 with only its 1 setup deposit.",
    "notes": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised."
  },
  {
    "id": "S6-TC06",
    "precondition": "Apply fixture FUNDED. Start signed out. A balance = 1000; History has 1 setup deposit. Open a fresh Account page with no category selected.",
    "accountState": fundedState,
    "scenario": 6,
    "tags": ["@variant", "@bill-payment-rejection", "@bill-category-selected"],
    "title": "Reject a fractional bill payment",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "100.5"
    },
    "message": "The balance amount must be a whole number with no decimals.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. Expected message: The balance amount must be a whole number with no decimals. A remains 1000 with only its 1 setup deposit.",
    "notes": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised."
  },
  {
    "id": "S6-TC07",
    "precondition": "Apply fixture FUNDED. Start signed out. A balance = 1000; History has 1 setup deposit. Open a fresh Account page with no category selected.",
    "accountState": fundedState,
    "scenario": 6,
    "tags": ["@variant", "@bill-payment-rejection", "@bill-category-required"],
    "title": "Reject a bill payment without a selected category",
    "inputs": {
      "Target Payment": "None",
      "Amount": "300"
    },
    "message": null,
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Bill payment is rejected. The form requires one category. The specification gives no exact error text (N/A); capture the actual required-field validation. A remains 1000 with only its 1 setup deposit.",
    "notes": "Use a fresh page; a previously selected radio must not carry over. No exact message is asserted because the specification says N/A."
  }
];
