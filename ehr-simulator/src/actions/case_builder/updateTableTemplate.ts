"use server"

import { FlexSheetSection } from "@/lib/flexSheet/flexSheetSections";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateTableTemplate(
  supabase: SupabaseClient,
  payload: FlexSheetSection[],
  caseId: string,
) {

  const { data, error } = await supabase
    .from('cases')
    .update({ flexsheet_sections: payload })
    .eq('id', caseId)
    .select()

  if (error) throw new Error(error.message);
  if (!data) throw new Error(`Case not found for id: ${caseId}`)
}
