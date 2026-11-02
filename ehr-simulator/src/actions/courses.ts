"use server"

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { Database, Tables } from "../../database.types";
import {
  buildCourseDiff,
  CourseState,
  resolveDraftIds,
  type CourseDraft,
} from "@/lib/courses/courseDiff";
import { ActionResponse } from "./cases";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createRoleGatedClient } from "./roleGatedClient";

export type Course = Tables<"courses">
export type Section = Tables<"sections">
export type Group = Tables<"groups">
export type User = Tables<"users">

export async function getAllCourses(
  opts?: { archived?: boolean }
): Promise<ActionResponse<Course[] | null>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabase.from("courses").select("*");
  query = opts?.archived ? query.eq("active", false) : query.eq("active", true);

  const { data, error } = await query.order('code', { ascending: false })

  if (error) {
    const result: ActionResponse = {
      success: false,
      message: 'Failed to fetch courses.',
      error,
    }
    return result

  }
  return {
    success: true,
    data,
    message: 'Successfully retrieved all courses.'
  }
}

export async function getCourseById(id: string): Promise<ActionResponse<Course | null>> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    const result: ActionResponse = {
      success: false,
      error,
      message: 'Failed to retrieve course.'
    }
    return result
  }

  return {
    success: true,
    data: data,
    message: 'Successfully retrieved course.'
  }
}

export async function getSectionsByCourseId(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("course_id", id)
    .eq("active", true)

  if (error) {
    const result: ActionResponse = {
      success: false,
      error,
      message: 'Failed to retrieve sections.'
    }
    return result;
  }

  return {
    success: true,
    data,
    message: 'Successfully retrieved sections.',
  }
}


export async function getCourseFull(id: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("courses")
    .select(`
      id,
      code,
      name,
      semester,
      start_date,
      end_date,
      active,
      sections (
        id,
        name,
        groups (
          id,
          name,
          group_members (
            student:users ( id, email, full_name )
          )
        )
      )
    `)
    .eq("id", id)
    .eq("sections.active", true)
    .eq("sections.groups.active", true)
    .eq("sections.groups.group_members.active", true)
    .single();

  if (error || !data) {
    console.error("Failed to fetch full course:", error);
    return null;
  }

  return data;
}

export type CourseFull = NonNullable<Awaited<ReturnType<typeof getCourseFull>>>;

export async function saveCourseEdits(courseId: string | null, payload: CourseDraft): Promise<ActionResponse<string | null>> {
  try {
    const supabase = await createRoleGatedClient(["admin"]);

    const state = courseId ? await getCourseEditState(supabase, courseId) : { sections: [] };

    const diff = buildCourseDiff(state, resolveDraftIds(payload, courseId, randomUUID));

    const { data: savedCourseId, error } = await supabase.rpc("save_course_edits", {
      p_diff: diff,
    });
    if (error) {
      console.error("save_course_edits error:", error);
      return { success: false, message: "Failed to save the course. Please try again.", error };
    }

    revalidatePath('/admin/courses', 'layout');
    return { success: true, message: "Course saved successfully.", data: savedCourseId };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save the course. Please try again.",
    };
  }
}

async function setCourseActive(
  courseId: string,
  active: boolean,
  successMessage: string,
  failureMessage: string
): Promise<ActionResponse<null>> {
  try {
    const supabase = await createRoleGatedClient(["admin"]);

    const { error } = await supabase
      .from("courses")
      .update({ active })
      .eq("id", courseId);

    if (error) {
      console.error(`setCourseActive(${active}) error:`, error);
      return { success: false, message: failureMessage, error };
    }

    revalidatePath("/admin/courses");
    return { success: true, message: successMessage, data: null };
  } catch (err) {
    console.error(`setCourseActive(${active}) authorization error:`, err);
    return {
      success: false,
      message: err instanceof Error ? err.message : failureMessage,
    };
  }
}

export async function archiveCourse(courseId: string): Promise<ActionResponse<null>> {
  return setCourseActive(courseId, false, "Course archived.", "Failed to archive the course. Please try again.");
}

export async function unarchiveCourse(courseId: string): Promise<ActionResponse<null>> {
  return setCourseActive(courseId, true, "Course unarchived.", "Failed to unarchive the course. Please try again.");
}

export async function deleteCourse(courseId: string): Promise<ActionResponse<null>> {
  try {
    const supabase = await createRoleGatedClient(["admin"]);

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (error) {
      console.error("deleteCourse error:", error);
      return { success: false, message: "Failed to delete the course. Please try again.", error };
    }

    revalidatePath("/admin/courses");
  } catch (err) {
    console.error("deleteCourse authorization error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete the course. Please try again.",
    };
  }

  redirect("/admin/courses");
}

export async function getCourseEditState(
  supabase: SupabaseClient,
  courseId: string,
): Promise<CourseState> {
  const { data, error } = await supabase
    .from("sections")
    .select(`
      id, 
      name, 
      active, 
      groups (
        id, 
        section_id, 
        name, 
        active, 
          group_members (
            id, 
            student_id, 
            active 
          ) 
      )`
    )
    .eq("course_id", courseId)
    .eq("active", true)
    .eq("groups.active", true);

  if (error) throw new Error(`Failed to fetch course state: ${error.message}`);

  return {
    sections: (data ?? []).map((section) => ({
      id: section.id,
      name: section.name,
      active: section.active,
      groups: section.groups.map((group) => ({
        id: group.id,
        section_id: group.section_id,
        name: group.name,
        active: group.active,
        memberships: group.group_members.map((member) => ({
          id: member.id,
          student_id: member.student_id,
          active: member.active,
        })),
      })),
    })),
  };
}
