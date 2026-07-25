"use server"

import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "../../database.types";
import { revalidatePath } from "next/cache";
import { createServiceRoleSupabase } from "@/utils/supabase/service";

export type SectionAssignment = Database['public']['Tables']['section_assignments']['Row'];
export type SectionAssignmentInsert = Database['public']['Tables']['section_assignments']['Insert'];
export type SimCase = Database['public']['Tables']['cases']['Row']
export type CaseSessionUpsert = Database['public']['Tables']['case_sessions']['Insert']

export type ActionResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T | null;
  error?: PostgrestError;
};

export async function getAllSimCases() {
  const supabase = createServiceRoleSupabase();

  const { data, error } = await supabase
    .from("cases")
    .select("*")

  if (error) {
    const result: ActionResponse = {
      success: false,
      message: 'Failed to retrieve Sim Cases',
      error,
      data
    }
    return result
  }

  return {
    success: true,
    data,
    message: 'Successfully retrieved Sim Cases'
  };
}

export async function getSimCaseById(id: string) {
  const supabase = createServiceRoleSupabase();

  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)

  if (error) {
    const result = {
      success: false,
      message: 'Failed to retrieve specified Sim Case',
      error,
      data
    }
    return result
  }
  return {
    success: true,
    data,
    message: 'Successfully retrieved Sim Cases'
  };
}


export async function getCaseByCourseId() {
  const supabase = createServiceRoleSupabase();

  const { data, error } = await supabase
    .from("cases")
    .select("*")
  // .eq("course_id", id) // Commented out to retrieve all cases for assignment. 

  if (error) {
    const result = {
      success: false,
      message: 'Failed to retrieve Sim Case paired with this course.',
      error,
      data
    }
    return result
  }

  return {
    success: true,
    data: data,
    message: 'Successfully retrieved Sim Cases paired with this course',
  };
}

export async function getSectionCaseAssignments(courseId: string) {
  const supabase = createServiceRoleSupabase();

  const { data, error } = await supabase
    .from('sections')
    .select(`
      id,
      name,
      meeting_time,
      section_assignments (
        id,
        sim_time,
        presim_time,
        case_sessions (
          id,
          status,
          started_at,
          completed_at
        ),
        cases!section_assignments_case_id_fkey (
          id,
          name,
          description,
          admitting_diagnosis
        )
      )
    `)
    .eq('course_id', courseId);

  if (error) {
    const result = {
      success: false,
      message: 'Failed to retrieve Sim Case paired with this course.',
      error,
      data: null
    };
    return result
  }

  // explicitly get TS to recognize cases as object, not array
  const cleanData = data?.map((item) => {
    const cleanedAssignments = item.section_assignments.map(assignment => {
      const assignmentSessions = Array.isArray((assignment as { case_sessions?: unknown[] }).case_sessions)
        ? ((assignment as { case_sessions?: unknown[] }).case_sessions as Array<{
          id: string;
          status: string | null;
          started_at: string | null;
          completed_at: string | null;
        }>)
        : [];
      const selectedSession =
        assignmentSessions.find((session) => session.status === 'in progress') ??
        assignmentSessions.find((session) => session.status === 'assigned') ??
        assignmentSessions.find((session) => session.status === 'unassigned') ??
        assignmentSessions[0] ??
        null;
      const _caseData = Array.isArray(assignment.cases)
        ? assignment.cases[0]
        : assignment.cases;

      return {
        ...assignment,
        cases: _caseData,
        session_id: selectedSession?.id ?? null,
        session_status: selectedSession?.status ?? null,
      };
    });

    return {
      ...item,
      section_assignments: cleanedAssignments
    };
  });

  return {
    success: true,
    message: 'Successfully retrieved Sim Assignment for this section.',
    data: cleanData,
  }
}

export async function createSectionCaseAssignment(payload: SectionAssignmentInsert): Promise<ActionResponse<SectionAssignment>> {
  const supabase = createServiceRoleSupabase();

  const { data, error } = await supabase
    .from('section_assignments')
    .upsert(payload)
    .select()
    .single()

  if (error) {
    console.error("Upsert Error:", error);
    return {
      success: false,
      message: "Failed to save the assignment. Please try again.",
      error
    };
  }

  revalidatePath('/courses');

  return {
    success: true,
    message: "Assignment saved successfully.",
    data
  };
}

export async function deleteSectionCaseAssignment(id: string): Promise<ActionResponse> {
  const supabase = createServiceRoleSupabase();

  const { error } = await supabase
    .from('section_assignments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Delete Error:", error);
    return {
      success: false,
      message: "Failed to delete assignment. Please try again.",
      error
    };
  }

  revalidatePath('/courses');

  return {
    success: true,
    message: "Assignment deleted successfully."
  };
}

export async function updateCaseSession(session: CaseSessionUpsert) {
  const supabase = createServiceRoleSupabase();

  const { error } = await supabase
    .from('case_sessions')
    .upsert(session);

  if (error) {
    return {
      success: false,
      message: 'Failed to update session data.',
      error,
      data: null
    };
  }

  return {
    success: true,
    message: 'Session data updated.',
    data: session,
  };
}

// extracts type of data from ActionResponse for use in frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractData<T extends (...args: any) => Promise<ActionResponse<any>>> =
  NonNullable<Awaited<ReturnType<T>>['data']>;

export type SectionSimulationsData = ExtractData<typeof getSectionCaseAssignments>;
export type CasesData = ExtractData<typeof getCaseByCourseId>;
