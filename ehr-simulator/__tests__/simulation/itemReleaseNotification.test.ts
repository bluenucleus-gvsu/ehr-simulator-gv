import { describe, expect, it } from "vitest";

import { createEmptyReleasedItemsMap, type ReleasedItemsMap } from "@/lib/faculty/itemRelease";
import {
  buildReleaseUpdateSummary,
  diffReleasedItems,
} from "@/lib/faculty/itemReleaseNotification";
import type { CaseBundle } from "@/actions/case_builder/getCase";

function makeMap(
  entries: Record<string, string>,
  table: keyof ReleasedItemsMap = "lab_result_releases",
) {
  const map = createEmptyReleasedItemsMap();
  for (const [itemId, releasedAt] of Object.entries(entries)) {
    map[table].set(itemId, releasedAt);
  }
  return map;
}

const BUNDLE_WITH_LABELS = {
  labResults: [
    { id: "a", label: "BMP — 1h post-diuresis" },
    { id: "b", label: null },
  ],
} as unknown as CaseBundle;

describe("diffReleasedItems", () => {
  it("returns items added since the baseline, sorted by releasedAt", () => {
    const baseline = makeMap({ old: "2026-01-01T10:00:00Z" });
    const current = makeMap({
      old: "2026-01-01T10:00:00Z",
      second: "2026-01-01T10:06:00Z",
      first: "2026-01-01T10:05:00Z",
    });

    const diff = diffReleasedItems(baseline, current);
    expect(diff.lab_result_releases.map((entry) => entry.itemId)).toEqual(["first", "second"]);
  });

  it("returns an empty diff when nothing changed", () => {
    const map = makeMap({ a: "t1" });
    expect(diffReleasedItems(map, map).lab_result_releases).toEqual([]);
  });

  it("an un-released item vanishes from the diff", () => {
    const baseline = makeMap({});
    const released = makeMap({ a: "t1" });
    const afterUnrelease = makeMap({});

    expect(diffReleasedItems(baseline, released).lab_result_releases).toHaveLength(1);
    expect(diffReleasedItems(baseline, afterUnrelease).lab_result_releases).toEqual([]);
  });
});

describe("buildReleaseUpdateSummary", () => {
  it("builds a labs section from the diff", () => {
    const summary = buildReleaseUpdateSummary(
      makeMap({}),
      makeMap({ a: "2026-01-01T10:05:00Z", b: "2026-01-01T10:06:00Z" }),
      BUNDLE_WITH_LABELS,
    );

    expect(summary.hasAnyNewData).toBe(true);
    expect(summary.sections).toHaveLength(1);
    expect(summary.sections[0]).toMatchObject({
      key: "labs",
      label: "Labs",
      items: ["BMP — 1h post-diuresis", "Lab panel 2"],
      summary: "New 2 lab panels available.",
    });
  });

  it("excludes baseline items from the summary", () => {
    const baseline = makeMap({ a: "t1" });
    const current = makeMap({ a: "t1", b: "t2" });

    const summary = buildReleaseUpdateSummary(baseline, current, BUNDLE_WITH_LABELS);
    expect(summary.sections[0].items).toEqual(["Lab panel 1"]);
  });

  it("returns hasAnyNewData false for an empty diff", () => {
    const map = makeMap({ a: "t1" });
    const summary = buildReleaseUpdateSummary(map, map, BUNDLE_WITH_LABELS);

    expect(summary.hasAnyNewData).toBe(false);
    expect(summary.sections).toEqual([]);
  });

  it("maps clinical_document releases to the Notes section", () => {
    const bundle = {
      clinicalDocuments: [
        { id: "n1", label: "Cardiology consult", category: "Consult" },
        { id: "n2", label: null, category: "Progress" },
      ],
    } as unknown as CaseBundle;

    const summary = buildReleaseUpdateSummary(
      makeMap({}, "clinical_document_releases"),
      makeMap({ n1: "t1", n2: "t2" }, "clinical_document_releases"),
      bundle,
    );

    expect(summary.sections).toHaveLength(1);
    expect(summary.sections[0]).toMatchObject({
      key: "notes",
      label: "Notes",
      items: ["Cardiology consult", "Note 2"],
    });
  });

  it("maps order releases to the Orders section using title as the label", () => {
    const bundle = {
      orders: [
        { id: "o1", title: "Chest x-ray" },
        { id: "o2", title: null },
      ],
    } as unknown as CaseBundle;

    const summary = buildReleaseUpdateSummary(
      makeMap({}, "order_releases"),
      makeMap({ o1: "t1", o2: "t2" }, "order_releases"),
      bundle,
    );

    expect(summary.sections).toHaveLength(1);
    expect(summary.sections[0]).toMatchObject({
      key: "orders",
      label: "Orders",
      items: ["Chest x-ray", "Clinical order 2"],
    });
  });

  it("maps medication_order releases to the MAR section, falling back to the medication name", () => {
    const bundle = {
      medicationOrders: [
        { id: "m1", label: "Heparin — 1h post-diuresis", medications: { generic_name: "heparin sodium" } },
        { id: "m2", label: null, medications: { generic_name: "insulin glargine" } },
      ],
    } as unknown as CaseBundle;

    const summary = buildReleaseUpdateSummary(
      makeMap({}, "medication_order_releases"),
      makeMap({ m1: "t1", m2: "t2" }, "medication_order_releases"),
      bundle,
    );

    expect(summary.sections).toHaveLength(1);
    expect(summary.sections[0]).toMatchObject({
      key: "mar",
      label: "MAR",
      items: ["Heparin — 1h post-diuresis", "insulin glargine"],
    });
  });

  it("emits one section per type in registry order", () => {
    const bundle = {
      clinicalDocuments: [{ id: "n1", label: "Consult" }],
      orders: [{ id: "o1", title: "X-ray" }],
    } as unknown as CaseBundle;

    const summary = buildReleaseUpdateSummary(
      createEmptyReleasedItemsMap(),
      (() => {
        const map = createEmptyReleasedItemsMap();
        map.clinical_document_releases.set("n1", "t1");
        map.order_releases.set("o1", "t2");
        return map;
      })(),
      bundle,
    );

    expect(summary.sections.map((section) => section.key)).toEqual(["notes", "orders"]);
  });
});
