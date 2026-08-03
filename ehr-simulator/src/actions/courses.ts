"use server"

import { createClient } from "@supabase/supabase-js";
import { Database, Tables, TablesInsert, TablesUpdate } from "../../database.types";
import { ActionResponse } from "./cases";
import { revalidatePath } from "next/cache";

export type Course = Tables<"courses">
export type CourseInsert = TablesInsert<"courses">
export type CourseUpdate = TablesUpdate<"courses">
export type Section = Tables<"sections">
export type SectionInsert = TablesInsert<"sections">
export type SectionUpdate = TablesUpdate<"sections">
export type Group = Tables<"groups">
export type GroupInsert = TablesInsert<"groups">
export type GroupMembers = Tables<"group_members">
export type GroupMembersInsert = TablesInsert<"group_members">
export type FacultySection = Tables<"faculty_section">
export type FacultySectionInsert = TablesInsert<"faculty_section">
export type SectionEnrollment = Tables<"section_enrollments">
export type SectionEnrollmentInsert = TablesInsert<"section_enrollments">
export type User = Tables<"users">
export type UserInsert = TablesInsert<"users">

function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function revalidateCoursePaths(courseId?: string) {
  revalidatePath("/admin/courses");
  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}/edit`);
  }
}

async function sectionIdsForCourse(courseId: string) {
  const supabase = serviceClient();
  const { data } = await supabase.from("sections").select("id").eq("course_id", courseId);
  return (data ?? []).map((s) => s.id);
}

async function replaceGroupMembers(
  supabase: ReturnType<typeof serviceClient>,
  groupId: string,
  studentIds: string[]
) {
  await supabase.from("group_members").delete().eq("group_id", groupId);
  if (!studentIds.length) return null;
  const { error } = await supabase.from("group_members").insert(
    studentIds.map((student_id) => ({ group_id: groupId, student_id, active: true }))
  );
  return error;
}

async function enrollStudents(
  supabase: ReturnType<typeof serviceClient>,
  sectionId: string | null | undefined,
  studentIds: string[]
) {
  if (!sectionId || !studentIds.length) return;
  await supabase.from("section_enrollments").upsert(
    studentIds.map((student_id) => ({ section_id: sectionId, student_id, active: true })),
    { onConflict: "section_id,student_id" }
  );
}

export async function getAllCourses(): Promise<ActionResponse<Course[] | null>> {
  const supabase = serviceClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order('code', { ascending: false })

  if (error) {
    return {
      success: false,
      message: 'Failed to fetch courses.',
      error,
    }
  }
  return {
    success: true,
    data,
    message: 'Successfully retrieved all courses.'
  }
}

export async function getCourseById(id: string): Promise<ActionResponse<Course | null>> {
  const supabase = serviceClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)

  if (error) {
    return {
      success: false,
      error,
      message: 'Failed to retrieve course.'
    }
  }

  const cleanData = Array.isArray(data) ? data[0] : data

  return {
    success: true,
    data: cleanData,
    message: 'Successfully retrieved course.'
  }
}

export async function getSectionsByCourseId(id: string) {
  const supabase = serviceClient();

  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("course_id", id)

  if (error) {
    return {
      success: false,
      error,
      message: 'Failed to retrieve sections.'
    };
  }

  return {
    success: true,
    data,
    message: 'Successfully retrieved sections.',
  }
}

export async function createCourse(course: CourseInsert): Promise<ActionResponse<Course>> {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
    .single();

  if (error) {
    console.error("Insert Error:", error);
    return { success: false, message: "Failed to create the course. Please try again.", error };
  }
  revalidateCoursePaths(data.id);
  return { success: true, message: "Course created successfully.", data };
}

export async function updateCourse(course: CourseUpdate & { id: string }): Promise<ActionResponse<Course>> {
  const supabase = serviceClient();
  const { id, ...rest } = course;
  const { data, error } = await supabase
    .from('courses')
    .update(rest)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Update Error:", error);
    return { success: false, message: "Failed to update the course. Please try again.", error };
  }
  revalidateCoursePaths(id);
  return {
    success: true,
    message: "Course saved successfully.",
    data
  };
}

export async function createSection(section: SectionInsert): Promise<ActionResponse<Section>> {
  const supabase = serviceClient();

  const { data, error } = await supabase
    .from('sections')
    .upsert(section)
    .select()
    .single()

  if (error) {
    console.error("Upsert Error:", error);
    return {
      success: false,
      message: "Failed to update the section. Please try again.",
      error: error
    };
  }

  revalidateCoursePaths(section.course_id ?? undefined);

  return {
    success: true,
    message: "Section saved successfully.",
    data
  };
}

export async function updateSection(section: SectionUpdate & { id: string }): Promise<ActionResponse<Section>> {
  const supabase = serviceClient();
  const { id, ...rest } = section;
  const { data, error } = await supabase
    .from('sections')
    .update(rest)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Update Section Error:", error);
    return { success: false, message: "Failed to update the section.", error };
  }

  revalidateCoursePaths(data.course_id ?? undefined);
  return { success: true, message: "Section updated successfully.", data };
}

export async function createGroup(group: GroupInsert) {
  const supabase = serviceClient();

  const { data, error } = await supabase
    .from('groups')
    .upsert(group)
    .select()
    .single()

  if (error) {
    console.error("Upsert Error:", error);
    return {
      success: false,
      message: "Failed to update the section. Please try again.",
      error: error
    };
  }

  return {
    success: true,
    message: "Group saved successfully.",
    data
  };
}

export async function createGroupMembers(groupMember: GroupMembersInsert) {
  const supabase = serviceClient();

  const { data, error } = await supabase
    .from('group_members')
    .upsert(groupMember)
    .select()
    .single()

  if (error) {
    console.error("Upsert Error:", error);
    return {
      success: false,
      message: "Failed to update the section. Please try again.",
      error: error
    };
  }

  return {
    success: true,
    message: "Group saved successfully.",
    data
  };
}

export async function createSectionEnrollment(
  enrollment: SectionEnrollmentInsert
): Promise<ActionResponse<SectionEnrollment>> {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("section_enrollments")
    .upsert(enrollment, { onConflict: "section_id,student_id" })
    .select()
    .single();

  if (error) {
    return { success: false, message: "Failed to enroll student in section.", error };
  }
  return { success: true, message: "Student enrolled.", data };
}

export async function createFacultySection(
  payload: FacultySectionInsert
): Promise<ActionResponse<FacultySection>> {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("faculty_section")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    return { success: false, message: "Failed to assign faculty to section.", error };
  }
  return { success: true, message: "Faculty assigned.", data };
}

export async function deleteCourse(courseId: string): Promise<ActionResponse> {
  const supabase = serviceClient();
  const sectionIds = await sectionIdsForCourse(courseId);
  if (sectionIds.length) {
    await supabase.from("faculty_section").delete().in("section_id", sectionIds);
  }
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) {
    return { success: false, message: error.message || "Failed to delete course.", error };
  }
  revalidatePath("/admin/courses");
  return { success: true, message: "Course deleted." };
}

export async function removeStudentFromCourse(
  courseId: string,
  studentId: string
): Promise<ActionResponse> {
  const supabase = serviceClient();
  const sectionIds = await sectionIdsForCourse(courseId);
  if (!sectionIds.length) return { success: true, message: "No sections to update." };
  await supabase
    .from("section_enrollments")
    .delete()
    .in("section_id", sectionIds)
    .eq("student_id", studentId);
  const { data: groups } = await supabase.from("groups").select("id").in("section_id", sectionIds);
  const groupIds = (groups ?? []).map((g) => g.id);
  if (groupIds.length) {
    await supabase.from("group_members").delete().in("group_id", groupIds).eq("student_id", studentId);
  }
  revalidateCoursePaths(courseId);
  return { success: true, message: "Student removed from course." };
}

export type CourseEditStudent = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export type CourseEditGroupMember = {
  id: string;
  student_id: string | null;
  active: boolean | null;
  student: CourseEditStudent | null;
};

export type CourseEditGroup = {
  id: string;
  name: string;
  active: boolean;
  section_id: string | null;
  section_assignment_id: string | null;
  faculty_lead_id: string | null;
  members: CourseEditGroupMember[];
  session: {
    id: string;
    status: string | null;
    current_phase: number | null;
    started_at: string | null;
    completed_at: string | null;
  } | null;
};

export type CourseEditAssignment = {
  id: string;
  case_id: string;
  sim_time: string;
  presim_time: string;
  case: {
    id: string;
    name: string | null;
    description: string | null;
    admitting_diagnosis: string | null;
    phase_count: number | null;
  } | null;
  groups: CourseEditGroup[];
};

export type CourseEditSection = {
  id: string;
  name: string;
  semester: string | null;
  meeting_time: string | null;
  start_date: string | null;
  end_date: string | null;
  enrollments: Array<{
    id: string;
    student_id: string | null;
    active: boolean;
    student: CourseEditStudent | null;
  }>;
  templateGroups: CourseEditGroup[];
  faculty: Array<{
    id: string;
    faculty_id: string | null;
    active: boolean | null;
    faculty: CourseEditStudent | null;
  }>;
  assignments: CourseEditAssignment[];
};

export type CourseEditBundle = { course: Course; sections: CourseEditSection[] };

function normalizeStudent(raw: unknown): CourseEditStudent | null {
  const s = (Array.isArray(raw) ? raw[0] : raw) as
    | { id?: string; full_name?: string | null; email?: string | null }
    | null
    | undefined;
  return s?.id ? { id: s.id, full_name: s.full_name ?? null, email: s.email ?? null } : null;
}

export async function getCourseEditBundle(
  courseId: string
): Promise<ActionResponse<CourseEditBundle | null>> {
  const supabase = serviceClient();
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();
  if (courseError || !course) {
    return { success: false, message: "Failed to load course.", error: courseError ?? undefined, data: null };
  }

  const { data: sectionsRaw, error: sectionsError } = await supabase
    .from("sections")
    .select(`
      id, name, semester, meeting_time, start_date, end_date,
      section_enrollments (id, student_id, active, student:users!section_enrollments_student_id_fkey (id, full_name, email)),
      faculty_section (id, faculty_id, active, faculty:users!faculty_section_faculty_id_fkey (id, full_name, email)),
      groups (id, name, active, section_id, section_assignment_id, faculty_lead_id,
        group_members (id, student_id, active, student:users!group_members_student_id_fkey (id, full_name, email))),
      section_assignments (id, case_id, sim_time, presim_time,
        cases!section_assignments_case_id_fkey (id, name, description, admitting_diagnosis, phase_count),
        case_sessions (id, status, current_phase, started_at, completed_at, group_id))
    `)
    .eq("course_id", courseId)
    .order("name");

  if (sectionsError) {
    return { success: false, message: "Failed to load course sections.", error: sectionsError, data: null };
  }

  const sections: CourseEditSection[] = (sectionsRaw ?? []).map((section) => {
    const allGroups: CourseEditGroup[] = (section.groups ?? []).map((group) => ({
      id: group.id,
      name: group.name,
      active: group.active ?? true,
      section_id: group.section_id,
      section_assignment_id: group.section_assignment_id,
      faculty_lead_id: group.faculty_lead_id ?? null,
      members: (group.group_members ?? []).map((m) => ({
        id: m.id,
        student_id: m.student_id,
        active: m.active,
        student: normalizeStudent(m.student),
      })),
      session: null,
    }));

    const assignments: CourseEditAssignment[] = (section.section_assignments ?? [])
      .filter((a) => Boolean(a.case_id))
      .map((a) => {
        const caseRaw = Array.isArray(a.cases) ? a.cases[0] : a.cases;
        const sessionByGroup = new Map(
          (a.case_sessions ?? []).filter((s) => s.group_id).map((s) => [s.group_id as string, s])
        );
        return {
          id: a.id,
          case_id: a.case_id as string,
          sim_time: a.sim_time,
          presim_time: a.presim_time,
          case: caseRaw
            ? {
                id: caseRaw.id,
                name: caseRaw.name,
                description: caseRaw.description,
                admitting_diagnosis: caseRaw.admitting_diagnosis,
                phase_count: caseRaw.phase_count,
              }
            : null,
          groups: allGroups
            .filter((g) => g.section_assignment_id === a.id && g.active)
            .map((g) => {
              const s = sessionByGroup.get(g.id);
              return {
                ...g,
                session: s
                  ? {
                      id: s.id,
                      status: s.status,
                      current_phase: s.current_phase,
                      started_at: s.started_at,
                      completed_at: s.completed_at,
                    }
                  : null,
              };
            }),
        };
      });

    return {
      id: section.id,
      name: section.name,
      semester: section.semester,
      meeting_time: section.meeting_time,
      start_date: section.start_date,
      end_date: section.end_date,
      enrollments: (section.section_enrollments ?? []).map((e) => ({
        id: e.id,
        student_id: e.student_id,
        active: e.active ?? true,
        student: normalizeStudent(e.student),
      })),
      templateGroups: allGroups.filter((g) => !g.section_assignment_id && g.active),
      faculty: (section.faculty_section ?? []).map((f) => ({
        id: f.id,
        faculty_id: f.faculty_id,
        active: f.active,
        faculty: normalizeStudent(f.faculty),
      })),
      assignments,
    };
  });

  return { success: true, message: "Course edit bundle loaded.", data: { course, sections } };
}

export type AssignmentGroupPayload = {
  id?: string;
  name: string;
  studentIds: string[];
  facultyLeadId?: string | null;
};

type Sb = ReturnType<typeof serviceClient>;

async function upsertGroups(
  supabase: Sb,
  sectionId: string,
  assignmentId: string | null,
  groupsPayload: AssignmentGroupPayload[],
  options?: { force?: boolean; renamePeers?: boolean }
): Promise<ActionResponse<{ groupCount: number }>> {
  const force = options?.force ?? false;
  let existingSessions: { id: string; status: string | null; group_id: string | null }[] = [];
  let locked = false;

  if (assignmentId) {
    const { data } = await supabase
      .from("case_sessions")
      .select("id, status, group_id")
      .eq("section_assignment_id", assignmentId);
    existingSessions = data ?? [];
    locked = existingSessions.some((s) =>
      ["in progress", "completed", "archived"].includes(s.status?.toLowerCase() ?? "")
    );
    if (locked && !force) {
      return {
        success: false,
        message: "Cannot edit groups while sessions are in progress, completed, or archived.",
      };
    }
  }

  let existingQuery = supabase.from("groups").select("id, name").eq("section_id", sectionId);
  existingQuery = assignmentId
    ? existingQuery.eq("section_assignment_id", assignmentId)
    : existingQuery.is("section_assignment_id", null);
  const { data: existingGroups } = await existingQuery;
  const keepIds = new Set(groupsPayload.map((g) => g.id).filter((id): id is string => Boolean(id)));

  for (const existing of existingGroups ?? []) {
    if (keepIds.has(existing.id)) continue;
    if (assignmentId && (locked || existingSessions.some((s) => s.group_id === existing.id))) {
      await supabase.from("groups").update({ active: false }).eq("id", existing.id);
    } else {
      await supabase.from("group_members").delete().eq("group_id", existing.id);
      if (assignmentId) {
        await supabase
          .from("case_sessions")
          .delete()
          .eq("group_id", existing.id)
          .eq("section_assignment_id", assignmentId);
      }
      await supabase.from("groups").delete().eq("id", existing.id);
    }
  }

  for (const payload of groupsPayload) {
    let groupId = payload.id;
    const row = {
      name: payload.name,
      active: true,
      section_id: sectionId,
      section_assignment_id: assignmentId,
      faculty_lead_id: payload.facultyLeadId || null,
    };

    if (groupId) {
      if (options?.renamePeers) {
        const { data: existing } = await supabase.from("groups").select("name").eq("id", groupId).single();
        if (existing?.name && existing.name !== payload.name) {
          await supabase
            .from("groups")
            .update({ name: payload.name })
            .eq("section_id", sectionId)
            .eq("name", existing.name);
        }
      }
      await supabase.from("groups").update(row).eq("id", groupId);
    } else {
      const { data: created, error: createError } = await supabase.from("groups").insert(row).select().single();
      if (createError || !created) {
        return {
          success: false,
          message: `Failed to create group ${payload.name}.`,
          error: createError ?? undefined,
        };
      }
      groupId = created.id;
    }

    const memberError = await replaceGroupMembers(supabase, groupId!, payload.studentIds);
    if (memberError) {
      return { success: false, message: "Failed to update group members.", error: memberError };
    }
    await enrollStudents(supabase, sectionId, payload.studentIds);
  }

  return { success: true, message: "Groups updated.", data: { groupCount: groupsPayload.length } };
}

export async function replaceSectionTemplateGroups(
  sectionId: string,
  groupsPayload: AssignmentGroupPayload[],
  options?: { courseId?: string }
): Promise<ActionResponse<{ groupCount: number }>> {
  const supabase = serviceClient();
  const result = await upsertGroups(supabase, sectionId, null, groupsPayload, { renamePeers: true });
  if (!result.success) return result;

  const { data: assignments } = await supabase
    .from("section_assignments")
    .select("id")
    .eq("section_id", sectionId);
  for (const assignment of assignments ?? []) {
    const { data: assignmentGroups } = await supabase
      .from("groups")
      .select("id, name")
      .eq("section_assignment_id", assignment.id);
    const byName = Object.fromEntries((assignmentGroups ?? []).map((g) => [g.name, g.id]));
    const synced = await upsertGroups(
      supabase,
      sectionId,
      assignment.id,
      groupsPayload.map((g) => ({
        id: byName[g.name],
        name: g.name,
        studentIds: g.studentIds,
        facultyLeadId: g.facultyLeadId,
      })),
      { force: true }
    );
    if (!synced.success) return synced;
  }

  revalidateCoursePaths(options?.courseId);
  return result;
}

export async function replaceAssignmentGroups(
  assignmentId: string,
  groupsPayload: AssignmentGroupPayload[],
  options?: { force?: boolean; courseId?: string }
): Promise<ActionResponse<{ groupCount: number }>> {
  const supabase = serviceClient();
  const { data: assignment, error } = await supabase
    .from("section_assignments")
    .select("id, section_id")
    .eq("id", assignmentId)
    .single();
  if (error || !assignment?.section_id) {
    return { success: false, message: "Assignment not found.", error: error ?? undefined };
  }
  const result = await upsertGroups(supabase, assignment.section_id, assignmentId, groupsPayload, {
    force: options?.force,
  });
  if (result.success) revalidateCoursePaths(options?.courseId);
  return result;
}

export async function copyAssignmentGroups(
  sourceAssignmentId: string,
  targetAssignmentId: string,
  options?: { force?: boolean; courseId?: string }
): Promise<ActionResponse<{ groupCount: number }>> {
  const supabase = serviceClient();
  const { data: sourceGroups, error } = await supabase
    .from("groups")
    .select("name, group_members (student_id)")
    .eq("section_assignment_id", sourceAssignmentId)
    .eq("active", true);
  if (error) return { success: false, message: "Failed to load source groups.", error };
  return replaceAssignmentGroups(
    targetAssignmentId,
    (sourceGroups ?? []).map((g) => ({
      name: g.name,
      studentIds: (g.group_members ?? [])
        .map((m) => m.student_id)
        .filter((id): id is string => Boolean(id)),
    })),
    options
  );
}

export async function ensureAssignmentGroupsFromTemplate(
  assignmentId: string,
  options?: { copyFromAssignmentId?: string; courseId?: string }
): Promise<ActionResponse<{ groupCount: number }>> {
  const supabase = serviceClient();
  const { data: existing } = await supabase
    .from("groups")
    .select("id")
    .eq("section_assignment_id", assignmentId)
    .eq("active", true)
    .limit(1);
  if (existing?.length) {
    return { success: true, message: "Assignment already has groups.", data: { groupCount: existing.length } };
  }
  if (options?.copyFromAssignmentId) {
    return copyAssignmentGroups(options.copyFromAssignmentId, assignmentId, { courseId: options.courseId });
  }

  const { data: assignment, error } = await supabase
    .from("section_assignments")
    .select("id, section_id")
    .eq("id", assignmentId)
    .single();
  if (error || !assignment?.section_id) {
    return { success: false, message: "Assignment not found.", error: error ?? undefined };
  }

  const { data: sibling } = await supabase
    .from("section_assignments")
    .select("id")
    .eq("section_id", assignment.section_id)
    .neq("id", assignmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (sibling?.id) {
    return copyAssignmentGroups(sibling.id, assignmentId, { courseId: options?.courseId });
  }

  const { data: templates, error: templateError } = await supabase
    .from("groups")
    .select("name, group_members (student_id)")
    .eq("section_id", assignment.section_id)
    .is("section_assignment_id", null)
    .eq("active", true);
  if (templateError) return { success: false, message: "Failed to load template groups.", error: templateError };

  const payload: AssignmentGroupPayload[] = (templates ?? []).map((g) => ({
    name: g.name,
    studentIds: (g.group_members ?? [])
      .map((m) => m.student_id)
      .filter((id): id is string => Boolean(id)),
  }));
  if (!payload.length) {
    return { success: true, message: "No template groups to copy.", data: { groupCount: 0 } };
  }
  return replaceAssignmentGroups(assignmentId, payload, { courseId: options?.courseId });
}

async function bulkSessionStatus(
  assignmentId: string,
  mode: "complete" | "expire",
  courseId?: string
): Promise<ActionResponse<{ updated: number }>> {
  const supabase = serviceClient();
  const now = new Date().toISOString();
  const { data: sessions, error } = await supabase
    .from("case_sessions")
    .select("id, status, started_at, completed_at")
    .eq("section_assignment_id", assignmentId);
  if (error) return { success: false, message: "Failed to load sessions.", error };

  let updated = 0;
  for (const session of sessions ?? []) {
    const status = session.status?.toLowerCase() ?? "";
    if (status === "archived" || status === "completed") continue;
    const patch =
      mode === "complete"
        ? {
            status: "completed",
            completed_at: session.completed_at ?? now,
            started_at: session.started_at ?? now,
          }
        : { status: "archived" };
    const { error: upErr } = await supabase.from("case_sessions").update(patch).eq("id", session.id);
    if (!upErr) updated += 1;
  }
  revalidateCoursePaths(courseId);
  return {
    success: true,
    message: `${mode === "complete" ? "Completed" : "Expired"} ${updated} session(s).`,
    data: { updated },
  };
}

export async function completeAllSessionsForAssignment(assignmentId: string, courseId?: string) {
  return bulkSessionStatus(assignmentId, "complete", courseId);
}

export async function expireAllSessionsForAssignment(assignmentId: string, courseId?: string) {
  return bulkSessionStatus(assignmentId, "expire", courseId);
}
