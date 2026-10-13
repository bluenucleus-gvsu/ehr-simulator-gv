import type { Database } from "../../database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];
const roleLabels: Record<UserRole, string> = {
  student: "Student",
  admin: "Admin",
  faculty: "Faculty",
};
export const userRoles = Object.keys(roleLabels) as UserRole[];
export { roleLabels };
export type ManagedUser = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  sections: string[];
  classes: string[];
};
