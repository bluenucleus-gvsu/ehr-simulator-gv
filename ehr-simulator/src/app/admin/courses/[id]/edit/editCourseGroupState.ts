import type { CourseEditSection } from "@/actions/courses";
import type { SectionGroups } from "@/app/admin/courses/new/SectionCard";
import type { Student } from "@/app/admin/courses/new/types";

export const SHARED_POOL = "__shared__";
export const UNASSIGNED_GROUP = "__unassigned__";
export const DEFAULT_GROUP_SIZE = 4;

export type SectionGroupState = {
  groups: SectionGroups;
  groupSize: number;
  groupIdsByName: Record<string, string>;
  groupFacultyLeads: Record<string, string>;
};

export function toStudent(option: {
  id: string;
  full_name?: string | null;
  email?: string | null;
}): Student {
  return {
    id: option.id,
    full_name: option.full_name ?? null,
    email: option.email ?? null,
    role: "student",
    is_active: true,
    status: null,
    created_at: null,
    updated_at: null,
  };
}

export function studentKey(student: Student) {
  return student.id ?? student.email ?? student.full_name ?? "";
}

export function withoutStudent(students: Student[], student: Student) {
  const key = studentKey(student);
  return students.filter((s) => studentKey(s) !== key);
}

export function buildInitialGroupState(sections: CourseEditSection[]): {
  sharedUnassigned: Student[];
  sectionStates: Record<string, SectionGroupState>;
} {
  const sectionStates: Record<string, SectionGroupState> = {};
  const assignedIds = new Set<string>();
  const allStudents = new Map<string, Student>();

  for (const section of sections) {
    for (const enrollment of section.enrollments) {
      if (!enrollment.active || !enrollment.student_id) continue;
      allStudents.set(
        enrollment.student_id,
        toStudent({
          id: enrollment.student_id,
          full_name: enrollment.student?.full_name,
          email: enrollment.student?.email,
        })
      );
    }

    // Only reuse IDs from template groups; assignment IDs must not become template IDs.
    const useTemplates = section.templateGroups.length > 0;
    const sourceGroups = useTemplates
      ? section.templateGroups
      : section.assignments[0]?.groups ?? [];

    const groups: SectionGroups = {};
    const groupIdsByName: Record<string, string> = {};

    for (const group of sourceGroups) {
      const members = group.members
        .filter((m) => m.student_id)
        .map((m) =>
          toStudent({
            id: m.student_id!,
            full_name: m.student?.full_name,
            email: m.student?.email,
          })
        );
      groups[group.name] = members;
      if (useTemplates) {
        groupIdsByName[group.name] = group.id;
      }
      for (const member of members) {
        if (member.id) assignedIds.add(member.id);
      }
    }

    sectionStates[section.name] = {
      groups,
      groupSize: DEFAULT_GROUP_SIZE,
      groupIdsByName,
      groupFacultyLeads: {},
    };
  }

  const sharedUnassigned = [...allStudents.values()].filter(
    (s) => !s.id || !assignedIds.has(s.id)
  );

  return { sharedUnassigned, sectionStates };
}

export function removeStudentFromAllGroups(
  sectionStates: Record<string, SectionGroupState>,
  student: Student
): Record<string, SectionGroupState> {
  const next: Record<string, SectionGroupState> = {};
  for (const [sectionId, state] of Object.entries(sectionStates)) {
    const groups: SectionGroups = {};
    for (const [groupName, students] of Object.entries(state.groups)) {
      groups[groupName] = withoutStudent(students, student);
    }
    next[sectionId] = { ...state, groups };
  }
  return next;
}
