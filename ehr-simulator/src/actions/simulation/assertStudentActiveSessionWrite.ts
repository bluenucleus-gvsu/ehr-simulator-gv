"use server";

import { createServerSupabase } from "@/utils/supabase/server";
import { createServiceRoleSupabase } from "@/utils/supabase/service";

const PRESIM_WRITE_MESSAGE =
  "Documentation is view-only in pre-simulation. Enter the active simulation from your profile to make changes.";

function sessionHasStarted(status: string | null, startedAt: string | null): boolean {
  const normalized = (status ?? "").toLowerCase();
  return (
    Boolean(startedAt) ||
    normalized === "in progress" ||
    normalized === "completed"
  );
}

/**
 * Blocks student writes while the case session is still in pre-sim (not started).
 * Faculty/admin are not restricted here.
 */
export async function assertStudentActiveSessionWrite(
  caseSessionId: string,
): Promise<{ allowed: true } | { allowed: false; message: string }> {
  const authSupabase = await createServerSupabase();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user?.id) {
    return { allowed: false, message: "You must be signed in to save simulation data." };
  }

  const serviceSupabase = createServiceRoleSupabase();

  const { data: profile } = await serviceSupabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "").trim().toLowerCase();
  if (role !== "student") {
    return { allowed: true };
  }

  const { data: session, error } = await serviceSupabase
    .from("case_sessions")
    .select("status, started_at")
    .eq("id", caseSessionId)
    .maybeSingle();

  if (error || !session) {
    return { allowed: false, message: "Could not verify simulation session." };
  }

  if (!sessionHasStarted(session.status, session.started_at)) {
    return { allowed: false, message: PRESIM_WRITE_MESSAGE };
  }

  return { allowed: true };
}
