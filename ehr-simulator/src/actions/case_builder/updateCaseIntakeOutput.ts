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

  const { data, error } = await supabase
    .from("cases")
    .update({
      intake_output_blocks: blocks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId)
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error(`Case not found for id ${caseId}`)
}
