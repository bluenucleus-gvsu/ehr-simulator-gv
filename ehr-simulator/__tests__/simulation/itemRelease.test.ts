import { describe, expect, it } from "vitest";

import {
  PREVIEW_STAGED_OFFSET_STEP_MIN,
  RELEASABLE_ITEMS,
  applyReleaseDelete,
  applyReleaseInsert,
  buildPreviewReleasedItems,
  createEmptyReleasedItemsMap,
  isVisibleInSim,
  resolveDisplayOffset,
  toReleasedItemsMap,
  type SessionItemReleasesByTable,
} from "@/lib/faculty/itemRelease";

const SIM_START = Date.parse("2026-01-01T10:00:00Z");

const allReleaseTables = () =>
  Object.values(RELEASABLE_ITEMS).map(({ releaseTable }) => releaseTable);

const fullReleasesPayload = (
  rows: Partial<Record<keyof SessionItemReleasesByTable, { itemId: string; releasedAt: string }[]>>,
): SessionItemReleasesByTable => {
  const payload = {} as SessionItemReleasesByTable;
  for (const table of allReleaseTables()) {
    payload[table] = rows[table as keyof SessionItemReleasesByTable] ?? [];
  }
  return payload;
};

describe("isVisibleInSim", () => {
  it("shows presim-flagged items and hides others during presim", () => {
    expect(
      isVisibleInSim({ id: "a", phase: 1, isInPresim: true }, true, new Set())
    ).toBe(true);
    expect(
      isVisibleInSim({ id: "b", phase: 1, isInPresim: false }, true, new Set())
    ).toBe(false);
  });

  it("does not let releases bypass presim", () => {
    expect(
      isVisibleInSim({ id: "a", phase: 2 }, true, new Set(["a"]))
    ).toBe(false);
  });

  it("shows phase 1 items in active sim without a release", () => {
    expect(
      isVisibleInSim({ id: "a", phase: 1, isInPresim: true }, false, new Set())
    ).toBe(true);
  });

  it("shows faculty-released items only when released, regardless of phase", () => {
    expect(
      isVisibleInSim({ id: "a", phase: 2 }, false, new Set())
    ).toBe(false);
    expect(
      isVisibleInSim({ id: "a", phase: 2 }, false, new Set(["a"]))
    ).toBe(true);
    expect(
      isVisibleInSim({ id: "a", phase: 3 }, false, new Set())
    ).toBe(false);
    expect(
      isVisibleInSim({ id: "a", phase: 3 }, false, new Set(["a"]))
    ).toBe(true);
  });
});

describe("resolveDisplayOffset", () => {
  it("uses the time_offset when present", () => {
    expect(resolveDisplayOffset(90, undefined, SIM_START)).toBe(90);
  });

  it("derives minutes from the release time for live items", () => {
    const releasedAt = "2026-01-01T10:12:30Z";
    expect(resolveDisplayOffset(null, releasedAt, SIM_START)).toBe(13);
  });

  it("returns -Infinity for unreleased live items or missing sim start", () => {
    expect(resolveDisplayOffset(null, undefined, SIM_START)).toBe(Number.NEGATIVE_INFINITY);
    expect(resolveDisplayOffset(null, "2026-01-01T10:05:00Z", null)).toBe(Number.NEGATIVE_INFINITY);
  });

  it("returns -Infinity for an invalid release timestamp", () => {
    expect(resolveDisplayOffset(null, "not-a-date", SIM_START)).toBe(Number.NEGATIVE_INFINITY);
  });
});

describe("release map helpers", () => {
  it("converts payloads into a keyed map", () => {
    const map = toReleasedItemsMap(fullReleasesPayload({
      lab_result_releases: [
        { itemId: "a", releasedAt: "2026-01-01T10:05:00Z" },
        { itemId: "b", releasedAt: "2026-01-01T10:06:00Z" },
      ],
      clinical_document_releases: [
        { itemId: "n1", releasedAt: "2026-01-01T10:07:00Z" },
      ],
    }));

    expect(map.lab_result_releases.get("a")).toBe("2026-01-01T10:05:00Z");
    expect(map.lab_result_releases.get("b")).toBe("2026-01-01T10:06:00Z");
    expect(map.lab_result_releases.size).toBe(2);
    expect(map.clinical_document_releases.get("n1")).toBe("2026-01-01T10:07:00Z");
  });
});

describe("buildPreviewReleasedItems", () => {
  const bundle = {
    labResults: [
      { id: "lab-baseline", phase: 1 },
      { id: "lab-p2", phase: 2 },
      { id: "lab-p3", phase: 3 },
      { phase: 2 },
    ],
    clinicalDocuments: [
      { id: "note-baseline", phase: 1 },
      { id: "note-p2", phase: 2 },
    ],
    orders: [
      { id: "order-baseline", phase: 1 },
      { id: "order-p3", phase: 3 },
    ],
    medicationOrders: [
      { id: "med-baseline", phase: 1 },
      { id: "med-p2", phase: 2 },
    ],
  };

  it("releases every staged (phase > 1) item across all four tables", () => {
    const map = buildPreviewReleasedItems(bundle, SIM_START);

    expect([...map.lab_result_releases.keys()].sort()).toEqual(["lab-p2", "lab-p3"]);
    expect(map.clinical_document_releases.has("note-p2")).toBe(true);
    expect(map.clinical_document_releases.has("note-baseline")).toBe(false);
    expect([...map.order_releases.keys()]).toEqual(["order-p3"]);
    expect([...map.medication_order_releases.keys()]).toEqual(["med-p2"]);
  });

  it("scales fabricated release stamps by phase so staged content sorts after baseline in phase order", () => {
    const map = buildPreviewReleasedItems(bundle, SIM_START);

    const p2 = Date.parse(map.lab_result_releases.get("lab-p2")!);
    const p3 = Date.parse(map.lab_result_releases.get("lab-p3")!);
    expect(p2).toBe(SIM_START + 2 * PREVIEW_STAGED_OFFSET_STEP_MIN * 60000);
    expect(p3).toBe(SIM_START + 3 * PREVIEW_STAGED_OFFSET_STEP_MIN * 60000);
    expect(p3).toBeGreaterThan(p2);
  });

  it("returns an empty map for a null/empty bundle", () => {
    const empty = buildPreviewReleasedItems(null, SIM_START);
    allReleaseTables().forEach((releaseTable) => {
      expect(empty[releaseTable].size).toBe(0);
    });
    const noStaged = buildPreviewReleasedItems(
      { labResults: [{ id: "a", phase: 1 }], clinicalDocuments: [], orders: [], medicationOrders: [] },
      SIM_START,
    );
    allReleaseTables().forEach((releaseTable) => {
      expect(noStaged[releaseTable].size).toBe(0);
    });
  });
});

describe("realtime reducers", () => {
  it("insert adds itemId -> releasedAt and returns a new reference", () => {
    const initial = createEmptyReleasedItemsMap();
    const next = applyReleaseInsert(initial, "lab_result_releases", "a", "2026-01-01T10:05:00Z");

    expect(next).not.toBe(initial);
    expect(next.lab_result_releases).not.toBe(initial.lab_result_releases);
    expect(next.lab_result_releases.get("a")).toBe("2026-01-01T10:05:00Z");
  });

  it("insert works for the non-lab release tables", () => {
    const initial = createEmptyReleasedItemsMap();
    const next = applyReleaseInsert(initial, "medication_order_releases", "mo1", "t1");

    expect(next.medication_order_releases.get("mo1")).toBe("t1");
    expect(next.lab_result_releases.size).toBe(0);
  });

  it("delete removes by itemId", () => {
    const initial = toReleasedItemsMap(fullReleasesPayload({
      lab_result_releases: [{ itemId: "a", releasedAt: "t1" }],
    }));
    const next = applyReleaseDelete(initial, "lab_result_releases", "a");

    expect(next).not.toBe(initial);
    expect(next.lab_result_releases.has("a")).toBe(false);
  });

  it("delete with a missing itemId is a no-op", () => {
    const initial = toReleasedItemsMap(fullReleasesPayload({
      lab_result_releases: [{ itemId: "a", releasedAt: "t1" }],
    }));
    const next = applyReleaseDelete(initial, "lab_result_releases", "missing");

    expect(next).not.toBe(initial);
    expect(next.lab_result_releases.get("a")).toBe("t1");
  });
});
