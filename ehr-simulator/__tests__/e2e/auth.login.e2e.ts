import { test, expect } from "@playwright/test";
import { authState } from "../../playwright/helpers/auth";

test("unauthenticated users are redirected to the login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(
    page.getByRole("heading", { name: /Welcome to the GVSU EHR Simulator/ }),
  ).toBeVisible();
});

test.describe("role sessions", () => {
  test.describe("student", () => {
    test.use({ storageState: authState("student") });

    test("loads the app with the student role", async ({ page }) => {
      await page.goto("/");
      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect.poll(() => page.evaluate(() => localStorage.getItem("role"))).toBe("student");
    });
  });

  test.describe("faculty", () => {
    test.use({ storageState: authState("faculty") });

    test("loads the app with the faculty role", async ({ page }) => {
      await page.goto("/");
      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect.poll(() => page.evaluate(() => localStorage.getItem("role"))).toBe("faculty");
    });
  });

  test.describe("admin", () => {
    test.use({ storageState: authState("admin") });

    test("loads the app with the admin role", async ({ page }) => {
      await page.goto("/");
      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect.poll(() => page.evaluate(() => localStorage.getItem("role"))).toBe("admin");
    });

    test("can open the admin dashboard", async ({ page }) => {
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "DASHBOARD" })).toBeVisible();
    });
  });
});