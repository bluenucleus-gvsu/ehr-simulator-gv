"use server"

import { createClient, PostgrestError } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { revalidatePath } from "next/cache";
import { runWriteForMode } from "@/utils/testerWriteGateway";

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
    data,
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
    data,
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
    data: data,
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
  return runWriteForMode(
    async () => {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

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
    },
    async () => ({
      success: true,
      message: "Assignment saved locally for tester mode.",
      data: { ...(payload as SectionAssignment), id: payload.id ?? crypto.randomUUID() },
    }),
  );
}

export async function deleteSectionCaseAssignment(id: string): Promise<ActionResponse> {
  return runWriteForMode(
    async () => {
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
    },
    async () => ({
      success: true,
      message: "Assignment deleted locally for tester mode.",
    }),
  );
}

export async function getCourseCaseAssignments() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('cases')
    .select(`
      id,
      name,
      description, 
      admitting_diagnosis,
      course_cases (
        id,
        course_id,
        courses (
          id,
          name,
          code
        )
      )
    `);

  if (error) {
    return {
      success: false,
      message: 'Failed to retrieve sim cases.',
      error,
      data: null
    };
  }

  const assignments = data?.flatMap((caseItem) => {
    // Handle unassigned cases (Left Join equivalent)
    if (!caseItem.course_cases || caseItem.course_cases.length === 0) {
      return [{
        id: null, // No assignment ID because it's not in course_cases
        courseId: null,
        caseId: caseItem.id,
        courseName: null,
        courseCode: null,
        caseName: caseItem.name,
        description: caseItem.description,
        diagnosis: caseItem.admitting_diagnosis
      }];
    }

    // Handle cases assigned to one or more courses
    return caseItem.course_cases.map((assignment) => {
      const course = Array.isArray(assignment.courses)
        ? assignment.courses[0]
        : assignment.courses;

      return {
        id: assignment.id, // The course_cases ID
        courseId: assignment.course_id,
        caseId: caseItem.id,
        courseName: course?.name,
        courseCode: course?.code,
        caseName: caseItem.name,
        description: caseItem.description,
        diagnosis: caseItem.admitting_diagnosis
      };
    });
  }) ?? [];

  return {
    success: true,
    message: 'Successfully retrieved sim cases.',
    data: assignments,
  };
}

export async function updateCaseSession(session: CaseSessionUpsert) {
  return runWriteForMode(
    async () => {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

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
    },
    async () => ({
      success: true,
      message: "Session update saved locally for tester mode.",
      data: session,
    }),
  );
}

export type TemplateCase = {
  id: string;
  name: string;
  description: string | null;
  admitting_diagnosis: string | null;
  created_at: string | null;
  created_by: string | null;
  creator_name: string | null;
};

export async function getTemplates(): Promise<TemplateCase[]> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: templates, error } = await supabase
    .from("cases")
    .select("id, name, description, admitting_diagnosis, created_at, created_by")
    .eq("is_template", true)
    .order("created_at", { ascending: false });

  if (error || !templates) return [];

  const creatorIds = [
    ...new Set(templates.map((t) => t.created_by).filter((id): id is string => Boolean(id))),
  ];

  const creatorMap = new Map<string, string>();
  if (creatorIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, email")
      .in("id", creatorIds);

    (users ?? []).forEach((u) => {
      creatorMap.set(u.id, u.full_name ?? u.email ?? "Unknown");
    });
  }

  return templates.map((t) => ({
    ...t,
    creator_name: t.created_by ? (creatorMap.get(t.created_by) ?? "Unknown") : "System",
  }));
}

export async function updateCaseName(caseId: string, name: string): Promise<ActionResponse> {
  return runWriteForMode(
    async () => {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error } = await supabase
        .from("cases")
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq("id", caseId);

      if (error) {
        return { success: false, message: "Failed to update case name.", error };
      }

      revalidatePath("/admin/templates");
      return { success: true, message: "Case name updated." };
    },
    async () => ({ success: true, message: "Case name updated locally for tester mode." }),
  );
}

export async function setTemplateFlag(caseId: string, isTemplate: boolean): Promise<ActionResponse> {
  return runWriteForMode(
    async () => {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error } = await supabase
        .from("cases")
        .update({ is_template: isTemplate })
        .eq("id", caseId);

      if (error) {
        return { success: false, message: "Failed to update template flag.", error };
      }

      return {
        success: true,
        message: isTemplate ? "Case saved as template." : "Template flag removed.",
      };
    },
    async () => ({
      success: true,
      message: isTemplate
        ? "Case marked as template locally for tester mode."
        : "Template flag removed locally for tester mode.",
    }),
  );
}

// extracts type of data from ActionResponse for use in frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractData<T extends (...args: any) => Promise<ActionResponse<any>>> =
  NonNullable<Awaited<ReturnType<T>>['data']>;

export type SectionSimulationsData = ExtractData<typeof getSectionCaseAssignments>;
export type CasesData = ExtractData<typeof getCaseByCourseId>;
export type CaseCourseAssignments = ExtractData<typeof getCourseCaseAssignments>;
export type CaseCourseAssignment = CaseCourseAssignments[number]
