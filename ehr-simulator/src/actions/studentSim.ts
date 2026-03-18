import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { ActionResponse } from "./cases";
import { revalidatePath } from "next/cache";

export type EditableStudentNoteUpsert = Database['public']['Tables']['editable_clinical_documents']['Insert'];
export type EditableStudentNote = Database['public']['Tables']['editable_clinical_documents'];
export type ClinicalDocument = Database['public']['Tables']['clinical_documents'];

export async function submitStudentNote(note: EditableStudentNoteUpsert): Promise<ActionResponse<EditableStudentNote>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = supabase
    .from('editable_clinical_documentation')
    .upsert(note)
    .select()
    .single()

  if (error) {
    return {
      success: false,
      message: "Failed to record note. Please try again.",
      error
    };
  }
  revalidatePath('/editable_clinical_documentation')

  return {
    success: true,
    data,
    message: 'Successfully recorded note.'
  }

}

export async function getSimClinicalDocuments(caseId: string): Promise<ActionResponse<ClinicalDocument>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = supabase
    .from('clinical_documents')
    .select('*')
    .eq('case_id', caseId);

  if (error) {
    return {
      success: false,
      message: 'Failed to retrieve clinical documents',
      error
    }
  }
  return {
    success: true,
    data,
    message: 'Successfully retrieved clinical documents'
  }
}

export async function getClinicalDocumentsBySession(caseSessionId: string): Promise<ActionResponse<ClinicalDocument>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = supabase
    .from('editable_clinical_documents')
    .select('*')
    .eq('case_session_id', caseSessionId);

  if (error) {
    return {
      success: false,
      message: 'Failed to retrieve clinical documents',
      error
    }
  }
  return {
    success: true,
    data,
    message: 'Successfully retrieved clinical documents'
  }
}