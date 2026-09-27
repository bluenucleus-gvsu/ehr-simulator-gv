"use server"

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../database.types";

export async function updatePatientHistory(
  supabase: SupabaseClient<Database>,
  payload: unknown,
  caseId: string,
) {
  const { error } = await supabase.rpc("case_builder_replace_history", {
    p_case_id: caseId,
    p_history: payload,
  });
  if (error) throw new Error(error.message);
}
