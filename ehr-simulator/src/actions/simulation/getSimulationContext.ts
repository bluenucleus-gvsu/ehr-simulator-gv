"use server";

import { createClient } from "@supabase/supabase-js";
import {
  resolveSimulationPhaseContext,
  type SimulationPhaseContext,
} from "@/lib/simPhases";
import { isTesterModeServer } from "@/utils/testerModeServer";

export interface SimulationRouteContext {
  routeId: string;
  caseId: string;
  source: "section_assignment" | "case_session" | "case";
}

/**
 * Resolve the chart URL `[sessionId]` segment to a `cases.id`.
 * Production links have used different foreign keys for that segment over time
 * (`section_assignments`, `case_sessions`); tester/dev may also use `cases.id`.
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
  if (assignment?.case_id) {
    return { routeId, caseId: assignment.case_id, source: "section_assignment" };
  }

  const { data: session, error: sessionError } = await supabase
    .from("case_sessions")
    .select("id, case_id")
    .eq("id", routeId)
    .maybeSingle();

  if (sessionError) throw sessionError;
  if (session?.case_id) {
    return { routeId, caseId: session.case_id, source: "case_session" };
  }

  const { data: caseRow, error: caseError } = await supabase
    .from("cases")
    .select("id")
    .eq("id", routeId)
    .maybeSingle();

  if (caseError) throw caseError;
  if (caseRow?.id) {
    return { routeId, caseId: caseRow.id, source: "case" };
  }

  if (await isTesterModeServer()) {
    return { routeId, caseId: routeId, source: "case" };
  }

  throw new Error(`Unable to resolve simulation route id: ${routeId}`);
}

/** Session + case phase state for student chart (defaults to phase 1). */
export async function getSimulationPhaseState(
  routeContext: SimulationRouteContext,
  casePhaseCount?: number | null,
): Promise<SimulationPhaseContext> {
  const phaseCount = casePhaseCount ?? 1;

  if (routeContext.source !== "case_session") {
    return resolveSimulationPhaseContext({ phaseCount, currentPhase: 1 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from("case_sessions")
    .select("current_phase")
    .eq("id", routeContext.routeId)
    .maybeSingle();

  if (error) throw error;

  return resolveSimulationPhaseContext({
    phaseCount,
    currentPhase: data?.current_phase ?? 1,
  });
}
