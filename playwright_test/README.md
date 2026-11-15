# CU Bank Playwright tests

Browser tests for all 49 cases in `CU_Bank_Test_Cases_8_Scenarios.xlsx` (sheet `Test_Cases`), written in plain
Playwright Test with TypeScript and `async`/`await`. Each test title starts with its workbook ID, and the eight
demo cases, one per scenario, carry the `@demo` tag.

## Layout

| Folder                           | Contents                                                                                                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [data/scenarios](data/scenarios) | One file per scenario: every case's ID, inputs, expected message, account pre-condition (`precondition`) and expected result (`postcondition`).                                         |
| [tests](tests)                   | One spec per scenario. It loops over the scenario's cases and runs each as `test.step`s in the order of the test-case template: pre-condition, inputs, expected output, post-condition. |
| [support](support)               | Helpers the specs share (see below).                                                                                                                                                    |

[data/account.ts](data/account.ts) defines named accounts with an `id`, password and registration names.
`AccountPrecondition` in [data/account-state.ts](data/account-state.ts) pairs an `account` with its starting
balance, setup deposits and existence flag. States refer to named IDs such as `newCustomer.id` and
`unregisteredAccount.id`. Scenario 8 selects `newCustomerAndRecipient` or `boundaryCustomerAndRecipient`
directly, using the account definitions for its registration inputs.

| Scenario                            | Case data                                                    | Spec                                                    |
| ----------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| 1. Registration rejected            | [Cases](data/scenarios/scenario-01-registration.ts)          | [Spec](tests/scenario-01-registration.spec.ts)          |
| 2. Login rejected                   | [Cases](data/scenarios/scenario-02-login.ts)                 | [Spec](tests/scenario-02-login.spec.ts)                 |
| 3. Deposit rejected                 | [Cases](data/scenarios/scenario-03-deposit.ts)               | [Spec](tests/scenario-03-deposit.spec.ts)               |
| 4. Withdrawal rejected              | [Cases](data/scenarios/scenario-04-withdrawal.ts)            | [Spec](tests/scenario-04-withdrawal.spec.ts)            |
| 5. Transfer rejected                | [Cases](data/scenarios/scenario-05-transfer.ts)              | [Spec](tests/scenario-05-transfer.spec.ts)              |
| 6. Bill payment rejected            | [Cases](data/scenarios/scenario-06-bill-payment-rejected.ts) | [Spec](tests/scenario-06-bill-payment-rejected.spec.ts) |
| 7. Bill payment succeeds            | [Cases](data/scenarios/scenario-07-bill-payment-success.ts)  | [Spec](tests/scenario-07-bill-payment-success.spec.ts)  |
| 8. Registration-to-transfer journey | [Cases](data/scenarios/scenario-08-registration-journey.ts)  | [Spec](tests/scenario-08-registration-journey.spec.ts)  |

### Support helpers

| File                                         | What it provides                                                                                                                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [fixtures.ts](support/fixtures.ts)           | `test` with one extra fixture, `openSession()`: a page in a fresh browser context, so a test can act as several customers.                                                                                                  |
| [preconditions.ts](support/preconditions.ts) | `prepareAccounts()`: empties the database, then registers, logs in and funds each account the case needs, through the UI.                                                                                                   |
| [database.ts](support/database.ts)           | The only direct database access. `clearAccounts()` resets the system before each case because the application cannot delete accounts.                                                                                       |
| [forms.ts](support/forms.ts)                 | Each `fill…Form()` helper fills fields and returns the form's validation field and confirmation button. `submitForm()` records native validation, clicks the button and returns observations for expected-output checks.    |
| [ui.ts](support/ui.ts)                       | `expectLoggedIn`, `expectTransaction`, `expectAccountPage` and `expectAccountUnchanged` check outputs. `register`, `login` and `transact` compose input and checks for account setup and verification in separate sessions. |
| [evidence.ts](support/evidence.ts)           | `captureActualOutput()`: attaches a screenshot named `actual-output` to the case; the report uses it as the Actual Output.                                                                                                  |
| [rejections.ts](support/rejections.ts)       | `expectRejection()` checks the specified error message using the submission's recorded validation, or reports that the browser blocked the form.                                                                            |

## Setup

Use Node.js 22.18+ or 24.11+ LTS and pnpm 11.24.0, pinned in `package.json`. From the repository root:

```bash
# Application dependencies
npm ci --prefix frontend
npm ci --prefix backend

# Playwright tooling
cd playwright_test
pnpm install --frozen-lockfile
pnpm run browsers:install          # on Linux, if needed: pnpm exec playwright install --with-deps chromium
```

The first run downloads a MongoDB server binary through `mongodb-memory-server`, so it needs network access.

## Run

Inside `playwright_test`:

```bash
pnpm test                          # all 49 cases, about 7 minutes
pnpm run test:demo                 # the 8 @demo cases, about 1.5 minutes
pnpm run test:demo --headed        # the same, with a visible browser
pnpm test --grep S5-TC01           # one case
pnpm run report                    # open the HTML report
pnpm run check                     # formatting, TypeScript and dead-code checks
```

Vite Plus is installed in this package. Run formatting commands inside `playwright_test`.

```bash
pnpm run format                    # apply formatting
pnpm run format:check              # check formatting
```

[vite.config.ts](vite.config.ts) defines the shared formatting options. `pnpm run check` checks
formatting, TypeScript and dead code. Generated reports, dependencies and the package lockfile are
excluded from formatting. See the [Vite Plus formatting guide](https://viteplus.dev/guide/fmt).

Support helpers accept named object arguments, including account matchers.

```ts
const form = await fillLoginForm({ page, account: sender.account });
await submitForm({ form });
await expectAccountPage({ page }).toHaveBalance({ balance: 1000 });
```

Ports 3000 and 4000 must be free: Playwright starts the React frontend on `http://localhost:3000`, and global setup
starts the Express backend on `http://localhost:4000` with a temporary MongoDB database that is discarded afterwards.
These URLs are the ones the application hard-codes for its API and CORS settings. Cases run one at a time
(`workers: 1`) because they share the workbook's account numbers.

## How a case runs

1. **Pre-condition.** `prepareAccounts` empties the database and builds the case's account state through the UI,
   each account in its own browser context. The test itself then starts signed out in a fresh context.
2. **Input.** Each form has a fill step using `fill…Form()` and a separate submit step using `submitForm()`.
   Successful and rejected actions use the same helpers. Every successful prefix action has a following
   `Expected output` step that checks its result before the next action starts. Bill-category selection is
   checked between filling and submitting, before a successful payment reloads the page.
3. **Expected output.** A rejected step is checked against the workbook's message, character for character. This
   check is a soft assertion: a wording mismatch fails the case, and the case still goes on to check the state.
4. **Post-condition.** The page is reloaded and the balance and history are compared with the expected values.
   Transfer cases also log in as the recipient in a separate context.

## Results

`pnpm run report` opens the HTML report; `test-results/results.json` has the same results in machine-readable form.
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
