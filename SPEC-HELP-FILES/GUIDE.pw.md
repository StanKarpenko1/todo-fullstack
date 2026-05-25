# Playwright E2E Framework — Setup Guide

A project-agnostic reference for setting up a Playwright UI E2E suite that scales from one test to many features, many pages, and many engineers. Captures the patterns and rationale — not the exhaustive Playwright API (use the official docs for that).

Aimed at: bootstrapping a new project, or refactoring an ad-hoc suite into something maintainable.

---

## TL;DR — what this guide gives you

- A **feature-first folder structure** that mirrors how modern frontends organize themselves.
- A **POM convention** with verb-style methods that read like user intent.
- **Composable fixtures** via `mergeTests`, so adding a feature is a one-line change.
- A clean separation between **test data** (static JSON) and **test fixtures** (Playwright `test.extend`).
- An **authentication strategy** that drives the login UI exactly once (in the login spec) and reuses storage state everywhere else — making authenticated tests almost free.
- An **annotated `playwright.config.ts`** with sensible defaults and a rationale for each option.
- A **bootstrap checklist** at the end (§16) for setting up a new project from scratch.

---

## 1. Philosophy and goals

**Optimize for change, not initial setup.** E2E suites die when adding the 50th test takes as much effort as adding the 5th. Every pattern here is justified by what happens at scale — even when applied to a tiny first suite.

**Tests describe user intent, not DOM interactions.** A test reads "log in as standard user, expect dashboard visible" — not "fill #email, fill #password, click button, wait, query `.welcome-banner`."

**Localize change.** When a UI changes, the test files don't. When a route is renamed, one POM file changes. When a backend API changes, one service wrapper changes.

**No `waitForTimeout`.** Anywhere. Always wait for *something* (a URL, a locator state, an event), never for time.

**One assertion per behavior in a test.** Tests proving "after login, dashboard renders" assert two things (URL + a rendered element). Tests don't assert intermediate steps — those are waits, not assertions.

---

## 2. Folder structure (feature-first)

Recommended top-level layout:

```
tests-e2e/                                ← parent for all E2E concerns (UI + future API E2E)
├── fixtures/                             ← static test data — JSON only, framework-agnostic
│   └── users.json
│
└── playwright/                           ← Playwright workspace (own package.json, tsconfig)
    ├── features/                         ← feature-first vertical slices
    │   ├── <feature>/
    │   │   ├── pages/                    ← route-level POMs (one per URL)
    │   │   ├── components/               ← reusable UI fragments (dialogs, modals, widgets)
    │   │   ├── services/                 ← HTTP API client wrappers (no browser)
    │   │   └── fixtures.ts               ← feature-scoped `test.extend`
    │   └── shared/                       ← cross-feature UI (LAZY — create only when needed)
    │       ├── components/
    │       └── fixtures.ts
    │
    ├── framework/                        ← Playwright extensions + cross-cutting infrastructure
    │   ├── test.ts                       ← `mergeTests(...)` composer + re-export of `expect`
    │   ├── matchers.ts                   ← (later) custom expect matchers
    │   └── types.ts                      ← (later) shared TS types
    │
    ├── tests/                            ← actual spec files, mirroring feature names
    │   └── <feature>/
    │       └── *.spec.ts
    │
    ├── .auth/                            ← gitignored generated storage states
    │   └── <persona>.json
    │
    ├── global-setup.ts                   ← runs once: API login → write .auth/<persona>.json
    ├── playwright.config.ts
    ├── package.json
    └── tsconfig.json
```

**Why feature-first scales:**
- **Locality of change.** Working on auth means touching one folder — pages, components, services, fixtures all together.
- **Onboarding.** A new contributor learning the auth feature only needs to learn `features/auth/`.
- **Composability.** Each feature exports its own `test` from `fixtures.ts`; the framework composes them with `mergeTests`.
- **Mirrors modern frontends.** If your FE uses `src/features/auth/`, the test suite matching that gives one mental model for both halves.

**Anti-patterns:**
- Flat `pages/` at root with 50 POMs jumbled together.
- `pages/`, `services/`, `helpers/`, `utils/` siblings at root with no domain grouping.
- "Shared" folder created up front and used as a dumping ground.

---

## 3. The four test artifacts

Stop thinking "POMs" and start thinking in four distinct categories. Each has a clear scope.

| Artifact | What it wraps | Scope | Example |
|---|---|---|---|
| **Page** | A full route (URL maps to a page) | One per route | `LoginPage` → `/login` |
| **Component** | A reusable UI fragment that's *not* a route | Many per feature | `EditDialog`, `NavBar`, `ConfirmModal` |
| **Service** | An HTTP API wrapper (browser-free) | One per backend resource | `authApi`, `ordersApi` |
| **Fixture** | A `test.extend` definition injecting the above into tests | One per feature; composed via `mergeTests` | `features/auth/fixtures.ts` |

**Crucial distinction**: dialogs and modals are **components, not pages**. A confirm dialog isn't a route — it's an overlay that exists inside one or more pages. Its POM lives in `components/`, not `pages/`.

---

## 4. Page Object Model — design rules

A POM is a class. Its **methods are verbs** that describe user intent. Locators live inside; assertions live in tests.

### 4.1 The shape

```ts
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  // navigation
  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  // wait helpers (not assertions — they're navigation-equivalents)
  async expectVisible(): Promise<void> {
    await this.page.getByTestId('login-form').waitFor({ state: 'visible' });
  }

  // atomic actions — useful for field-level tests (validation, etc.)
  async enterEmail(email: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
  }
  async enterPassword(password: string): Promise<void> {
    await this.page.getByLabel('Password').fill(password);
  }
  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  // composite action — describes user intent at a higher level
  async loginAs(credentials: { email: string; password: string }): Promise<void> {
    await this.enterEmail(credentials.email);
    await this.enterPassword(credentials.password);
    await this.submit();
    await this.page.waitForURL(/\/dashboard$/);  // wait until the operation truly completes
  }
}
```

### 4.2 Rules

1. **Methods do, tests assert.** `expect(...)` calls belong in test files, not POMs. The only exception: waits that are logically part of a navigation (e.g., `waitForURL` after a form submit).
2. **No `waitForTimeout` ever.** Wait for things, not durations. Time-based waits make tests flaky and slow.
3. **Locators are owned by the POM.** Tests never touch raw selectors. When the DOM changes, one POM file changes.
4. **Provide both atomic and composite methods.** `enterEmail` / `submit` for field-level tests; `loginAs(...)` for the common case.
5. **Take typed args, not raw `Locator`s.** `enterEmail(email: string)` not `enterEmail(input: Locator)`.
6. **Don't return `Locator`s.** If callers need to interact with an element, expose a method for that intent.
7. **One POM per route for pages**; one POM per reusable fragment for components.

### 4.3 Naming

- `<Feature>Page` for routes: `LoginPage`, `DashboardPage`.
- `<Name>Dialog` / `<Name>Component` / `<Name>Modal` for fragments.
- File name matches class name (`LoginPage.ts`).

---

## 5. Test fixtures — composition

Playwright's `test.extend` is dependency injection. Each test receives an object with the dependencies it asked for; everything else is built lazily.

### 5.1 Per-feature `fixtures.ts`

```ts
// features/auth/fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

type AuthFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  registerPage: async ({ page }, use) => { await use(new RegisterPage(page)); },
});
```

### 5.2 `framework/test.ts` — the composer

```ts
import { mergeTests } from '@playwright/test';
import { test as authTest } from '../features/auth/fixtures';
import { test as ordersTest } from '../features/orders/fixtures';

export const test = mergeTests(authTest, ordersTest);
export { expect } from '@playwright/test';
```

Tests import only from here:

```ts
import { test, expect } from '../../framework/test';

test('user signs in', async ({ loginPage }) => { ... });
```

### 5.3 Rules

1. **Each feature owns one `fixtures.ts`.** All of that feature's POMs (pages + components) get injected here.
2. **`framework/test.ts` is the only place that re-exports `expect`.** Single source of truth. Tests never `import { expect } from '@playwright/test'`.
3. **Fixtures are lazy.** A test that doesn't destructure `registerPage` doesn't pay to instantiate it. Define generously, use selectively.
4. **Default scope is `test`** (one fixture instance per test). For expensive shared state (e.g., a logged-in API client), use `{ scope: 'worker' }`.
5. **Adding a feature is one line** in `framework/test.ts` — `import` + add to `mergeTests`.

---

## 6. Test data separation

Two completely different things share the word "fixture" in this ecosystem. Use distinct folder names:

| Term | What it is | Where it lives |
|---|---|---|
| **Test data fixtures** | Static input data (users, products, configs) | `tests-e2e/fixtures/*.json` |
| **Test fixtures** | Playwright `test.extend` definitions | `features/<feature>/fixtures.ts` and `framework/test.ts` |

### 6.1 Test data — recommended shape

```json
// tests-e2e/fixtures/users.json
{
  "standard": { "email": "standard.user@example.com", "password": "Password123!", "name": "Standard User" },
  "admin":    { "email": "admin.user@example.com",    "password": "Password123!", "name": "Admin User",    "role": "admin" }
}
```

Persona-keyed, not flat. Lets tests read like user stories: `users.standard.email`, `users.admin.email`.

### 6.2 Rules

1. **JSON, not TS.** Framework-agnostic — Playwright, Cypress, Supertest all consume JSON. TS modules require per-runner configuration.
2. **Use reserved-for-test domains** (`@example.com`, `@example.test`) — RFC 2606 reserves these so test data can never collide with real users.
3. **Passwords meet plausible future-stronger rules.** Pick something with upper/lower/digit/symbol even if current validation only requires 6 chars.
4. **Never commit real credentials.** Test users are not secrets; real keys/tokens are.
5. **Don't mutate fixtures from tests.** They're read-only constants.

---

## 7. Selector strategy

Priority order, from most to least preferred:

| Priority | Locator | Why |
|---|---|---|
| 1 | `getByRole('button', { name: 'Submit' })` | Semantic + accessible + matches what screen-readers see |
| 2 | `getByLabel('Email')` | Stable as long as labels don't change |
| 3 | `getByPlaceholder('Search...')` | Useful for inputs without labels |
| 4 | `getByTestId('user-menu')` | Explicit test handle. Use when role/label is ambiguous. |
| 5 | `getByText('Welcome back')` | OK for unique copy. Brittle if copy changes. |
| 6 | CSS / XPath | Last resort. Brittle to refactors. |

### 7.1 When to add `data-testid`

Add it when:
- Role/label is genuinely ambiguous (multiple buttons named "Submit" on screen).
- Element has no semantic meaning but you need to assert on it (a container `<div>` that proves the page rendered).
- The element exists for testing only (e.g., a hidden `<div data-testid="page-loaded">`).

Don't add it when a role/label would work — that just clutters the markup.

### 7.2 Naming `data-testid`

- kebab-case: `login-form-container`, `todo-list-empty-state`.
- Be specific: `submit-button` is bad (which submit button?), `register-submit-button` is good.

---

## 8. Authentication strategy

The single most important decision in an E2E suite. Get this wrong and either every test is slow, or your login UI failure cascades across the whole suite.

### 8.1 The rule

- **Login spec drives the UI.** This is the test of the login UI; no shortcuts.
- **Every other authenticated test uses `storageState`.** No UI login round-trip.

### 8.2 The mechanism

1. A `global-setup.ts` runs once before the entire suite.
2. It calls the backend's login endpoint via Playwright's `request` API (pure HTTP, no browser).
3. It writes the response (token, user, whatever your app stores) into a one-off browser context.
4. It saves that context's state to `.auth/<persona>.json` (gitignored).
5. `playwright.config.ts` sets `use: { storageState: '.auth/standard-user.json' }` as the default.
6. Tests that need to be **unauthenticated** (login, register, forgot-password) opt out per spec:

```ts
// features/auth/tests/login.spec.ts
test.use({ storageState: { cookies: [], origins: [] } });
```

### 8.3 Why not log in via UI in `beforeEach` of every test

- Each UI login costs ~2 seconds. 50 tests × 2s = 100s of pure overhead.
- Makes every test depend on the login UI being healthy. One regression there turns the entire suite red.
- Duplicates the login test's coverage in every other test.

### 8.4 Per-worker auth state (advanced)

For very large suites, derive the storage state per worker rather than globally:

```ts
// playwright.config.ts
projects: [
  {
    name: 'authenticated',
    use: { storageState: '.auth/standard-user.json' },
    dependencies: ['setup'],
  },
  {
    name: 'setup',
    testMatch: /global-setup\.spec\.ts/,
  },
],
```

The "setup" project runs first, produces the storage state, and the "authenticated" project uses it.

### 8.5 Where the storage state file goes

- `.auth/` directory at the playwright root.
- Gitignored — it's a generated artifact and contains JWTs.
- Regenerated on every run via `global-setup`.

---

## 9. `playwright.config.ts` — annotated

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',                    // recurses into subfolders; mirrors features/ naming

  fullyParallel: true,                   // tests within a file also parallelize
                                         //   requires test isolation (each test self-contained)

  forbidOnly: !!process.env.CI,          // fail CI if `test.only` was left in code

  retries: process.env.CI ? 2 : 0,       // retry on CI, never locally
                                         //   locally you want failures loud, not flake-tolerant

  workers: process.env.CI ? 1 : undefined,
                                         // serial on CI (resource-constrained, easier logs)
                                         // half-cores locally (default)

  reporter: process.env.CI ? [['html'], ['github']] : 'html',

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
                                         // env-driven so the same suite runs against staging/prod
    storageState: '.auth/standard-user.json',
                                         // default authenticated state; specs override when needed
    trace: 'on-first-retry',             // record trace on retry — debugging without overhead
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,               // default timeout for individual actions
    navigationTimeout: 30_000,           // generous for slow page loads
  },

  globalSetup: require.resolve('./global-setup'),

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Uncomment when stable:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
  ],

  // Optional — manage your dev server from Playwright:
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120_000,
  // },
});
```

### 9.1 Key options explained

- **`trace: 'on-first-retry'`** — record a full execution trace only when a test fails and gets retried. Zero overhead on green tests; full debugging info on flakes.
- **`fullyParallel: true`** — tests within a single file run in parallel workers. Requires that tests don't share state. Strictly faster.
- **`workers: 1` on CI** — defensive default until tests are isolated enough to parallelize safely on resource-constrained runners.
- **`baseURL`** — `page.goto('/login')` becomes possible. Env-drivable so the same suite tests staging or prod.
- **`storageState` global default** — every test starts authenticated; login/register specs opt out per file.

### 9.2 When to enable `webServer`

Trade-off: convenience vs. flexibility.

**Enable when:**
- All services run locally as Node processes.
- You want `npx playwright test` to be self-bootstrapping.

**Skip when:**
- Backend or DB runs in Docker (Playwright can't elegantly manage that).
- You're testing against staging/prod URLs.
- You want faster startup for repeated runs (server already up).

---

## 10. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Smoke spec | `<feature>.smoke.spec.ts` | `login.smoke.spec.ts` |
| Regression spec | `<feature>.spec.ts` | `login.spec.ts` |
| Feature folder | kebab-case | `features/auth/`, `features/orders/` |
| Feature fixtures file | always `fixtures.ts` | `features/auth/fixtures.ts` |
| Test folder mirror | mirror feature names | `tests/auth/`, `tests/orders/` |
| POM file (page) | PascalCase + `Page` suffix | `LoginPage.ts` |
| POM class (page) | matches filename | `class LoginPage` |
| POM file (component) | PascalCase + `Component`/`Dialog`/`Modal` | `ConfirmDialog.ts` |
| Service module | camelCase + `Api` suffix | `authApi.ts`, `ordersApi.ts` |
| Setup file | kebab-case | `global-setup.ts` |
| Generated state file | kebab-case | `standard-user.json` |
| Test data file | lowercase noun-plural | `users.json`, `products.json` |
| Test data persona key | camelCase or single noun | `standard`, `admin`, `readOnly` |

### 10.1 Inside specs

- One `test.describe(...)` per file, named after feature + tier: `test.describe('Login — smoke', () => {})`.
- Test titles imperative; describe behavior; no "should": `'standard user signs in and reaches dashboard'`.

### 10.2 Filtering by tier (consequence of the naming)

- Smoke only: `playwright test "**/*.smoke.spec.ts"`
- Regression only: `playwright test --grep-invert smoke`
- One feature: `playwright test tests/auth/`

---

## 11. Spec file patterns

### 11.1 Minimum viable spec

```ts
import { test, expect } from '../../framework/test';
import users from '../../../fixtures/users.json';

test.describe('Login — smoke', () => {
  test('standard user signs in and reaches dashboard', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.expectVisible();
    await loginPage.loginAs(users.standard);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('dashboard-container')).toBeVisible();
  });
});
```

### 11.2 Rules

1. **One `describe` per file.** Group tests by feature/tier, not by random topic.
2. **Imperative test titles.** "user signs in" not "should sign in user". Reads like a checklist.
3. **Two assertions for a smoke test.** URL change *and* a visible element on the destination. URL alone proves routing, element proves rendering.
4. **No conditional logic in tests.** `if (condition) expect(...)` is a code smell — split into two tests or move to a helper.
5. **Tests are independent.** Each must run alone in any order. No "test 1 creates user, test 2 uses it" coupling.
6. **No raw selectors.** All DOM access goes through POMs.

### 11.3 What NOT to do

```ts
// Bad
await page.fill('input[name="email"]', 'test@example.com');  // raw selector
await page.fill('input[name="password"]', 'hunter2');         // raw selector + raw data
await page.click('button[type="submit"]');                    // raw selector
await page.waitForTimeout(2000);                              // forbidden
expect(await page.locator('.dashboard').isVisible()).toBe(true);  // non-auto-waiting assertion
```

```ts
// Good
await loginPage.loginAs(users.standard);
await expect(page).toHaveURL(/\/dashboard$/);
await expect(page.getByTestId('dashboard-container')).toBeVisible();
```

---

## 12. Scaling patterns

### 12.1 When to introduce each pattern

| Trigger | Pattern to introduce |
|---|---|
| 1st test | Feature-first folder, `framework/test.ts`, one `fixtures.ts`. |
| 2nd feature | Add `features/<new>/fixtures.ts`, one-line update to `framework/test.ts`. |
| Path imports reach `../../../` | Add `tsconfig.json` path aliases (e.g., `@features/auth/LoginPage`). |
| Same setup needed across 20+ tests | Storage state via `global-setup`. |
| Tests start race-conditioning on shared DB | Per-worker fixture users (workerStorageState pattern). |
| CI takes >10min | Sharding (`--shard=1/3` across 3 CI jobs). |
| Same component reused in 2+ features | Move to `features/shared/components/`. |

### 12.2 Path aliases

When imports get deep, add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@framework/*": ["framework/*"],
      "@features/*":  ["features/*"],
      "@fixtures/*":  ["../fixtures/*"]
    }
  }
}
```

Then: `import { LoginPage } from '@features/auth/pages/LoginPage'`.

### 12.3 Sharding (CI parallelism)

Split tests across N CI machines:

```yaml
# .github/workflows/e2e.yml
strategy:
  matrix:
    shard: [1, 2, 3]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/3
```

Each machine runs ⅓ of the suite. Reports can be merged post-run via `playwright merge-reports`.

---

## 13. CI considerations

### 13.1 Defaults that matter on CI

- `workers: 1` — defensive until tests are isolated.
- `retries: 2` — flake tolerance.
- `forbidOnly: true` — fail if `.only` was left in code.
- `reporter: [['html'], ['github']]` — HTML for artifact, github for inline PR comments.

### 13.2 Storing artifacts

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: tests-e2e/playwright/playwright-report/
    retention-days: 14
```

Downloadable `index.html` with screenshots, videos, and trace viewer links per failure.

### 13.3 Trace viewer for failures

In any failure:
```bash
npx playwright show-trace path/to/trace.zip
```

Opens a time-travel debugger — every action, every DOM snapshot, every network call, scrubbable timeline.

---

## 14. Common pitfalls

| Anti-pattern | Why it's bad | Fix |
|---|---|---|
| `await page.waitForTimeout(2000)` | Slow + flaky | Wait for a thing: `waitForURL`, `waitFor`, `toBeVisible` |
| Raw selectors in test bodies | Fragile to UI changes | Put locators in POMs |
| `expect` inside POMs | Mixes "do" and "assert" responsibilities | POMs do, tests assert. Use `locator.waitFor()` for waits |
| One giant `support/test.ts` with all fixtures | Doesn't scale past ~10 fixtures | Per-feature `fixtures.ts` + `mergeTests` |
| Logging in via UI in every test | ~2s overhead per test | `storageState` from `global-setup` |
| `data-testid` on every element | Markup clutter | Only when role/label is ambiguous |
| Tests depending on order | Brittle to reorganization | Each test sets up its own state |
| Hard-coded `http://localhost:5173` in tests | Can't run against staging | `baseURL` in config + `page.goto('/')` |
| Asserting on intermediate steps | Slow + noisy on failures | Assert on the final state |
| Mocking the backend in E2E tests | Defeats the point of E2E | Mock at unit/integration layer; E2E hits real backend |

---

## 15. Debug techniques

### 15.1 UI Mode — the day-to-day driver

```bash
npx playwright test --ui
```

Opens a dedicated UI window with:
- Test tree (click to run).
- Time-travel: scrub through DOM snapshots of every step.
- Watch mode: re-runs on file save.
- Pick-locator button.
- Network and console panels.

This is where most test development happens.

### 15.2 Debug mode — step-through

```bash
npx playwright test --debug
```

Launches headed browser + Playwright Inspector paused at first action. Step through one action at a time, inspect locators, eval expressions.

Tip: `await page.pause()` anywhere in a test pauses execution at that line — works without `--debug`.

### 15.3 Codegen — record and generate

```bash
npx playwright codegen http://localhost:5173
```

You click in the browser; Playwright writes test code in real time. Great for:
- Bootstrapping a flow you've never automated.
- Seeing which selectors Playwright would pick.

The output needs cleanup — codegen records actions but skimps on assertions and uses fallback selectors.

### 15.4 Show last report

```bash
npx playwright show-report
```

Opens the HTML report from the most recent run. Find failures → click → see screenshots, videos, traces.

### 15.5 Show a specific trace

```bash
npx playwright show-trace tests-e2e/playwright/test-results/<run>/trace.zip
```

Full time-travel debugger for one specific test execution.

---

## 16. Bootstrap checklist — setting up a new project

Step-by-step for a fresh project. Assumes you have the app's FE running on `:5173` and BE on `:5000` (adjust as needed).

```
[ ] 1. Create the workspace
       mkdir -p tests-e2e/playwright/{features,framework,tests,.auth}
       mkdir -p tests-e2e/fixtures
       cd tests-e2e/playwright
       npm init -y
       npm install -D @playwright/test @types/node
       npx playwright install

[ ] 2. Gitignore generated artifacts
       Add to .gitignore (project root):
         tests-e2e/playwright/.auth/
         tests-e2e/playwright/playwright-report/
         tests-e2e/playwright/test-results/
         tests-e2e/playwright/node_modules/

[ ] 3. tsconfig.json (in tests-e2e/playwright/)
       Compiler options: "target": "ESNext", "module": "commonjs",
       "moduleResolution": "node", "strict": true, "resolveJsonModule": true,
       "esModuleInterop": true, "skipLibCheck": true,
       "types": ["node", "@playwright/test"]

[ ] 4. playwright.config.ts (see §9 for full template)

[ ] 5. Test data: tests-e2e/fixtures/users.json
       { "standard": { "email": "...", "password": "..." } }

[ ] 6. First feature scaffold:
       features/<feature>/pages/<Feature>Page.ts       (the POM)
       features/<feature>/fixtures.ts                  (test.extend)

[ ] 7. framework/test.ts (mergeTests composer)

[ ] 8. First spec:
       tests/<feature>/<feature>.smoke.spec.ts

[ ] 9. Wire package.json scripts:
       "test:pw":         "playwright test"
       "test:pw:ui":      "playwright test --ui"
       "test:pw:headed":  "playwright test --headed"
       "test:pw:debug":   "playwright test --debug"
       "report:pw":       "playwright show-report"
       "codegen:pw":      "playwright codegen http://localhost:5173"

[ ] 10. Run: npm run test:pw:ui — verify green

[ ] 11. (When needed) global-setup.ts + storageState wiring

[ ] 12. (When needed) services/ folder + API helpers

[ ] 13. (When needed) Custom matchers in framework/matchers.ts

[ ] 14. (When needed) Path aliases in tsconfig.json
```

---

## 17. What this guide deliberately does NOT cover

- **Specific Playwright API reference** — see the official Playwright docs.
- **Visual regression testing** — separate concern; see Playwright's `toHaveScreenshot()` or specialized tools (Percy, Chromatic).
- **Accessibility audits** — separate concern; integrate `@axe-core/playwright` if needed.
- **Performance testing** — Playwright isn't the right tool; use Lighthouse / k6.
- **Component testing** — Playwright supports it (`@playwright/experimental-ct-react`), but it's a different paradigm. Keep that in a separate workspace from your E2E suite.
- **Cypress comparison** — different tool, different conventions.
- **Multi-app/microservice patterns** — cross-service E2E suites warrant their own guide.

---

## Quick reference card

| Need to... | Do this |
|---|---|
| Add a new POM | `features/<feature>/pages/<Name>Page.ts` + register in `features/<feature>/fixtures.ts` |
| Add a new feature | Create folder + `fixtures.ts` + add to `mergeTests` in `framework/test.ts` |
| Add a reusable dialog/modal | `features/<feature>/components/<Name>Dialog.ts` + register in `fixtures.ts` |
| Add an API helper | `features/<feature>/services/<name>Api.ts` |
| Run smoke only | `npx playwright test "**/*.smoke.spec.ts"` |
| Run one feature | `npx playwright test tests/<feature>/` |
| Debug a single failing test | `npx playwright test <file> --debug` |
| See last report | `npx playwright show-report` |
| Generate test from clicks | `npx playwright codegen <url>` |
