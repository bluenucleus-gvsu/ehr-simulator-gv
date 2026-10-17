import type { CaseBundle } from "@/actions/case_builder/getCase";
import {
  RELEASABLE_ITEMS,
  type ReleasableItemType,
  type ReleaseTable,
  type ReleasedItemsMap,
} from "@/lib/faculty/itemRelease";

export type ReleaseUpdateSectionKey = "labs" | "notes" | "orders" | "mar";

export interface ReleaseUpdateSection {
  key: ReleaseUpdateSectionKey;
  label: string;
  items: string[];
  summary: string;
}

export interface ReleaseUpdateSummary {
  hasAnyNewData: boolean;
  sections: ReleaseUpdateSection[];
}

const SECTION_BY_TYPE: Record<
  ReleasableItemType,
  { sectionKey: ReleaseUpdateSectionKey; sectionLabel: string; typeLabel: string }
> = {
  lab_result: { sectionKey: "labs", sectionLabel: "Labs", typeLabel: "Lab panel" },
  clinical_document: { sectionKey: "notes", sectionLabel: "Notes", typeLabel: "Note" },
  order: { sectionKey: "orders", sectionLabel: "Orders", typeLabel: "Clinical order" },
  medication_order: { sectionKey: "mar", sectionLabel: "MAR", typeLabel: "Med order" },
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function labelOf(
  type: ReleasableItemType,
  row: Record<string, unknown> | { title?: string | null },
): string | null {
  if (type === "order") return asString((row as { title?: unknown }).title);
  return asString((row as Record<string, unknown>).label);
}

function resolveItemLabels(
  type: ReleasableItemType,
  itemIds: string[],
  caseBundle: CaseBundle | null,
): string[] {
  const { typeLabel } = SECTION_BY_TYPE[type];

  const rows: Record<string, unknown>[] = [];
  switch (type) {
    case "lab_result":
      rows.push(...(caseBundle?.labResults ?? []));
      break;
    case "clinical_document":
      rows.push(...(caseBundle?.clinicalDocuments ?? []));
      break;
    case "order":
      rows.push(...(caseBundle?.orders ?? []));
      break;
    case "medication_order": {
      for (const row of caseBundle?.medicationOrders ?? []) {
        rows.push({
          ...row,
          label:
            asString(row.label) ??
            asString(
              (row.medications as { generic_name?: unknown } | undefined)?.generic_name,
            ),
        });
      }
      break;
    }
  }

  const labelById = new Map(rows.map((row) => [String(row.id), labelOf(type, row)]));

  return itemIds.map((id, index) => {
    const label = labelById.get(id);
    return label ?? `${typeLabel} ${index + 1}`;
  });
}

export function diffReleasedItems(
  baseline: ReleasedItemsMap,
  current: ReleasedItemsMap,
): Record<ReleaseTable, { itemId: string; releasedAt: string }[]> {
  const diff = {} as Record<ReleaseTable, { itemId: string; releasedAt: string }[]>;

  for (const { releaseTable } of Object.values(RELEASABLE_ITEMS)) {
    const baselineIds = baseline[releaseTable] ?? new Map<string, string>();
    const entries: { itemId: string; releasedAt: string }[] = [];

    for (const [itemId, releasedAt] of current[releaseTable] ?? new Map<string, string>()) {
      if (!baselineIds.has(itemId)) {
        entries.push({ itemId, releasedAt });
      }
    }

    entries.sort((a, b) => a.releasedAt.localeCompare(b.releasedAt));
    diff[releaseTable] = entries;
  }

  return diff;
}

export function buildReleaseUpdateSummary(
  baseline: ReleasedItemsMap,
  current: ReleasedItemsMap,
  caseBundle: CaseBundle | null,
): ReleaseUpdateSummary {
  const diff = diffReleasedItems(baseline, current);
  const sections: ReleaseUpdateSection[] = [];

  for (const type of Object.keys(RELEASABLE_ITEMS) as ReleasableItemType[]) {
    const entries = diff[RELEASABLE_ITEMS[type].releaseTable];
    if (entries.length === 0) continue;

    const meta = SECTION_BY_TYPE[type];
    const items = resolveItemLabels(type, entries.map((entry) => entry.itemId), caseBundle);

    sections.push({
      key: meta.sectionKey,
      label: meta.sectionLabel,
      items,
      summary: `New ${pluralize(items.length, meta.typeLabel.toLowerCase())} available.`,
    });
  }

  return {
    hasAnyNewData: sections.length > 0,
    sections,
  };
}
