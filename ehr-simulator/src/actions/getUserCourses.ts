"use server"

import { createServerSupabase } from "@/utils/supabase/server";
import { one } from "@/utils/normalizeToRow";
import { SESSION_STATUS, isTerminalSessionStatus, normalizeSessionStatus } from "@/utils/sessionStatus";
import { getCaseSessionAvailability, type CaseSessionAvailability } from "@/utils/assignedSimulationLifecycle";

export interface SessionCard {
  sessionId: string;
  assignmentId: string | null;
  caseId: string | null;
  caseName: string | null;
  status: string | null;
  availability: CaseSessionAvailability;
  simTime: string | null;
  presimTime: string | null;
  finishedAt: string | null;
  feedback: string | null;
  teamMembers: string[];
}

export interface CourseCard {
  id: string;
  name: string | null;
  code: string | null;
  isActive: boolean;
  activeSessions: SessionCard[];
  pastSessions: SessionCard[];
}

export interface UserCoursesData {
  activeCourses: CourseCard[];
  inactiveCourses: CourseCard[];
}

interface SessionRow {
  id: string;
  status: string | null;
  feedback: string | null;
  completed_at: string | null;
  archived_at: string | null;
  group_id: string | null;
  section_assignment_id: string | null;
  case: { id: string; name: string | null } | null;
  section_assignment: { sim_time: string | null; presim_time: string | null } | null;
}

interface CourseEntry {
  course: { id: string; name: string | null; code: string | null };
  isActive: boolean;
  activeSessions: SessionCard[];
  pastSessions: SessionCard[];
}

export async function getUserCourses(userId: string): Promise<UserCoursesData> {
  const supabase = await createServerSupabase();
  try {
    const { data: memberships, error: membershipError } = await supabase
      .from("group_members")
      .select("active, group:groups(id, section:sections(course:courses(id, name, code)))")
      .eq("student_id", userId);

    if (membershipError) {
      console.error("getUserCourses membership query error:", membershipError);
      return { activeCourses: [], inactiveCourses: [] };
    }

    const courseById = new Map<string, CourseEntry>();
    const groupIdToCourseId = new Map<string, string>();
    const activeGroupIds = new Set<string>();

    for (const membership of (memberships ?? [])) {
      const group = one(membership.group);
      const course = one(one(group?.section)?.course);

      if (!group || !course) {
        continue;
      }

      groupIdToCourseId.set(group.id, course.id);

      let entry = courseById.get(course.id);

      if (!entry) {
        entry = { course, isActive: false, activeSessions: [], pastSessions: [] };
        courseById.set(course.id, entry);
      }

      if (membership.active) {
        entry.isActive = true;
        activeGroupIds.add(group.id);
      }
    }

    if (groupIdToCourseId.size === 0) {
      return { activeCourses: [], inactiveCourses: [] };
    }

    const { data: sessionRows, error: sessionError } = await supabase
      .from("case_sessions")
      .select(`id, status, feedback, completed_at, archived_at, group_id, section_assignment_id,
               case:cases(id, name),
               section_assignment:section_assignments(sim_time, presim_time)`)
      .in("group_id", [...groupIdToCourseId.keys()]);

    if (sessionError) {
      console.error("getUserCourses sessions query error:", sessionError);

      return { activeCourses: [], inactiveCourses: [] };
    }

    const { data: memberRows, error: memberError } = await supabase
      .from("group_members")
      .select("group_id, student:users(full_name, email)")
      .in("group_id", [...groupIdToCourseId.keys()])
      .neq("student_id", userId);

    if (memberError) {
      console.error("getUserCourses members query error:", memberError);
    }

    const teamMembersByGroup = new Map<string, string[]>();

    for (const row of (memberRows ?? [])) {
      const student = one(row.student);
      const name = student?.full_name || null;

      if (!name || !row.group_id) {
        continue;
      }

      teamMembersByGroup.set(row.group_id, [...(teamMembersByGroup.get(row.group_id) ?? []), name]);
    }

    for (const session of (sessionRows ?? [])) {
      if (!session.group_id) {
        continue;
      }

      const courseId = groupIdToCourseId.get(session.group_id);
      const courseEntry = courseId ? courseById.get(courseId) : undefined;

      if (!courseEntry) {
        continue;
      }

      const status = normalizeSessionStatus(session.status);
      const card = toCard(session, teamMembersByGroup.get(session.group_id) ?? []);

      if (isTerminalSessionStatus(status)) {
        courseEntry.pastSessions.push({
          ...card,
          finishedAt: status === SESSION_STATUS.Completed ? session.completed_at : session.archived_at,
        });
      } else if (activeGroupIds.has(session.group_id)) {
        courseEntry.activeSessions.push(card);
      }
    }

    const toCourseCard = (entry: CourseEntry): CourseCard => {
      const latestFirst = (a: string | null, b: string | null) =>
        new Date(b ?? 0).getTime() - new Date(a ?? 0).getTime();

      return {
        id: entry.course.id,
        name: entry.course.name,
        code: entry.course.code,
        isActive: entry.isActive,
        activeSessions: entry.activeSessions.toSorted((a, b) => latestFirst(a.simTime, b.simTime)),
        pastSessions: entry.pastSessions.toSorted((a, b) => latestFirst(a.finishedAt, b.finishedAt)),
      };
    };

    const allCourses = [...courseById.values()];

    return {
      activeCourses: allCourses.filter((c) => c.isActive).map(toCourseCard),
      inactiveCourses: allCourses.filter((c) => !c.isActive).map(toCourseCard),
    };
  } catch (err) {
    console.error("Error fetching user courses:", err);
    return { activeCourses: [], inactiveCourses: [] };
  }
}

function toCard(session: SessionRow, teamMembers: string[]): SessionCard {
  return {
    sessionId: session.id,
    assignmentId: session.section_assignment_id,
    caseId: session.case?.id ?? null,
    caseName: session.case?.name ?? null,
    status: session.status,
    availability: getCaseSessionAvailability(
      session.section_assignment?.sim_time,
      session.section_assignment?.presim_time,
      session.status,
    ),
    simTime: session.section_assignment?.sim_time ?? null,
    presimTime: session.section_assignment?.presim_time ?? null,
    finishedAt: null,
    feedback: session.feedback,
    teamMembers,
  };
}
