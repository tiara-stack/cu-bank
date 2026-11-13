# CU Bank Playwright tests

TypeScript browser tests for all 49 cases in `CU_Bank_Test_Cases_8_Scenarios.xlsx`, sheet `Test_Cases`. Each test title starts with its workbook ID. Case definitions contain the inputs, account preconditions, and structured account outcomes defined by [TestCase](data/test-case.ts). Each case's `details` object contains Playwright's `tag` array and `annotation` array, including the workbook's expected output, precondition, and execution notes. Specs pass `example.details` directly to `test.effect`. The eight demo cases have the `@demo` tag.

## Scenario files

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

## Setup

Use Node.js 22 or later. Install the application and test dependencies from the repository root.

```bash
npm ci --prefix frontend
npm ci --prefix backend
cd playwright_test
npm ci
npm run browsers:install
```

On Linux, install Chromium system dependencies if needed.

```bash
npx playwright install --with-deps chromium
```

The first test run downloads a MongoDB server binary through `mongodb-memory-server`. Allow network access during that download.

## Run

Run these commands inside `playwright_test`.

```bash
npm test
npm run test:demo
npm test -- --grep S5-TC01
npm test -- --grep @bill-category-required
npm test -- --grep @bill-payment-rejection
npm run test:headed
npm run test:ui
npm run test:list
npm run check
npm run report
```

`npm run check` runs strict TypeScript checking and [fallow.rs](https://fallow.tools/docs/) dead-code and dependency analysis. Fallow discovers the Playwright configuration, global setup, and test files through its built-in plugin. The Fallow configuration excludes generated reports.

Browser helpers use [effect-playwright](https://github.com/Jobflow-io/effect-playwright) 0.9.0 with Effect 4. The custom fixtures are extended with Playwright and exported through `makeMethods(fixtures)`, following the library's custom-fixture integration. Specs use `test.effect` and obtain the active page and browser through `yield* Playwright.Page` and `yield* Playwright.Browser`. The integration provides the Effect runtime, test scope, and timeout interruption during fixture teardown. Fixture callbacks run setup programs through `Effect.runPromise`.

Additional browser contexts are acquired through effect-playwright and close when their Effect scope ends. The fixture uses [effect-mongodb](https://github.com/doubleloop-io/effect-mongodb) 0.9.0 with MongoDB driver 6 to clear the test data before each case. The scoped database client closes after clearing.

Expectations use rendered UI, browser validation, and native JavaScript dialogs. `expectAccountPage(page)` provides `toHaveBalance(balance)`, `toHaveHistoryCount(count)`, `toHaveHistory(transactions)`, and `toHaveName(name)`. Rejection messages use `expectRejection(error, { validation }).toHaveMessage(message)`. These helpers return Effects executed with `yield*`, such as `yield* expectAccountPage(page).toHaveBalance(0)`.

The shared `expect` uses Playwright's `expect.extend` in [support/matchers.ts](support/matchers.ts). It accepts wrapped and native pages and locators for `toHaveURL`, `toHaveText`, `toHaveCount`, `toBeVisible`, `toBeFocused`, and `toBeChecked`. An Effect adapter makes wrapped page and locator assertions return lazy Effects, executed with `yield* expect(locator).toHaveText('expected')`. Each execution runs the assertion again. Scalar assertions run synchronously, and native page and locator assertions return Promises. The adapter supports native matcher options, configured timeouts, `.not`, `.soft`, and custom messages. Actions synchronize through visible balances, histories, navigation, and dialog events. Registration captures the alert type and text, accepts the alert, and verifies navigation to Login.

In effect-playwright 0.9.0, Playwright reports test declaration locations in the integration adapter. Spec-file selection and workbook-ID filtering remain available. The package uses ES modules to load effect-playwright's ESM exports.

## Execution

Playwright starts the existing React frontend on `http://localhost:3000`. Global setup starts the existing Express backend on `http://localhost:4000` with a temporary MongoDB database and a generated test JWT secret. Leave both ports available. These URLs match the application's API URLs and CORS configuration.

Each case declares its own `accountState` and `accountOutcome` in its [scenario data file](data/scenarios). Reusable states in [data/account-state.ts](data/account-state.ts) name participants under `accounts.sender`, `accounts.recipient`, and other roles needed by the scenario. Each participant declares its account ID, credentials, starting balance, and setup deposits. `exists: false` marks a participant that must be absent at setup. A case can supply its own state object or override a reusable state.

`accountOutcome` declares the intended `unchanged` or `updated` outcome and expected account names, balances, and visible transaction histories. Its `accounts` map uses the same role names as the preconditions. Outcomes for a role override its seeded expectations or describe its expected creation. Seeded roles omitted from that map retain their setup expectations. `expectedAccounts.sender` and `expectedAccounts.recipient` are plain values derived from this data for the specs' UI assertions. The shared types and projection are in [data/account-outcome.ts](data/account-outcome.ts).

The fixture clears the temporary database, creates each existing participant through the UI, and applies its setup deposits through the UI. Each setup account uses a separate browser context. Setup verifies login, displayed name, balance, and history. Participants marked `exists: false` are left uncreated after clearing. The report includes the original workbook precondition and an `account-preconditions` attachment. The measured test starts in its own fresh browser context.

Registration and login cases prepare account A as `sender`. ZERO gives `sender` a zero balance and empty history, with `recipient` B at 200 and one setup deposit. FUNDED gives `sender` a balance of 1000 with one setup deposit. In registration journeys, `sender` identifies the new account and is initially absent. Account A is kept under `baseline`, and account B is `recipient`.

One worker runs the fixed workbook accounts sequentially. Global setup checks the worker count. Backend and temporary database cleanup runs at the end, including after failed assertions. Database operations use the URI created for this run.

Each scenario has a numbered spec file that imports its own case definitions directly and registers flat tests. `testFor(example)` extends the shared fixtures with that case's `accountState` and `accountOutcome`, then adds the Effect integration through `makeMethods`. The workbook ID is included in the test title, and `example.details` supplies the tags and annotations. Workflow tags such as `@withdrawal-rejection` and `@registration-journey` support CLI filtering. Bill-payment rejection cases use `@bill-category-selected` or `@bill-category-required` from `details.tag` to select the interaction. Each generated test runs navigation, login, and successful prefix steps in its Effect body using that case's starting balance and history. Case loops supply input variants within that scenario. Browser actions use ordinary functions and the application's `cid` selectors. Successful deposits and withdrawals are verified before later scenario steps. Transfer cases also open a separate recipient browser context. Specs receive expected account values from the `expectedAccounts` fixture.

Field-entry helpers in [support/forms.ts](support/forms.ts) accept named values for registration, login, deposits, withdrawals, transfers, and bill amounts. Amount helpers return the field locator for native validation and focus checks. Numeric fields use ordinary keyboard entry to exercise browser constraints.

Rejection specs explicitly record native validation, click Confirm, check the rejection, reload, and assert the account summary, history, and logged-in navigation. Browser-blocked submissions also check focus on the invalid field. The missing-category spec checks the radio's required-field validation message and focus. `expectRejection` provides `toHaveMessage` for the application-message assertion and records the browser's validation when it blocked submission. Rejection cases compare the visible history text before and after refresh. History assertions also validate the dates displayed in the UI.

MongoDB access is confined to clearing data in [the fixture](support/fixtures.ts). Account creation and funding use browser forms. Registration and login rejection cases verify the existing sender through a separate browser session. Transfer cases inspect both participants through their account pages. All application interactions originate from browser actions, and assertions evaluate UI state and native dialogs.

## Results

Open the HTML report with `npm run report`. Machine-readable results are in `test-results/results.json`. Failed cases retain screenshots, video, and traces. Native validation details and declared account outcomes are attached to individual test results.

Expected application messages retain the workbook wording, including punctuation and the registration alert `success`. Text discrepancies fail assertions. Soft assertions let the tests finish checking state and the successful registration-to-transfer journey after a wording failure.

Nonnumeric amounts use ordinary keyboard input. Decimal amounts retain the browser's integer-step validation. Cases attach the actual native validation and check the invalid field's focus after submitting. A missing specified application message is a failure in the report. The missing bill-category case asserts native required-field validation, as specified by S6-TC07.

The equality cases S4-TC02, S5-TC11, and S6-TC02 enforce the workbook's strict amount-less-than-balance rule. The workbook flags this rule for confirmation during defect classification. A prefix step that fails stops that case before its later action.
