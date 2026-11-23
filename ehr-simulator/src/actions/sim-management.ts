import { createServerSupabase } from "@/utils/supabase/server";
import { Course, Simulation, Group, Section } from "@/lib/sim-management";
import { User } from "@/actions/courses";

const getStudentName = (student: User) => {
  if (!student) return "Unknown Student";
  if (student.full_name) return student.full_name;
  return student.email || "Unknown Student";
};

export async function getActiveCourses(): Promise<Course[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("sections")
    .select(`
      id,
      name,
      course:courses (*),
      section_assignments (
        id,
        sim_time,
        presim_time,
        case_id,
        cases (id, name, first_name, last_name, phase_count),
        case_sessions (id, group_id, current_phase, status)
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
    `)
    .eq('active', true)
    .eq('groups.active', true)
    .eq('groups.group_members.active', true);

  if (error) {
    console.error("Failed to fetch faculty courses:", error);
    return [];
  }

  const sections = (data ?? []).filter(Boolean);

  const courseMap = new Map<string, Course>();

  for (const section of sections) {
    const course = (
      Array.isArray(section.course) ? section.course[0] : section.course
    ) as Course;
    if (!course?.id) continue;

    const groupById = new Map<string, any>(
      (section.groups ?? []).map((group: any) => [group.id, group])
    );

    const simulationRows: Simulation[] = (section.section_assignments ?? []).map((assignment: any) => {
      const caseRecord = assignment.cases;
      const caseName =
        caseRecord?.name ||
        [caseRecord?.first_name, caseRecord?.last_name].filter(Boolean).join(" ") ||
        "Untitled Simulation";

      const groupRows: Group[] = (assignment.case_sessions ?? [])
        .filter((session: any) => session.group_id && session.id)
        .flatMap((session: any) => {
          const group = groupById.get(session.group_id);
          if (!group) return [];
          return [{
            id: session.group_id,
            name: group.name,
            caseSessionId: session.id,
            currentPhase: session.current_phase ?? 1,
            members: (group.group_members ?? [])
              .map((member: any) => ({
                id: member.student?.id ?? member.id,
                name: getStudentName(member.student),
              }))
              .filter((member: any) => member.id),
          }];
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
        ...course,
        sections: [sectionPayload]
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
    .eq("section.active", true)
    .eq("case_sessions.group.active", true)
    .eq("case_sessions.group.group_members.active", true)
    .eq("id", sectionAssignmentId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch section data:", error);
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
