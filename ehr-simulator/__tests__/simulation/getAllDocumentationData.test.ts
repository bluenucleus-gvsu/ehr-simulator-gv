import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAllDocumentationData } from "@/actions/simulation/getAllDocumentationData";
import { createClient } from "@supabase/supabase-js";
import { PREVIEW_SESSION_ID } from "@/lib/faculty/itemRelease";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

const CASE_ID = "e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d";
const SESSION_ID = "a5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9a";
const PREVIEW_SENTINEL = "00000000-0000-0000-0000-000000000000";

type QueryResult = { data?: unknown; error?: { message: string } | null };

type BuilderCalls = Record<string, unknown[][]>;

function createBuilderMock(result: QueryResult = { data: [], error: null }) {
  const calls: BuilderCalls = {};
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "eq", "or"]) {
    calls[method] = [];
    builder[method] = vi.fn((...args: unknown[]) => {
      calls[method].push(args);
      return builder;
    });
  }
  builder.then = (
    onFulfilled: (value: QueryResult) => unknown,
    onRejected: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return { builder, calls, result };
}

type FromHandlers = Record<string, () => ReturnType<typeof createBuilderMock>>;

function createSupabaseMock(handlers: FromHandlers = {}) {
  const from = vi.fn((table: string) => {
    const handler = handlers[table];
    if (handler) return handler().builder;
    return createBuilderMock().builder;
  });
  return { from };
}

const mockClient = (supabase: ReturnType<typeof createSupabaseMock>) => {
  vi.mocked(createClient).mockReturnValue(supabase as never);
};

beforeEach(() => {
  vi.mocked(createClient).mockReset();
});

const caseRow = {
  id: "case-row-1",
  case_id: CASE_ID,
  time_offset: 0,
  is_in_presim: true,
  hr: "80",
  fhr_baseline: "140",
};

const studentRow = {
  id: "student-row-1",
  case_id: CASE_ID,
  case_session_id: SESSION_ID,
  user_id: "user-1",
  group_id: "group-1",
  time_offset: 0,
  is_in_presim: false,
  hr: "72",
};

describe("getAllDocumentationData", () => {
  it("merges case rows first so student edits win per time offset", async () => {
    mockClient(createSupabaseMock({
      documentation_results: () => createBuilderMock({ data: [caseRow], error: null }),
      editable_documentation_results: () => createBuilderMock({ data: [studentRow], error: null }),
    }));

    const response = await getAllDocumentationData(CASE_ID, SESSION_ID);

    expect(response.success).toBe(true);
    const rows = response.data!;
    expect(rows.map((row) => row.source_type)).toEqual([
      "case_documentation",
      "student_documentation",
    ]);

    const byOffset = new Map(rows.map((row) => [row.time_offset, row]));
    expect(byOffset.get(0)?.source_type).toBe("student_documentation");
    expect(byOffset.get(0)?.hr).toBe("72");
    expect(byOffset.get(0)?.fhr_baseline).toBeUndefined();

    expect(rows[0].fhr_baseline).toBe("140");
  });

  it("fabricates null identity columns on case rows and keeps them on student rows", async () => {
    mockClient(createSupabaseMock({
      documentation_results: () => createBuilderMock({ data: [caseRow], error: null }),
      editable_documentation_results: () => createBuilderMock({ data: [studentRow], error: null }),
    }));

    const rows = (await getAllDocumentationData(CASE_ID, SESSION_ID)).data!;

    const [caseMerged, studentMerged] = rows;
    expect(caseMerged.case_session_id).toBeNull();
    expect(caseMerged.user_id).toBeNull();
    expect(caseMerged.group_id).toBeNull();

    expect(studentMerged.case_session_id).toBe(SESSION_ID);
    expect(studentMerged.user_id).toBe("user-1");
    expect(studentMerged.group_id).toBe("group-1");
  });

  it("queries both tables and filters student rows to the session", async () => {
    const caseBuilder = createBuilderMock({ data: [caseRow], error: null });
    const studentBuilder = createBuilderMock({ data: [studentRow], error: null });
    mockClient(createSupabaseMock({
      documentation_results: () => caseBuilder,
      editable_documentation_results: () => studentBuilder,
    }));

    await getAllDocumentationData(CASE_ID, SESSION_ID);

    expect(caseBuilder.calls.eq).toContainEqual(["case_id", CASE_ID]);
    expect(studentBuilder.calls.eq).toContainEqual(["case_id", CASE_ID]);
    expect(studentBuilder.calls.eq).toContainEqual(["case_session_id", SESSION_ID]);
  });

  it("resolves the preview session id to the sentinel UUID", async () => {
    const studentBuilder = createBuilderMock({ data: [], error: null });
    mockClient(createSupabaseMock({
      documentation_results: () => createBuilderMock({ data: [], error: null }),
      editable_documentation_results: () => studentBuilder,
    }));

    await getAllDocumentationData(CASE_ID, PREVIEW_SESSION_ID);

    expect(studentBuilder.calls.eq).toContainEqual(["case_session_id", PREVIEW_SENTINEL]);
  });

  it("hard-fails when the case baseline query errors", async () => {
    const failure = { message: "case docs broke", code: "XX000" };
    mockClient(createSupabaseMock({
      documentation_results: () => createBuilderMock({ data: null, error: failure }),
      editable_documentation_results: () => createBuilderMock({ data: [], error: null }),
    }));

    const response = await getAllDocumentationData(CASE_ID, SESSION_ID);

    expect(response.success).toBe(false);
    expect(response.message).toBe("Failed to retrieve documentation results.");
    expect(response.error).toMatchObject({ message: "case docs broke" });
  });

  it("hard-fails when the student rows query errors", async () => {
    const failure = { message: "student docs broke", code: "XX000" };
    mockClient(createSupabaseMock({
      documentation_results: () => createBuilderMock({ data: [caseRow], error: null }),
      editable_documentation_results: () => createBuilderMock({ data: null, error: failure }),
    }));

    const response = await getAllDocumentationData(CASE_ID, SESSION_ID);

    expect(response.success).toBe(false);
    expect(response.error).toMatchObject({ message: "student docs broke" });
  });

  it("returns an empty merged list when both tables have no rows", async () => {
    mockClient(createSupabaseMock({
      documentation_results: () => createBuilderMock({ data: null, error: null }),
      editable_documentation_results: () => createBuilderMock({ data: null, error: null }),
    }));

    const response = await getAllDocumentationData(CASE_ID, SESSION_ID);

    expect(response.success).toBe(true);
    expect(response.data).toEqual([]);
  });
});
