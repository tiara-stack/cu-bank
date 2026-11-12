import { fundedState } from '../account-state';
import type { TestCase } from '../test-case';

export const cases: ReadonlyArray<TestCase> = [
  {
    "id": "S7-TC01",
    "precondition": "Apply fixture FUNDED independently for this case. Start signed out. A balance = 1000; History has 1 setup deposit.",
    "accountState": fundedState,
    "scenario": 7,
    "tags": ["@demo", "@bill-payment-success"],
    "title": "Pay Water Charge successfully",
    "inputs": {
      "Target Payment": "Water Charge",
      "Amount": "300"
    },
    "message": null,
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Payment succeeds. A balance = 700. Exactly one new bill-payment record: target = water, amount = 300, resulting balance = 700. The original setup deposit remains. Refresh and confirm the same balances and transaction records. Check action, target, amount, resulting balance, and a plausible execution timestamp.",
    "notes": "Reset FUNDED before each category; do not run the three cases cumulatively. Target strings are the labels stored by the supplied source code."
  },
  {
    "id": "S7-TC02",
    "precondition": "Apply fixture FUNDED independently for this case. Start signed out. A balance = 1000; History has 1 setup deposit.",
    "accountState": fundedState,
    "scenario": 7,
    "tags": ["@variant", "@bill-payment-success"],
    "title": "Pay Electric Charge successfully",
    "inputs": {
      "Target Payment": "Electric Charge",
      "Amount": "500"
    },
    "message": null,
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Payment succeeds. A balance = 500. Exactly one new bill-payment record: target = electric, amount = 500, resulting balance = 500. The original setup deposit remains. Refresh and confirm the same balances and transaction records. Check action, target, amount, resulting balance, and a plausible execution timestamp.",
    "notes": "Reset FUNDED before each category; do not run the three cases cumulatively. Target strings are the labels stored by the supplied source code."
  },
  {
    "id": "S7-TC03",
    "precondition": "Apply fixture FUNDED independently for this case. Start signed out. A balance = 1000; History has 1 setup deposit.",
    "accountState": fundedState,
    "scenario": 7,
    "tags": ["@variant", "@bill-payment-success"],
    "title": "Pay Phone Charge successfully",
    "inputs": {
      "Target Payment": "Phone Charge",
      "Amount": "200"
    },
    "message": null,
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Payment succeeds. A balance = 800. Exactly one new bill-payment record: target = phone, amount = 200, resulting balance = 800. The original setup deposit remains. Refresh and confirm the same balances and transaction records. Check action, target, amount, resulting balance, and a plausible execution timestamp.",
    "notes": "Reset FUNDED before each category; do not run the three cases cumulatively. Target strings are the labels stored by the supplied source code."
  }
];
