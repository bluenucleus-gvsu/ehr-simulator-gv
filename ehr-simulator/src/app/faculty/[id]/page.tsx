import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/utils/supabase/server";
import FacultyHeader from "@/app/faculty/components/FacultyHeader";
import FacultyCoursesView, { Course } from "@/app/faculty/components/FacultyCoursesView";

/* ─── Dummy data (replace with real DB calls later) ───────────────────────────
function getDummyCourses(): Course[] {
  // Use a fixed "today" date string so it always shows the Start Simulation button
  // In production this will come from the DB
  const todayISO = new Date().toISOString().split("T")[0];

  return [
    {
      id: "c1",
      code: "NRS 310",
      name: "Clinical Simulation I",
      active: true,
      sections: [
        {
          id: "sec1",
          name: "Section A – MWF 9:00 AM",
          simulations: [
            {
              id: "sim1",
              caseName: "Cardiac Assessment – John Doe",
              simTime: `${todayISO}T10:00:00`,
              groups: [
                {
                  id: "g1",
                  name: "Group 1",
                  members: [
                    { id: "s1", name: "Alice Johnson" },
                    { id: "s2", name: "Bob Smith" },
                    { id: "s3", name: "Carol White" },
                  ],
                },
                {
                  id: "g2",
                  name: "Group 2",
                  members: [
                    { id: "s4", name: "David Brown" },
                    { id: "s5", name: "Emma Davis" },
                    { id: "s6", name: "Frank Miller" },
                  ],
                },
              ],
            },
            {
              id: "sim2",
              caseName: "Respiratory Distress – Jane Smith",
              simTime: "2026-03-25T14:00:00",
              groups: [
                {
                  id: "g3",
                  name: "Group 1",
                  members: [
                    { id: "s1", name: "Alice Johnson" },
                    { id: "s2", name: "Bob Smith" },
                  ],
                },
                {
                  id: "g4",
                  name: "Group 2",
                  members: [
                    { id: "s4", name: "David Brown" },
                    { id: "s5", name: "Emma Davis" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "c2",
      code: "NRS 410",
      name: "Advanced Clinical Simulation",
      active: true,
      sections: [
        {
          id: "sec2",
          name: "Section B – TTh 2:00 PM",
          simulations: [
            {
              id: "sim3",
              caseName: "Post-Op Patient – Mary Johnson",
              simTime: "2026-03-22T09:00:00",
              groups: [
                {
                  id: "g5",
                  name: "Group A",
                  members: [
                    { id: "s7", name: "Grace Lee" },
                    { id: "s8", name: "Henry Wilson" },
                    { id: "s9", name: "Isabella Chen" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "c3",
      code: "NRS 210",
      name: "Fundamentals of Nursing",
      active: false,
      sections: [
        {
          id: "sec3",
          name: "Section A – Spring 2025",
          simulations: [
            {
              id: "sim4",
              caseName: "Fall Risk Assessment – Tom Brown",
              simTime: "2025-11-15T10:00:00",
              groups: [
                {
                  id: "g6",
                  name: "Group 1",
                  members: [
                    { id: "s10", name: "Jack Thompson" },
                    { id: "s11", name: "Karen White" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}
/*/// ─────────────────────────────────────────────────────────────────────────────

// ─── Test Real Data Flow (May change later) ──────────────────────────────────

// Helper Function for getFacultyCourses
const getStudentName = (student: any) => {
  if (!student) return "Unknown Student";
  if (student.full_name) return student.full_name;
  return student.email || "Unknown Student";
};

// Get data from Supabase (May place this somewhere else or use SQL function)
async function getFacultyCourses(facultyId: string): Promise<Course[]> {

  // Establish Connection
  const supabase = await createServerSupabase();

  // Get Data
  const { data, error } = await supabase
    .from("faculty_section")
    .select(`
      section:sections (
        id,
        name,
        meeting_time,
        semester,
        course:course_id (id, code, name, active),
        section_assignments (
          id,
          sim_time,
          presim_time,
          case_id,
          cases (id, name, first_name, last_name, phase_count),
          case_sessions (id, group_id, status)
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
      )
    `)
    .eq("faculty_id", facultyId);

  if (error) {
    console.error("Failed to fetch faculty courses:", error);
    return [];
  }

  // Filter for Sections
  const sections = (data ?? [])
    .map((row: any) => row.section)
    .filter(Boolean);

  // Create an empty map for (course_id, Course Object & sections array)
  const courseMap = new Map<string, Course & { sections: any[] }>();


  // Loop over sections to organize the data
  for (const section of sections) {
    const course = section.course;
    if (!course?.id) continue;

    // simulationRows which contains info from: cases, groups, case_sessions, group_members, and section_assignments
    const simulationRows = (section.section_assignments ?? []).map((assignment: any) => {

      // Set up the caseName and phaseCount from cases
      const caseRecord = assignment.cases;
      const caseName =
        caseRecord?.name ||
        [caseRecord?.first_name, caseRecord?.last_name].filter(Boolean).join(" ") ||
        "Untitled Simulation";
      const phaseCount = caseRecord?.phase_count;

      // Filter each session by group
      const sessionByGroupId = new Map<string, string>(
        (assignment.case_sessions ?? [])
          .filter((session: any) => session.group_id && session.id)
          .map((session: any) => [session.group_id, session.id])
      );

      // Gather all the groups info, including members
      const groupRows = (section.groups ?? []).map((group: any) => ({
        id: group.id,
        name: group.name,
        caseSessionId: sessionByGroupId.get(group.id) ?? null,
        members: (group.group_members ?? [])
          .map((member: any) => ({
            id: member.student?.id ?? member.id,
            name: getStudentName(member.student),
          }))
          .filter((member: any) => member.id),
      }));

      // Get the case_session.id for all section_assignments
      const caseSessionIds = (assignment.case_sessions ?? []).map((session: any) => session.id).filter(Boolean);

      // simulationRows return
      return {
        id: assignment.id,
        caseName,
        phaseCount,
        simTime: assignment.sim_time ?? assignment.presim_time ?? "",
        groups: groupRows,
        sessionId: caseSessionIds[0] ?? null,
        caseSessionIds,
      };
    });

    // Set up the paylod for section with id, name and simulationRows
    const sectionPayload = {
      id: section.id,
      name: section.name,
      simulations: simulationRows,
    };
    
    // Check if the course exists
    const existingCourse = courseMap.get(course.id);
    if (existingCourse) {
      existingCourse.sections.push(sectionPayload); // Add the payload to the existing course
    } else {

      // Fill the empty course map (course_id, Course Object & sections array)
      courseMap.set(course.id, {
        // Course Object
        id: course.id,
        code: course.code,
        name: course.name,
        active: course.active ?? false,

        // Section Array
        sections: [sectionPayload], 
      });
    }
  }

  // Return an array of the data in an array
  return Array.from(courseMap.values()).map((course) => ({
    ...course,
    sections: course.sections,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function FacultyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  let facultyName = "Faculty";
  let avatarUrl = "";

  if (user.id === id) {
    facultyName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      "Faculty";
    avatarUrl = user.user_metadata?.avatar_url || "";
  } else {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", id)
      .single();
    facultyName = profile?.full_name || profile?.email || "Faculty";
  }

  //const dummycourses = getDummyCourses();

  // May come from another file in future...
  const courses = await getFacultyCourses(id)

  const courseCodes = courses.filter((c) => c.active).map((c) => c.code || c.name);

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <FacultyHeader
        name={facultyName}
        avatarUrl={avatarUrl}
        courses={courseCodes}
      />
      <FacultyCoursesView courses={courses} />
    </main>
  );
}
