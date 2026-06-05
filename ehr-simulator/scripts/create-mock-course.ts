import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

const DEFAULT_STUDENT_EMAIL = "khanm3@mail.gvsu.edu";
const PREFERRED_CASE_ID = "211f12d9-b6d8-4fea-acd2-36c803aab63a";

function loadEnvLocal() {
  const envPath = join(process.cwd(), ".env.local");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function resolveCaseId(
  supabase: ReturnType<typeof createClient>,
  explicitCaseId?: string,
): Promise<string> {
  if (explicitCaseId) {
    const { data, error } = await supabase
      .from("cases")
      .select("id")
      .eq("id", explicitCaseId)
      .maybeSingle();
    if (error) throw error;
    if (!data?.id) throw new Error(`Case not found: ${explicitCaseId}`);
    return data.id;
  }

  const { data: preferred, error: preferredErr } = await supabase
    .from("cases")
    .select("id")
    .eq("id", PREFERRED_CASE_ID)
    .maybeSingle();
  if (preferredErr) throw preferredErr;
  if (preferred?.id) return preferred.id;

  const { data: complete, error: completeErr } = await supabase
    .from("cases")
    .select("id")
    .eq("case_creation_complete", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (completeErr) throw completeErr;
  if (complete?.id) return complete.id;

  const { data: anyCase, error: anyErr } = await supabase
    .from("cases")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (anyErr) throw anyErr;
  if (!anyCase?.id) {
    throw new Error(
      "No cases in the database. Run: npx tsx scripts/create-full-mock-case.ts",
    );
  }
  return anyCase.id;
}

async function main() {
  loadEnvLocal();

  const studentEmail = process.argv[2] ?? DEFAULT_STUDENT_EMAIL;
  const caseIdArg = process.argv[3];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: student, error: studentErr } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .ilike("email", studentEmail)
    .maybeSingle();
  if (studentErr) throw studentErr;
  if (!student?.id) {
    throw new Error(`No user found for email: ${studentEmail}`);
  }
  if (student.role !== "student") {
    console.warn(`Warning: user role is "${student.role}", expected "student"`);
  }

  const caseId = await resolveCaseId(supabase, caseIdArg);
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .insert({
      name: `Mock Simulation Course (${stamp})`,
      code: `SIM-${Date.now().toString().slice(-6)}`,
      active: true,
    })
    .select("id, name, code")
    .single();
  if (courseErr) throw courseErr;

  const meetingTime = new Date();
  meetingTime.setHours(10, 0, 0, 0);

  const { data: section, error: sectionErr } = await supabase
    .from("sections")
    .insert({
      course_id: course.id,
      name: "Section A",
      meeting_time: meetingTime.toISOString(),
      semester: "Spring 2026",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id, name")
    .single();
  if (sectionErr) throw sectionErr;

  const { data: group, error: groupErr } = await supabase
    .from("groups")
    .insert({
      section_id: section.id,
      name: "Group 1",
    })
    .select("id, name")
    .single();
  if (groupErr) throw groupErr;

  const { error: memberErr } = await supabase.from("group_members").insert({
    group_id: group.id,
    student_id: student.id,
    active: true,
  });
  if (memberErr) throw memberErr;

  const { error: courseCaseErr } = await supabase.from("course_cases").insert({
    course_id: course.id,
    case_id: caseId,
  });
  if (courseCaseErr) throw courseCaseErr;

  const presimTime = new Date();
  const simTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

  const { data: assignment, error: assignmentErr } = await supabase
    .from("section_assignments")
    .insert({
      section_id: section.id,
      case_id: caseId,
      presim_time: presimTime.toISOString(),
      sim_time: simTime.toISOString(),
    })
    .select("id, presim_time, sim_time")
    .single();
  if (assignmentErr) throw assignmentErr;

  const { data: coursesForStudent, error: rpcErr } = await supabase.rpc(
    "get_user_courses",
    { p_user_id: student.id },
  );
  if (rpcErr) throw rpcErr;

  const activeCourses =
    coursesForStudent &&
    typeof coursesForStudent === "object" &&
    "activeCourses" in coursesForStudent &&
    Array.isArray((coursesForStudent as { activeCourses: unknown }).activeCourses)
      ? (coursesForStudent as { activeCourses: { id: string }[] }).activeCourses
      : [];
  const visible = activeCourses.find((c) => c.id === course.id) ?? null;

  console.log(
    JSON.stringify(
      {
        success: true,
        student: {
          id: student.id,
          email: student.email,
          full_name: student.full_name,
        },
        course: {
          id: course.id,
          name: course.name,
          code: course.code,
        },
        section: { id: section.id, name: section.name },
        group: { id: group.id, name: group.name },
        caseId,
        sectionAssignment: assignment,
        studentSeesCourse: Boolean(visible),
        getUserCoursesPreview: visible ?? "Course created; refresh student dashboard if not listed yet",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Failed to create mock course:", error);
  process.exit(1);
});
