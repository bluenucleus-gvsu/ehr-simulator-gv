"use client";

import { type LabResultInsert } from "@/lib/labTypes";
import type { LabTableData } from "./labsData";

type DbLabResult = {
  id?: string | null;
  time_offset?: number | null;
  [key: string]: unknown;
};

function toDisplayValue(value: unknown): string {
  if (value == null || value === "") return "";
  return String(value);
}

function hasRenderableValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (value && typeof value === "object") return Object.keys(value as object).length > 0;
  return Boolean(value);
}

export function buildLabRowsFromBundle(
  labResults: DbLabResult[],
  template: LabTableData[],
): { rows: LabTableData[]; timePoints: number[], timePointsInPresim: number[] } {

  const timePoints = Array.from(
    new Set(
      labResults
        .map((row) => row.time_offset)
        .filter((offset): offset is number => typeof offset === "number"),
    ),
  ).sort((a, b) => a - b);

  const timePointsInPresim = Array.from(new Set(
    labResults
      .filter((row) => Boolean(row?.is_in_presim))
      .map((row) => Number(row.time_offset))
  )).sort((a, b) => a - b);;

  const labByOffset = new Map<number, DbLabResult>();
  const labOffsetById = new Map<string, number>();
  for (const lab of labResults) {
    if (typeof lab.time_offset === "number") {
      labByOffset.set(lab.time_offset, lab);
    }
    if (lab.id && typeof lab.time_offset === "number") {
      labOffsetById.set(lab.id, lab.time_offset);
    }
  }

  const rows = template
    .map((templateRow) => {
      const nextRow: LabTableData = {
        id: templateRow.id,
        field: templateRow.field,
        rowType: templateRow.rowType,
        unit: templateRow.unit,
        normalRange: templateRow.normalRange,
        criticalRange: templateRow.criticalRange,
        hideable: templateRow.hideable,
      };

      if (templateRow.rowType === "results") {
        const dbRow = templateRow.id as keyof LabResultInsert | undefined;
        for (const offset of timePoints) {
          const source = labByOffset.get(offset);

          const unstructured = source?.data && typeof source.data === "object"
            ? (source.data as { unstructured?: Record<string, unknown> }).unstructured
            : undefined;
          const value = dbRow
            ? source?.[dbRow as string]
            : unstructured?.[templateRow.field];
          nextRow[offset] = toDisplayValue(value);
        }
      }

      return nextRow;
    })
    .filter((row) => {
      if (!row.hideable) return true;
      return timePoints.some((offset) => hasRenderableValue(row[offset]));
    });

  return { rows, timePoints, timePointsInPresim };
}
