import { test, expect } from "@playwright/test";
import { authState } from "../../playwright/helpers/auth";

test.use({ storageState: authState("student") });

test("student can open their own profile", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "My Profile" })).toBeVisible();

  await page.getByRole("link", { name: "My Profile" }).click();

  await expect(page).toHaveURL(/\/user\/profile\/[0-9a-f-]{36}/);
});