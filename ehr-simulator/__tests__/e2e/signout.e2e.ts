import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { BASE_URL, E2E_PASSWORD, ROLE_ACCOUNTS, currentUserId } from "../../playwright/helpers/auth";

// get separate browser context - signing out would ruin other test's authentication
async function createBrowserContext(
  browser: Browser,
  role: "admin" | "faculty" | "student",
): Promise<{ context: BrowserContext; page: Page }> {
  const account = ROLE_ACCOUNTS.find((a) => a.role === role);

  if (!account) {
    throw new Error(`[e2e] unknown role ${role}`);
  }

  const context = await browser.newContext();
  const response = await context.request.post(`${BASE_URL}/auth/e2e-login`, {
    data: { email: account.email, password: E2E_PASSWORD },
  });

  expect(response.ok()).toBeTruthy();

  const page = await context.newPage();
  return { context, page };
}

async function expectSignedOut(page: Page) {
  await expect(page).toHaveURL(/\/auth\/login/);
  // A follow-up navigation to "/" must bounce back to login, proving the session cookie is gone.
  await page.goto("/");
  await expect(page).toHaveURL(/\/auth\/login/);
}

test.describe("sign out", () => {
  test.describe("admin", () => {
    test("logs out from the sidebar", async ({ browser }) => {
      const { context, page } = await createBrowserContext(browser, "admin");
      try {
        await page.goto("/admin");
        await page.getByRole("button", { name: "Logout" }).click();
        await expectSignedOut(page);
      } finally {
        await context.close();
      }
    });
  });

  test.describe("faculty", () => {
    test("logs out from the faculty header", async ({ browser }) => {
      const { context, page } = await createBrowserContext(browser, "faculty");
      try {
        const userId = await currentUserId(page);
        await page.goto(`/faculty/${userId}`);
        await page.getByRole("button", { name: "Logout" }).click();
        await expectSignedOut(page);
      } finally {
        await context.close();
      }
    });
  });

  test.describe("student", () => {
    test("logs out from the profile header", async ({ browser }) => {
      const { context, page } = await createBrowserContext(browser, "student");
      try {
        const userId = await currentUserId(page);
        await page.goto(`/user/profile/${userId}`);
        await page.getByRole("button", { name: "Logout" }).click();
        await expectSignedOut(page);
      } finally {
        await context.close();
      }
    });
  });
});
