"use server"

import { createClient } from "@supabase/supabase-js"
import { Database } from "../../database.types"
import { revalidatePath } from "next/cache"
import { ActionResponse } from "@/actions/cases"

export type LabResultRow = Database['public']['Tables']['lab_results']['Row']
export type LabResultInsert = Database['public']['Tables']['lab_results']['Insert']

export async function getLabResultsForCase(caseId: string): Promise<ActionResponse<LabResultRow[]>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('lab_results')
    .select('*')
    .eq('case_id', caseId)
    .order('time_offset')

  if (error) return { success: false, message: 'Failed to fetch lab results.', error }
  return { success: true, message: 'ok', data: data as LabResultRow[] }
}

export async function replaceLabResults(
  caseId: string,
  rows: LabResultInsert[]
): Promise<ActionResponse> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: deleteError } = await supabase
    .from('lab_results')
    .delete()
    .eq('case_id', caseId)

  if (deleteError) return { success: false, message: 'Failed to clear lab results.', error: deleteError }

  if (rows.length === 0) return { success: true, message: 'Lab results cleared.' }

  const { error: insertError } = await supabase
    .from('lab_results')
    .insert(rows.map(r => ({ ...r, case_id: caseId })))

  if (insertError) return { success: false, message: 'Failed to insert lab results.', error: insertError }

  revalidatePath('/admin/cases')
  return { success: true, message: 'Lab results saved.' }
}