import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import { createServerSupabase } from "@/utils/supabase/server";

export type PrivilegedRole = "admin" | "faculty";

export async function createRoleGatedClient(
  allowedRoles: readonly PrivilegedRole[],
): Promise<SupabaseClient> {
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

  if (!hasRole && !emailIsDevAdminAllowlist(user.email ?? undefined)) {
    throw new Error("You do not have permission to perform this action.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Database credentials are not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
