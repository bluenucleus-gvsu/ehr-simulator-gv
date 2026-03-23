"use server"

import { SupabaseClient } from "@supabase/supabase-js";
import { MedicationAdministrationInsert, transformMedicationOrdersToSchema } from "@/lib/medicationTypes";
import { MedAdministrationInstance } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";

export async function updateMedications(
  supabase: SupabaseClient,
  payload: MedAdministrationInstance[],
  caseId: string
) {
  deleteMedications(supabase, caseId)
  insertMedications(
    supabase,
    transformMedicationOrdersToSchema(caseId, payload),
    caseId
  )
}

async function deleteMedications(supabase: SupabaseClient, caseId: string) {
  const { error: deleteErr } = await supabase
    .from("medication_administrations")
    .delete()
    .eq("case_id", caseId)
  if (deleteErr) throw deleteErr
}

async function insertMedications(
  supabase: SupabaseClient,
  medAdministrations: MedicationAdministrationInsert[],
  caseId: string
) {
  const { error: insertErr } = await supabase
    .from("medication_administrations")
    .insert(medAdministrations)
    .select("*")
    .eq("case_id", caseId)
  if (insertErr) throw insertErr
}
