type GroupDraft<Id extends string | null = string | null> = {
  id: Id;
  name: string;
  member_ids: string[];
};

type SectionDraft<Id extends string | null = string | null> = {
  id: Id;
  name: string;
  groups: GroupDraft<Id>[];
};

type CourseCore = {
  name: string;
  code: string;
  semester: string;
  start_date: string | null;
  end_date: string | null;
};

export type CourseDraft<Id extends string | null = string | null> = CourseCore & {
  sections: SectionDraft<Id>[];
};

export type ResolvedCourseDraft = CourseDraft<string> & { id: string | null };

type MembershipState = {
  id: string;
  student_id: string;
  active: boolean;
};

type GroupState = {
  id: string;
  section_id: string;
  name: string;
  active: boolean;
  memberships: MembershipState[];
};

type SectionState = {
  id: string;
  name: string;
  active: boolean;
  groups: GroupState[];
};

export type CourseState = {
  sections: SectionState[];
};

export type SectionUpsert = { id: string; name: string };

type GroupUpsert = SectionUpsert & { section_id: string };

type GroupSectionMove = {
  group_id: string;
  from_section_id: string;
  to_section_id: string;
};

type MembershipOp = { membership_id: string };
type MemberInsert = { group_id: string; student_id: string };

type CourseDiff = {
  /** `id: null` = create the course atomically inside the RPC. */
  course: CourseCore & { id: string | null };
  sections_to_deactivate: string[];
  groups_to_deactivate: string[];
  group_section_moves: GroupSectionMove[];
  sections_upsert: SectionUpsert[];
  groups_upsert: GroupUpsert[];
  members_to_deactivate: MembershipOp[];
  members_to_reactivate: MembershipOp[];
  members_to_insert: MemberInsert[];
};

function requireField(value: string | null | undefined, label: string): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  return trimmed;
}

function validateDraft(draft: ResolvedCourseDraft): void {
  requireField(draft.name, "Course name");
  requireField(draft.code, "Course code");
  requireField(draft.semester, "Semester");

  const owner = new Map<string, string>(); // student_id -> group name
  for (const section of draft.sections) {
    requireField(section.name, "Section name");
    for (const group of section.groups) {
      requireField(group.name, "Group name");
      for (const studentId of group.member_ids) {
        const existing = owner.get(studentId);
        if (existing) {
          throw new Error(
            `A student is assigned to more than one group (${existing} and ${group.name}).`,
          );
        }
        owner.set(studentId, group.name);
      }
    }
  }
}

export function resolveDraftIds(
  draft: CourseDraft,
  courseId: string | null,
  newId: () => string,
): ResolvedCourseDraft {
  return {
    id: courseId,
    name: draft.name,
    code: draft.code,
    semester: draft.semester,
    start_date: draft.start_date,
    end_date: draft.end_date,
    sections: draft.sections.map((section) => {
      const sectionId = section.id ?? newId();
      return {
        id: sectionId,
        name: section.name,
        groups: section.groups.map((group) => ({
          id: group.id ?? newId(),
          name: group.name,
          member_ids: group.member_ids,
        })),
      };
    }),
  };
}


export function buildCourseDiff(state: CourseState, draft: ResolvedCourseDraft): CourseDiff {
  validateDraft(draft);

  const stateGroupsById = new Map(
    state.sections.flatMap((s) => s.groups).map((g) => [g.id, g]),
  );

  const payloadSectionIds = draft.sections.map((s) => s.id);
  const payloadGroupIds = draft.sections.flatMap((s) => s.groups.map((g) => g.id));

  const sectionsToDeactivate = state.sections
    .filter((s) => s.active && !payloadSectionIds.includes(s.id))
    .map((s) => s.id);

  const groupsToDeactivate = state.sections
    .flatMap((s) => s.groups)
    .filter((g) => g.active && !payloadGroupIds.includes(g.id))
    .map((g) => g.id);

  const groupSectionMoves: GroupSectionMove[] = [];
  for (const section of draft.sections) {
    for (const group of section.groups) {
      const existing = stateGroupsById.get(group.id);
      if (!existing) continue;
      if (existing.section_id !== section.id) {
        groupSectionMoves.push({
          group_id: group.id,
          from_section_id: existing.section_id,
          to_section_id: section.id,
        });
      }
    }
  }

  const membersToDeactivate: MembershipOp[] = [];
  const membersToReactivate: MembershipOp[] = [];
  const membersToInsert: MemberInsert[] = [];

  for (const section of draft.sections) {
    for (const group of section.groups) {
      const existing = stateGroupsById.get(group.id);
      const memberships = existing ? existing.memberships : [];
      const wantedIds = new Set(group.member_ids);

      for (const membership of memberships) {
        const wanted = wantedIds.has(membership.student_id);
        if (membership.active && !wanted) {
          membersToDeactivate.push({ membership_id: membership.id });
        }
        if (!membership.active && wanted) {
          membersToReactivate.push({ membership_id: membership.id });
        }
      }

      const knownStudents = new Set(memberships.map((m) => m.student_id));
      for (const studentId of group.member_ids) {
        if (!knownStudents.has(studentId)) {
          membersToInsert.push({ group_id: group.id, student_id: studentId });
        }
      }
    }
  }

  return {
    course: {
      id: draft.id,
      name: draft.name.trim(),
      code: draft.code.trim(),
      semester: draft.semester.trim(),
      start_date: draft.start_date,
      end_date: draft.end_date,
    },
    sections_to_deactivate: sectionsToDeactivate,
    groups_to_deactivate: groupsToDeactivate,
    group_section_moves: groupSectionMoves,
    sections_upsert: draft.sections.map((s) => ({ id: s.id, name: s.name.trim() })),
    groups_upsert: draft.sections.flatMap((s) =>
      s.groups.map((g) => ({ id: g.id, name: g.name.trim(), section_id: s.id })),
    ),
    members_to_deactivate: membersToDeactivate,
    members_to_reactivate: membersToReactivate,
    members_to_insert: membersToInsert,
  };
}
