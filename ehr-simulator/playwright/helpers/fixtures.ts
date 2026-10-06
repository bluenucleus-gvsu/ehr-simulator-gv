import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "./auth";
import type {
  CaseInsert,
  CaseRow,
  CaseSessionRow,
  CourseInsert,
  CourseRow,
  GroupInsert,
  GroupMembersInsert,
  SectionAssignmentInsert,
  SectionAssignmentRow,
  SectionInsert,
  SectionRow,
} from "@/types/db";

export type SessionRowState = Pick<
  CaseSessionRow,
  "id" | "status" | "started_at" | "completed_at" | "archived_at"
>;

export interface FixtureDb {
  client: SupabaseClient;

  createCase(opts?: { name?: string }): Promise<FixtureHandle & { case: CaseRow }>;

  createCourse(opts?: {
    active?: boolean;
    groups?: FixtureGroup[];
  }): Promise<FixtureHandle & { course: CourseRow; section: SectionRow; groupIds: string[] }>;

  assignCase(opts: {
    caseId: string;
    sectionId: string;
    presimOffsetHours?: number;
    simOffsetHours?: number;
  }): Promise<FixtureHandle & {
    assignment: SectionAssignmentRow;
    sessionIds: string[];
    sessionIdByGroup: Record<string, string>;
  }>;

  cleanup(): Promise<void>;
}

export interface FixtureHandle {
  cleanup: () => Promise<void>;
}

export interface FixtureGroup {
  name?: string;
  studentIds?: string[];
  inactiveStudentIds?: string[];
}

export const E2E_EMAILS = {
  student: "e2e.student@mail.gvsu.edu",
  faculty: "e2e.faculty@gvsu.edu",
  admin: "e2e.admin@gvsu.edu",
} as const;

const HOUR_MS = 60 * 60 * 1000;

const atOffsetHours = (hours: number): string =>
  new Date(Date.now() + hours * HOUR_MS).toISOString();

export async function setSessionStatus(
  sessionId: string,
  status: CaseSessionRow["status"],
): Promise<void> {
  const client = createServiceClient();
  const now = new Date().toISOString();

  const updates: Partial<CaseSessionRow> = { status };

  if (status === "in progress") {
    updates.started_at = now;
    updates.completed_at = null;
    updates.archived_at = null;
  } else if (status === "completed") {
    updates.completed_at = now;
    updates.archived_at = null;
  } else if (status === "archived") {
    updates.archived_at = now;
    updates.completed_at = null;
  } else {
    updates.started_at = null;
    updates.completed_at = null;
    updates.archived_at = null;
  }

  const { error } = await client.from("case_sessions").update(updates).eq("id", sessionId);
  if (error) throw new Error(`setSessionStatus failed: ${error.message}`);
}

/** Reschedule an existing assignment */
export async function updateAssignmentTimes(
  assignmentId: string,
  opts: { presimOffsetHours: number; simOffsetHours: number },
): Promise<void> {
  const client = createServiceClient();
  const updates: Partial<SectionAssignmentInsert> = {
    presim_time: atOffsetHours(opts.presimOffsetHours),
    sim_time: atOffsetHours(opts.simOffsetHours),
  };
  const { error } = await client
    .from("section_assignments")
    .update(updates)
    .eq("id", assignmentId);
  if (error) throw new Error(`updateAssignmentTimes failed: ${error.message}`);
}

/** DB assertion helper: returns the live row for expect() checks. */
export async function expectSessionStatus(sessionId: string): Promise<SessionRowState> {
  const client = createServiceClient();

  const { data, error } = await client
    .from("case_sessions")
    .select("id, status, started_at, completed_at, archived_at")
    .eq("id", sessionId)
    .single();

  if (error || !data) throw new Error(`expectSessionStatus failed: ${error?.message}`);

  return data;
}

export async function getUserIdByEmail(email: string): Promise<string> {
  const client = createServiceClient();
  const { data, error } = await client.from("users").select("id").eq("email", email).maybeSingle();

  if (error || !data) throw new Error(`getUserIdByEmail failed for ${email}: ${error?.message}`);

  return data.id;
}

/** Invokes archive_due_case_sessions on demand */
export async function runArchiveDueJob(): Promise<number> {
  const client = createServiceClient();
  const { data, error } = await client.rpc("archive_due_case_sessions");

  if (error) throw new Error(`runArchiveDueJob failed: ${error.message}`);

  return Number(data ?? 0);
}

export function createFixtureDb(): FixtureDb {
  const client = createServiceClient();
  const teardowns: Array<() => Promise<void>> = [];

  const track = <T extends FixtureHandle>(fixture: T): T => {
    let done = false;
    const once = async () => {
      if (done) return;
      done = true;
      await fixture.cleanup();
    };
    teardowns.push(once);
    return { ...fixture, cleanup: once };
  };

  return {
    client,

    async createCase(opts) {
      const insert: CaseInsert = {
        name: opts?.name ?? `E2E Case ${randomUUID().slice(0, 8)}`,
        first_name: "E2E",
        last_name: "Patient",
        description: "E2E simulation case",
        age: 55,
        case_specialty: "med_surg" as CaseInsert["case_specialty"],
        code_status: "Full" as CaseInsert["code_status"],
      };
      const { data, error } = await client
        .from("cases")
        .insert(insert)
        .select()
        .single();
      if (error || !data) throw new Error(`createCase failed: ${error?.message}`);
      const caseRow = data as CaseRow;

      return track({
        case: caseRow,
        cleanup: async () => {
          await client.from("cases").delete().eq("id", caseRow.id);
        },
      });
    },

    async createCourse(opts) {
      const suffix = randomUUID().slice(0, 8);
      const courseCode = `E2E-${suffix}`;

      const courseInsert: CourseInsert = {
        code: courseCode,
        name: `E2E Course ${suffix}`,
        active: opts?.active ?? true,
      };
      const { data: course, error: courseError } = await client
        .from("courses")
        .insert(courseInsert)
        .select()
        .single();
      if (courseError || !course) throw new Error(`createCourse course insert failed: ${courseError?.message}`);

      const sectionInsert: SectionInsert = { course_id: course.id, name: `E2E Section ${suffix}` };
      const { data: section, error: sectionError } = await client
        .from("sections")
        .insert(sectionInsert)
        .select()
        .single();
      if (sectionError || !section) throw new Error(`createCourse section insert failed: ${sectionError?.message}`);

      const groupSpecs: FixtureGroup[] = opts?.groups ?? [{}];
      const groupIds: string[] = [];

      for (const [index, spec] of groupSpecs.entries()) {
        const groupInsert: GroupInsert = {
          section_id: section.id,
          name: spec.name ?? `E2E Group ${index + 1} ${suffix}`,
        };
        const { data: group, error: groupError } = await client
          .from("groups")
          .insert(groupInsert)
          .select()
          .single();

        if (groupError || !group) throw new Error(`createCourse group insert failed: ${groupError?.message}`);

        groupIds.push(group.id);

        const memberRows: GroupMembersInsert[] = [
          ...(spec.studentIds ?? []).map((student_id) => ({ group_id: group.id, student_id, active: true })),
          ...(spec.inactiveStudentIds ?? []).map((student_id) => ({ group_id: group.id, student_id, active: false })),
        ];
        if (memberRows.length > 0) {
          const { error: memberError } = await client.from("group_members").insert(memberRows);
          if (memberError) throw new Error(`createCourse group_members insert failed: ${memberError.message}`);
        }
      }

      return track({
        course: course as CourseRow,
        section: section as SectionRow,
        groupIds,
        cleanup: async () => {
          for (const groupId of groupIds) {
            await client.from("group_members").delete().eq("group_id", groupId);
            await client.from("groups").delete().eq("id", groupId);
          }
          await client.from("sections").delete().eq("id", section.id);
          await client.from("courses").delete().eq("id", course.id);
        },
      });
    },

    async assignCase(opts) {
      const assignmentInsert: SectionAssignmentInsert = {
        section_id: opts.sectionId,
        case_id: opts.caseId,
        presim_time: atOffsetHours(opts.presimOffsetHours ?? -1),
        sim_time: atOffsetHours(opts.simOffsetHours ?? 1),
      };

      const { data: assignment, error: assignmentError } = await client
        .from("section_assignments")
        .insert(assignmentInsert)
        .select()
        .single();
      if (assignmentError || !assignment) throw new Error(`assignCase insert failed: ${assignmentError?.message}`);

      const { data: sessions, error: sessionsError } = await client
        .from("case_sessions")
        .select("id, group_id")
        .eq("section_assignment_id", assignment.id);
      if (sessionsError || !sessions) throw new Error(`assignCase session fetch failed: ${sessionsError?.message}`);

      const { count: groupCount, error: groupCountError } = await client
        .from("groups")
        .select("id", { count: "exact", head: true })
        .eq("section_id", opts.sectionId);
      if (groupCountError) throw new Error(`assignCase group count failed: ${groupCountError.message}`);
      if (sessions.length !== groupCount) {
        throw new Error(
          `assignCase trigger check failed: expected ${groupCount} case_sessions for the section, got ${sessions.length}`,
        );
      }

      return track({
        assignment: assignment as SectionAssignmentRow,
        sessionIds: sessions.map((session) => session.id),
        sessionIdByGroup: Object.fromEntries(
          sessions.filter((session) => session.group_id).map((session) => [session.group_id, session.id]),
        ),
        cleanup: async () => {
          await client.from("case_sessions").delete().eq("section_assignment_id", assignment.id);
          await client.from("section_assignments").delete().eq("id", assignment.id);
        },
      });
    },

    async cleanup() {
      const failures: unknown[] = [];
      for (const teardown of teardowns.reverse()) {
        try {
          await teardown();
        } catch (error) {
          failures.push(error);
        }
      }
      if (failures.length > 0) {
        console.error("[fixtures] cleanup reported failures:", failures);
      }
    },
  };
}
