import { test, expect, Page } from "@playwright/test";
import { routes } from "@/lib/routes";
import { authState } from "../../playwright/helpers/auth";

async function expectNotAuthorized(page: Page) {
  await expect(page.getByRole("heading", { name: "Not authorized" })).toBeVisible();
}

test.describe("RBAC", () => {
  test.describe("student", () => {
    test.use({ storageState: authState("student") });

    test("cannot access /admin", async ({ page }) => {
      await page.goto(routes.admin.getHref());
      await expectNotAuthorized(page);
    });
  });

  test.describe("faculty", () => {
    test.use({ storageState: authState("faculty") });

    test("cannot access /admin", async ({ page }) => {
      await page.goto(routes.admin.getHref());
      await expect(page.getByRole("heading", { name: "DASHBOARD" })).toBeVisible();
    });

    // test("can access /faculty/:id", async ({ page }) => {
    //   const userId = await currentUserId(page);
    //   await page.goto(routes.faculty.getHref(userId));
    //   await expect(page.getByRole("heading", { name: "E2E Faculty" })).toBeVisible();
    // });
  });

  test.describe("admin", () => {
    test.use({ storageState: authState("admin") });

    test("can access /admin", async ({ page }) => {
      await page.goto(routes.admin.getHref());
      await expect(page.getByRole("heading", { name: "DASHBOARD" })).toBeVisible();
    });

  });
});
