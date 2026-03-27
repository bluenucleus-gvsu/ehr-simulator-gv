"use server";

import { createClient } from "@supabase/supabase-js";

export interface SimulationRouteContext {
  routeId: string;
  caseId: string;
  source: "section_assignment" | "case_session" | "case";
}

export async function resolveSimulationRouteContext(routeId: string): Promise<SimulationRouteContext> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Primary path: student simulation links currently pass section_assignments.id.
  const { data: assignment, error: assignmentError } = await supabase
    .from("section_assignments")
    .select("id, case_id")
    .eq("id", routeId)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (assignment?.case_id) {
    return { routeId, caseId: assignment.case_id, source: "section_assignment" };
  }

  // Fallback path: completed-session ids can be case_sessions.id.
  const { data: session, error: sessionError } = await supabase
    .from("case_sessions")
    .select("id, case_id")
    .eq("id", routeId)
    .maybeSingle();

  if (sessionError) throw sessionError;
  if (session?.case_id) {
    return { routeId, caseId: session.case_id, source: "case_session" };
  }

  // Dev fallback: direct case id in URL.
  const { data: caseRow, error: caseError } = await supabase
    .from("cases")
    .select("id")
    .eq("id", routeId)
    .maybeSingle();

  if (caseError) throw caseError;
  if (caseRow?.id) {
    return { routeId, caseId: caseRow.id, source: "case" };
  }

  throw new Error(`Unable to resolve simulation route id: ${routeId}`);
}
