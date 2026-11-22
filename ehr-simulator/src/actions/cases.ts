"use server"

import { createClient, PostgrestError } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { revalidatePath } from "next/cache";
import { caseMeetsMinimumRequirements } from "@/lib/caseMinimumRequirements";
import { routes } from "@/lib/routes";
import { createRoleGatedClient } from "./roleGatedClient";

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

export async function getAllSimCases(options?: { usableOnly?: boolean }) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
    data: options?.usableOnly ? (data ?? []).filter(caseMeetsMinimumRequirements) : data,
    message: 'Successfully retrieved Sim Cases'
  };
}

export async function getSimCaseById(id: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
    data: data?.filter(caseMeetsMinimumRequirements) ?? [],
    message: 'Successfully retrieved Sim Cases'
  };
}


export async function getCaseByCourseId() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
    data: data?.filter(caseMeetsMinimumRequirements) ?? [],
    message: 'Successfully retrieved Sim Cases paired with this course',
  };
}

export async function getSectionCaseAssignments(courseId: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('sections')
    .select(`
      id,
      name,
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
    .eq('course_id', courseId)
    .eq('active', true);

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
  const { supabase } = await createRoleGatedClient(["admin"]);

  if (!payload.case_id) {
    return {
      success: false,
      message: "A case is required for this assignment.",
    };
  }

  const { data: simCase, error: caseError } = await supabase
    .from("cases")
    .select("first_name, last_name, description, age")
    .eq("id", payload.case_id)
    .maybeSingle();

  if (caseError || !simCase || !caseMeetsMinimumRequirements(simCase)) {
    return {
      success: false,
      message: "This case does not meet the minimum requirements for use.",
      error: caseError ?? undefined,
    };
  }

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

  revalidatePath(routes.workspace.courses.getHref(), 'layout');

  return {
    success: true,
    message: "Assignment saved successfully.",
    data
  };
}

export async function deleteSectionCaseAssignment(ids: string[]): Promise<ActionResponse> {
  if (ids.length === 0) {
    return { success: true, message: "Nothing to delete." };
  }

  try {
    const { supabase } = await createRoleGatedClient(["admin"]);

    const { error } = await supabase
      .from('section_assignments')
      .delete()
      .in('id', ids)

    if (error) {
      console.error("Delete Error:", error);
      return {
        success: false,
        message: "Failed to delete assignments. Please try again.",
        error
      };
    }

    revalidatePath(routes.workspace.courses.getHref(), 'layout');

    return {
      success: true,
      message: "Assignments deleted successfully."
    };
  } catch (err) {
    console.error("deleteSectionCaseAssignment authorization error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete assignments. Please try again.",
    };
  }
}

// extracts type of data from ActionResponse for use in frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractData<T extends (...args: any) => Promise<ActionResponse<any>>> =
  NonNullable<Awaited<ReturnType<T>>['data']>;

export type SectionSimulationsData = ExtractData<typeof getSectionCaseAssignments>;
export type CasesData = ExtractData<typeof getCaseByCourseId>;
