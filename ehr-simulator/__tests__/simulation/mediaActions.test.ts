import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { getMedia } from "@/actions/simulation";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

const CASE_ID = "11111111-1111-4111-8111-111111111111";
const SESSION_ID = "22222222-2222-4222-8222-222222222222";

function createBuilder(result: { data?: unknown; error?: { message: string } | null }) {
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "eq"]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.maybeSingle = vi.fn(async () => result);
  builder.then = (
    resolve: (value: typeof result) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(resolve, reject);
  return builder;
}

function setClient(results: Record<string, { data?: unknown; error?: { message: string } | null }>) {
  const client = {
    from: vi.fn((table: string) => createBuilder(results[table] ?? { data: [], error: null })),
  };
  vi.mocked(createClient).mockReturnValue(client as never);
}

describe("getMedia", () => {
  beforeEach(() => vi.mocked(createClient).mockReset());

  it("returns phase 1 and this session's released media only", async () => {
    setClient({
      case_sessions: { data: { case_id: CASE_ID }, error: null },
      case_images: {
        data: [
          { id: "baseline", preview_url: "baseline.png", phase: 1, is_in_presim: true },
          { id: "released", preview_url: "released.png", phase: 2, is_in_presim: false },
          { id: "pending", preview_url: "pending.png", phase: 3, is_in_presim: false },
        ],
        error: null,
      },
      case_image_releases: { data: [{ item_id: "released" }], error: null },
    });

    const result = await getMedia(CASE_ID, SESSION_ID, false);

    expect(result.success).toBe(true);
    expect(result.data?.map((image) => image.id)).toEqual(["baseline", "released"]);
  });

  it("does not let a release bypass presimulation visibility", async () => {
    setClient({
      case_sessions: { data: { case_id: CASE_ID }, error: null },
      case_images: {
        data: [{ id: "staged", preview_url: "staged.png", phase: 2, is_in_presim: false }],
        error: null,
      },
      case_image_releases: { data: [{ item_id: "staged" }], error: null },
    });

    const result = await getMedia(CASE_ID, SESSION_ID, true);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it("rejects a case that does not match the session", async () => {
    setClient({
      case_sessions: { data: { case_id: "33333333-3333-4333-8333-333333333333" }, error: null },
    });

    const result = await getMedia(CASE_ID, SESSION_ID, false);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Media is not available for this simulation session.");
  });
});
