import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import {
  buildCourseDiff,
  resolveDraftIds,
  type CourseDraft,
} from "@/lib/courses/courseDiff";
import { getCourseEditState } from "@/actions/courses";

type AssignedCard = {
  id: string;
  case_id: string;
  session_id: string | null;
  canJoin: boolean;
  groupMembers: string[];
  name: string | null;
};

type Profile = {
  activeCourses: Array<{
    id: string;
    assigned: AssignedCard[];
    completed: Array<{ id: string; name: string | null; teamMembers: string[] }>;
  }>;
  inactiveCourses: Array<{ id: string; assigned: AssignedCard[] }>;
};

const studentIds: string[] = [];
const authCleanup: Array<() => Promise<unknown>> = [];
const courseIds: string[] = [];
const caseIds: string[] = [];

const studentName = (index: number) => `RPC Test Student ${index}`;
const student = (index: number) => studentIds[index];

function makeDraft(sections: CourseDraft["sections"]): CourseDraft {
  return {
    name: "RPC Branch Contract Course",
    code: `RPC-${randomUUID().slice(0, 8)}`,
    semester: "Winter 2026",
    start_date: "2026-01-10",
    end_date: "2026-05-01",
    sections,
  };
}

async function callSave(courseId: string | null, draft: CourseDraft) {
  const state = courseId ? await getCourseEditState(supabase, courseId) : { sections: [] };
  const resolved = resolveDraftIds(draft, courseId, () => randomUUID());
  const diff = buildCourseDiff(state, resolved);
  return supabase.rpc("save_course_edits", { p_diff: diff });
}

async function createCourse(draft: CourseDraft): Promise<string> {
  const { data: courseId, error } = await callSave(null, draft);
  if (error || !courseId) throw new Error(`createCourse failed: ${error?.message}`);
  courseIds.push(courseId);
  return courseId;
}

async function createCase(name: string): Promise<string> {
  const id = randomUUID();
  caseIds.push(id);
  const { error } = await supabase.from("cases").insert({
    id,
    name,
    first_name: "Samuel",
    last_name: "Jones",
    code_status: "Full",
    case_specialty: "med_surg",
  });
  if (error) throw new Error(`Could not create test case: ${error.message}`);
  return id;
}

async function assignCase(sectionId: string, caseId: string): Promise<string> {
  const future = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from("section_assignments")
    .insert({ section_id: sectionId, case_id: caseId, sim_time: future, presim_time: future })
    .select("id")
    .single();
  if (error || !data) throw new Error(`assignment insert failed: ${error?.message}`);
  return data.id;
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

async function sessionsOf(groupId: string) {
  const { data, error } = await supabase
    .from("case_sessions")
    .select("id, section_assignment_id, case_id, status, started_at")
    .eq("group_id", groupId);
  if (error || !data) throw new Error(`sessionsOf failed: ${error?.message}`);
  return data;
}

/** Starts a session (fires the participant snapshot trigger). */
async function startSession(sessionId: string) {
  const { error } = await supabase
    .from("case_sessions")
    .update({ started_at: new Date().toISOString() })
    .eq("id", sessionId);
  expect(error).toBeNull();
}

async function view(userId: string): Promise<Profile> {
  const { data, error } = await supabase.rpc("get_user_courses", { p_user_id: userId });
  expect(error).toBeNull();
  return data as Profile;
}

function cardsForCase(profile: Profile, courseId: string, caseId: string): AssignedCard[] {
  return profile.activeCourses
    .find((c) => c.id === courseId)
    ?.assigned.filter((a) => a.case_id === caseId) ?? [];
}

beforeAll(async () => {
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  for (let i = 0; i < 4; i++) {
    const id = randomUUID();
    const email = `rpc-branch-${id}@example.edu`;
    const { error } = await adminSupabase.auth.admin.createUser({
      id,
      email,
      email_confirm: true,
      user_metadata: { full_name: studentName(i) },
    });
    if (error) throw new Error(`Could not create test auth user: ${error.message}`);
    const { error: profileErr } = await supabase.from("users").upsert({
      id,
      email,
      full_name: studentName(i),
      role: "student",
    });
    if (profileErr) throw new Error(`Could not enrich test user profile: ${profileErr.message}`);
    studentIds.push(id);
    authCleanup.push(() => adminSupabase.auth.admin.deleteUser(id));
  }
});

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

describe("W1 — mid-sim student move", () => {
  it("started session follows the moved student, locked with frozen roster; new group's pending work is enterable; others unaffected", async () => {
    const caseId = await createCase("W1 Mid-Sim Move Case");
    const courseId = await createCourse(
      makeDraft([
        {
          id: null,
          name: "S1",
          groups: [
            { id: null, name: "GA", member_ids: [student(0), student(1), student(2)] },
            { id: null, name: "GB", member_ids: [student(3)] },
          ],
        },
      ]),
    );
    const s1 = (await sectionIds(courseId)).get("S1")!;
    const groups = await groupsBySection(s1);
    const ga = groups.find((g) => g.name === "GA")!;
    const gb = groups.find((g) => g.name === "GB")!;

    await assignCase(s1, caseId);
    const gaSession = (await sessionsOf(ga.id)).find((s) => s.case_id === caseId)!;
    const gbSession = (await sessionsOf(gb.id)).find((s) => s.case_id === caseId)!;

    // Sim starts with GA = {A, B, C} — the participant snapshot freezes that roster.
    await startSession(gaSession.id);

    // Admin moves B (student 1) from GA to GB mid-sim.
    const { error } = await callSave(
      courseId,
      makeDraft([
        {
          id: s1,
          name: "S1",
          groups: [
            { id: ga.id, name: "GA", member_ids: [student(0), student(2)] },
            { id: gb.id, name: "GB", member_ids: [student(3), student(1)] },
          ],
        },
      ]),
    );
    expect(error).toBeNull();

    const bView = await view(student(1));
    const bCards = cardsForCase(bView, courseId, caseId);
    const bStarted = bCards.find((c) => c.session_id === gaSession.id);
    expect(bStarted, "started session must follow the moved student").toBeDefined();
    expect(bStarted!.canJoin).toBe(false);
    expect([...bStarted!.groupMembers].sort()).toEqual(
      [studentName(0), studentName(1), studentName(2)].sort(),
    );

    const bPending = bCards.find((c) => c.session_id === gbSession.id);
    expect(bPending, "new group's pending assignment must appear for the moved student").toBeDefined();
    expect(bPending!.canJoin).toBe(true);
    expect([...bPending!.groupMembers].sort()).toEqual(
      [studentName(1), studentName(3)].sort(),
    );

    const aView = await view(student(0));
    const aCards = cardsForCase(aView, courseId, caseId);
    expect(aCards).toHaveLength(1);
    expect(aCards[0].session_id).toBe(gaSession.id);
    expect(aCards[0].canJoin).toBe(true);
    expect([...aCards[0].groupMembers].sort()).toEqual(
      [studentName(0), studentName(1), studentName(2)].sort(),
    );
  });
});

describe("No re-entry of former group's sessions", () => {
  it("move before any session starts: exactly one pending card, current roster, old group's session gone", async () => {
    const caseId = await createCase("W2 Pre-Start Move Case");
    const courseId = await createCourse(
      makeDraft([
        {
          id: null,
          name: "S1",
          groups: [
            { id: null, name: "GA", member_ids: [student(0)] },
            { id: null, name: "GB", member_ids: [student(1)] },
            { id: null, name: "GC", member_ids: [student(2)] },
          ],
        },
      ]),
    );
    const s1 = (await sectionIds(courseId)).get("S1")!;
    const groups = await groupsBySection(s1);
    const ga = groups.find((g) => g.name === "GA")!;
    const gb = groups.find((g) => g.name === "GB")!;

    await assignCase(s1, caseId);
    const gaSession = (await sessionsOf(ga.id)).find((s) => s.case_id === caseId)!;
    const gbSession = (await sessionsOf(gb.id)).find((s) => s.case_id === caseId)!;

    const { error } = await callSave(
      courseId,
      makeDraft([
        {
          id: s1,
          name: "S1",
          groups: [
            { id: ga.id, name: "GA", member_ids: [] },
            { id: gb.id, name: "GB", member_ids: [student(1), student(0)] },
            { id: groups.find((g) => g.name === "GC")!.id, name: "GC", member_ids: [student(2)] },
          ],
        },
      ]),
    );
    expect(error).toBeNull();

    const aView = await view(student(0));
    const aCards = cardsForCase(aView, courseId, caseId);
    expect(aCards).toHaveLength(1);
    expect(aCards[0].session_id).toBe(gbSession.id);
    expect(aCards[0].canJoin).toBe(true);
    expect([...aCards[0].groupMembers].sort()).toEqual(
      [studentName(0), studentName(1)].sort(),
    );
    expect(aCards.some((c) => c.session_id === gaSession.id)).toBe(false);
  });

  it("student who participated in a completed session gets no new card for the assignment", async () => {
    const caseId = await createCase("No-Re-Run Case");
    const courseId = await createCourse(
      makeDraft([
        {
          id: null,
          name: "S1",
          groups: [
            { id: null, name: "GA", member_ids: [] },
            { id: null, name: "GB", member_ids: [student(0), student(1)] },
            { id: null, name: "GC", member_ids: [student(2)] },
          ],
        },
      ]),
    );
    const s1 = (await sectionIds(courseId)).get("S1")!;
    const groups = await groupsBySection(s1);
    const gb = groups.find((g) => g.name === "GB")!;
    const gc = groups.find((g) => g.name === "GC")!;

    await assignCase(s1, caseId);
    const gbSession = (await sessionsOf(gb.id)).find((s) => s.case_id === caseId)!;
    const gcSession = (await sessionsOf(gc.id)).find((s) => s.case_id === caseId)!;

    await startSession(gbSession.id);
    const { error: completeErr } = await supabase
      .from("case_sessions")
      .update({ status: "completed" })
      .eq("id", gbSession.id);
    expect(completeErr).toBeNull();

    const { error } = await callSave(
      courseId,
      makeDraft([
        {
          id: s1,
          name: "S1",
          groups: [
            { id: groups.find((g) => g.name === "GA")!.id, name: "GA", member_ids: [] },
            { id: gb.id, name: "GB", member_ids: [student(1)] },
            { id: gc.id, name: "GC", member_ids: [student(2), student(0)] },
          ],
        },
      ]),
    );
    expect(error).toBeNull();

    const aView = await view(student(0));
    expect(cardsForCase(aView, courseId, caseId)).toHaveLength(0);

    const aCourse = aView.activeCourses.find((c) => c.id === courseId)!;
    const completed = aCourse.completed.filter((c) => c.name?.includes("No-Re-Run"));
    expect(completed).toHaveLength(1);
    expect(completed[0].teamMembers).toContain(studentName(0));
    expect(cardsForCase(aView, courseId, caseId).some((c) => c.session_id === gcSession.id)).toBe(false);
  });

  it("joining a group whose session for the assignment is already completed leaks nothing", async () => {
    const caseId = await createCase("Completed Leak Case");
    const courseId = await createCourse(
      makeDraft([
        {
          id: null,
          name: "S1",
          groups: [
            { id: null, name: "GA", member_ids: [student(0)] },
            { id: null, name: "GB", member_ids: [student(1)] },
          ],
        },
      ]),
    );
    const s1 = (await sectionIds(courseId)).get("S1")!;
    const groups = await groupsBySection(s1);
    const gb = groups.find((g) => g.name === "GB")!;

    await assignCase(s1, caseId);
    const gbSession = (await sessionsOf(gb.id)).find((s) => s.case_id === caseId)!;

    const { error: completeErr } = await supabase
      .from("case_sessions")
      .update({ status: "completed" })
      .eq("id", gbSession.id);
    expect(completeErr).toBeNull();

    const { error } = await callSave(
      courseId,
      makeDraft([
        {
          id: s1,
          name: "S1",
          groups: [
            { id: groups.find((g) => g.name === "GA")!.id, name: "GA", member_ids: [] },
            { id: gb.id, name: "GB", member_ids: [student(1), student(0)] },
          ],
        },
      ]),
    );
    expect(error).toBeNull();

    const aView = await view(student(0));
    expect(cardsForCase(aView, courseId, caseId)).toHaveLength(0);
    const aCourse = aView.activeCourses.find((c) => c.id === courseId)!;
    expect(aCourse.completed.filter((c) => c.name?.includes("Completed Leak"))).toHaveLength(0);
  });
});
