"use server"

import type { SupabaseClient } from "@supabase/supabase-js";
import { transformLabTableToSchema, type LabColumn } from "@/lib/labTypes";
import type { LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";

export type LabSavePayload = {
  data: LabTableData[];
  columns: LabColumn[];
};

export async function updateLabs(
  supabase: SupabaseClient,
  payload: LabSavePayload,
  caseId: string,
) {
  const transformed = transformLabTableToSchema(caseId, {
    data: payload.data ?? [],
    columns: payload.columns ?? [],
  });
  const { error } = await supabase.rpc("case_builder_replace_labs", {
    p_case_id: caseId,
    p_lab_rows: transformed.labResults,
  });
  if (error) throw new Error(error.message);
  return transformed;
}