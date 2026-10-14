import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../database.types";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import { createServerSupabase } from "@/utils/supabase/server";
import { createServiceSupabase } from "@/utils/supabase/service";

export type StaffRole = "admin" | "faculty";

async function verifyStaff(roles: StaffRole[]): Promise<{ userId: string; role: StaffRole } | null> {
  const sessionClient = await createServerSupabase();
  const { data: { user }, error: userError } = await sessionClient.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await sessionClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  const allowed = !profileError && (roles as string[]).includes(role ?? "");
  if (!allowed && !emailIsDevAdminAllowlist(user.email ?? undefined)) {
    return null;
  }

  return { userId: user.id, role: (role as StaffRole) ?? "admin" };
}

export async function isVerifiedStaff(
  roles: StaffRole[] = ["admin", "faculty"],
): Promise<boolean> {
  return (await verifyStaff(roles)) !== null;
}

export async function createStaffServiceClient(
  roles: StaffRole[] = ["admin", "faculty"],
): Promise<SupabaseClient<Database>> {
  const access = await verifyStaff(roles);

  if (!access) {
    throw new Error("You do not have permission to perform this action.");
  }

  return createServiceSupabase();
}
