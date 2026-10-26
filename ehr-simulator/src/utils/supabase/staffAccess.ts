import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import { createServerSupabase } from "@/utils/supabase/server";

export type StaffAccess = {
  supabase: SupabaseClient;
  userId: string;
  role: "admin" | "faculty";
};

export async function createVerifiedStaffClient(): Promise<StaffAccess> {
  const sessionClient = await createServerSupabase();
  const { data: { user }, error: userError } = await sessionClient.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to manage simulations.");
  }

  const { data: profile } = await sessionClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role =
    profile?.role === "faculty" || profile?.role === "admin" ? profile.role : null;
  if (!role && !emailIsDevAdminAllowlist(user.email ?? undefined)) {
    throw new Error("You do not have permission to manage simulations.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Simulation database credentials are not configured.");
  }

  return {
    supabase: createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    userId: user.id,
    role: role ?? "admin",
  };
}
