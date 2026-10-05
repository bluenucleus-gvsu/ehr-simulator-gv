import { test as setup, expect } from "@playwright/test";
import {
  BASE_URL,
  E2E_PASSWORD,
  ROLE_ACCOUNTS,
  authState,
} from "../../playwright/helpers/auth";

for (const account of ROLE_ACCOUNTS) {
  setup(`authenticate as ${account.role}`, async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/e2e-login`, {
      data: {
        email: account.email,
        password: E2E_PASSWORD,
      },
    });

    expect(response.ok()).toBeTruthy();

    await request.storageState({ path: authState(account.role) });
  });
}