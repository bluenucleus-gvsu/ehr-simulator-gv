"use server";

import { createClient } from "@supabase/supabase-js";
import { clampPhaseCount } from "@/lib/casePhases";
import { runWriteForMode } from "@/utils/testerWriteGateway";

export async function updateCasePhaseCount(caseId: string, phaseCount: number) {
  const count = clampPhaseCount(phaseCount);

  return runWriteForMode(
    async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      const { data, error } = await supabase
        .from("cases")
        .update({ phase_count: count })
        .eq("id", caseId)
        .select("id, phase_count")
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    async () => ({
      id: caseId,
      phase_count: count,
    }),
  );
}
