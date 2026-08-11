import { createServerSupabase } from "@/utils/supabase/server";
import { Course, Simulation, Group, Section } from "./types";

type CourseRelation = {
  id: Course["id"];
  code: Course["code"];
  name: Course["name"];
  active: Course["active"];
};

// Helper Function for getFacultyCourses
const getStudentName = (student: any) => {
  if (!student) return "Unknown Student";
  if (student.full_name) return student.full_name;
  return student.email || "Unknown Student";
};

// Get data from Supabase (May place this somewhere else or use SQL function)
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
        case_sessions (id, group_id, current_phase, status, case_photo_url)
      ),
      groups (
        id,
        name,
        group_members (
          id,
          student_id,
          student:student_id (id, full_name, email)
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

    // Lookup table so each group's name/members can be matched by id below
    const groupById = new Map<string, any>(
      (section.groups ?? []).map((group: any) => [group.id, group])
    );

    // One Simulation per section_assignment; its groups are scoped to THAT
    // assignment's case_sessions, not the whole section's group list
    const simulationRows: Simulation[] = (section.section_assignments ?? []).map((assignment: any) => {
      const caseRecord = assignment.cases;
      const caseName =
        caseRecord?.name ||
        [caseRecord?.first_name, caseRecord?.last_name].filter(Boolean).join(" ") ||
        "Untitled Simulation";

      // A group only belongs to this simulation if it has a case_session under this assignment
      const groupRows: Group[] = (assignment.case_sessions ?? [])
        .filter((session: any) => session.group_id && session.id)
        .map((session: any) => {
          const group = groupById.get(session.group_id);
          return {
            id: session.group_id,
            name: group?.name ?? "Unknown Group",
            caseSessionId: session.id,
            currentPhase: session.current_phase ?? 1,
            casePhotoUrl: session.case_photo_url ?? null,
            members: (group?.group_members ?? [])
              .map((member: any) => ({
                id: member.student?.id ?? member.id,
                name: getStudentName(member.student),
              }))
              .filter((member: any) => member.id),
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
    });

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
        case_photo_url,
        group: groups(
          id,
          name,
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

  // section/course can come back as arrays or objects depending on FK shape — normalize
  const section = Array.isArray(data.section) ? data.section[0] : data.section;
  const course = Array.isArray(section?.course) ? section.course[0] : section?.course;
  const caseRecord = Array.isArray(data.cases) ? data.cases[0] : data.cases;

  if (!section || !course) {
    console.error("Missing section or course for section_assignment", sectionAssignmentId);
    return null;
  }

  const groups: Group[] = (data.case_sessions ?? [])
    .filter((session: any) => session.group) // skip sessions with no linked group
    .map((session: any) => {
      const group = Array.isArray(session.group) ? session.group[0] : session.group;

      return {
        id: group.id,
        name: group.name,
        caseSessionId: session.id,
        currentPhase: session.current_phase ?? 1,
        casePhotoUrl: session.case_photo_url ?? null,
        members: (group.group_members ?? [])
          .map((member: any) => ({
            id: member.student?.id ?? member.id,
            name: getStudentName(member.student),
          }))
          .filter((member: any) => member.id),
      };
    });

  const simulation: Simulation = {
    id: data.id,   // section_assignments.id
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
