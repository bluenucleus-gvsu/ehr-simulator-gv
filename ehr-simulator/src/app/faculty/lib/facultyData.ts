import { createServerSupabase } from "@/utils/supabase/server";
import { Course, Simulation, Group, Section } from "./types";

type CourseRelation = {
  id: Course["id"];
  code: Course["code"];
  name: Course["name"];
  active: Course["active"];
};

const getStudentName = (student: {
  full_name?: string | null;
  email?: string | null;
} | null) => {
  if (!student) return "Unknown Student";
  if (student.full_name) return student.full_name;
  return student.email || "Unknown Student";
};

export async function getFacultyCourses(): Promise<Course[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("sections")
    .select(`
      id,
      name,
      meeting_time,
      semester,
      course:courses (id, code, name, active),
      section_assignments (
        id,
        sim_time,
        presim_time,
        case_id,
        cases (id, name, first_name, last_name, phase_count),
        case_sessions (
          id,
          group_id,
          current_phase,
          status,
          group:groups (
            id,
            name,
            section_assignment_id,
            active,
            group_members (
              id,
              student_id,
              student:student_id (id, full_name, email)
            )
          )
        )
      )
    `);

  if (error) {
    console.error("Failed to fetch faculty courses:", error);
    return [];
  }

  const sections = (data ?? []).filter(Boolean);
  const courseMap = new Map<string, Course>();

  for (const section of sections) {
    const course = (
      Array.isArray(section.course) ? section.course[0] : section.course
    ) as CourseRelation | null | undefined;
    if (!course?.id) continue;

    const simulationRows: Simulation[] = (section.section_assignments ?? []).map(
      (assignment: {
        id: string;
        sim_time: string | null;
        presim_time: string | null;
        cases:
          | {
              name?: string | null;
              first_name?: string | null;
              last_name?: string | null;
              phase_count?: number | null;
            }
          | Array<{
              name?: string | null;
              first_name?: string | null;
              last_name?: string | null;
              phase_count?: number | null;
            }>
          | null;
        case_sessions?: Array<{
          id: string;
          group_id: string | null;
          current_phase: number | null;
          status: string | null;
          group:
            | {
                id: string;
                name: string;
                active?: boolean | null;
                group_members?: Array<{
                  id: string;
                  student?: { id: string; full_name: string | null; email: string | null } | null;
                }>;
              }
            | Array<{
                id: string;
                name: string;
                active?: boolean | null;
                group_members?: Array<{
                  id: string;
                  student?: { id: string; full_name: string | null; email: string | null } | null;
                }>;
              }>
            | null;
        }>;
      }) => {
        const caseRecord = Array.isArray(assignment.cases)
          ? assignment.cases[0]
          : assignment.cases;
        const caseName =
          caseRecord?.name ||
          [caseRecord?.first_name, caseRecord?.last_name].filter(Boolean).join(" ") ||
          "Untitled Simulation";

        const groupRows: Group[] = (assignment.case_sessions ?? [])
          .filter((session) => {
            if (!session.group_id || !session.id) return false;
            const group = Array.isArray(session.group) ? session.group[0] : session.group;
            return group?.active !== false;
          })
          .map((session) => {
            const group = Array.isArray(session.group) ? session.group[0] : session.group;
            return {
              id: session.group_id as string,
              name: group?.name ?? "Unknown Group",
              caseSessionId: session.id,
              currentPhase: session.current_phase ?? 1,
              members: (group?.group_members ?? [])
                .map((member) => ({
                  id: member.student?.id ?? member.id,
                  name: getStudentName(member.student ?? null),
                }))
                .filter((member) => member.id),
            };
          });

        return {
          id: assignment.id,
          caseName,
          phaseCount: caseRecord?.phase_count ?? 0,
          simTime: assignment.sim_time ?? "",
          presimTime: assignment.presim_time ?? "",
          groups: groupRows,
        };
      }
    );

    const sectionPayload: Section = {
      id: section.id,
      name: section.name,
      simulations: simulationRows,
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

export async function getSectionSimulationDetails(sectionAssignmentId: string) {
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
        meeting_time,
        semester,
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
        group: groups(
          id,
          name,
          section_assignment_id,
          active,
          group_members (
            id,
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

  const section = Array.isArray(data.section) ? data.section[0] : data.section;
  const course = Array.isArray(section?.course) ? section.course[0] : section?.course;
  const caseRecord = Array.isArray(data.cases) ? data.cases[0] : data.cases;

  if (!section || !course) {
    console.error("Missing section or course for section_assignment", sectionAssignmentId);
    return null;
  }

  const groups: Group[] = (data.case_sessions ?? [])
    .filter((session: {
      group?:
        | { active?: boolean | null }
        | Array<{ active?: boolean | null }>
        | null;
    }) => {
      const group = Array.isArray(session.group) ? session.group[0] : session.group;
      return Boolean(group) && group?.active !== false;
    })
    .map((session: {
      id: string;
      current_phase: number | null;
      group:
        | {
            id: string;
            name: string;
            active?: boolean | null;
            group_members?: Array<{
              id: string;
              student?:
                | { id: string; full_name: string | null; email: string | null }
                | Array<{ id: string; full_name: string | null; email: string | null }>
                | null;
            }>;
          }
        | Array<{
            id: string;
            name: string;
            active?: boolean | null;
            group_members?: Array<{
              id: string;
              student?:
                | { id: string; full_name: string | null; email: string | null }
                | Array<{ id: string; full_name: string | null; email: string | null }>
                | null;
            }>;
          }>;
    }) => {
      const group = Array.isArray(session.group) ? session.group[0] : session.group;

      return {
        id: group.id,
        name: group.name,
        caseSessionId: session.id,
        currentPhase: session.current_phase ?? 1,
        members: (group.group_members ?? [])
          .map((member) => {
            const student = Array.isArray(member.student)
              ? member.student[0]
              : member.student;
            return {
              id: student?.id ?? member.id,
              name: getStudentName(student ?? null),
            };
          })
          .filter((member) => member.id),
      };
    });

  const simulation: Simulation = {
    id: data.id,
    caseName: caseRecord?.name ?? "Untitled Simulation",
    phaseCount: caseRecord?.phase_count ?? 0,
    simTime: data.sim_time ?? "",
    presimTime: data.presim_time ?? "",
    groups,
  };

  return {
    simulation,
    courseName: course.name,
    sectionName: section.name,
  };
}
