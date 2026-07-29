'use server'

import { createClient, type PostgrestError } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { ActionResponse, ExtractData } from "./cases";
import { UUID } from "crypto";
import { revalidatePath } from "next/cache";
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
  phase: number | null,
  category: string,
  specialty: string,
  author: string,
  time_offset: number,
  doc_text: string
  source_type: string
}

const resolvePreviewSessionId = (id: string) =>
  id === "preview" ? "00000000-0000-0000-0000-000000000000" : id;

export async function submitStudentNote(note: EditableStudentNoteUpsert): Promise<ActionResponse<EditableStudentNote | ClinicalDocument>> {
  const writeGuard = await assertStudentActiveSessionWrite(note.case_session_id);
  if (!writeGuard.allowed) {
    return { success: false, message: writeGuard.message };
  }

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
        phase: 1,
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
}

export async function getAllClinicalDocuments(caseId: string, sessionId: string): Promise<ActionResponse<ClinicalDocumentView[]>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  sessionId = resolvePreviewSessionId(sessionId);

  const { data, error } = await supabase
    .from('all_clinical_documents')
    .select('*')
    .eq('case_id', caseId)
    .or(`case_session_id.eq.${sessionId},case_session_id.is.null`);

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
        .select('id, case_id, is_in_presim, phase, category, specialty, author, time_offset, doc_text')
        .eq('case_id', caseId),
      supabase
        .from('editable_clinical_documents')
        .select('id, case_id, case_session_id, is_in_presim, category, specialty, author, time_offset, doc_text')
        .eq('case_id', caseId)
        .eq('case_session_id', sessionId),
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
        phase: 1,
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

  sessionId = resolvePreviewSessionId(sessionId);

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
}

export async function getAllDocumentationData(caseId: string, sessionId: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  sessionId = resolvePreviewSessionId(sessionId);

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

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('editable_documentation_results')
    .upsert(payload, {
      onConflict: 'case_session_id, time_offset'
    });

  if (!error) {
    return { data, error: null };
  }

  return { data, error };
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

export async function getCurrentPhases(
  groups: Array<{ id: string; caseSessionId?: string | null }>,
  fallbackSessionId?: string
) {
  const sessionIds = [...new Set(
    groups
      .map(g => g.caseSessionId ?? fallbackSessionId)
      .filter((id): id is string => Boolean(id))
  )];

  if (sessionIds.length === 0) {
    return { success: false, message: "Failed to fetch phases, no session Ids", data: null };
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("case_sessions")
    .select("id, current_phase")
    .in("id", sessionIds);

  if (error) {
    return { success: false, message: "Failed to fetch phases", error, data: null };
  }

  const groupPhaseMap: Record<string, number> = {};

  groups.forEach(group => {
    const sessionId = group.caseSessionId ?? fallbackSessionId;
    const session = data?.find(s => s.id === sessionId);
    if (session) {
      groupPhaseMap[group.id] = session.current_phase ?? 1;
    }
  });

  return { success: true, data: groupPhaseMap };
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
    .update({
      current_phase: updatedPhase
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

export async function updateSessionPhoto(photoUrl: string | null, sessionId: string) {
  const startedAt = Date.now();
  const supabase = createServiceRoleSupabase();

  try {
    // case_sessions.case_photo_url isn't in the generated types yet (added via migration; types need regen)
    const { error } = await supabase
      .from("case_sessions")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ case_photo_url: photoUrl } as any)
      .eq("id", sessionId)

    if (error) {
      console.warn('[update-session-photo] Supabase rejected the update', {
        sessionId,
        durationMs: Date.now() - startedAt,
        error: getErrorDetails(error),
      });

      return {
        success: false,
        message: "The photo could not be updated. Please try again.",
        error,
        data: null
      };
    }

    return {
      success: true,
      message: `case_photo_url updated:${sessionId}`,
      data: null,
    };
  } catch (error) {
    const errorDetails = getErrorDetails(error);

    console.error('[update-session-photo] Supabase request failed', {
      sessionId,
      durationMs: Date.now() - startedAt,
      error: errorDetails,
    });

    return {
      success: false,
      message:
        errorDetails.name === 'TimeoutError'
          ? "The photo update timed out. Please try again."
          : "The photo could not be updated. Please try again.",
      error: errorDetails,
      data: null,
    };
  }
}
