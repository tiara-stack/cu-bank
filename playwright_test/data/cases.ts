import { fundedState, loginState, registrationState, zeroState, type AccountState } from './account-state';

export type CaseTag =
  | '@demo'
  | '@variant'
  | '@registration-rejection'
  | '@login-rejection'
  | '@deposit-rejection'
  | '@withdrawal-rejection'
  | '@transfer-rejection'
  | '@bill-payment-rejection'
  | '@bill-payment-success'
  | '@registration-journey'
  | '@bill-category-selected'
  | '@bill-category-required';

export const cases: ReadonlyArray<{
  id: string;
  scenario: number;
  tags: ReadonlyArray<CaseTag>;
  title: string;
  precondition: string;
  accountState: AccountState;
  inputs: Readonly<Record<string, string>>;
  message: string | null;
  expected: string;
  notes: string;
}> = [
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
  },
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
  },
  {
    "id": "S3-TC01",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 3,
    "tags": ["@demo", "@deposit-rejection"],
    "title": "Reject a zero deposit",
    "inputs": {
      "Deposit Amount": "0"
    },
    "message": "The amount must be greater than 0. Please enter a positive number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A balance remains 0 and History remains empty.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S3-TC02",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 3,
    "tags": ["@variant", "@deposit-rejection"],
    "title": "Reject a negative deposit",
    "inputs": {
      "Deposit Amount": "-1"
    },
    "message": "The amount must be greater than 0. Please enter a positive number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A balance remains 0 and History remains empty.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S3-TC03",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 3,
    "tags": ["@variant", "@deposit-rejection"],
    "title": "Reject a nonnumeric deposit",
    "inputs": {
      "Deposit Amount": "abc"
    },
    "message": "Invalid balance amount. Please enter a valid number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit is rejected. Expected message: Invalid balance amount. Please enter a valid number. A balance remains 0 and History remains empty.",
    "notes": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised."
  },
  {
    "id": "S3-TC04",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 3,
    "tags": ["@variant", "@deposit-rejection"],
    "title": "Reject a fractional deposit",
    "inputs": {
      "Deposit Amount": "100.5"
    },
    "message": "The balance amount must be a whole number with no decimals.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit is rejected. Expected message: The balance amount must be a whole number with no decimals. A balance remains 0 and History remains empty.",
    "notes": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised."
  },
  {
    "id": "S4-TC01",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@demo", "@withdrawal-rejection"],
    "title": "Reject withdrawal above the balance",
    "inputs": {
      "Withdraw Amount": "1001"
    },
    "message": "Your balance is not enough to complete the withdrawal.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: Your balance is not enough to complete the withdrawal. A balance stays 1000; History contains only the successful deposit.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S4-TC02",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@variant", "@withdrawal-rejection"],
    "title": "Reject withdrawal equal to the balance under the literal specification",
    "inputs": {
      "Withdraw Amount": "1000"
    },
    "message": "Your balance is not enough to complete the withdrawal.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: Your balance is not enough to complete the withdrawal. A balance stays 1000; History contains only the successful deposit.",
    "notes": "Specification pp. 3-4 says amount must be LESS THAN the balance. This case expects rejection at equality. The supplied code permits equality. Confirm the intended rule with the instructor before final defect classification."
  },
  {
    "id": "S4-TC03",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@variant", "@withdrawal-rejection"],
    "title": "Reject a zero withdrawal",
    "inputs": {
      "Withdraw Amount": "0"
    },
    "message": "The amount must be greater than 0. Please enter a positive number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A balance stays 1000; History contains only the successful deposit.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S4-TC04",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@variant", "@withdrawal-rejection"],
    "title": "Reject a negative withdrawal",
    "inputs": {
      "Withdraw Amount": "-1"
    },
    "message": "The amount must be greater than 0. Please enter a positive number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: The amount must be greater than 0. Please enter a positive number. A balance stays 1000; History contains only the successful deposit.",
    "notes": "All other inputs and successful prefix steps remain valid. A rejected action must not change balances or append a transaction. Verify after refresh."
  },
  {
    "id": "S4-TC05",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@variant", "@withdrawal-rejection"],
    "title": "Reject a nonnumeric withdrawal",
    "inputs": {
      "Withdraw Amount": "abc"
    },
    "message": "Invalid balance amount. Please enter a valid number.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: Invalid balance amount. Please enter a valid number. A balance stays 1000; History contains only the successful deposit.",
    "notes": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised."
  },
  {
    "id": "S4-TC06",
    "precondition": "Apply fixture ZERO. Start signed out. A balance = 0; history has 0 records.",
    "accountState": zeroState,
    "scenario": 4,
    "tags": ["@variant", "@withdrawal-rejection"],
    "title": "Reject a fractional withdrawal",
    "inputs": {
      "Withdraw Amount": "100.5"
    },
    "message": "The balance amount must be a whole number with no decimals.",
    "expected": "Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. Deposit succeeds: A balance = 1000, deposit record amount/balance = 1000. Withdrawal is rejected. Expected message: The balance amount must be a whole number with no decimals. A balance stays 1000; History contains only the successful deposit.",
    "notes": "UI amount inputs use type=number and the default integer step. Try ordinary typing/paste. If the browser blocks submission, record its actual validation and that the specified app message was not observed. Do not remove HTML constraints or claim backend validation was exercised."
  },
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
  },
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
  },
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
  },
  {
    "id": "S8-TC01",
    "precondition": "Apply fixture ZERO. Start signed out. New account 3333333333 must not exist. B (2222222222) exists with password 1234, balance 200 and 1 setup-deposit record.",
    "accountState": zeroState,
    "scenario": 8,
    "tags": ["@demo", "@registration-journey"],
    "title": "Complete a successful registration-to-transfer journey",
    "inputs": {
      "Register Account Number": "3333333333",
      "Password": "1234",
      "Firstname": "Sam",
      "Lastname": "Son",
      "Transfer Target": "2222222222",
      "Amount": "300"
    },
    "message": null,
    "expected": "Register succeeds and shows the specified 'success' message, then Login. A new account stores the supplied account ID and full name. Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. New sender balance: 0 -> 1000 -> 800 -> 500. Recipient B: 200 -> 500. Sender has 3 records: deposit 1000 (balance 1000), withdraw 200 (balance 800), transfer to B 300 (balance 500). B gains 1 transfer-from record for 3333333333, amount 300, balance 500. Refresh and confirm the same balances and transaction records. Check action, target, amount, resulting balance, and a plausible execution timestamp.",
    "notes": "Static review: Register displays \"Registration successful!\", while the specification names \"success\". Verify the UI and report the text discrepancy separately from successful registration."
  },
  {
    "id": "S8-TC02",
    "precondition": "Apply fixture ZERO. Start signed out. New account 0333333333 must not exist. B (2222222222) exists with password 1234, balance 200 and 1 setup-deposit record.",
    "accountState": zeroState,
    "scenario": 8,
    "tags": ["@variant", "@registration-journey"],
    "title": "Accept a 30-character name and preserve leading zeros",
    "inputs": {
      "Register Account Number": "0333333333",
      "Password": "0123",
      "Firstname": "ABCDEFGHIJKLMNO",
      "Lastname": "ABCDEFGHIJKLMN",
      "Transfer Target": "2222222222",
      "Amount": "300"
    },
    "message": null,
    "expected": "Register succeeds and shows the specified 'success' message, then Login. A new account stores the supplied account ID and full name. Login succeeds: Account page opens; Register and LOG IN links are hidden; LOG OUT is visible. New sender balance: 0 -> 1000 -> 800 -> 500. Recipient B: 200 -> 500. Sender has 3 records: deposit 1000 (balance 1000), withdraw 200 (balance 800), transfer to B 300 (balance 500). B gains 1 transfer-from record for 0333333333, amount 300, balance 500. Refresh and confirm the same balances and transaction records. Check action, target, amount, resulting balance, and a plausible execution timestamp.",
    "notes": "15 + 1 + 14 = 30 characters. Keep account and password as strings, preserving leading zeros. This is an additional valid/boundary representative, not a new EQ class."
  }
];
