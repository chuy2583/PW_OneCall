# PW_OneCall

End-to-end tests for the AstroFlow website (`https://astroflow.wingflows.com`), written with [Playwright](https://playwright.dev) and TypeScript.

The suite currently covers the **Request Quote** flow: it opens the home page, follows the "Request Quote" link, fills in the form, and checks the confirmation message shown after submitting.

> **Warning:** `tests/request.spec.ts` submits the real form on the production site. Each run creates a real quote request. Run it only when that is intended.

## Requirements

- [Node.js](https://nodejs.org) LTS
- npm (comes with Node.js)

## Setup

```bash
npm ci
npx playwright install --with-deps chromium
```

`npm ci` installs the exact versions from `package-lock.json`. The second command downloads the Chromium browser used by the tests.

## Running the tests

The `package.json` has no npm scripts, so use the Playwright CLI directly:

```bash
npx playwright test                       # run all tests
npx playwright test tests/request.spec.ts # run one file
npx playwright test --headed              # show the browser
npx playwright test --ui                  # open the interactive UI mode
npx playwright show-report                # open the last HTML report
```

## Project structure

```
PW_OneCall/
├── .github/
│   └── workflows/
│       └── playwright.yml     # CI: runs the tests on push and pull request
├── fixtures/
│   └── pages.fixtures.ts      # Custom test fixtures that provide page objects
├── pages/
│   ├── BasePage.ts            # Base class shared by all page objects
│   ├── HomePage.ts            # Page object for the home page
│   └── RequestPage.ts         # Page object for the Request Quote form
├── tests/
│   ├── example.spec.ts        # Playwright sample tests (playwright.dev)
│   └── request.spec.ts        # Request Quote end-to-end test
├── playwright.config.ts       # Playwright configuration
├── package.json               # Dependencies (Playwright and Node types)
└── package-lock.json          # Locked dependency versions
```

Generated folders such as `node_modules/`, `test-results/` and `playwright-report/` are listed in `.gitignore` and are not committed.

## How it works

### Configuration (`playwright.config.ts`)

- `testDir` is `./tests`, so every `*.spec.ts` file there is picked up.
- `baseURL` is `https://astroflow.wingflows.com`. Relative paths such as `page.goto('/')` are resolved against it.
- The tests run in Chromium (Desktop Chrome). Firefox, WebKit and mobile projects are present but commented out.
- The HTML reporter writes to `playwright-report/`.
- On failure the test keeps a screenshot and, on the first retry, a trace.
- On CI, tests run with 2 retries and one worker.

### Page objects (`pages/`)

Page objects keep selectors and page actions in one place, so a test reads as a list of steps.

- **`BasePage`** is an abstract class. It stores the Playwright `page` and provides `goto(path)`. Every page object extends it.
- **`HomePage`** defines the "Request Quote" link locator and `clickRequestButton()`.
- **`RequestPage`** defines the locators for every field of the form and provides:
  - `selectServices(services)`: checks the service checkboxes. These are custom controls, so it retries the click until `aria-checked` is `true`.
  - `fillRequestForm(data)`: fills all fields from a `RequestData` object.
  - `submitForm(timeoutMs)`: clicks "Submit Request" and returns the text of the confirmation alert.

The types in `RequestPage.ts` describe the valid input values:

- `ServiceName`: the six service checkboxes.
- `Industry` and `Timeline`: the values of the select options. They match the HTML `value` attributes, not the visible text. For example, use `'flexible'`, not `'Flexible'`.

### Fixtures (`fixtures/pages.fixtures.ts`)

`test` is extended with two fixtures, `homePage` and `requestPage`. Each one creates a page object from the `page` fixture that Playwright provides for each test. Tests import `test` and `expect` from this file, not from `@playwright/test`, so they receive the page objects as arguments.

```ts
import { test, expect } from '../fixtures/pages.fixtures';

test('example', async ({ homePage, requestPage }) => {
  // homePage and requestPage are ready to use
});
```

### Tests (`tests/`)

- **`request.spec.ts`** opens the home page, clicks "Request Quote", fills the form, submits it, and checks that the confirmation message is `Thank you for your request! We will contact you within 24 hours.`
- **`example.spec.ts`** is the sample file from the Playwright template. It tests `playwright.dev`, not this project.

### Continuous integration (`.github/workflows/playwright.yml`)

On every push and pull request to `main` or `master`, the workflow:

1. Installs Node.js LTS and runs `npm ci`.
2. Installs Playwright browsers with their system dependencies.
3. Runs `npx playwright test` (all tests, including `request.spec.ts`).
4. Uploads `playwright-report/` as an artifact, kept for 30 days.

Because of this, **every push or pull request submits a real quote request**. Consider limiting the form test to manual runs or running it against a test environment.

## Notes and known limitations

- The "Warehouse" field from earlier versions of the form does not exist on the current page. Services are selected with checkboxes.
- The Timeline `<select>` is `required` and its placeholder option has an empty value, so the browser blocks submitting until a real option is chosen.
- The types only check values at compile time. Playwright removes types without checking them, so a wrong value only shows as an error in the editor or with `npx tsc --noEmit`, not when the tests run.
