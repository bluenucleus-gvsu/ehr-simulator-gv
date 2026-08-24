"use server";

import { createClient } from "@supabase/supabase-js";
import { caseMeetsMinimumRequirements } from "@/lib/caseMinimumRequirements";

export interface SimulationRouteContext {
  routeId: string;
  caseId: string;
  source: "section_assignment" | "case_session" | "case";
}

/**
 * Resolve the chart URL `[sessionId]` segment to a `cases.id`.
 * Production links have used different foreign keys for that segment over time
 * (`section_assignments`, `case_sessions`); some legacy/admin flows may also use `cases.id`.
 */
export async function resolveSimulationRouteContext(routeId: string): Promise<SimulationRouteContext> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: assignment, error: assignmentError } = await supabase
    .from("section_assignments")
    .select("id, case_id")
    .eq("id", routeId)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  let resolved: SimulationRouteContext | null = assignment?.case_id
    ? { routeId, caseId: assignment.case_id, source: "section_assignment" }
    : null;

  if (!resolved) {
    const { data: session, error: sessionError } = await supabase
      .from("case_sessions")
      .select("id, case_id")
      .eq("id", routeId)
      .maybeSingle();

    if (sessionError) throw sessionError;
    if (session?.case_id) {
      resolved = { routeId, caseId: session.case_id, source: "case_session" };
    }
  }

  const caseId = resolved?.caseId ?? routeId;
  const { data: caseRow, error: caseError } = await supabase
    .from("cases")
    .select("id, first_name, last_name, description, date_of_birth")
    .eq("id", caseId)
    .maybeSingle();

  if (caseError) throw caseError;
  if (!caseRow?.id) {
    throw new Error(`Unable to resolve simulation route id: ${routeId}`);
  }
  if (!caseMeetsMinimumRequirements(caseRow)) {
    throw new Error("This case does not meet the minimum requirements for use.");
  }

  return resolved ?? { routeId, caseId: caseRow.id, source: "case" };
}
