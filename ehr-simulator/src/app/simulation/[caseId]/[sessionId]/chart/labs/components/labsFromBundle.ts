"use client";

import { type LabColumn, type LabResultInsert } from "@/lib/labTypes";
import type { LabTableData } from "./labsData";
import { LabResultsRow } from "@/actions/case_builder/getCase";

type DbLabResult = Partial<LabResultsRow>;

export function buildLabColumnsFromBundle(
  labResults: DbLabResult[],
): LabColumn[] {
  const sorted = [...labResults].sort((a, b) => {
    const aOffset = a.time_offset;
    const bOffset = b.time_offset;
    if (aOffset == null && bOffset == null) return 0;
    if (aOffset == null) return 1;
    if (bOffset == null) return -1;
    return aOffset - bOffset;
  });

  return sorted.map((lab, index) => ({
    id: lab.id ?? `lab-col-${index}`,
    time_offset: typeof lab.time_offset === "number" ? lab.time_offset : null,
    is_in_presim: Boolean(lab.is_in_presim),
    phase: Math.max(1, Number(lab.phase ?? 1)),
    label: typeof lab.label === "string" && lab.label.trim() ? lab.label : null,
  }));
}

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
): { rows: LabTableData[]; columns: LabColumn[] } {
  const columns = buildLabColumnsFromBundle(labResults);

  const labById = new Map<string, DbLabResult>();
  for (const lab of labResults) {
    if (lab.id) {
      labById.set(lab.id, lab);
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
        const dbColumn = templateRow.id as keyof LabResultInsert | undefined;
        for (const column of columns) {
          const source = labById.get(column.id);
          const value = dbColumn
            ? (source as Record<string, unknown> | undefined)?.[dbColumn as string]
            : undefined;
          nextRow[column.id] = toDisplayValue(value);
        }
      }

      return nextRow;
    })
    .filter((row) => {
      if (!row.hideable) return true;
      return columns.some((column) => hasRenderableValue(row[column.id]));
    });

  return { rows, columns };
}
