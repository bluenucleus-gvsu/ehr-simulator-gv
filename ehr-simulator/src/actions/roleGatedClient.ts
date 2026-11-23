import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import { createServerSupabase } from "@/utils/supabase/server";
import { Database } from "../../database.types";
import { UserRole } from "@/lib/userManagement";

export type PrivilegedRole = "admin" | "faculty";

export type RoleGateClient = {
  supabase: SupabaseClient<Database>;
  userId: string;
  role: UserRole;
};

export async function createRoleGatedClient(
  allowedRoles: readonly PrivilegedRole[],
): Promise<RoleGateClient> {
  const sessionClient = await createServerSupabase();
  const { data: { user }, error: userError } = await sessionClient.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to perform this action.");
  }

  const { data: profile, error: profileError } = await sessionClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const hasRole =
    !profileError &&
    !!profile?.role &&
    (allowedRoles as readonly string[]).includes(profile.role);

  if (!profile || (!hasRole && !emailIsDevAdminAllowlist(user.email ?? undefined))) {
    throw new Error("You do not have permission to perform this action.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Database credentials are not configured.");
  }

  return {
    supabase: createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    }),
    userId: user.id,
    role: profile.role
  }
}

