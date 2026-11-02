import { describe, expect, it } from "vitest";

import {
  buildCourseDiff,
  resolveDraftIds,
  type CourseState,
  type CourseDraft,
  type ResolvedCourseDraft,
} from "@/lib/courses/courseDiff";


let nextFakeId = 0;
/** Deterministic stand-in for crypto.randomUUID. */
function fakeNewId(): string {
  return `new-${++nextFakeId}`;
}

function resolve(draft: CourseDraft & { id?: string | null }): ResolvedCourseDraft {
  nextFakeId = 0;
  const { id, ...rest } = draft;
  return resolveDraftIds(rest, id ?? null, fakeNewId);
}

function makeDraft(overrides?: Partial<CourseDraft> & { id?: string | null }): CourseDraft & { id?: string | null } {
  return {
    name: "NUR 101",
    code: "NUR-101",
    semester: "Winter 2026",
    start_date: "2026-01-10",
    end_date: "2026-05-01",
    sections: [],
    ...overrides,
  };
}

function makeState(overrides?: Partial<CourseState>): CourseState {
  return {
    sections: [],
    ...overrides,
  };
}

type StateGroup = CourseState["sections"][number]["groups"][number];
type StateSection = CourseState["sections"][number];

function stateGroup(
  id: string,
  sectionId: string,
  name: string,
  memberships: StateGroup["memberships"] = [],
  active = true,
): StateGroup {
  return { id, section_id: sectionId, name, active, memberships };
}

function stateSection(
  id: string,
  name: string,
  groups: StateGroup[] = [],
  active = true,
): StateSection {
  return { id, name, active, groups };
}

describe("resolveDraftIds", () => {
  it("mints distinct primary keys for new sections and groups", () => {
    const resolved = resolve(
      makeDraft({
        sections: [
          {
            id: null,
            name: "S1",
            groups: [
              { id: null, name: "G1", member_ids: [] },
              { id: null, name: "G2", member_ids: [] },
            ],
          },
          { id: null, name: "S2", groups: [] },
        ],
      }),
    );

    const [s1, s2] = resolved.sections;
    expect(s1.id).not.toBe(s2.id);
    expect(s1.groups[0].id).not.toBe(s1.groups[1].id);
    expect(s1.groups.every((g) => typeof g.id === "string")).toBe(true);
  });

  it("keeps persisted ids untouched", () => {
    const resolved = resolve(
      makeDraft({
        sections: [
          {
            id: "existing-sec",
            name: "S1",
            groups: [{ id: "existing-grp", name: "G1", member_ids: [] }],
          },
        ],
      }),
    );

    expect(resolved.sections[0].id).toBe("existing-sec");
    expect(resolved.sections[0].groups[0].id).toBe("existing-grp");
  });
});

describe("buildCourseDiff — validation", () => {
  const base: ResolvedCourseDraft = {
    id: null,
    name: "NUR 101",
    code: "NUR-101",
    semester: "Winter 2026",
    start_date: null,
    end_date: null,
    sections: [],
  };

  it("rejects a student assigned to two groups", () => {
    expect(() =>
      buildCourseDiff(
        makeState(),
        resolve(
          makeDraft({
            sections: [
              {
                id: null,
                name: "S1",
                groups: [
                  { id: null, name: "G1", member_ids: ["stu-1"] },
                  { id: null, name: "G2", member_ids: ["stu-1"] },
                ],
              },
            ],
          }),
        ),
      ),
    ).toThrow(/more than one group/);
  });

  it("rejects a student listed twice within the same group", () => {
    expect(() =>
      buildCourseDiff(
        makeState(),
        resolve(
          makeDraft({
            sections: [
              { id: null, name: "S1", groups: [{ id: null, name: "G1", member_ids: ["stu-1", "stu-1"] }] },
            ],
          }),
        ),
      ),
    ).toThrow(/more than one group/);
  });

  it("rejects blank course name, code, semester, section and group names", () => {
    expect(() => buildCourseDiff(makeState(), { ...base, name: "  " })).toThrow(/name is required/i);
    expect(() => buildCourseDiff(makeState(), { ...base, code: "" })).toThrow(/code is required/i);
    expect(() => buildCourseDiff(makeState(), { ...base, semester: "" })).toThrow(/semester is required/i);
    expect(() =>
      buildCourseDiff(makeState(), { ...base, sections: [{ id: "s1", name: "  ", groups: [] }] }),
    ).toThrow(/section name is required/i);
    expect(() =>
      buildCourseDiff(
        makeState(),
        { ...base, sections: [{ id: "s1", name: "S1", groups: [{ id: "g1", name: "", member_ids: [] }] }] },
      ),
    ).toThrow(/group name is required/i);
  });
});

describe("buildCourseDiff — create", () => {
  it("emits all-insert instructions with ids as correlation and no deactivations", () => {
    const diff = buildCourseDiff(
      makeState(),
      resolve(
        makeDraft({
          sections: [
            {
              id: null,
              name: "Section 01",
              groups: [{ id: null, name: "Group A", member_ids: ["stu-1", "stu-2"] }],
            },
          ],
        }),
      ),
    );

    expect(diff.course.id).toBeNull();
    expect(diff.sections_to_deactivate).toEqual([]);
    expect(diff.groups_to_deactivate).toEqual([]);
    expect(diff.group_section_moves).toEqual([]);

    expect(diff.sections_upsert).toHaveLength(1);
    expect(diff.sections_upsert[0].id).toBe("new-1");
    expect(diff.groups_upsert).toEqual([
      { id: "new-2", name: "Group A", section_id: "new-1" },
    ]);
    expect(diff.members_to_deactivate).toEqual([]);
    expect(diff.members_to_reactivate).toEqual([]);
    expect(diff.members_to_insert).toEqual([
      { group_id: "new-2", student_id: "stu-1" },
      { group_id: "new-2", student_id: "stu-2" },
    ]);
  });
});

describe("buildCourseDiff removes sections/groups/members", () => {
  it("deactivates sections and groups absent from the draft", () => {
    const diff = buildCourseDiff(
      makeState({
        sections: [
          stateSection("sec-a", "S1", [
            stateGroup("grp-keep", "sec-a", "Keep"),
            stateGroup("grp-drop", "sec-a", "Drop"),
          ]),
          stateSection("sec-b", "S2", [stateGroup("grp-b", "sec-b", "B")]),
        ],
      }),
      resolve(
        makeDraft({
          id: "course-1",
          sections: [
            { id: "sec-a", name: "S1", groups: [{ id: "grp-keep", name: "Keep", member_ids: [] }] },
          ],
        }),
      ),
    );

    expect(diff.sections_to_deactivate).toEqual(["sec-b"]);
    expect(diff.groups_to_deactivate).toEqual(["grp-drop", "grp-b"]);
    expect(diff.group_section_moves).toEqual([]);
  });

  it("re-homes a group out of a removed section instead of deactivating it", () => {
    const diff = buildCourseDiff(
      makeState({
        sections: [
          stateSection("sec-a", "S1", [stateGroup("grp-1", "sec-a", "G1")]),
          stateSection("sec-b", "S2", []),
        ],
      }),
      resolve(
        makeDraft({
          id: "course-1",
          sections: [
            { id: "sec-b", name: "S2", groups: [{ id: "grp-1", name: "G1", member_ids: ["stu-1"] }] },
          ],
        }),
      ),
    );

    expect(diff.sections_to_deactivate).toEqual(["sec-a"]);
    expect(diff.groups_to_deactivate).toEqual([]);
    expect(diff.group_section_moves).toEqual([
      { group_id: "grp-1", from_section_id: "sec-a", to_section_id: "sec-b" },
    ]);
  });

  it("records a move when a group joins a brand-new section", () => {
    const diff = buildCourseDiff(
      makeState({
        sections: [stateSection("sec-a", "S1", [stateGroup("grp-1", "sec-a", "G1")])],
      }),
      resolve(
        makeDraft({
          id: "course-1",
          sections: [
            { id: "sec-a", name: "S1", groups: [] },
            { id: null, name: "S2", groups: [{ id: "grp-1", name: "G1", member_ids: ["stu-1"] }] },
          ],
        }),
      ),
    );

    expect(diff.group_section_moves).toEqual([
      { group_id: "grp-1", from_section_id: "sec-a", to_section_id: "new-1" },
    ]);
    expect(diff.groups_upsert).toContainEqual({
      id: "grp-1",
      name: "G1",
      section_id: "new-1",
    });
  });

  it("does not record a move when the group stays in its section", () => {
    const diff = buildCourseDiff(
      makeState({
        sections: [stateSection("sec-a", "S1", [stateGroup("grp-1", "sec-a", "G1")])],
      }),
      resolve(
        makeDraft({
          id: "course-1",
          sections: [
            { id: "sec-a", name: "S1 renamed", groups: [{ id: "grp-1", name: "G1 renamed", member_ids: [] }] },
          ],
        }),
      ),
    );

    expect(diff.group_section_moves).toEqual([]);
    expect(diff.sections_upsert).toEqual([{ id: "sec-a", name: "S1 renamed" }]);
  });
});

describe("buildCourseDiff — membership classification", () => {
  it("classifies deactivate / reactivate / insert against all membership rows", () => {
    const diff = buildCourseDiff(
      makeState({
        sections: [
          stateSection("sec-a", "S1", [
            stateGroup("grp-1", "sec-a", "G1", [
              { id: "m-1", student_id: "stu-1", active: true },
              { id: "m-2", student_id: "stu-2", active: true },
              { id: "m-3", student_id: "stu-3", active: false },
              { id: "m-4", student_id: "stu-4", active: false },
            ]),
          ]),
        ],
      }),
      resolve(
        makeDraft({
          id: "course-1",
          sections: [
            {
              id: "sec-a",
              name: "S1",
              groups: [{ id: "grp-1", name: "G1", member_ids: ["stu-1", "stu-3", "stu-5"] }],
            },
          ],
        }),
      ),
    );

    expect(diff.members_to_deactivate).toEqual([{ membership_id: "m-2" }]);
    expect(diff.members_to_reactivate).toEqual([{ membership_id: "m-3" }]);
    expect(diff.members_to_insert).toEqual([{ group_id: "grp-1", student_id: "stu-5" }]);
  });

  it("inserts every member for brand-new groups", () => {
    const diff = buildCourseDiff(
      makeState({
        sections: [stateSection("sec-a", "S1", [])],
      }),
      resolve(
        makeDraft({
          id: "course-1",
          sections: [
            {
              id: "sec-a",
              name: "S1",
              groups: [{ id: null, name: "G2", member_ids: ["stu-1", "stu-2"] }],
            },
          ],
        }),
      ),
    );

    const newGroupId = diff.groups_upsert[0].id;
    expect(diff.members_to_insert).toEqual([
      { group_id: newGroupId, student_id: "stu-1" },
      { group_id: newGroupId, student_id: "stu-2" },
    ]);
    expect(diff.members_to_deactivate).toEqual([]);
    expect(diff.members_to_reactivate).toEqual([]);
  });

  it("produces no member ops for an unchanged group (idempotency)", () => {
    const diff = buildCourseDiff(
      makeState({
        sections: [
          stateSection("sec-a", "S1", [
            stateGroup("grp-1", "sec-a", "G1", [
              { id: "m-1", student_id: "stu-1", active: true },
              { id: "m-2", student_id: "stu-2", active: true },
            ]),
          ]),
        ],
      }),
      resolve(
        makeDraft({
          id: "course-1",
          sections: [
            {
              id: "sec-a",
              name: "S1",
              groups: [{ id: "grp-1", name: "G1", member_ids: ["stu-1", "stu-2"] }],
            },
          ],
        }),
      ),
    );

    expect(diff.members_to_deactivate).toEqual([]);
    expect(diff.members_to_reactivate).toEqual([]);
    expect(diff.members_to_insert).toEqual([]);
  });
});
