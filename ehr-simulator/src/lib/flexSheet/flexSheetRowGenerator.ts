"use client";

import { DatabaseDocumentation } from "@/actions/simulation";
import { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";

function asCellString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

// Allow for string matching between IDs of DatabaseDocumentation row and FlexSheetTemplate row 
function getField(row: DatabaseDocumentation | undefined, key: string): unknown {
  return row ? (row as unknown as Record<string, unknown>)[key] : undefined;
}

export function buildChartingRowsFromBundle(
  documentationResults: DatabaseDocumentation[] | null | undefined,
  template: FlexSheetData[],
): { rows: FlexSheetData[]; timeOffsets: number[]; timePointsInPreSim: Set<number>; visibleItems: Set<string> } {

  const docs = documentationResults ?? [];
  const timeOffsetsSet = new Set<number>();
  const timeOffsetsInPreSim = new Set<number>();
  const docByOffset = new Map<number, DatabaseDocumentation>();

  for (const row of docs) {
    if (typeof row.time_offset === "number") {
      timeOffsetsSet.add(row.time_offset);
      docByOffset.set(row.time_offset, row);
      if (row.is_in_presim) {
        timeOffsetsInPreSim.add(row.time_offset);
      }
    }
  }

  const timeOffsets = Array.from(timeOffsetsSet).sort((a, b) => a - b);
  const fallbackOffsets = timeOffsets.length > 0 ? timeOffsets : [0];

  const visibleItems = new Set<string>();

  const rows = template.map((templateRow) => {
    const nextRow: FlexSheetData = { ...templateRow };
    let hasValue = false;
    const mappedColumn = templateRow.id;

    for (const offset of fallbackOffsets) {
      const docRow = docByOffset.get(offset);
      const value = asCellString(getField(docRow, mappedColumn));
      nextRow[offset] = value;
      if (value !== "") hasValue = true;
    }

    if (templateRow.hideable) {
      nextRow.hideable = !hasValue;
      if (hasValue) visibleItems.add(templateRow.field);
    }

    return nextRow;
  });

  return { rows, timeOffsets: fallbackOffsets, timePointsInPreSim: timeOffsetsInPreSim, visibleItems };
}
