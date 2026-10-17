import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  releaseSessionItems,
  unreleaseSessionItems,
  getReleasePanelData,
  type ReleasableItem,
} from "@/actions/faculty";
import { createVerifiedStaffClient } from "@/utils/supabase/staffAccess";
import { createClient } from "@supabase/supabase-js";

vi.mock("@/utils/supabase/staffAccess", () => ({
  createVerifiedStaffClient: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

const SESSION_ID = "a5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9a";
const CASE_ID = "e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d";
const USER_ID = "f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c";

type QueryResult = { data?: unknown; error?: { message: string } | null };

type BuilderCalls = Record<string, unknown[][]>;

function createBuilderMock(result: QueryResult = { data: [], error: null }) {
  const calls: BuilderCalls = {};
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "eq", "gt", "in", "upsert", "delete"]) {
    calls[method] = [];
    builder[method] = vi.fn((...args: unknown[]) => {
      calls[method].push(args);
      return builder;
    });
  }
  builder.maybeSingle = vi.fn(async () => result);
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

const mockStaff = (supabase: ReturnType<typeof createSupabaseMock>) => {
  vi.mocked(createVerifiedStaffClient).mockResolvedValue({
    supabase: supabase as never,
    userId: USER_ID,
    role: "faculty",
  });
};

beforeEach(() => {
  vi.mocked(createVerifiedStaffClient).mockReset();
});

describe("releaseSessionItems", () => {
  it("rejects an empty item list", async () => {
    const supabase = createSupabaseMock();
    mockStaff(supabase);

    const response = await releaseSessionItems(SESSION_ID, []);

    expect(response.success).toBe(false);
    expect(response.message).toBe("No items were specified.");
  });

  it("rejects a session without a linked case", async () => {
    const sessions = createBuilderMock({ data: null, error: null });
    const supabase = createSupabaseMock({ case_sessions: () => sessions });
    mockStaff(supabase);

    const response = await releaseSessionItems(SESSION_ID, [
      { type: "lab_result", id: "11111111-1111-4111-8111-111111111111" },
    ]);

    expect(response.success).toBe(false);
    expect(response.message).toBe("Simulation session has no linked case.");
    expect(sessions.calls.eq[0]).toEqual(["id", SESSION_ID]);
  });

  it("rejects items that do not exist in the case's item table", async () => {
    const sessions = createBuilderMock({ data: { case_id: CASE_ID }, error: null });
    const labItems = createBuilderMock({
      data: [{ id: "22222222-2222-4222-8222-222222222222", case_id: CASE_ID }],
      error: null,
    });
    const supabase = createSupabaseMock({
      case_sessions: () => sessions,
      lab_results: () => labItems,
    });
    mockStaff(supabase);

    const response = await releaseSessionItems(SESSION_ID, [
      { type: "lab_result", id: "22222222-2222-4222-8222-222222222222" },
      { type: "lab_result", id: "33333333-3333-4333-8333-333333333333" },
    ]);

    expect(response.success).toBe(false);
    expect(response.message).toBe("Some items were not found for this case.");
  });

  it("rejects items belonging to a different case (ownership check)", async () => {
    const sessions = createBuilderMock({ data: { case_id: CASE_ID }, error: null });
    const labItems = createBuilderMock({
      data: [{ id: "22222222-2222-4222-8222-222222222222", case_id: "99999999-9999-4999-8999-999999999999" }],
      error: null,
    });
    const supabase = createSupabaseMock({
      case_sessions: () => sessions,
      lab_results: () => labItems,
    });
    mockStaff(supabase);

    const response = await releaseSessionItems(SESSION_ID, [
      { type: "lab_result", id: "22222222-2222-4222-8222-222222222222" },
    ]);

    expect(response.success).toBe(false);
    expect(response.message).toBe("Some items do not belong to this session's case.");
  });

  it("upserts one release row per item with staff identity and the composite conflict target", async () => {
    const sessions = createBuilderMock({ data: { case_id: CASE_ID }, error: null });
    const labItems = createBuilderMock({
      data: [
        { id: "22222222-2222-4222-8222-222222222222", case_id: CASE_ID },
        { id: "33333333-3333-4333-8333-333333333333", case_id: CASE_ID },
      ],
      error: null,
    });
    const releases = createBuilderMock({ data: null, error: null });
    const supabase = createSupabaseMock({
      case_sessions: () => sessions,
      lab_results: () => labItems,
      lab_result_releases: () => releases,
    });
    mockStaff(supabase);

    const response = await releaseSessionItems(SESSION_ID, [
      { type: "lab_result", id: "22222222-2222-4222-8222-222222222222" },
      { type: "lab_result", id: "33333333-3333-4333-8333-333333333333" },
    ]);

    expect(response.success).toBe(true);
    expect(response.data).toBe(2);
    expect(releases.calls.upsert).toHaveLength(1);
    const [payload, options] = releases.calls.upsert[0] as [
      Record<string, string>[],
      { onConflict: string },
    ];
    expect(options).toEqual({ onConflict: "session_id,item_id" });
    expect(payload).toEqual([
      {
        session_id: SESSION_ID,
        item_id: "22222222-2222-4222-8222-222222222222",
        released_by: USER_ID,
        released_at: expect.any(String),
      },
      {
        session_id: SESSION_ID,
        item_id: "33333333-3333-4333-8333-333333333333",
        released_by: USER_ID,
        released_at: expect.any(String),
      },
    ]);
    for (const row of payload) {
      expect(Number.isNaN(Date.parse(row.released_at))).toBe(false);
    }
  });

  it("batches mixed item types into one upsert per release table", async () => {
    const sessions = createBuilderMock({ data: { case_id: CASE_ID }, error: null });
    const labItems = createBuilderMock({
      data: [{ id: "22222222-2222-4222-8222-222222222222", case_id: CASE_ID }],
      error: null,
    });
    const noteItems = createBuilderMock({
      data: [{ id: "44444444-4444-4444-8444-444444444444", case_id: CASE_ID }],
      error: null,
    });
    const labReleases = createBuilderMock();
    const noteReleases = createBuilderMock();
    const supabase = createSupabaseMock({
      case_sessions: () => sessions,
      lab_results: () => labItems,
      clinical_documents: () => noteItems,
      lab_result_releases: () => labReleases,
      clinical_document_releases: () => noteReleases,
    });
    mockStaff(supabase);

    const items: ReleasableItem[] = [
      { type: "lab_result", id: "22222222-2222-4222-8222-222222222222" },
      { type: "clinical_document", id: "44444444-4444-4444-8444-444444444444" },
    ];

    const response = await releaseSessionItems(SESSION_ID, items);

    expect(response.success).toBe(true);
    expect(response.data).toBe(2);
    expect(labReleases.calls.upsert).toHaveLength(1);
    expect(noteReleases.calls.upsert).toHaveLength(1);
    expect(labReleases.calls.upsert[0][0]).toEqual([
      expect.objectContaining({ item_id: "22222222-2222-4222-8222-222222222222" }),
    ]);
    expect(noteReleases.calls.upsert[0][0]).toEqual([
      expect.objectContaining({ item_id: "44444444-4444-4444-8444-444444444444" }),
    ]);
  });

  it("surfaces an upsert failure as an unsuccessful response", async () => {
    const sessions = createBuilderMock({ data: { case_id: CASE_ID }, error: null });
    const labItems = createBuilderMock({
      data: [{ id: "22222222-2222-4222-8222-222222222222", case_id: CASE_ID }],
      error: null,
    });
    const releases = createBuilderMock({
      data: null,
      error: { message: "duplicate key value violates unique constraint" },
    });
    const supabase = createSupabaseMock({
      case_sessions: () => sessions,
      lab_results: () => labItems,
      lab_result_releases: () => releases,
    });
    mockStaff(supabase);

    const response = await releaseSessionItems(SESSION_ID, [
      { type: "lab_result", id: "22222222-2222-4222-8222-222222222222" },
    ]);

    expect(response.success).toBe(false);
    expect(response.message).toContain("Failed to release items");
  });
});

describe("unreleaseSessionItems", () => {
  it("deletes by session id and item ids", async () => {
    const releases = createBuilderMock({ data: null, error: null });
    const supabase = createSupabaseMock({
      lab_result_releases: () => releases,
    });
    mockStaff(supabase);

    const response = await unreleaseSessionItems(SESSION_ID, [
      { type: "lab_result", id: "22222222-2222-4222-8222-222222222222" },
      { type: "lab_result", id: "33333333-3333-4333-8333-333333333333" },
    ]);

    expect(response.success).toBe(true);
    expect(response.data).toBe(2);
    expect(releases.calls.delete).toHaveLength(1);
    expect(releases.calls.eq[0]).toEqual(["session_id", SESSION_ID]);
    expect(releases.calls.in[0]).toEqual([
      "item_id",
      ["22222222-2222-4222-8222-222222222222", "33333333-3333-4333-8333-333333333333"],
    ]);
  });

  it("rejects an empty item list", async () => {
    mockStaff(createSupabaseMock());

    const response = await unreleaseSessionItems(SESSION_ID, []);

    expect(response.success).toBe(false);
    expect(response.message).toBe("No items were specified.");
  });
});

describe("getReleasePanelData", () => {
  const releasedNoteId = "44444444-4444-4444-8444-444444444444";
  const pendingNoteId = "55555555-5555-4555-8555-555555555555";

  const stubSessionReleases = (rows: Record<string, { item_id: string; released_at: string }[]>) => {
    const client = {
      from: vi.fn((table: string) => createBuilderMock({ data: rows[table] ?? [], error: null }).builder),
    };
    vi.mocked(createClient).mockReturnValue(client as never);
    return client;
  };

  it("returns pending staged items minus already-released ones, with typed released entries", async () => {
    const sessions = createBuilderMock({ data: { case_id: CASE_ID }, error: null });
    const noteItems = createBuilderMock({
      data: [
        { id: releasedNoteId, phase: 2, label: "Cardiology consult" },
        { id: pendingNoteId, phase: 3, label: "Rapid response note" },
      ],
      error: null,
    });
    const supabase = createSupabaseMock({
      case_sessions: () => sessions,
      clinical_documents: () => noteItems,
    });
    mockStaff(supabase);
    stubSessionReleases({
      clinical_document_releases: [{ item_id: releasedNoteId, released_at: "2026-01-01T10:05:00Z" }],
    });

    const response = await getReleasePanelData(SESSION_ID);

    expect(response.success).toBe(true);
    const panel = response.data!;
    expect(panel.pending).toEqual([
      { type: "clinical_document", id: pendingNoteId, phase: 3, label: "Rapid response note" },
    ]);
    expect(panel.released).toEqual([
      {
        type: "clinical_document",
        id: releasedNoteId,
        releasedAt: "2026-01-01T10:05:00Z",
        label: "Cardiology consult",
      },
    ]);
  });

  it("normalizes blank labels to null and floors the pending phase at 1", async () => {
    const sessions = createBuilderMock({ data: { case_id: CASE_ID }, error: null });
    const orderItems = createBuilderMock({
      data: [
        { id: "66666666-6666-4666-8666-666666666666", phase: 2, title: "   " },
        { id: "77777777-7777-4777-8777-777777777777", phase: 0, title: "Nursing orders" },
      ],
      error: null,
    });
    const supabase = createSupabaseMock({
      case_sessions: () => sessions,
      orders: () => orderItems,
    });
    mockStaff(supabase);
    stubSessionReleases({});

    const response = await getReleasePanelData(SESSION_ID);

    expect(response.success).toBe(true);
    const pending = response.data!.pending;
    expect(pending.find((item) => item.type === "order" && item.id === "66666666-6666-4666-8666-666666666666"))
      .toMatchObject({ label: null, phase: 2 });
    expect(pending.find((item) => item.type === "order" && item.id === "77777777-7777-4777-8777-777777777777"))
      .toMatchObject({ label: "Nursing orders", phase: 1 });
  });

  it("queries pending items by the session's case with phase > 1", async () => {
    const sessions = createBuilderMock({ data: { case_id: CASE_ID }, error: null });
    const medItems = createBuilderMock({ data: [], error: null });
    const supabase = createSupabaseMock({
      case_sessions: () => sessions,
      medication_orders: () => medItems,
    });
    mockStaff(supabase);
    stubSessionReleases({});

    await getReleasePanelData(SESSION_ID);

    expect(medItems.calls.eq[0]).toEqual(["case_id", CASE_ID]);
    expect(medItems.calls.gt[0]).toEqual(["phase", 1]);
  });

  it("rejects a session without a linked case", async () => {
    const sessions = createBuilderMock({ data: null, error: null });
    mockStaff(createSupabaseMock({ case_sessions: () => sessions }));

    const response = await getReleasePanelData(SESSION_ID);

    expect(response.success).toBe(false);
    expect(response.message).toBe("Simulation session has no linked case.");
  });
});
