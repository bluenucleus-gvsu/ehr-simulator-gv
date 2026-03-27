"use server"

import { createClient } from "@supabase/supabase-js";
import { TablesInsert, Tables } from "../../database.types";
import { ActionResponse } from "./cases";
import { revalidatePath } from "next/cache";


export async function getClinicalDocuments(caseId: string): Promise<ActionResponse<Tables<"clinical_documents">[]>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('clinical_documents')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  if (error) return { success: false, message: 'Failed to fetch clinical documents.', error }
  return { success: true, message: 'ok', data }
}

export async function replaceClinicalDocuments(
  caseId: string,
  entries: TablesInsert<"clinical_documents">[]
): Promise<ActionResponse> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: deleteError } = await supabase
    .from('clinical_documents')
    .delete()
    .eq('case_id', caseId)

  if (deleteError) return { success: false, message: 'Failed to clear clinical documents.', error: deleteError }

  if (entries.length === 0) return { success: true, message: 'Clinical documents cleared.' }

  const { error: insertError } = await supabase
    .from('clinical_documents')
    .insert(entries.map(e => ({ ...e, case_id: caseId })))

  if (insertError) return { success: false, message: 'Failed to insert clinical documents.', error: insertError }

  revalidatePath('/admin/cases')
  return { success: true, message: 'Clinical documents saved.' }
}