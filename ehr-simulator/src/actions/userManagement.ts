"use server";

import { revalidatePath } from "next/cache";
import { userRoles, type ManagedUser, type UserRole } from "@/lib/userManagement";
import { createRoleGatedClient } from "./roleGatedClient";

export async function getManagedUsers(): Promise<ManagedUser[]> {
  const { supabase } = await createRoleGatedClient(['admin', 'faculty']);
  const users: ManagedUser[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("users").select(`
      id, full_name, email, role,
      group_members(groups(sections(id, name, courses(id, code, name))))
    `).order("id").range(offset, offset + 499)
      .eq("group_members.active", true)
      .eq("group_members.groups.active", true)
      .eq("group_members.groups.sections.active", true);
    if (error) throw new Error("Unable to load users: " + error.message);
    for (const user of data ?? []) {
      const studentSections = user.group_members.flatMap(m => m.groups?.sections ? [m.groups.sections] : []);
      const allSections = studentSections;
      const sections = new Map(studentSections.map(s => [s.id, s.courses ? `${s.courses.code} — ${s.name}` : s.name]));
      const courses = new Map(allSections.flatMap(s => s.courses ? [[s.courses.id, `${s.courses.code} — ${s.courses.name}`] as const] : []));
      users.push({
        id: user.id, full_name: user.full_name ?? "", email: user.email ?? "", role: user.role,
        sections: [...sections.values()].sort(), classes: [...courses.values()].sort()
      });
    }
    if (!data || data.length < 500) break;
  }
  return users.sort((a, b) => a.full_name.localeCompare(b.full_name) || a.email.localeCompare(b.email));
}

export async function updateUserRole(userId: string, role: UserRole) {
  try {
    const { supabase } = await createRoleGatedClient(['admin']);
    if (!userRoles.includes(role)) throw new Error("Invalid user role.");
    if (!userId) throw new Error("A user is required.");
    const { data, error } = await supabase.from("users").update({ role }).eq("id", userId).select("id").single();
    if (error || !data) throw new Error("Unable to update this user's role.");
    revalidatePath("/", "layout");
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Unable to update role." };
  }
}
