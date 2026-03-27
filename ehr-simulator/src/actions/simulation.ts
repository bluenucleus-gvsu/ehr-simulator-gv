'use server'

import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { ActionResponse, ExtractData } from "./cases";
import { UUID } from "crypto";
import { revalidatePath } from "next/cache";

export type EditableStudentNoteUpsert = Database['public']['Tables']['editable_clinical_documents']['Insert'];
export type EditableStudentNote = Database['public']['Tables']['editable_clinical_documents'];
export type ClinicalDocument = Database['public']['Tables']['clinical_documents'];
export type DatabaseMedicationOrder = Database['public']['Tables']['medication_orders'];
export type DatabaseMedAdministration = Database['public']['Views']['all_medication_administrations']['Row'];

export type StudentMedicationAdministration = Database['public']['Tables']['student_medication_administrations']['Insert'];
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
      message: 'Failed to submit note, please try again',
      error: error
    };
  }
  revalidatePath(`/simulation/${note.case_id}/${note.case_session_id}/chart/notes`);

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

  return {
    success: true,
    data,
    message: 'Successfully retrieved clinical documents'
  }
}

export async function getMedicationOrders(caseId: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('medication_orders')
    .select(`

    *,
    medications (
      id,
      generic_name,
      brand_name,
      route,
      strength,
      strength_unit,
      dispense_units (
        name
      ),
      infusion_rate_unit,
      diluent,
      total_volume,
      is_continuous 
    )
  `)
    .eq('case_id', caseId);

  if (error) {
    return {
      success: false,
      message: 'Failed to retrieve medication orders',
      error
    }
  }

  return {
    success: true,
    data,
    message: 'Successfully retrieved medication orders'
  }
}

export async function getMedicationAdministrations(caseId: string, sessionId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('all_medication_administrations')
    .select('*')
    .eq('case_id', caseId)
    .or(`case_session_id.eq.${sessionId},case_session_id.is.null`);
  ;

  if (error) {
    return {
      success: false,
      message: 'Failed to retrieve medication administrations',
      error
    }
  }

  return {
    success: true,
    data,
    message: 'Successfully retrieved medication administrations'
  }
}

type OrderAndMedicationType = ExtractData<typeof getMedicationOrders>;
export type DatabaseMedication = OrderAndMedicationType[number]["medications"]

// export async function getAllMedicationAdministrations(caseId: string, sessionId: string) {
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!
//   );

//   const { data, error } = supabase
//     .from('all_medication_administrations')
//     .select('*')
//     .eq('case_id', caseId)
//     .or(`case_session_id.eq.${sessionId},case_session_id.is.null`);

//   if (error) {
//     return {
//       success: false,
//       message: 'Failed to retrieve medication administration data',
//       error
//     }
//   }

//   revalidatePath(`/simulation/${caseId}/${sessionId}/chart/mar`);

//   return {
//     success: true,
//     data,
//     message: 'Successfully retrieved medication administration data'
//   }
// }

export async function submitMedicationAdministrations(
  medAdministrations: StudentMedicationAdministration[],
  caseId: string,
  sessionId: string
) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from('student_medication_administrations')
    .upsert(medAdministrations)
    .select()

  if (error) {
    return {
      success: false,
      message: 'Failed to document medications',
      error
    }
  }

  revalidatePath(`/simulation/${caseId}/${sessionId}/chart/mar`);

  return {
    success: true,
    data,
    message: 'Medications successfully documented'
  }

}
