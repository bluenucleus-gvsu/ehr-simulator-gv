export type ReleasableItemType = keyof typeof RELEASABLE_ITEMS;
export type ReleaseTable = (typeof RELEASABLE_ITEMS)[ReleasableItemType]["releaseTable"];
export type SessionItemReleasesByTable = Record<ReleaseTable, { itemId: string; releasedAt: string }[]>;
export type ReleasedItemsMap = Record<ReleaseTable, Map<string, string>>;

export type SimReleaseItem = {
  id: string;
  phase: number;
  isInPresim?: boolean;
};

type PreviewBundleRows = Partial<
  Record<(typeof RELEASABLE_ITEMS)[ReleasableItemType]["bundleKey"],
    { id?: string | null; phase?: number | null }[]>
>;
export const RELEASABLE_ITEMS = {
  lab_result: {
    bundleKey: "labResults",
    releaseTable: "lab_result_releases",
    itemTable: "lab_results",
    labelColumn: "label",
  },
  clinical_document: {
    bundleKey: "clinicalDocuments",
    releaseTable: "clinical_document_releases",
    itemTable: "clinical_documents",
    labelColumn: "label",
  },
  order: {
    bundleKey: "orders",
    releaseTable: "order_releases",
    itemTable: "orders",
    labelColumn: "title",
  },
  medication_order: {
    bundleKey: "medicationOrders",
    releaseTable: "medication_order_releases",
    itemTable: "medication_orders",
    labelColumn: "label",
  },
} as const;

export const PREVIEW_SESSION_ID = "preview";
export const PREVIEW_STAGED_OFFSET_STEP_MIN = 5;

export function isVisibleInSim(
  item: SimReleaseItem,
  isPresim: boolean,
  releasedIds: ReadonlySet<string>
): boolean {
  if (isPresim) {
    return item.isInPresim === true;
  }
  return item.phase === 1 || releasedIds.has(item.id);
}

export function resolveDisplayOffset(
  timeOffset: number | null | undefined,
  releasedAt?: string,
  simStart?: number | null,
): number {
  if (timeOffset !== null && timeOffset !== undefined) {
    return timeOffset;
  }
  if (!releasedAt || simStart === null || simStart === undefined) {
    return Number.NEGATIVE_INFINITY;
  }
  const releasedMs = new Date(releasedAt).getTime();
  if (!Number.isFinite(releasedMs)) {
    return Number.NEGATIVE_INFINITY;
  }
  return Math.round((releasedMs - simStart) / 60000);
}

export function displayOffsetFor(
  phase: number,
  timeOffset: number | null | undefined,
): number | null {
  return phase > 1 ? null : timeOffset ?? null;
}

export function buildPreviewReleasedItems(
  caseBundle: PreviewBundleRows | null | undefined,
  simStartMs: number,
): ReleasedItemsMap {
  const map = createEmptyReleasedItemsMap();
  if (!caseBundle) return map;

  for (const { bundleKey, releaseTable } of Object.values(RELEASABLE_ITEMS)) {
    const rows = caseBundle[bundleKey] ?? [];
    const target = map[releaseTable];
    for (const row of rows) {
      const phase = row.phase ?? 1;
      if (phase > 1 && row.id) {
        target.set(
          row.id,
          new Date(simStartMs + phase * PREVIEW_STAGED_OFFSET_STEP_MIN * 60000).toISOString(),
        );
      }
    }
  }
  return map;
}

export function createEmptyReleasedItemsMap(): ReleasedItemsMap {
  const map = {} as ReleasedItemsMap;
  for (const { releaseTable } of Object.values(RELEASABLE_ITEMS)) {
    map[releaseTable] = new Map();
  }
  return map;
}

export function toReleasedItemsMap(
  releases: SessionItemReleasesByTable,
): ReleasedItemsMap {
  const map = createEmptyReleasedItemsMap();
  for (const { releaseTable } of Object.values(RELEASABLE_ITEMS)) {
    for (const release of releases[releaseTable] ?? []) {
      map[releaseTable].set(release.itemId, release.releasedAt);
    }
  }
  return map;
}

export function applyReleaseInsert(
  releases: ReleasedItemsMap,
  table: ReleaseTable,
  itemId: string,
  releasedAt: string,
): ReleasedItemsMap {
  const next = new Map(releases[table]);
  next.set(itemId, releasedAt);
  return { ...releases, [table]: next };
}

export function applyReleaseDelete(
  releases: ReleasedItemsMap,
  table: ReleaseTable,
  itemId: string,
): ReleasedItemsMap {
  const next = new Map(releases[table]);
  next.delete(itemId);
  return { ...releases, [table]: next };
}
