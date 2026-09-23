import { randomUUID } from "node:crypto";
import { mkdir } from "fs/promises";
import { resolve } from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  E2E_PASSWORD,
  ROLE_ACCOUNTS,
  createServiceClient,
  type RoleAccount,
} from "./helpers/auth";

async function ensurePublicUser(client: SupabaseClient, account: RoleAccount): Promise<void> {
  const { data: existingUser, error } = await client
    .from("users")
    .select("id")
    .eq("email", account.email)
    .maybeSingle();
  if (error) throw error;

  if (existingUser) {
    const { error: updateError } = await client
      .from("users")
      .update({ role: account.role, full_name: account.fullName, is_active: true })
      .eq("email", account.email);
    if (updateError) throw updateError;
    return;
  }

  const { error: insertError } = await client.from("users").insert({
    id: randomUUID(),
    email: account.email,
    role: account.role,
    full_name: account.fullName,
    is_active: true,
  });
  if (insertError) throw insertError;
}

async function findAuthUserId(client: SupabaseClient, email: string): Promise<string | null> {
  const { data, error } = await client.auth.admin.listUsers();

  if (error) {
    throw error;
  }

  const normalizedEmail = email.toLowerCase();
  return data?.users.find((user) => user.email?.toLowerCase() === normalizedEmail)?.id ?? null;
}

async function ensureAuthUser(client: SupabaseClient, account: RoleAccount): Promise<string> {
  const existingId = await findAuthUserId(client, account.email);

  if (existingId) {
    const { error } = await client.auth.admin.updateUserById(existingId, {
      password: E2E_PASSWORD,
      email_confirm: true,
    });

    if (error) throw error;

    return existingId;
  }

  const { data, error } = await client.auth.admin.createUser({
    email: account.email,
    password: E2E_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: account.fullName, role: account.role },
  });

  if (error) {
    throw error;
  }

  return data.user.id;
}

// The provisioned public.users row MUST be linked to the auth account by email
async function assertLinked(
  client: SupabaseClient,
  email: string,
  authUserId: string,
): Promise<void> {
  const { data, error } = await client
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(`[e2e] public.users row not found for ${email}`);
  }

  if (data.id !== authUserId) {
    throw new Error(
      `[e2e] public.users row for ${email} has id ${data.id} but the auth account is ` +
      `${authUserId}; link_new_user_profile did not link it.`,
    );
  }
}

export default async function globalSetup() {
  const client = createServiceClient();
  await mkdir(resolve(process.cwd(), "playwright", ".auth"), { recursive: true });

  for (const account of ROLE_ACCOUNTS) {
    await ensurePublicUser(client, account);

    const authUserId = await ensureAuthUser(client, account);

    await assertLinked(client, account.email, authUserId);
    console.log(`[e2e] provisioned ${account.role} -> ${account.email} (${authUserId})`);
  }
}