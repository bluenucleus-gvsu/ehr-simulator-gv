import type { Tables, TablesInsert } from "../../database.types";

// ─── Row types ───────────────────────────────────────────────────────────────

export type UserRow = Tables<"users">;
export type CourseRow = Tables<"courses">;
export type SectionRow = Tables<"sections">;
export type GroupRow = Tables<"groups">;
export type GroupMemberRow = Tables<"group_members">;
export type FacultySectionRow = Tables<"faculty_section">;
export type CaseRow = Tables<"cases">;
export type CaseSessionRow = Tables<"case_sessions">;
export type SectionAssignmentRow = Tables<"section_assignments">;

// ─── Insert types ────────────────────────────────────────────────────────────

export type UserInsert = TablesInsert<"users">;
export type CourseInsert = TablesInsert<"courses">;
export type SectionInsert = TablesInsert<"sections">;
export type GroupInsert = TablesInsert<"groups">;
export type GroupMembersInsert = TablesInsert<"group_members">;
export type FacultySectionInsert = TablesInsert<"faculty_section">;
export type CaseInsert = TablesInsert<"cases">;
export type SectionAssignmentInsert = TablesInsert<"section_assignments">;
