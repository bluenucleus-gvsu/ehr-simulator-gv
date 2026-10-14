"use server"

import { createServerSupabase } from "@/utils/supabase/server";
import { one } from "@/utils/normalizeToRow";
import type {
  CaseRow,
  CaseSessionRow,
  CourseRow,
  GroupRow,
  SectionAssignmentRow,
  SectionRow,
  UserRow,
} from "@/types/db";

type Group = Pick<GroupRow, "id" | "name"> & {
  caseSessionId: CaseSessionRow["id"];
  currentPhase: CaseSessionRow["current_phase"];
  sessionStatus?: CaseSessionRow["status"];
  members: Pick<UserRow, "id" | "full_name" | "email">[];
};

export type Simulation = {
  id: SectionAssignmentRow["id"];
  caseName: string;
  phaseCount: CaseRow["phase_count"];
  simTime: string | null;
  presimTime: string | null;
  groups: Group[];
};

type Section = Pick<SectionRow, "id" | "name"> & {
  simulations: Simulation[];
};

export type Course = Pick<CourseRow, "id" | "code" | "name" | "active"> & {
  sections: Section[];
};

export type FeedbackTarget =
  | { kind: "group"; groupId: string; groupName: string }
  | { kind: "individual"; studentId: string; studentName: string; groupName: string };

export type ActiveSimView = {
  simulation: Simulation;
  courseName: string;
  sectionName: string;
};

export async function getFacultyCourses(): Promise<Course[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("sections")
    .select(`
      id,
      name,
      course:courses (id, code, name, active),
      section_assignments (
        id,
        sim_time,
        presim_time,
        cases (id, name, first_name, last_name, phase_count),
        case_sessions (id, group_id, current_phase, status)
      ),
      groups (
        id,
        name,
        group_members (
          student:student_id (id, full_name, email)
        )
      )
    `);

  if (error) {
    console.error("Failed to fetch faculty courses:", error);
    return [];
  }

  const sections = (data ?? []);

  const courseMap = new Map<string, Course>();

  for (const section of sections) {
    const course = one(section.course);
    if (!course?.id) continue;

    const groupById = new Map(
      (section.groups ?? []).map((group) => [group.id, group]),
    );

    const simulations = (section.section_assignments ?? []).map((assignment) => {
      const caseRecord = one(assignment.cases);
      const caseName =
        caseRecord?.name ||
        [caseRecord?.first_name, caseRecord?.last_name].filter(Boolean).join(" ") ||
        "Untitled Simulation";

      const groups = (assignment.case_sessions ?? [])
        .filter((session) => session.group_id && session.id)
        .map((session) => {
          const group = groupById.get(session.group_id!);
          return {
            id: session.group_id!,
            name: group?.name ?? "Unknown Group",
            caseSessionId: session.id,
            currentPhase: session.current_phase ?? 1,
            sessionStatus: session.status ?? null,
            members: (group?.group_members ?? [])
              .map((member) => member.student)
              .filter((student) => !!student),
          };
        });

      return {
        id: assignment.id,
        caseName,
        phaseCount: caseRecord?.phase_count ?? 0,
        simTime: assignment.sim_time,
        presimTime: assignment.presim_time,
        groups,
      };
    });

    const sectionPayload = {
      id: section.id,
      name: section.name,
      simulations,
    };

    const existingCourse = courseMap.get(course.id);
    if (existingCourse) {
      existingCourse.sections.push(sectionPayload);
    } else {
      courseMap.set(course.id, {
        id: course.id,
        code: course.code,
        name: course.name,
        active: course.active ?? false,
        sections: [sectionPayload],
      });
    }
  }

  return Array.from(courseMap.values());
}


export async function getSectionSimulationDetails(
  sectionAssignmentId: string,
): Promise<ActiveSimView | null> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("section_assignments")
    .select(`
      id,
      sim_time,
      presim_time,
      section:sections (
        id,
        name,
        course:courses (id, code, name, active)
      ),
      cases (
        id,
        name,
        phase_count
      ),
      case_sessions (
        id,
        current_phase,
        status,
        group: groups(
          id,
          name,
          group_members (
            student:users (
              id,
              full_name,
              email
            )
          )
        )
      )
    `)
    .eq("id", sectionAssignmentId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch faculty section data:", error);
    return null;
  }

  const sectionAssignment = data;

  const section = one(sectionAssignment.section);
  const course = one(section?.course);
  const caseRecord = one(sectionAssignment.cases);

  if (!section || !course) {
    console.error("Missing section or course for section_assignment", sectionAssignmentId);
    return null;
  }

  const sessions = sectionAssignment.case_sessions ?? [];

  const groups = sessions
    .filter((session) => session.group)
    .map((session) => {
      const group = one(session.group);

      return {
        id: group!.id,
        name: group!.name,
        caseSessionId: session.id,
        currentPhase: session.current_phase ?? 1,
        sessionStatus: session.status ?? null,
        members: (group!.group_members ?? [])
          .map((member) => member.student)
          .filter((student) => !!student),
      };
    });

  const simulation = {
    id: sectionAssignment.id,
    caseName: caseRecord?.name ?? "Untitled Simulation",
    phaseCount: caseRecord?.phase_count ?? 1,
    simTime: sectionAssignment.sim_time,
    presimTime: sectionAssignment.presim_time,
    groups,
  };

  return {
    simulation,
    courseName: course.name,
    sectionName: section.name,
  };
}
