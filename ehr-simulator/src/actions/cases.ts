"use server"

import { createClient, PostgrestError } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { revalidatePath } from "next/cache";

export type SectionAssignment = Database['public']['Tables']['section_assignments']['Row'];
export type SectionAssignmentInsert = Database['public']['Tables']['section_assignments']['Insert'];
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


export async function getCaseByCourseId(id: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("course_cases")
    .select(`
      case_id,
      course_id,
      cases(
        name
      )
      `)
    .eq("course_id", id)

  if (error) {
    const result = {
      success: false,
      message: 'Failed to retrieve Sim Case paired with this course.',
      error,
      data
    }
    return result
  }

  // Auto-generated Supabase types wouldn't recognize the PK/FK relationship between cases -m and course_case
  // Force case data to be single object, not array
  const cleanData = data?.map((item) => {
    const _caseData = Array.isArray(item.cases)
      ? item.cases[0]
      : item.cases;

    return {
      ...item,
      cases: _caseData || { name: "Unknown Case" }
    };
  });

  return {
    success: true,
    data: cleanData,
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
      const _caseData = Array.isArray(assignment.cases)
        ? assignment.cases[0]
        : assignment.cases;

      return {
        ...assignment,
        cases: _caseData
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
  const supabase = createClient(
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

// extracts type of data from ActionResponse for use in frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractData<T extends (...args: any) => Promise<ActionResponse<any>>> =
  NonNullable<Awaited<ReturnType<T>>['data']>;

export type SectionSimulationsData = ExtractData<typeof getSectionCaseAssignments>;
export type CasesData = ExtractData<typeof getCaseByCourseId>;
export type CaseCourseAssignments = ExtractData<typeof getCourseCaseAssignments>;
export type CaseCourseAssignment = CaseCourseAssignments[number]
