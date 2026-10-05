import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import { createServerSupabase } from "@/utils/supabase/server";

export async function createCaseBuilderAdminClient(): Promise<SupabaseClient> {
  const sessionClient = await createServerSupabase();
  const { data: { user }, error: userError } = await sessionClient.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to manage cases.");
  }

  const { data: profile, error: profileError } = await sessionClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = !profileError && profile?.role === "admin";
  if (!isAdmin && !emailIsDevAdminAllowlist(user.email ?? undefined)) {
    throw new Error("You do not have permission to manage cases.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Case-builder database credentials are not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
