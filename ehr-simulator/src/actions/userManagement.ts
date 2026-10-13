"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database } from "../../database.types";
import { createServerSupabase } from "@/utils/supabase/server";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import { userRoles, type ManagedUser, type UserRole } from "@/lib/userManagement";

async function adminClient() {
  const session = await createServerSupabase();
  const { data: { user }, error } = await session.auth.getUser();
  if (error || !user) throw new Error("You must be signed in to manage users.");
  const { data: profile, error: profileError } = await session.from("users")
    .select("role").eq("id", user.id).single();
  if ((profileError || profile?.role !== "admin") && !emailIsDevAdminAllowlist(user.email)) {
    throw new Error("You do not have permission to manage users.");
  }
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getManagedUsers(): Promise<ManagedUser[]> {
  const client = await adminClient();
  const users: ManagedUser[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from("users").select(`
      id, full_name, email, role,
      group_members(groups(sections(id, name, courses(id, code, name)))),
      faculty_section(sections(id, name, courses(id, code, name)))
    `).order("id").range(offset, offset + 499);
    if (error) throw new Error("Unable to load users: " + error.message);
    for (const user of data ?? []) {
      const studentSections = user.group_members.flatMap(m => m.groups?.sections ? [m.groups.sections] : []);
      const allSections = [...studentSections, ...user.faculty_section.flatMap(m => m.sections ? [m.sections] : [])];
      const sections = new Map(studentSections.map(s => [s.id, s.courses ? `${s.courses.code} — ${s.name}` : s.name]));
      const courses = new Map(allSections.flatMap(s => s.courses ? [[s.courses.id, `${s.courses.code} — ${s.courses.name}`] as const] : []));
      users.push({ id: user.id, full_name: user.full_name ?? "", email: user.email ?? "", role: user.role,
        sections: [...sections.values()].sort(), classes: [...courses.values()].sort() });
    }
    if (!data || data.length < 500) break;
  }
  return users.sort((a, b) => a.full_name.localeCompare(b.full_name) || a.email.localeCompare(b.email));
}

export async function updateUserRole(userId: string, role: UserRole) {
  try {
    const client = await adminClient();
    if (!userRoles.includes(role)) throw new Error("Invalid user role.");
    if (!userId) throw new Error("A user is required.");
    const { data, error } = await client.from("users").update({ role }).eq("id", userId).select("id").single();
    if (error || !data) throw new Error("Unable to update this user's role.");
    revalidatePath("/", "layout");
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Unable to update role." };
  }
}
