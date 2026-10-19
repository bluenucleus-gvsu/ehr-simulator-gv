import { config as loadEnv } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolve } from "path";
import type { Browser, BrowserContext, Page } from "@playwright/test";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const BASE_URL = "http://localhost:3000";
export const E2E_PASSWORD = "e2e-password123";

export interface RoleAccount {
  role: "student" | "faculty" | "admin";
  email: string;
  fullName: string;
}

export const ROLE_ACCOUNTS: RoleAccount[] = [
  { role: "admin", email: "e2e.admin@gvsu.edu", fullName: "E2E Admin" },
  { role: "faculty", email: "e2e.faculty@gvsu.edu", fullName: "E2E Faculty" },
  { role: "student", email: "e2e.student@mail.gvsu.edu", fullName: "E2E Student" },
];

export function createServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function authState(role: string): string {
  return resolve(process.cwd(), "playwright", ".auth", `${role}.json`);
}

/** Opens an authenticated browser context for a role (for cross-role tests). */
export async function authenticatedContext(
  browser: Browser,
  role: string,
): Promise<BrowserContext> {
  return browser.newContext({ storageState: authState(role) });
}

/** Resolves the signed-in user's id from the "My Profile" link on the home page. */
export async function currentUserId(page: Page): Promise<string> {
  await page.goto("/");
  const href = await page.getByRole("link", { name: "My Profile" }).getAttribute("href");
  const match = href?.match(/\/user\/profile\/([0-9a-f-]{36})/);
  if (!match) {
    throw new Error(`[e2e] could not resolve user id from My Profile href: ${href}`);
  }
  return match[1];
}