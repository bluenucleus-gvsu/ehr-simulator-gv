"use server"

import { createServerSupabase } from "@/utils/supabase/server";

export interface AssignedCase {
  id: string;
  name: string | null;
  sim_time: string | null;
  presim_time: string | null;
  groupMembers: string[];
}

export interface CompletedCase {
  id: string;
  name: string | null;
  completed_at: string | null;
  feedback: string | null;
  teamMembers: string[];
}

export interface Course {
  id: string;
  name: string | null;
  code: string | null;
  assigned: AssignedCase[];
  completed: CompletedCase[];
}

export interface UserCoursesData {
  activeCourses: Course[];
  inactiveCourses: Course[];
}

export async function getUserCourses(userId: string): Promise<UserCoursesData> {
  const supabase = await createServerSupabase();
  try {
    const { data, error } = await supabase.rpc("get_user_courses", { p_user_id: userId });
    if (error) {
      console.error("RPC get_user_courses error:", error);
      return { activeCourses: [], inactiveCourses: [] };
    }
    const normalize = (courses: Course[]): Course[] =>
      courses.map((c) => ({
        ...c,
        assigned: (c.assigned ?? []).map((a) => ({ ...a, groupMembers: a.groupMembers ?? [] })),
        completed: (c.completed ?? []).map((s) => ({ ...s, teamMembers: s.teamMembers ?? [] })),
      }));

    return {
      activeCourses: normalize((data?.activeCourses ?? []) as Course[]),
      inactiveCourses: normalize((data?.inactiveCourses ?? []) as Course[]),
    };
  } catch (err) {
    console.error("Error fetching user courses:", err);
    return { activeCourses: [], inactiveCourses: [] };
  }
}
