"use server"

import type { SupabaseClient } from "@supabase/supabase-js";
import { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";
import { transformFlexSheetPayloadToSchema } from "@/lib/flexSheet/flexSheetHelpers";

type DocumentationSavePayload = {
  data: FlexSheetData[];
  timePoints: number[];
  timePointsInPreSim: number[];
};

export async function updateDocumentationResults(
  supabase: SupabaseClient,
  payload: DocumentationSavePayload,
  caseId: string,
) {
  const rows = transformFlexSheetPayloadToSchema(caseId, {
    data: payload.data ?? [],
    timePoints: payload.timePoints ?? [],
    timePointsInPreSim: new Set(payload.timePointsInPreSim ?? []),
  });
  const { error } = await supabase.rpc("case_builder_replace_documentation", {
    p_case_id: caseId,
    p_rows: rows,
  });
  if (error) throw new Error(error.message);
  return rows;
}
