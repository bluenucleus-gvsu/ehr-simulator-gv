import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import {
  buildCourseDiff,
  resolveDraftIds,
  type CourseDraft,
  type CourseState,
} from "@/lib/courses/courseDiff";
import { getCourseEditState } from "@/actions/courses";

const studentIds: string[] = [];
const courseIds: string[] = [];
const caseIds: string[] = [];

function student(index: number) {
  return studentIds[index];
}

function makeDraft(sections: CourseDraft["sections"], code?: string): CourseDraft {
  return {
    name: "Test Course",
    code: code ?? `RPC-${randomUUID().slice(0, 8)}`,
    semester: "Winter 2026",
    start_date: "2026-01-10",
    end_date: "2026-05-01",
    sections,
  };
}

async function callSave(courseId: string | null, draft: CourseDraft) {
  const state: CourseState = courseId ? await getCourseEditState(supabase, courseId) : { sections: [] };
  const resolved = resolveDraftIds(draft, courseId, () => randomUUID());
  const diff = buildCourseDiff(state, resolved);
  return supabase.rpc("save_course_edits", { p_diff: diff });
}

async function createCourse(draft: CourseDraft): Promise<string> {
  const { data: courseId, error } = await callSave(null, draft);
  if (error || !courseId) throw new Error(`createCoursestarted failed: ${error?.message}`);
  courseIds.push(courseId);
  return courseId;
}

async function sectionIds(courseId: string): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("sections")
    .select("id, name")
    .eq("course_id", courseId)
    .order("created_at");
  if (error || !data) throw new Error(`sectionIds failed: ${error?.message}`);
  return new Map(data.map((s) => [s.name, s.id]));
}

async function groupsBySection(sectionId: string) {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, active")
    .eq("section_id", sectionId)
    .order("created_at");
  if (error || !data) throw new Error(`groupsBySection failed: ${error?.message}`);
  return data;
}

async function membershipsOf(groupId: string) {
  const { data, error } = await supabase
    .from("group_members")
    .select("id, student_id, active, ended_at")
    .eq("group_id", groupId)
    .order("created_at");
  if (error || !data) throw new Error(`membershipsOf failed: ${error?.message}`);
  return data;
}

async function sessionsOf(groupId: string) {
  const { data, error } = await supabase
    .from("case_sessions")
    .select("id, section_assignment_id, status, started_at")
    .eq("group_id", groupId);
  if (error || !data) throw new Error(`sessionsOf failed: ${error?.message}`);
  return data;
}

beforeAll(async () => {
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Three students, shared across scenarios.
  for (let i = 0; i < 3; i++) {
    const id = randomUUID();
    const email = `rpc-test-${id}@example.edu`;
    const { error } = await adminSupabase.auth.admin.createUser({
      id,
      email,
      email_confirm: true,
      user_metadata: { full_name: `RPC Test Student ${i}` },
    });
    if (error) throw new Error(`Could not create test auth user: ${error.message}`);
    const { error: profileErr } = await supabase.from("users").upsert({
      id,
      email,
      full_name: `RPC Test Student ${i}`,
      role: "student",
    });
    if (profileErr) throw new Error(`Could not enrich test user profile: ${profileErr.message}`);
    studentIds.push(id);
    authCleanup.push(() => adminSupabase.auth.admin.deleteUser(id));
  }
});

const authCleanup: Array<() => Promise<unknown>> = [];

afterAll(async () => {
  // Deleting the course cascades sections → groups → members → sessions → participants.
  if (courseIds.length > 0) {
    await supabase.from("courses").delete().in("id", courseIds);
  }
  if (caseIds.length > 0) {
    await supabase.from("cases").delete().in("id", caseIds);
  }
  if (studentIds.length > 0) {
    await supabase.from("users").delete().in("id", studentIds);
  }
  for (const cleanup of authCleanup) {
    await cleanup().catch(() => undefined);
  }
});

describe("save_course_edits — create", () => {
  it("atomically creates course + sections + groups + memberships and returns the course id", async () => {
    const draft = makeDraft([
      {
        id: null,
        name: "Section 01",
        groups: [
          { id: null, name: "Group A", member_ids: [student(0)] },
          { id: null, name: "Group B", member_ids: [student(1)] },
        ],
      },
    ]);

    const courseId = await createCourse(draft);

    expect(courseId).toMatch(/^[0-9a-f-]{36}$/i);

    const sections = await sectionIds(courseId);
    expect(sections.size).toBe(1);
    const section = sections.get("Section 01")!;

    const groups = await groupsBySection(section);
    expect(groups.map((g) => g.name).sort()).toEqual(["Group A", "Group B"]);
    expect(groups.every((g) => g.active)).toBe(true);

    const groupA = groups.find((g) => g.name === "Group A")!;
    const members = await membershipsOf(groupA.id);
    expect(members).toHaveLength(1);
    expect(members[0].student_id).toBe(student(0));
    expect(members[0].active).toBe(true);
    expect(members[0].ended_at).toBeNull();
  });

  it("rejects a student assigned to two groups and creates nothing", async () => {
    const draft = makeDraft([
      {
        id: null,
        name: "Section 01",
        groups: [
          { id: null, name: "Group A", member_ids: [student(0), student(1)] },
          { id: null, name: "Group B", member_ids: [student(1)] },
        ],
      },
    ]);

    await expect(callSave(null, draft)).rejects.toThrow(/more than one group/);

    const { data } = await supabase.from("courses").select("id").eq("code", draft.code);
    expect(data).toHaveLength(0);
  });
});

describe("save_course_edits — edits", () => {
  it("move student A→B→A: reactivate restores the original row, ended_at cleared, no duplicates", async () => {
    const courseId = await createCourse(
      makeDraft([
        {
          id: null,
          name: "Section 01",
          groups: [
            { id: null, name: "Group A", member_ids: [student(0)] },
            { id: null, name: "Group B", member_ids: [student(1)] },
          ],
        },
      ]),
    );
    const section = (await sectionIds(courseId)).get("Section 01")!;
    const groups = await groupsBySection(section);
    const groupA = groups.find((g) => g.name === "Group A")!;
    const groupB = groups.find((g) => g.name === "Group B")!;

    const { error: swapErr } = await callSave(
      courseId,
      makeDraft([
        {
          id: section,
          name: "Section 01",
          groups: [
            { id: groupA.id, name: "Group A", member_ids: [student(1)] },
            { id: groupB.id, name: "Group B", member_ids: [student(0)] },
          ],
        },
      ]),
    );
    expect(swapErr).toBeNull();

    const aInA = await membershipsOf(groupA.id);
    const bInB = await membershipsOf(groupB.id);
    expect(aInA).toHaveLength(2);
    expect(bInB).toHaveLength(2);
    const aDeactivated = aInA.find((m) => m.student_id === student(0))!;
    const bInserted = aInA.find((m) => m.student_id === student(1))!;
    expect(aDeactivated.active).toBe(false);
    expect(aDeactivated.ended_at).not.toBeNull();
    expect(bInserted.active).toBe(true);
    const aInB = bInB.find((m) => m.student_id === student(0))!;
    expect(aInB.active).toBe(true);

    // Swap back
    const { error: backErr } = await callSave(
      courseId,
      makeDraft([
        {
          id: section,
          name: "Section 01",
          groups: [
            { id: groupA.id, name: "Group A", member_ids: [student(0)] },
            { id: groupB.id, name: "Group B", member_ids: [student(1)] },
          ],
        },
      ]),
    );
    expect(backErr).toBeNull();

    const aInAAfter = await membershipsOf(groupA.id);
    const aRow = aInAAfter.find((m) => m.student_id === student(0))!;
    expect(aRow.id).toBe(aDeactivated.id);
    expect(aRow.active).toBe(true);
    expect(aRow.ended_at).toBeNull();
    expect(aInAAfter.filter((m) => m.student_id === student(0))).toHaveLength(1);
    expect(aInAAfter.filter((m) => m.student_id === student(1))).toHaveLength(1);
    const bRowAfter = aInAAfter.find((m) => m.student_id === student(1))!;
    expect(bRowAfter.active).toBe(false);
    expect(bRowAfter.ended_at).not.toBeNull();
  });

  it("cross-section group move: destination sessions created, old never-started case_sessions deleted, started/completed kept", async () => {
    const caseId = randomUUID();
    caseIds.push(caseId);
    const { error: caseErr } = await supabase.from("cases").insert({
      id: caseId,
      name: "RPC Move Realign Case",
      first_name: "Samuel",
      last_name: "Jones",
      code_status: "Full",
      case_specialty: "med_surg",
    });
    if (caseErr) throw new Error(`Could not create test case: ${caseErr.message}`);

    const courseId = await createCourse(
      makeDraft([
        { id: null, name: "S1", groups: [{ id: null, name: "G1", member_ids: [student(0)] }] },
        { id: null, name: "S2", groups: [{ id: null, name: "G2", member_ids: [student(1)] }] },
      ]),
    );
    const sections = await sectionIds(courseId);
    const s1 = sections.get("S1")!;
    const s2 = sections.get("S2")!;
    const g1 = (await groupsBySection(s1)).find((g) => g.name === "G1")!;

    const future = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const assignmentStarted = { section_id: s1, case_id: caseId, sim_time: future, presim_time: future };
    const assignmentNeverStarted = { ...assignmentStarted };
    const assignmentDest = { section_id: s2, case_id: caseId, sim_time: future, presim_time: future };

    const { data: asg1 } = await supabase.from("section_assignments").insert(assignmentStarted).select("id").single();
    const { data: asg1b } = await supabase.from("section_assignments").insert(assignmentNeverStarted).select("id").single();
    const { data: asg2 } = await supabase.from("section_assignments").insert(assignmentDest).select("id").single();
    if (!asg1 || !asg1b || !asg2) throw new Error("assignment inserts failed");

    const startedSessions = (await sessionsOf(g1.id)).filter((s) => s.section_assignment_id === asg1.id);
    expect(startedSessions).toHaveLength(1);
    const { error: startErr } = await supabase
      .from("case_sessions")
      .update({ started_at: new Date().toISOString() })
      .eq("id", startedSessions[0].id);
    expect(startErr).toBeNull();

    const { data: asg1c } = await supabase
      .from("section_assignments")
      .insert({ ...assignmentStarted })
      .select("id")
      .single();
    if (!asg1c) throw new Error("assignment insert failed");
    const terminalSession = (await sessionsOf(g1.id)).find((s) => s.section_assignment_id === asg1c.id);
    expect(terminalSession).toBeDefined();
    const { error: completeErr } = await supabase
      .from("case_sessions")
      .update({ status: "completed" })
      .eq("id", terminalSession!.id);
    expect(completeErr).toBeNull();

    const { error: moveErr } = await callSave(
      courseId,
      makeDraft([
        { id: s1, name: "S1", groups: [] },
        {
          id: s2,
          name: "S2",
          groups: [
            { id: null, name: "G2", member_ids: [student(1)] },
            { id: g1.id, name: "G1", member_ids: [student(0)] },
          ],
        },
      ]),
    );
    expect(moveErr).toBeNull();

    const { data: movedGroup } = await supabase.from("groups").select("section_id, active").eq("id", g1.id).single();
    expect(movedGroup!.section_id).toBe(s2);
    expect(movedGroup!.active).toBe(true);

    const after = await sessionsOf(g1.id);
    expect(after.some((s) => s.id === startedSessions[0].id)).toBe(true);
    expect(after.some((s) => s.id === terminalSession!.id)).toBe(true);
    expect(after.some((s) => s.section_assignment_id === asg1b!.id)).toBe(false);
    expect(after.filter((s) => s.section_assignment_id === asg2!.id)).toHaveLength(1);
    expect(after).toHaveLength(3);

    const { data: participants } = await supabase
      .from("case_session_participants")
      .select("student_id")
      .eq("case_session_id", startedSessions[0].id);
    expect(participants!.map((p) => p.student_id)).toEqual([student(0)]);
  });

  it("removing a section deactivates it, its groups, and ends their memberships", async () => {
    const courseId = await createCourse(
      makeDraft([
        { id: null, name: "S1", groups: [{ id: null, name: "G1", member_ids: [student(0)] }] },
        { id: null, name: "S2", groups: [] },
      ]),
    );
    const sections = await sectionIds(courseId);
    const s1 = sections.get("S1")!;
    const s2 = sections.get("S2")!;
    const g1 = (await groupsBySection(s1)).find((g) => g.name === "G1")!;

    const { error } = await callSave(
      courseId,
      makeDraft([{ id: s2, name: "S2", groups: [] }]),
    );
    expect(error).toBeNull();

    const { data: sec } = await supabase.from("sections").select("active").eq("id", s1).single();
    expect(sec!.active).toBe(false);
    const { data: grp } = await supabase.from("groups").select("active").eq("id", g1.id).single();
    expect(grp!.active).toBe(false);
    const members = await membershipsOf(g1.id);
    expect(members.every((m) => !m.active && m.ended_at !== null)).toBe(true);
  });

  it("group moved out of a removed section is re-homed, not deactivated", async () => {
    const courseId = await createCourse(
      makeDraft([
        { id: null, name: "S1", groups: [{ id: null, name: "G1", member_ids: [student(0)] }] },
        { id: null, name: "S2", groups: [] },
      ]),
    );
    const sections = await sectionIds(courseId);
    const s1 = sections.get("S1")!;
    const s2 = sections.get("S2")!;
    const g1 = (await groupsBySection(s1)).find((g) => g.name === "G1")!;

    const { error } = await callSave(
      courseId,
      makeDraft([
        { id: s2, name: "S2", groups: [{ id: g1.id, name: "G1", member_ids: [student(0)] }] },
      ]),
    );
    expect(error).toBeNull();

    const { data: sec } = await supabase.from("sections").select("active").eq("id", s1).single();
    expect(sec!.active).toBe(false);
    const { data: grp } = await supabase.from("groups").select("section_id, active").eq("id", g1.id).single();
    expect(grp!.section_id).toBe(s2);
    expect(grp!.active).toBe(true);
    const members = await membershipsOf(g1.id);
    expect(members.filter((m) => m.active)).toHaveLength(1);
  });

  it("re-saving identical data is idempotent", async () => {
    const courseId = await createCourse(
      makeDraft([
        {
          id: null,
          name: "Section 01",
          groups: [{ id: null, name: "Group A", member_ids: [student(0), student(1)] }],
        },
      ]),
    );
    const section = (await sectionIds(courseId)).get("Section 01")!;
    const group = (await groupsBySection(section))[0];
    const before = await membershipsOf(group.id);
    const { data: groupBefore } = await supabase
      .from("groups")
      .select("id, created_at")
      .eq("id", group.id)
      .single();

    const { error } = await callSave(
      courseId,
      makeDraft([
        {
          id: section,
          name: "Section 01",
          groups: [{ id: group.id, name: "Group A", member_ids: [student(0), student(1)] }],
        },
      ]),
    );
    expect(error).toBeNull();

    const after = await membershipsOf(group.id);
    expect(after).toHaveLength(before.length);
    expect(after.map((m) => m.id).sort()).toEqual(before.map((m) => m.id).sort());
    expect(after.every((m) => m.active && m.ended_at === null)).toBe(true);

    const { data: groupAfter } = await supabase
      .from("groups")
      .select("id, created_at")
      .eq("id", group.id)
      .single();
    expect(groupAfter!.created_at).toBe(groupBefore!.created_at);
  });
});

describe("save_course_edits + get_user_courses results in correct student UI", () => {
  it("an in-progress session follows its group across a section move but is not enterable; the new section's assignment is enterable", async () => {
    const caseId = randomUUID();
    caseIds.push(caseId);
    const { error: caseErr } = await supabase.from("cases").insert({
      id: caseId,
      name: "RPC Group Move Visibility Case",
      first_name: "Samuel",
      last_name: "Jones",
      code_status: "Full",
      case_specialty: "med_surg",
    });
    if (caseErr) throw new Error(`Could not create test case: ${caseErr.message}`);

    const courseId = await createCourse(
      makeDraft([
        { id: null, name: "S1", groups: [{ id: null, name: "G1", member_ids: [student(0)] }] },
      ]),
    );
    const s1 = (await sectionIds(courseId)).get("S1")!;
    const g1 = (await groupsBySection(s1)).find((g) => g.name === "G1")!;

    const future = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const { data: asg } = await supabase
      .from("section_assignments")
      .insert({ section_id: s1, case_id: caseId, sim_time: future, presim_time: future })
      .select("id")
      .single();
    if (!asg) throw new Error("assignment insert failed");
    const session = (await sessionsOf(g1.id)).find((s) => s.section_assignment_id === asg.id);
    expect(session).toBeDefined();
    const { error: startErr } = await supabase
      .from("case_sessions")
      .update({ started_at: new Date().toISOString() })
      .eq("id", session!.id);
    expect(startErr).toBeNull();

    const { error: moveErr } = await callSave(
      courseId,
      makeDraft([
        { id: s1, name: "S1", groups: [] },
        { id: null, name: "S2", groups: [{ id: g1.id, name: "G1", member_ids: [student(0)] }] },
      ]),
    );
    expect(moveErr).toBeNull();

    const case2 = randomUUID();
    caseIds.push(case2);
    const { error: case2Err } = await supabase.from("cases").insert({
      id: case2,
      name: "RPC Group Move New Section Case",
      first_name: "Samuel",
      last_name: "Jones",
      code_status: "Full",
      case_specialty: "med_surg",
    });
    if (case2Err) throw new Error(`Could not create test case: ${case2Err.message}`);
    const { data: asg2 } = await supabase
      .from("section_assignments")
      .insert({ section_id: (await sectionIds(courseId)).get("S2")!, case_id: case2, sim_time: future, presim_time: future })
      .select("id")
      .single();
    if (!asg2) throw new Error("assignment 2 insert failed");

    const { data, error } = await supabase.rpc("get_user_courses", { p_user_id: student(0) });
    expect(error).toBeNull();

    const profile = data as {
      activeCourses: Array<{
        id: string;
        assigned: Array<{
          session_id: string | null;
          canJoin: boolean;
          groupMembers: string[];
        }>;
      }>;
    };
    const course = profile.activeCourses.find((c) => c.id === courseId);
    expect(course).toBeDefined();

    const oldCard = course!.assigned.find((a) => a.session_id === session!.id);
    expect(oldCard, "started session must follow the group after a section move").toBeDefined();
    expect(oldCard!.canJoin, "old-section session must be locked after the group moves").toBe(false);
    expect(oldCard!.groupMembers).toContain("RPC Test Student 0");

    const newCard = course!.assigned.find((a) => a.session_id !== session!.id);
    expect(newCard).toBeDefined();
    expect(newCard!.canJoin).toBe(true);
  });
});

describe("save_course_edits + get_user_courses produce correct team roster", () => {
  it("a never-started card shows the live team roster; an in-progress card shows the previous group after a group change", async () => {
    const caseId = randomUUID();
    caseIds.push(caseId);
    const { error: caseErr } = await supabase.from("cases").insert({
      id: caseId,
      name: "RPC Roster Regimes Case",
      first_name: "Samuel",
      last_name: "Jones",
      code_status: "Full",
      case_specialty: "med_surg",
    });
    if (caseErr) throw new Error(`Could not create test case: ${caseErr.message}`);

    const courseId = await createCourse(
      makeDraft([
        { id: null, name: "S1", groups: [{ id: null, name: "GA", member_ids: [student(0)] }] },
      ]),
    );
    const s1 = (await sectionIds(courseId)).get("S1")!;
    const ga = (await groupsBySection(s1)).find((g) => g.name === "GA")!;

    const future = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const { data: asg } = await supabase
      .from("section_assignments")
      .insert({ section_id: s1, case_id: caseId, sim_time: future, presim_time: future })
      .select("id")
      .single();
    if (!asg) throw new Error("assignment insert failed");
    const session = (await sessionsOf(ga.id)).find((s) => s.section_assignment_id === asg.id);
    expect(session).toBeDefined();
    const { error: startErr } = await supabase
      .from("case_sessions")
      .update({ started_at: new Date().toISOString() })
      .eq("id", session!.id);
    expect(startErr).toBeNull();

    const { data: gmState } = await supabase
      .from("group_members")
      .select("id, student_id, active")
      .eq("group_id", ga.id);
    const s1Membership = gmState!.find((m) => m.student_id === student(1))!;
    expect(s1Membership).toBeUndefined();

    const { error: joinErr } = await callSave(
      courseId,
      makeDraft([
        { id: s1, name: "S1", groups: [{ id: ga.id, name: "GA", member_ids: [student(0), student(1)] }] },
      ]),
    );
    expect(joinErr).toBeNull();

    const { data: viewLate, error: lateErr } = await supabase.rpc("get_user_courses", { p_user_id: student(1) });
    expect(lateErr).toBeNull();
    const profile = viewLate as unknown as {
      activeCourses: Array<{
        id: string;
        assigned: Array<{ session_id: string | null; canJoin: boolean; groupMembers: string[] }>;
      }>;
    };
    const card = profile.activeCourses.find((c) => c.id === courseId)!.assigned.find(
      (a) => a.session_id === session!.id
    )!;
    expect(card.canJoin).toBe(true);
    expect(card.groupMembers).toEqual(["RPC Test Student 0"]);

    const { data: participants } = await supabase
      .from("case_session_participants")
      .select("student_id")
      .eq("case_session_id", session!.id);
    expect(participants!.map((p) => p.student_id)).toEqual([student(0)]);
  });
});
