import { test, expect, Page } from "@playwright/test";
import { authState, currentUserId } from "../../playwright/helpers/auth";

async function expectNotAuthorized(page: Page) {
  await expect(page.getByRole("heading", { name: "Not authorized" })).toBeVisible();
}

test.describe("RBAC", () => {
  test.describe("student", () => {
    test.use({ storageState: authState("student") });

    test("cannot access /admin", async ({ page }) => {
      await page.goto("/admin");
      await expectNotAuthorized(page);
    });

    test("cannot access /faculty/:id", async ({ page }) => {
      const userId = await currentUserId(page);
      await page.goto(`/faculty/${userId}`);
      await expectNotAuthorized(page);
    });
  });

  test.describe("faculty", () => {
    test.use({ storageState: authState("faculty") });

    test("cannot access /admin", async ({ page }) => {
      await page.goto("/admin");
      await expectNotAuthorized(page);
    });

    test("can access /faculty/:id", async ({ page }) => {
      const userId = await currentUserId(page);
      await page.goto(`/faculty/${userId}`);
      await expect(page.getByRole("heading", { name: "E2E Faculty" })).toBeVisible();
    });
  });

  test.describe("admin", () => {
    test.use({ storageState: authState("admin") });

    test("can access /admin", async ({ page }) => {
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "DASHBOARD" })).toBeVisible();
    });

    test("can access /faculty/:id", async ({ page }) => {
      const userId = await currentUserId(page);
      await page.goto(`/faculty/${userId}`);
      await expect(page.getByRole("heading", { name: "E2E Admin" })).toBeVisible();
    });
  });
});
