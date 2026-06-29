"use server";

import { createClient } from "@supabase/supabase-js";
import type { PhaseTabScope } from "@/lib/casePhases";
import { runWriteForMode } from "@/utils/testerWriteGateway";

/** Remove saved Orders / Labs / MAR rows for the given phases (one tab scope). */
export async function deleteCasePhaseData(
  caseId: string,
  scope: PhaseTabScope,
  phases: number[],
) {
  const unique = [...new Set(phases.filter((p) => Number.isFinite(p) && p >= 1))];
  if (unique.length === 0) return;

  return runWriteForMode(
    async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      for (const phase of unique) {
        switch (scope) {
          case "orders":
            await supabase.from("orders").delete().eq("case_id", caseId).eq("phase", phase);
            break;
          case "labs": {
            const { data: labs } = await supabase
              .from("lab_results")
              .select("id")
              .eq("case_id", caseId)
              .eq("phase", phase);
            const labIds = (labs ?? []).map((r) => r.id);
            if (labIds.length > 0) {
              await supabase.from("imaging_reports").delete().in("lab_id", labIds);
              await supabase.from("microbiology_reports").delete().in("lab_id", labIds);
            }
            await supabase.from("lab_results").delete().eq("case_id", caseId).eq("phase", phase);
            break;
          }
          case "medOrders":
            await supabase
              .from("medication_orders")
              .delete()
              .eq("case_id", caseId)
              .eq("phase", phase);
            break;
          case "mar":
            await supabase
              .from("medication_administrations")
              .delete()
              .eq("case_id", caseId)
              .eq("phase", phase);
            break;
        }
      }
    },
    async () => undefined,
  );
}

/** Remove all phased content above maxPhase across every tab scope. */
export async function deleteCasePhasesAbove(caseId: string, maxPhase: number) {
  if (maxPhase < 1) return;

  return runWriteForMode(
    async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      const above = (table: string) =>
        supabase.from(table).delete().eq("case_id", caseId).gt("phase", maxPhase);

      const { data: labs } = await supabase
        .from("lab_results")
        .select("id")
        .eq("case_id", caseId)
        .gt("phase", maxPhase);
      const labIds = (labs ?? []).map((r) => r.id);
      if (labIds.length > 0) {
        await supabase.from("imaging_reports").delete().in("lab_id", labIds);
        await supabase.from("microbiology_reports").delete().in("lab_id", labIds);
      }

      await Promise.all([
        above("orders"),
        above("lab_results"),
        above("medication_orders"),
        above("medication_administrations"),
      ]);
    },
    async () => undefined,
  );
}
