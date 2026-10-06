"use server";

import { createServerSupabase } from "@/utils/supabase/server";
import { createServiceSupabase } from "@/utils/supabase/service";
import { SESSION_STATUS, isTerminalSessionStatus, normalizeSessionStatus } from "@/utils/sessionStatus";

const PRESIM_WRITE_MESSAGE =
  "Documentation is view-only in pre-sim mode.";

const TERMINAL_WRITE_MESSAGE = "This simulation has ended and is read-only.";

function sessionHasStarted(status: string | null, startedAt: string | null): boolean {
  const normalized = normalizeSessionStatus(status);
  return (
    Boolean(startedAt) ||
    normalized === SESSION_STATUS.InProgress
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

  const serviceSupabase = createServiceSupabase();

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

  if (isTerminalSessionStatus(session.status)) {
    return { allowed: false, message: TERMINAL_WRITE_MESSAGE };
  }

  if (!sessionHasStarted(session.status, session.started_at)) {
    return { allowed: false, message: PRESIM_WRITE_MESSAGE };
  }

  return { allowed: true };
}
