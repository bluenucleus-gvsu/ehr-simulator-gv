# Playwright E2E Testing Guide

How Playwright tests authenticate and load, and how to write new e2e tests.

## How tests load
1. **webServer** — Playwright builds the app (`npm run build`) and starts a production server
    on :3100 (or reuses a running server on :3100). The e2e login route is enabled by the
    `ENABLE_E2E_LOGIN=1` env var set in the webServer command; it stays disabled in normal
    production deployments. Running e2e against a production build avoids dev-server
    (Turbopack) instability and bottlenecks under parallel browser load.
2. **globalSetup** (`playwright/global-setup.ts`) — provisions the three users (student, faculty, and admin)
3. **setup project** (`__tests__/e2e/auth.setup.e2e.ts`) — one `setup()` test per role that authenticates
    each user.


## Writing tests

### Single Role Test
```ts
import { test, expect } from "@playwright/test";
import { authState } from "@/../playwright/helpers/auth";

test.use({ storageState: authState("admin") });

test("opens the admin dashboard", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "DASHBOARD" })).toBeVisible();
});
```
`test.use` goes at file top (or inside a `test.describe` block) and applies to all tests in scope.


### Cross-role test (multiple roles in one test)
```ts
test("faculty starts a session, student charts", async ({ browser }) => {
  const faculty = await browser.newContext({ storageState: authState("faculty") });
  const student = await browser.newContext({ storageState: authState("student") });
  const facultyPage = await faculty.newPage();
  const studentPage = await student.newPage();
  // ...roles interact with the SAME backend (incl. realtime)...
  await Promise.all([faculty.close(), student.close()]);
});
```

## Isolation & data
- **Browser state** (cookies/localStorage) is isolated per context.
- **Backend** (Supabase/DB) is shared across all contexts, allowing for tests
    where roles interact with eachother. 

## Running
- `npm run test:e2e` (headless) or `npm run test:e2e:headed`.
- Sessions expire after ~1h; they're regenerated on every run by the setup project.

## Adding a role
Extend `ROLE_ACCOUNTS` in `playwright/helpers/auth.ts` — the setup project auto-generates its
`.auth/<role>.json`. (The `/auth/e2e-login` allowlist also needs the new email.)

## Troubleshooting
- **`storageState` file missing** → run the `setup` project (it's a dependency of `chromium`).
- **`/auth/e2e-login` returns 404** → the server was started without `ENABLE_E2E_LOGIN=1`
    (the e2e webServer command sets it automatically).
- **Returns 403** → email not in the allowlist.
- **Install required browser binaries** → run `npx playwright install` (installs all default browsers) or
   `npx playwright install firefox webkit` (installs specific engines).