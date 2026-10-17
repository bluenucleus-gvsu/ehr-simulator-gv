import { describe, expect, it } from "vitest";

import { buildLabRowsFromBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsFromBundle";
import { type LabColumn } from "@/lib/labTypes";
import {
  labTemplate,
  type LabTableData,
} from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";

function rowById(rows: LabTableData[], id: string): LabTableData {
  const row = rows.find((row) => row.id === id);
  if (!row) {
    throw new Error(`no template row with id "${id}"`);
  }

  return row;
}

describe("buildLabRowsFromBundle", () => {
  it("orders columns by time offset with live columns last", () => {
    const { columns } = buildLabRowsFromBundle(
      [
        { id: "lab-live", time_offset: null, is_in_presim: false, phase: 1 },
        { id: "lab-a", time_offset: 30, is_in_presim: false, phase: 1 },
        { id: "lab-b", time_offset: 0, is_in_presim: false, phase: 1 },
      ],
      labTemplate,
    );

    expect(columns.map((column: LabColumn) => column.id)).toEqual(["lab-b", "lab-a", "lab-live"]);
    expect(columns[2]?.time_offset).toBeNull();
  });

  it("keeps multiple live columns as distinct columns", () => {
    const { columns } = buildLabRowsFromBundle(
      [
        { id: "lab-live-1", time_offset: null, is_in_presim: false, phase: 1 },
        { id: "lab-live-2", time_offset: null, is_in_presim: false, phase: 2 },
      ],
      labTemplate,
    );

    expect(columns).toHaveLength(2);
    expect(columns.map((column) => column.id)).toEqual(["lab-live-1", "lab-live-2"]);
  });

  it("carries presim and phase tags on each column", () => {
    const { columns } = buildLabRowsFromBundle(
      [
        { id: "lab-a", time_offset: 0, is_in_presim: true, phase: 2 },
        { id: "lab-b", time_offset: -90, is_in_presim: false, phase: 1 },
        { id: "lab-c", time_offset: null, is_in_presim: false, phase: 3 },
      ],
      labTemplate,
    );

    expect(columns[0]).toMatchObject({ id: "lab-b", time_offset: -90, is_in_presim: false, phase: 1 });
    expect(columns[1]).toMatchObject({ id: "lab-a", time_offset: 0, is_in_presim: true, phase: 2 });
    expect(columns[2]).toMatchObject({ id: "lab-c", time_offset: null, is_in_presim: false, phase: 3 });
  });

  it("Attaches labels, blanking whitespace-only ones", () => {
    const { columns } = buildLabRowsFromBundle(
      [
        { id: "lab-a", time_offset: null, is_in_presim: false, phase: 2, label: "BMP — repeat draw" },
        { id: "lab-b", time_offset: null, is_in_presim: false, phase: 2, label: "   " },
        { id: "lab-c", time_offset: null, is_in_presim: false, phase: 3, label: null },
      ],
      labTemplate,
    );

    expect(columns[0]?.label).toBe("BMP — repeat draw");
    expect(columns[1]?.label).toBeNull();
    expect(columns[2]?.label).toBeNull();
  });

  it("maps column values onto template rows by column id", () => {
    const { rows } = buildLabRowsFromBundle(
      [
        { id: "lab-1", time_offset: 0, is_in_presim: false, phase: 1, sodium: "145", potassium: "4.2" },
        { id: "lab-2", time_offset: 30, is_in_presim: false, phase: 1, sodium: "140", potassium: "5.6" },
      ],
      labTemplate,
    );

    expect(rowById(rows, "sodium")["lab-1"]).toBe("145");
    expect(rowById(rows, "sodium")["lab-2"]).toBe("140");
    expect(rowById(rows, "potassium")["lab-1"]).toBe("4.2");
    expect(rowById(rows, "potassium")["lab-2"]).toBe("5.6");
  });

  it("preserves template metadata on the processed rows", () => {
    const { rows } = buildLabRowsFromBundle(
      [{ id: "lab-1", time_offset: 0, is_in_presim: false, phase: 1, potassium: "4.2" }],
      labTemplate,
    );

    const potassiumRow = rowById(rows, "potassium");
    expect(potassiumRow.unit).toBe("(mEq/L)");
    expect(potassiumRow.normalRange).toEqual({ low: 3.5, high: 5.0 });
    expect(potassiumRow.criticalRange).toEqual({ low: 3.0, high: 6.0 });
  });
});