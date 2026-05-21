"use client";

import type { FlexSheetData } from "./flexSheetData";
import {
  coerceDocumentationValueForPersist,
  resolveDocumentationDbColumn,
} from "@/lib/documentationColumns";

export { coerceDocumentationValueForPersist, resolveDocumentationDbColumn };

type DocumentationRow = {
  time_offset?: number | null;
  [key: string]: unknown;
};

function asCellString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

export function buildChartingRowsFromBundle(
  documentationResults: DocumentationRow[] | null | undefined,
  template: FlexSheetData[],
): { rows: FlexSheetData[]; timeOffsets: number[]; timePointsInPreSim: Set<number>; visibleItems: Set<string> } {
  const docs = documentationResults ?? [];
  const timeOffsets = Array.from(
    new Set(
      docs
        .map((row) => row.time_offset)
        .filter((offset): offset is number => typeof offset === "number"),
    ),
  ).sort((a, b) => a - b);
  const timePointsInPreSim = new Set(
    docs
      .filter((row) => Boolean(row?.is_in_presim))
      .map((row) => Number(row.time_offset))
      .filter((offset) => Number.isFinite(offset)),
  );

  const fallbackOffsets = timeOffsets.length > 0 ? timeOffsets : [0];
  const docByOffset = new Map<number, DocumentationRow>();
  for (const row of docs) {
    if (typeof row.time_offset === "number") {
      docByOffset.set(row.time_offset, row);
    }
  }

  const visibleItems = new Set<string>();
  const rows = template.map((templateRow) => {
    const nextRow: FlexSheetData = { ...templateRow };
    let hasValue = false;
    const mappedColumn = resolveDocumentationDbColumn(templateRow.id);

    for (const offset of fallbackOffsets) {
      const docRow = docByOffset.get(offset);
      const value = asCellString(docRow?.[mappedColumn]);
      nextRow[offset] = value;
      if (value !== "") hasValue = true;
    }

    if (templateRow.hideable) {
      nextRow.hideable = !hasValue;
      if (hasValue) visibleItems.add(templateRow.field);
    }

    return nextRow;
  });

  return { rows, timeOffsets: fallbackOffsets, timePointsInPreSim, visibleItems };
}
