"use server"

import type { SupabaseClient } from "@supabase/supabase-js";
import { transformLabTableToSchema } from "@/lib/labTypes";
import type { LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";

type LabSavePayload = {
  data: LabTableData[];
  timePoints: number[];
  timePointsInPreSim: number[];
  visibleItems?: string[];
};

export async function updateLabs(
  supabase: SupabaseClient,
  payload: LabSavePayload,
  caseId: string,
) {
  const transformed = transformLabTableToSchema(caseId, {
    data: payload.data ?? [],
    timePoints: payload.timePoints ?? [],
    timePointsInPreSim: new Set(payload.timePointsInPreSim ?? []),
    visibleItems: new Set(payload.visibleItems ?? []),
  });
  const { error } = await supabase.rpc("case_builder_replace_labs", {
    p_case_id: caseId,
    p_lab_rows: transformed.labResults,
    p_imaging_rows: transformed.imagingReports,
    p_microbiology_rows: transformed.microbiologyReports,
  });
  if (error) throw new Error(error.message);
  return transformed;
}
