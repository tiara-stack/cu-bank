# CU Bank Playwright tests

TypeScript browser tests for all 49 cases in `CU_Bank_Test_Cases_8_Scenarios.xlsx`, sheet `Test_Cases`. Each case is grouped under its workbook ID. Typed tags in [data/cases.ts](data/cases.ts) select workflow groups and interaction variants, and are passed through to Playwright. The eight demo cases have the `@demo` tag. Preconditions, expected messages, and execution notes are in the same case data.

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

Browser helpers use [effect-playwright](https://github.com/Jobflow-io/effect-playwright) 0.9.0 with Effect 4. The custom fixtures are extended with Playwright and exported through `makeMethods(fixtures)`, following the library's custom-fixture integration. Specs use `test.effect` and obtain the active page and browser through `yield* Playwright.Page` and `yield* Playwright.Browser`. The integration provides the Effect runtime, test scope, and timeout interruption during fixture teardown. Native setup hooks and fixture callbacks bridge their Effect programs with `Effect.scoped` and `Effect.runPromise`.

Additional browser contexts are acquired through effect-playwright and close when their Effect scope ends. The MongoDB fixture uses [effect-mongodb](https://github.com/doubleloop-io/effect-mongodb) 0.9.0 with its MongoDB driver 6 peer dependency. `MongoClient.connectScoped` closes the client when the fixture's Effect scope ends. Collection operations and cursors return Effects directly, and missing accounts use `Option`. Account and transaction schemas preserve extra MongoDB fields so rejection snapshots include IDs, credentials, metadata, and complete histories. Report attachments redact password hashes.

Locator assertions use the wrapper's `use` method to run native Playwright assertions with their auto-retry and soft-assertion behavior. Native event coordination arms response/dialog listeners before clicks.

In effect-playwright 0.9.0, Playwright reports test declaration locations in the integration adapter. Spec-file selection and workbook-ID filtering remain available. The package uses ES modules to load effect-playwright's ESM exports.

## Execution

Playwright starts the existing React frontend on `http://localhost:3000`. Global setup starts the existing Express backend on `http://localhost:4000` with a temporary MongoDB database and a generated test JWT secret. Leave both ports available. These URLs match the application's API URLs and CORS configuration.

Each case declares its own `accountState` in [data/cases.ts](data/cases.ts). Reusable states in [data/account-state.ts](data/account-state.ts) list the accounts to create, credentials, starting balances, setup deposits, and account IDs that must be absent. A case can supply its own state object or override a reusable state.

The fixture clears the temporary database, creates each required account through the UI, and applies its setup deposits through the UI. Each setup account uses a separate browser context. Setup checks the credentials by logging in and verifies the balance, exact history, account count, and required absences before running the case's hooks and actions. The report includes the original workbook precondition and an `account-preconditions` attachment. The measured test starts in its own fresh browser context.

Registration and login cases prepare the existing account A. ZERO gives A a zero balance and empty history, with B at 200 and one setup deposit. FUNDED gives A a balance of 1000 with one setup deposit. Registration journeys explicitly require both new-account IDs to be absent.

One worker runs the fixed workbook accounts sequentially. Global setup checks the worker count. Backend and temporary database cleanup runs at the end, including after failed assertions. Database operations use the URI created for this run.

Each scenario has its own spec file. Specs select cases by workflow tags such as `@withdrawal-rejection` and `@registration-journey`. Bill-payment rejection cases use `@bill-category-selected` or `@bill-category-required` to select the interaction. Rejection helpers receive an explicit message or required-field expectation. Each case uses its own Playwright scope to apply `test.use({ accountState: example.accountState })`. Shared login and successful prefix steps run in `beforeEach` hooks using that case's starting balance and history. Case loops supply input variants within that scenario. Browser actions use ordinary functions and the application's `cid` selectors. Successful deposits and withdrawals are verified before later scenario steps. Rejection tests compare all persisted account documents after refresh, including credentials and histories. Transfer cases also open a separate recipient browser context. Success cases check transaction targets, amounts, resulting balances, timestamps, and persistence. Direct database access clears fixtures and verifies persistence. All application HTTP requests originate from browser actions.

## Results

Open the HTML report with `npm run report`. Machine-readable results are in `test-results/results.json`. Failed cases retain screenshots, video, and traces. Native validation details and persisted account state are attached to individual test results.

Expected application messages retain the workbook wording, including punctuation and the registration alert `success`. Text discrepancies fail assertions. Soft assertions let the tests finish checking state and the successful registration-to-transfer journey after a wording failure.

Nonnumeric amounts use ordinary keyboard input. Decimal amounts retain the browser's integer-step validation. Cases attach the actual native validation and check that a blocked form sends no transaction request. A missing specified application message is a failure in the report. The missing bill-category case asserts native required-field validation, as specified by S6-TC07.

The equality cases S4-TC02, S5-TC11, and S6-TC02 enforce the workbook's strict amount-less-than-balance rule. The workbook flags this rule for confirmation during defect classification. A prefix step that fails stops that case before its later action.
