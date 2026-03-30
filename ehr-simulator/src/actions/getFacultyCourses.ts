"use server"

import { createClient } from "@supabase/supabase-js"
import { Course, Section, Simulation, Group, Member } from "@/app/faculty/components/FacultyCoursesView"

export async function getFacultyCourses(facultyId: string): Promise<Course[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from("faculty_section")
    .select(`
      sections (
        id,
        name,
        courses (
          id,
          code,
          name,
          active
        ),
        section_assignments (
          id,
          sim_time,
          cases!section_assignments_case_id_fkey (
            id,
            name
          )
        ),
        groups (
          id,
          name,
          group_members (
            users!group_members_student_id_fkey (
              id,
              full_name,
              email
            )
          )
        )
      )
    `)
    .eq("faculty_id", facultyId)
    .neq("active", false)

  if (error) {
    console.error("getFacultyCourses error:", error)
    return []
  }

  const courseMap = new Map<string, Course>()

  for (const row of data ?? []) {
    const section = Array.isArray(row.sections) ? row.sections[0] : row.sections
    if (!section) continue

    const course = Array.isArray(section.courses) ? section.courses[0] : section.courses
    if (!course) continue

    const groups: Group[] = (section.groups ?? []).map((g) => {
      const members: Member[] = (g.group_members ?? []).map((gm) => {
        const user = Array.isArray(gm.users) ? gm.users[0] : gm.users
        return {
          id: user?.id ?? "",
          name: user?.full_name ?? user?.email ?? "Unknown",
        }
      })
      return { id: g.id, name: g.name, members }
    })

    const simulations: Simulation[] = (section.section_assignments ?? []).map((sa) => {
      const caseData = Array.isArray(sa.cases) ? sa.cases[0] : sa.cases
      return {
        id: sa.id,
        caseName: caseData?.name ?? "Unknown Case",
        simTime: sa.sim_time ?? "",
        groups,
      }
    })

    const sectionEntry: Section = {
      id: section.id,
      name: section.name,
      simulations,
    }

    if (!courseMap.has(course.id)) {
      courseMap.set(course.id, {
        id: course.id,
        code: course.code ?? "",
        name: course.name ?? "",
        active: course.active ?? false,
        sections: [],
      })
    }

    courseMap.get(course.id)!.sections.push(sectionEntry)
  }

  return Array.from(courseMap.values())
}
