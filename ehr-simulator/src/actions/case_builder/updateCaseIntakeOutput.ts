"use server"

import { SupabaseClient } from "@supabase/supabase-js"
import type { IntakeOutputFormData } from "@/utils/form"

export async function updateCaseIntakeOutput(
  supabase: SupabaseClient,
  payload: IntakeOutputFormData[],
  caseId: string,
) {
  const blocks = [1, 2, 3, 4].map((blockId) => {
    const row = payload.find((p) => p.blockId === blockId)
    return {
      blockId,
      intake: Number(row?.intake) || 0,
      output: Number(row?.output) || 0,
    }
  })

  const { error } = await supabase
    .from("cases")
    .update({ intake_output_blocks: blocks })
    .eq("id", caseId)

  if (error) throw error
}
