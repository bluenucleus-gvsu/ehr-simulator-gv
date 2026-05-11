"use server"

import { SupabaseClient } from "@supabase/supabase-js";
import { transformDocumentationTableToSchema } from "@/lib/documentationTypes";
import { DatabaseDocumentationInsert } from "../simulation";

export async function updateDocumentationResults(
  supabase: SupabaseClient,
  payload: any,
  caseId: string
) {

  const documentationResults = transformDocumentationTableToSchema(caseId, {
    data: payload.data ?? [],
    timePoints: payload.timePoints ?? [],
    timePointsInPreSim: new Set(payload.timePointsInPreSim ?? []),
  })

  await deleteDocumentationResults(supabase, caseId)
  return await saveDocumentationResults(supabase, documentationResults)
}

async function deleteDocumentationResults(supabase: SupabaseClient, caseId: string) {
  const { error: delErr } = await supabase
    .from("documentation_results")
    .delete()
    .eq("case_id", caseId)
  if (delErr) throw delErr
}

async function saveDocumentationResults(
  supabase: SupabaseClient,
  documentationResults: DatabaseDocumentationInsert[]) {

  if (documentationResults.length === 0) return []
  const { data, error } = await supabase
    .from("documentation_results")
    .insert(documentationResults)
    .select("id, case_id, time_offset")
  if (error) throw error

  return data
}
