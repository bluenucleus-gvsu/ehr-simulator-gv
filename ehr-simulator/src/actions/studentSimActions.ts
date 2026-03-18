import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { ActionResponse } from "./cases";
// import { revalidatePath } from "next/cache";
import { UUID } from "crypto";

export type EditableStudentNoteUpsert = Database['public']['Tables']['editable_clinical_documents']['Insert'];
export type EditableStudentNote = Database['public']['Tables']['editable_clinical_documents'];
export type ClinicalDocument = Database['public']['Tables']['clinical_documents'];
export type ClinicalDocumentView = {
  id: UUID,
  case_id: UUID,
  case_session_id: UUID | null,
  is_in_presim: boolean,
  category: string,
  specialty: string,
  author: string,
  time_offset: number,
  doc_text: string
  source_type: string
}

export async function submitStudentNote(note: EditableStudentNoteUpsert): Promise<ActionResponse<EditableStudentNote>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('editable_clinical_documents')
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
  // revalidatePath('/editable_clinical_documentation')

  return {
    success: true,
    data,
    message: 'Successfully recorded note.'
  }

}

export async function getAllClinicalDocuments(caseId: string, caseSessionId: string): Promise<ActionResponse<ClinicalDocumentView[]>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('all_clinical_documents')
    .select('*')
    .eq('case_id', caseId)
    .or(`case_session_id.eq.${caseSessionId},case_session_id.is.null`);

  if (error) {
    return {
      success: false,
      message: 'Failed to retrieve clinical documents',
      error
    }
  }

  // revalidatePath(`/simulation/${caseSessionId}/chart/notes`);

  return {
    success: true,
    data,
    message: 'Successfully retrieved clinical documents'
  }
}

