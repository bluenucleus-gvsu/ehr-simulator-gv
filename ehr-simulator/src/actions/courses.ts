"use server"

import { createClient } from "@supabase/supabase-js";
import { Tables, TablesInsert } from "../../database.types";
import { ActionResponse } from "./cases";
import { revalidatePath } from "next/cache";

export type Course = Tables<"courses">
export type CourseInsert = TablesInsert<"courses">
export type Section = Tables<"sections">
export type SectionInsert = TablesInsert<"sections">
export type Group = Tables<"groups">
export type GroupInsert = TablesInsert<"groups">
export type GroupMembers = Tables<"group_members">
export type GroupMembersInsert = TablesInsert<"group_members">
export type FacultySection = Tables<"faculty_section">
export type FacultySectionInsert = TablesInsert<"faculty_section">
export type User = Tables<"users">
export type UserInsert = TablesInsert<"users">

export async function getAllCourses(): Promise<ActionResponse<Course[] | null>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order('code', { ascending: false })

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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)


  if (error) {
    const result: ActionResponse = {
      success: false,
      error,
      message: 'Failed to retrieve course.'
    }
    return result
  }

  const cleanData = Array.isArray(data)
    ? data[0]
    : data

  return {
    success: true,
    data: cleanData,
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


export async function createCourse(course: CourseInsert): Promise<ActionResponse<Course>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
    .single();

  if (error) {
    console.error("Insert Error:", error);
    return { success: false, message: "Failed to create the course. Please try again.", error };
  }
  revalidatePath('/courses');
  return { success: true, message: "Course created successfully.", data };
}

export async function updateCourse(course: CourseInsert): Promise<ActionResponse<Course>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from('courses')
    .update(course)
    .eq('id', course.id)
    .select()
    .single();

  if (error) {
    console.error("Update Error:", error);
    return { success: false, message: "Failed to update the course. Please try again.", error };
  }
  revalidatePath('/courses');
  return {
    success: true,
    message: "Course saved successfully.",
    data
  };
}

export async function createSection(section: SectionInsert): Promise<ActionResponse<Section>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('sections')
    .upsert(section)
    .select()
    .single()

  if (error) {
    console.error("Upsert Error:", error);
    return {
      success: false,
      message: "Failed to update the section. Please try again.",
      error: error
    };
  }

  revalidatePath('/courses');

  return {
    success: true,
    message: "Section saved successfully.",
    data
  };
}

export async function createGroup(group: GroupInsert) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('groups')
    .upsert(group)
    .select()
    .single()

  if (error) {
    console.error("Upsert Error:", error);
    return {
      success: false,
      message: "Failed to update the section. Please try again.",
      error: error
    };
  }

  return {
    success: true,
    message: "Group saved successfully.",
    data
  };
}

export async function createGroupMembers(groupMember: GroupMembersInsert) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('group_members')
    .upsert(groupMember)
    .select()
    .single()

  if (error) {
    console.error("Upsert Error:", error);
    return {
      success: false,
      message: "Failed to update the section. Please try again.",
      error: error
    };
  }

  return {
    success: true,
    message: "Group saved successfully.",
    data
  };
}
