"use server"

import { createClient, PostgrestError } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { revalidatePath } from "next/cache";
import { caseMeetsMinimumRequirements } from "@/lib/caseMinimumRequirements";
import {
  SESSION_STATUS,
  resolveAssignmentStatus,
} from "@/utils/sessionStatus";
import type { SectionAssignmentInsert, SectionAssignmentRow } from "@/types/db";

export type ActionResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T | null;
  error?: PostgrestError;
};

export type TerminalAssignmentStatus =
  | typeof SESSION_STATUS.Completed
  | typeof SESSION_STATUS.Archived;

export interface SimAssignment {
  id: string;
  simTime: string | null;
  presimTime: string | null;
  caseId: string | null;
  caseName: string;
  caseDescription: string;
  caseDiagnosis: string;
  sectionId: string;
  sectionName: string;
  terminalStatus: TerminalAssignmentStatus | null;
}

export interface CourseSection {
  id: string;
  name: string;
  meetingTime: string | null;
}

export async function getAllSimCases(options?: { usableOnly?: boolean }) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("cases")
    .select("*")

  if (error) {
    const result = {
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


export async function getAllCases() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("cases")
    .select("*")

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

function getTerminalStatus(sessions: { id: string; status: string | null; }[]): TerminalAssignmentStatus | null {
  return resolveAssignmentStatus(sessions.map((session) => session.status));
}

export async function getSectionCaseAssignments(
  courseId: string,
): Promise<ActionResponse<{ sections: CourseSection[]; assignments: SimAssignment[] }>> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
          status
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
    return {
      success: false,
      message: 'Failed to retrieve Sim Case paired with this course.',
      error,
      data: null
    };
  }

  const sections: CourseSection[] = [];
  const assignments: SimAssignment[] = [];

  for (const section of (data ?? [])) {
    sections.push({ id: section.id, name: section.name, meetingTime: section.meeting_time });

    for (const assignment of section.section_assignments ?? []) {
      const sessions = assignment.case_sessions ?? [];
      const caseRecord = assignment.cases;
      assignments.push({
        id: assignment.id,
        simTime: assignment.sim_time,
        presimTime: assignment.presim_time,
        caseId: caseRecord?.id ?? null,
        caseName: caseRecord?.name ?? "Unknown Case",
        caseDescription: caseRecord?.description ?? "",
        caseDiagnosis: caseRecord?.admitting_diagnosis ?? "",
        sectionId: section.id,
        sectionName: section.name,
        terminalStatus: getTerminalStatus(sessions),
      });
    }
  }

  return {
    success: true,
    message: 'Successfully retrieved Sim Assignment for this section.',
    data: { sections, assignments },
  }
}

export async function createSectionCaseAssignment(payload: SectionAssignmentInsert): Promise<ActionResponse<SectionAssignmentRow>> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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

  revalidatePath('/courses');

  return {
    success: true,
    message: "Assignment saved successfully.",
    data
  };
}

export async function deleteSectionCaseAssignment(id: string): Promise<ActionResponse> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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

// extracts type of data from ActionResponse for use in frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractData<T extends (...args: any) => Promise<ActionResponse<any>>> =
  NonNullable<Awaited<ReturnType<T>>['data']>;

export type SectionSimulationsData = ExtractData<typeof getSectionCaseAssignments>;
export type CasesData = ExtractData<typeof getAllCases>;
