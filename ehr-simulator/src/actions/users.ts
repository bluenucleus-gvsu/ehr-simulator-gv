"use server"

import { createClient } from "@supabase/supabase-js";

export async function getAllUsers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("users")
    .select("*")

  if (error) throw new Error(error.message);

  return data || [];
}

export async function getAllStudentUsers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "student")
  if (error) throw new Error(error.message);

  return data || []
}

export async function getAllAdminUsers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "admin")
  if (error) throw new Error(error.message);

  return data || []
}

export async function getAllFacultyUsers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "faculty")
  if (error) throw new Error(error.message);

  return data || []
}

export async function provisionStudents(students: { email?: string | null; full_name?: string | null }[]) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("users")
    .select("id, email")
    .in("email", emails)

  if (error) throw new Error(error.message)
  return data || []
}