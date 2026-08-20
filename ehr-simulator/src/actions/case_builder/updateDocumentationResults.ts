"use server"

import type { SupabaseClient } from "@supabase/supabase-js";
import { transformDocumentationTableToSchema } from "@/lib/documentationTypes";
import type { FlexSheetData } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";

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
  const rows = transformDocumentationTableToSchema(caseId, {
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
