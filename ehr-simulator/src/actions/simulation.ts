'use server'

import { createClient, type PostgrestError } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { ActionResponse, ExtractData } from "./cases";
import { UUID } from "crypto";
import { revalidatePath } from "next/cache";
import { runWriteForMode } from "@/utils/testerWriteGateway";
import { isTesterModeServer } from "@/utils/testerModeServer";
import { assertStudentActiveSessionWrite } from "@/actions/simulation/assertStudentActiveSessionWrite";

export type EditableStudentNoteUpsert = Database['public']['Tables']['editable_clinical_documents']['Insert'];
export type EditableStudentNote = Database['public']['Tables']['editable_clinical_documents']['Row'];
export type ClinicalDocument = Database['public']['Tables']['clinical_documents']['Row'];
export type DatabaseMedicationOrder = Database['public']['Tables']['medication_orders'];
export type DatabaseMedAdministration = Database['public']['Views']['all_medication_administrations']['Row'];
export type DatabaseDocumentationInsert = Database['public']['Tables']['documentation_results']['Insert'];

export type StudentMedicationAdministration = Database['public']['Tables']['student_medication_administrations']['Insert'];
export type StudentMedicationAdministrationRow = Database['public']['Tables']['student_medication_administrations']['Row'];
export type DatabaseDocumentation = Database['public']['Views']['all_documentation_results']['Row'];

export type StudentDatabaseDocumentation = Database['public']['Tables']['editable_documentation_results']['Insert'];

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

export async function submitStudentNote(note: EditableStudentNoteUpsert): Promise<ActionResponse<EditableStudentNote | ClinicalDocument>> {
  const writeGuard = await assertStudentActiveSessionWrite(note.case_session_id);
  if (!writeGuard.allowed) {
    return { success: false, message: writeGuard.message };
  }

  return runWriteForMode(async () => {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('editable_clinical_documents')
      .insert(note)
      .select()
      .single()

    if ((error as { code?: string } | null)?.code === 'PGRST205') {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('clinical_documents')
        .insert({
          case_id: note.case_id,
          is_in_presim: note.is_in_presim ?? false,
          category: note.category,
          specialty: note.specialty,
          author: note.author,
          time_offset: note.time_offset,
          doc_text: note.doc_text,
        })
        .select()
        .single();

      if (!fallbackError) {
        revalidatePath(`/simulation/${note.case_id}/${note.case_session_id}/chart/notes`);
        return {
          success: true,
          data: fallbackData,
          message: 'Successfully recorded note.'
        }
      }

      return {
        success: false,
        message: `Failed to submit note, please try again (${fallbackError.message})`,
        error: fallbackError
      }
    }

    if (error) {
      return {
        success: false,
        message: `Failed to submit note, please try again (${error.message})`,
        error: error
      };
    }
    revalidatePath(`/simulation/${note.case_id}/${note.case_session_id}/chart/notes`);

    return {
      success: true,
      data,
      message: 'Successfully recorded note.'
    }
  }, async () => ({
    success: true,
    message: "Note saved locally for tester mode.",
    data: {
      ...note,
      id: crypto.randomUUID() as UUID,
    } as EditableStudentNote,
  }));
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

  if (!error) {
    return {
      success: true,
      data,
      message: 'Successfully retrieved clinical documents'
    }
  }

  if ((error as { code?: string }).code === 'PGRST205') {
    const [caseDocsRes, studentDocsRes] = await Promise.all([
      supabase
        .from('clinical_documents')
        .select('id, case_id, is_in_presim, category, specialty, author, time_offset, doc_text')
        .eq('case_id', caseId),
      supabase
        .from('editable_clinical_documents')
        .select('id, case_id, case_session_id, is_in_presim, category, specialty, author, time_offset, doc_text')
        .eq('case_id', caseId)
        .eq('case_session_id', caseSessionId),
    ])

    const studentDocsMissing = (studentDocsRes.error as { code?: string } | null)?.code === 'PGRST205'

    if (caseDocsRes.error || (studentDocsRes.error && !studentDocsMissing)) {
      return {
        success: false,
        message: 'Failed to retrieve clinical documents',
        error: caseDocsRes.error ?? studentDocsRes.error ?? error
      }
    }

    const merged: ClinicalDocumentView[] = [
      ...(caseDocsRes.data ?? []).map((row) => ({
        ...row,
        case_session_id: null,
        source_type: 'case_document',
      })),
      ...((studentDocsMissing ? [] : (studentDocsRes.data ?? [])).map((row) => ({
        ...row,
        source_type: 'student_document',
      }))),
    ]

    return {
      success: true,
      data: merged,
      message: 'Successfully retrieved clinical documents'
    }
  }

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
export async function getAllMedications() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('medications')
    .select(`*,
        dispense_units(
          name
        )
      `)
    .order('generic_name')

  if (error) {
    return {
      success: false,
      message: 'Failed to retrieve medications',
      error
    }
  }

  return {
    success: true,
    data,
    message: 'Successfully retrieved medications'
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
      is_variable_dose 
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
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('all_medication_administrations')
    .select('*')
    .eq('case_id', caseId)
    .or(`case_session_id.eq.${sessionId},case_session_id.is.null`);

  if (!error) {
    return {
      success: true,
      data: data ?? [],
      message: 'Successfully retrieved medication administrations'
    }
  }

  return {
    success: false,
    message: 'Failed to retrieve medication administrations',
    error
  }
}


type OrderAndMedicationType = ExtractData<typeof getMedicationOrders>;
export type DatabaseMedication = OrderAndMedicationType[number]["medications"]

export async function submitMedicationAdministrations(
  medAdministrations: StudentMedicationAdministration[],
  caseId: string,
  sessionId: string
) {
  const writeGuard = await assertStudentActiveSessionWrite(sessionId);
  if (!writeGuard.allowed) {
    return {
      success: false,
      message: writeGuard.message,
    };
  }

  return runWriteForMode<{
    success: boolean;
    message: string;
    data?: StudentMedicationAdministrationRow[];
    error?: PostgrestError | null;
  }>(async () => {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error } = await supabase
      .from('student_medication_administrations')
      .upsert(medAdministrations)
      .select()

    if ((error as { code?: string } | null)?.code === 'PGRST205') {
      return {
        success: false,
        message: 'Failed to document medications (student medication administration table is missing; simulation writes are blocked to protect case baseline data)',
        error
      }
    }

    if (error) {
      return {
        success: false,
        message: `Failed to document medications (${error.message})`,
        error
      }
    }

    revalidatePath(`/simulation/${caseId}/${sessionId}/chart/mar`);

    return {
      success: true,
      data: data,
      message: 'Medications successfully documented'
    }
  }, async () => ({
    success: true,
    data: medAdministrations as unknown as StudentMedicationAdministrationRow[],
    message: "Medication administrations saved locally for tester mode.",
  }));
}

export async function getAllDocumentationData(caseId: string, sessionId: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('all_documentation_results')
    .select('*')
    .eq('case_id', caseId)
    .or(`case_session_id.eq.${sessionId},case_session_id.is.null`);

  if (!error) {
    return {
      success: true,
      data,
      message: 'Successfully retrieved documentation results.'
    }
  }

  if ((error as { code?: string }).code === 'PGRST205') {
    const [caseDocsRes, studentDocsRes] = await Promise.all([
      supabase
        .from('documentation_results')
        .select('*')
        .eq('case_id', caseId),
      supabase
        .from('editable_documentation_results')
        .select('*')
        .eq('case_id', caseId)
        .eq('case_session_id', sessionId),
    ])

    const studentDocsMissing = (studentDocsRes.error as { code?: string } | null)?.code === 'PGRST205'

    if (caseDocsRes.error || (studentDocsRes.error && !studentDocsMissing)) {
      return {
        success: false,
        message: 'Failed to retrieve documentation results.',
        error: caseDocsRes.error ?? studentDocsRes.error ?? error
      }
    }

    const merged = [
      ...((caseDocsRes.data ?? []).map((row) => ({
        ...row,
        case_session_id: null,
        user_id: null,
        group_id: null,
        source_type: 'case_documentation',
      }))),
      ...(((studentDocsMissing ? [] : (studentDocsRes.data ?? []))).map((row) => ({
        ...row,
        source_type: 'student_documentation',
      }))),
    ]

    return {
      success: true,
      data: merged,
      message: 'Successfully retrieved documentation results.'
    }
  }

  if (error) {
    return {
      success: false,
      message: 'Failed to retrieve documentation results.',
      error
    }
  }
}


export async function upsertDocumentationRows(payload: StudentDatabaseDocumentation[]) {
  const sessionId = payload[0]?.case_session_id;
  if (sessionId) {
    const writeGuard = await assertStudentActiveSessionWrite(sessionId);
    if (!writeGuard.allowed) {
      return { data: null, error: { message: writeGuard.message } as PostgrestError };
    }
  }

  return runWriteForMode<{ data: unknown; error: PostgrestError | null }>(async () => {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const unsupportedLegacyColumns = new Set([
      'spo2_source',
      'pain_location',
      'pain_characteristics',
      'pain_alleviating_factors',
      'pain_aggravating_factors',
      'pain_interventions',
      'urine_description',
    ]);

    const sanitizePayload = <T extends Record<string, unknown>>(rows: T[]): T[] =>
      rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).filter(([key]) => !unsupportedLegacyColumns.has(key))
        ) as T
      );

    const { data, error } = await supabase
      .from('editable_documentation_results')
      .upsert(payload, {
        onConflict: 'case_session_id, time_offset'
      });

    if (!error) {
      return { data, error: null };
    }

    // Some databases are missing newer documentation columns.
    // Retry with a legacy-safe payload before broader table fallbacks.
    const legacySafePayload = sanitizePayload(payload as Record<string, unknown>[]) as StudentDatabaseDocumentation[];
    if ((error as { code?: string } | null)?.code === '42703' || (error as { code?: string } | null)?.code === 'PGRST204') {
      const safeUpsertRes = await supabase
        .from('editable_documentation_results')
        .upsert(legacySafePayload, {
          onConflict: 'case_session_id, time_offset'
        });
      if (!safeUpsertRes.error) {
        return { data: safeUpsertRes.data, error: null };
      }
    }

    // Some environments miss the unique constraint needed by upsert.
    if ((error as { code?: string } | null)?.code === '42P10') {
      const insertRes = await supabase
        .from('editable_documentation_results')
        .insert(legacySafePayload);
      if (!insertRes.error) {
        return { data: insertRes.data, error: null };
      }
      return { data: insertRes.data, error: insertRes.error };
    }

    // Backward-compatible fallback for environments without editable_documentation_results.
    if ((error as { code?: string } | null)?.code === 'PGRST205') {
      const fallbackPayload: Database['public']['Tables']['documentation_results']['Insert'][] = legacySafePayload.map((row) => {
        const {
          case_session_id: _caseSessionId,
          user_id: _userId,
          group_id: _groupId,
          ...rest
        } = row;
        return {
          ...rest,
        };
      });

      const fallbackRes = await supabase
        .from('documentation_results')
        .insert(fallbackPayload);

      if (!fallbackRes.error) {
        return { data: fallbackRes.data, error: null };
      }
      return { data: fallbackRes.data, error: fallbackRes.error };
    }

    return { data, error };
  }, async () => ({ data: payload, error: null }));
}


export async function markSessionInProgress(sessionId: string) {
  // Compatibility wrapper for existing callers.
  return startSession(sessionId);
}

type SessionStatus = "assigned" | "in progress" | "completed" | "unassigned" | "archived" | null;

type SessionTransitionResult = {
  success: boolean;
  error?: unknown;
  message?: string;
};

function createServiceSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getSessionTransitionContext(sessionId: string) {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("case_sessions")
    .select("status, started_at, completed_at")
    .eq("id", sessionId)
    .single();

  if (error) throw error;

  return {
    supabase,
    session: data as { status: SessionStatus; started_at: string | null; completed_at: string | null },
  };
}

export async function startSession(sessionId: string): Promise<SessionTransitionResult> {
  if (await isTesterModeServer()) {
    return { success: true };
  }
  try {
    const { supabase, session } = await getSessionTransitionContext(sessionId);
    const currentStatus = session.status;

    if (currentStatus === "completed" || currentStatus === "archived") {
      return {
        success: false,
        message: `Cannot start session from status "${currentStatus}".`,
      };
    }

    const updates: { status: SessionStatus; started_at?: string } = {
      status: "in progress",
    };

    if (!session.started_at) {
      updates.started_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("case_sessions")
      .update(updates)
      .eq("id", sessionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Failed to start session:", error);
    return { success: false, error };
  }
}

export async function completeSession(sessionId: string): Promise<SessionTransitionResult> {
  if (await isTesterModeServer()) {
    return { success: true };
  }
  try {
    const { supabase, session } = await getSessionTransitionContext(sessionId);
    const currentStatus = session.status;

    if (currentStatus === "archived") {
      return {
        success: false,
        message: "Cannot complete an archived session.",
      };
    }

    const updates: { status: SessionStatus; started_at?: string; completed_at?: string } = {
      status: "completed",
      completed_at: session.completed_at ?? new Date().toISOString(),
    };

    if (!session.started_at) {
      updates.started_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("case_sessions")
      .update(updates)
      .eq("id", sessionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Failed to complete session:", error);
    return { success: false, error };
  }
}

export async function expireSession(sessionId: string): Promise<SessionTransitionResult> {
  if (await isTesterModeServer()) {
    return { success: true };
  }
  try {
    const { supabase, session } = await getSessionTransitionContext(sessionId);
    const currentStatus = session.status;

    if (currentStatus === "completed") {
      return {
        success: false,
        message: "Cannot expire a completed session.",
      };
    }

    if (currentStatus === "archived") {
      return { success: true };
    }

    const { error } = await supabase
      .from("case_sessions")
      .update({
        status: "archived",
      })
      .eq("id", sessionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Failed to expire session:", error);
    return { success: false, error };
  }
}

export async function updateCurrentPhase(updatedPhase: number, sessionId: string) {
  // Function used to updated the current_phase in case_sessions table
  // Used in faculty/components/FacultyCoursesView.tsx

  // Establish Connection
  const supabase = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
  
  // Update based on sessionId
  const { error } = await supabase
    .from("case_sessions")
    .update({ current_phase: updatedPhase
    })
    .eq("id", sessionId)

  // Return error 
  if (error) {
    return {
      success: false,
      message: "Failed to update current_phase.",
      error,
      data: null
    };
  }

  // Return successful 
  return {
        success: true,
        message: `current_phase updated:${sessionId}`,
        data: null,
    }
}