import { test, expect, Page } from "@playwright/test";
import { routes } from "@/lib/routes";
import { authState } from "../../playwright/helpers/auth";

async function expectNotAuthorized(page: Page) {
  await expect(page.getByRole("heading", { name: "Not authorized" })).toBeVisible();
}

test.describe("RBAC", () => {
  test.describe("student", () => {
    test.use({ storageState: authState("student") });

    test("cannot access /workspace", async ({ page }) => {
      await page.goto(routes.workspace.getHref());
      await expectNotAuthorized(page);
    });

    test("cannot access /workspace/courses", async ({ page }) => {
      await page.goto(routes.workspace.courses.getHref());
      await expectNotAuthorized(page);
    });

    test("cannot access /workspace/case-builder", async ({ page }) => {
      await page.goto(routes.workspace.caseBuilder.form.getHref("demographics"));
      await expectNotAuthorized(page);
    });
  });

  test.describe("faculty", () => {
    test.use({ storageState: authState("faculty") });

    test("can access /workspace", async ({ page }) => {
      await page.goto(routes.workspace.getHref());
      await expect(page.getByRole("heading", { name: "DASHBOARD" })).toBeVisible();
    });

    test("cannot access /workspace/courses", async ({ page }) => {
      await page.goto(routes.workspace.courses.getHref());
      await expectNotAuthorized(page);
    });

    test("cannot access /workspace/case-builder", async ({ page }) => {
      await page.goto(routes.workspace.caseBuilder.form.getHref("demographics"));
      await expectNotAuthorized(page);
    });
  });

  test.describe("admin", () => {
    test.use({ storageState: authState("admin") });

    test("can access /workspace", async ({ page }) => {
      await page.goto(routes.workspace.getHref());
      await expect(page.getByRole("heading", { name: "DASHBOARD" })).toBeVisible();
    });

  });
});
