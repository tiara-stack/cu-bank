# CU Bank Playwright tests

Browser tests for all 49 cases in `CU_Bank_Test_Cases_8_Scenarios.xlsx` (sheet `Test_Cases`), written in plain
Playwright Test with TypeScript and `async`/`await`. Each test title starts with its workbook ID, and the eight
demo cases, one per scenario, carry the `@demo` tag.

## Layout

| Folder | Contents |
| --- | --- |
| [data/scenarios](data/scenarios) | One file per scenario: every case's ID, inputs, expected message, account pre-condition (`accountState`) and expected result (`accountOutcome`). |
| [tests](tests) | One spec per scenario. It loops over the scenario's cases and runs each as `test.step`s in the order of the test-case template: pre-condition, inputs, expected output, post-condition. |
| [support](support) | Helpers the specs share (see below). |

[data/account.ts](data/account.ts) defines named accounts with an `id`, password and registration names.
`AccountPrecondition` in [data/account-state.ts](data/account-state.ts) pairs an `account` with its starting
balance, setup deposits and existence flag. States refer to named IDs such as `newCustomer.id` and
`unregisteredAccount.id`. Scenario 8 selects `newCustomerAndRecipient` or `boundaryCustomerAndRecipient`
directly, using the account definitions for its registration inputs.

| Scenario | Case data | Spec |
| --- | --- | --- |
| 1. Registration rejected | [Cases](data/scenarios/scenario-01-registration.ts) | [Spec](tests/scenario-01-registration.spec.ts) |
| 2. Login rejected | [Cases](data/scenarios/scenario-02-login.ts) | [Spec](tests/scenario-02-login.spec.ts) |
| 3. Deposit rejected | [Cases](data/scenarios/scenario-03-deposit.ts) | [Spec](tests/scenario-03-deposit.spec.ts) |
| 4. Withdrawal rejected | [Cases](data/scenarios/scenario-04-withdrawal.ts) | [Spec](tests/scenario-04-withdrawal.spec.ts) |
| 5. Transfer rejected | [Cases](data/scenarios/scenario-05-transfer.ts) | [Spec](tests/scenario-05-transfer.spec.ts) |
| 6. Bill payment rejected | [Cases](data/scenarios/scenario-06-bill-payment-rejected.ts) | [Spec](tests/scenario-06-bill-payment-rejected.spec.ts) |
| 7. Bill payment succeeds | [Cases](data/scenarios/scenario-07-bill-payment-success.ts) | [Spec](tests/scenario-07-bill-payment-success.spec.ts) |
| 8. Registration-to-transfer journey | [Cases](data/scenarios/scenario-08-registration-journey.ts) | [Spec](tests/scenario-08-registration-journey.spec.ts) |

### Support helpers

| File | What it provides |
| --- | --- |
| [fixtures.ts](support/fixtures.ts) | `test` with one extra fixture, `openSession()`: a page in a fresh browser context, so a test can act as several customers. |
| [preconditions.ts](support/preconditions.ts) | `prepareAccounts()`: empties the database, then registers, logs in and funds each account the case needs, through the UI. |
| [database.ts](support/database.ts) | The only direct database access. `clearAccounts()` resets the system before each case because the application cannot delete accounts. |
| [forms.ts](support/forms.ts) | Field entry for each form, using the application's `cid` attributes. |
| [ui.ts](support/ui.ts) | `register`, `login`, `transact` for steps that must succeed; `expectAccountPage(page)` and `expectAccountUnchanged` for state checks. |
| [evidence.ts](support/evidence.ts) | `captureActualOutput()`: attaches a screenshot named `actual-output` to the case; the report uses it as the Actual Output. |
| [rejections.ts](support/rejections.ts) | `submitForm()`: the input, records the browser's own validation of the field and clicks Confirm. `expectRejection()`: the expected output, checks the specified error message, or reports that the browser blocked the form. |

## Setup

Use Node.js 22 or later. From the repository root:

```bash
npm ci --prefix frontend
npm ci --prefix backend
cd playwright_test
npm ci
npm run browsers:install      # on Linux, if needed: npx playwright install --with-deps chromium
```

The first run downloads a MongoDB server binary through `mongodb-memory-server`, so it needs network access.

## Run

Inside `playwright_test`:

```bash
npm test                        # all 49 cases, about 7 minutes
npm run test:demo               # the 8 @demo cases, about 1.5 minutes
npm run test:demo -- --headed   # the same, with a visible browser
npm test -- --grep S5-TC01      # one case
npm run report                  # open the HTML report
npm run check                   # TypeScript and dead-code checks
```

Ports 3000 and 4000 must be free: Playwright starts the React frontend on `http://localhost:3000`, and global setup
starts the Express backend on `http://localhost:4000` with a temporary MongoDB database that is discarded afterwards.
These URLs are the ones the application hard-codes for its API and CORS settings. Cases run one at a time
(`workers: 1`) because they share the workbook's account numbers.

## How a case runs

1. **Pre-condition.** `prepareAccounts` empties the database and builds the case's account state through the UI,
   each account in its own browser context. The test itself then starts signed out in a fresh context.
2. **Thread.** Steps that must succeed (`login`, `transact`) verify their own output before the next step, so a case
   stops as soon as the system is not in the state the next step needs.
3. **Expected output.** A rejected step is checked against the workbook's message, character for character. This
   check is a soft assertion: a wording mismatch fails the case, and the case still goes on to check the state.
4. **Post-condition.** The page is reloaded and the balance and history are compared with the expected values.
   Transfer cases also log in as the recipient in a separate context.

## Results

`npm run report` opens the HTML report; `test-results/results.json` has the same results in machine-readable form.
Failed cases keep screenshots, video and a trace. Each case attaches its account pre-condition, its expected outcome,
a screenshot of the actual output and, for amount fields, the browser's validation state. Step names start with the
field of the test-case template they belong to: `Pre-condition`, `Input`, `Expected output`, `Post-condition`.

Notes on interpreting failures:

- Amount inputs are `type="number"`. For non-numeric or decimal amounts the browser blocks the form, so the
  application's message never appears; the case records the browser's message and fails on the missing text.
- S4-TC02, S5-TC11 and S6-TC02 expect an amount equal to the balance to be rejected, following the literal wording
  of the instruction ("less than the balance").
- The missing bill category (S6-TC07) has no specified message; the case asserts the browser's required-field
  validation instead.
