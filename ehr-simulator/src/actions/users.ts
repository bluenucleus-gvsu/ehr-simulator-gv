"use server"

import { ActionResponse } from "./cases";
import { createServiceSupabase } from "@/utils/supabase/service";

export async function getAllUsers() {
  const supabase = createServiceSupabase();

  const { data, error } = await supabase
    .from("users")
    .select("*")

  if (error) throw new Error(error.message);

  return data || [];
}

export async function getAllStudentUsers() {
  const supabase = createServiceSupabase();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "student")
    .ilike("email", "%@mail.gvsu.edu")
  if (error) throw new Error(error.message);

  return data || []
}

export async function getAllAdminUsers() {
  const supabase = createServiceSupabase();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "admin")
  if (error) throw new Error(error.message);

  return data || []
}

export async function getAllFacultyUsers() {
  const supabase = createServiceSupabase();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "faculty")
  if (error) throw new Error(error.message);

  return data || []
}

export async function provisionStudents(students: { email?: string | null; full_name?: string | null }[]) {
  const supabase = createServiceSupabase();

  // Find which emails already have a record in the users table
  const emails = students.map(s => s.email).filter(Boolean) as string[];
  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("email")
    .in("email", emails);

  if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);

  const existingEmails = new Set(existing?.map(u => u.email) ?? []);

  // Only create records for students not yet in the users table
  const newStudents = students.filter(s => s.email && !existingEmails.has(s.email));

  if (newStudents.length === 0) return { provisioned: [] };

  const { error } = await supabase
    .from("users")
    .insert(
      newStudents.map(s => ({
        id: crypto.randomUUID(),
        email: s.email,
        full_name: s.full_name,
        role: "student",
        is_active: false,
      }))
    );

  if (error) throw new Error(`Insert failed: ${error.message}`);

  return { provisioned: newStudents };
}

export async function getUsersByEmails(emails: string[]) {
  const supabase = createServiceSupabase();

  const { data, error } = await supabase
    .from("users")
    .select("id, email")
    .in("email", emails)

  if (error) throw new Error(error.message)
  return data || []
}
export async function getUsersGroupId(userId: string) {
  const supabase = createServiceSupabase();

  const { data, error } = await supabase
    .from('users')
    .select(`id,
      full_name,
      role,
      group_members!inner(group_id)
      `)
    .eq('id', userId)
    .single();

  if (error) {
    const response: ActionResponse = {
      success: false,
      error,
      message: 'Failed to retrieve user data'
    };
    return response;
  }
  const extractedGroupId = data.group_members[0]?.group_id

  const cleanData = {
    id: data.id,
    full_name: data.full_name,
    group_id: extractedGroupId,
    role: data.role
  };
  return {
    success: true,
    data: cleanData,
    message: 'Successfully retrieved user data.'
  }
}
