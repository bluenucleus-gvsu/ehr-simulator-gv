import { describe, expect, it } from "vitest";

import { buildLabRowsFromBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsFromBundle";
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
  it("sorts and dedupes time offsets in ascending order", () => {
    const { timePoints } = buildLabRowsFromBundle(
      [
        { id: "lab-a", time_offset: 30 },
        { id: "lab-b", time_offset: 0 },
        { id: "lab-c", time_offset: 30 },
      ],
      labTemplate,
    );

    expect(timePoints).toEqual([0, 30]);
  });

  it("keeps only time points that are included in presim", () => {
    const { timePointsInPresim } = buildLabRowsFromBundle(
      [
        { id: "lab-a", time_offset: 0, is_in_presim: true },
        { id: "lab-b", time_offset: -90, is_in_presim: false },
        { id: "lab-c", time_offset: -30, is_in_presim: true },
        { id: "lab-d", time_offset: 30, is_in_presim: false },
      ],
      labTemplate,
    );

    expect(timePointsInPresim).toEqual([-30, 0]);
  });

  it("maps column values onto template rows at each time offset", () => {
    const { rows } = buildLabRowsFromBundle(
      [
        { id: "lab-1", time_offset: 0, sodium: "145", potassium: "4.2" },
        { id: "lab-2", time_offset: 30, sodium: "140", potassium: "5.6" },
      ],
      labTemplate,
    );

    expect(rowById(rows, "sodium")[0]).toBe("145");
    expect(rowById(rows, "sodium")[30]).toBe("140");
    expect(rowById(rows, "potassium")[0]).toBe("4.2");
    expect(rowById(rows, "potassium")[30]).toBe("5.6");
  });

  it("coerces numeric and blank database values to strings", () => {
    const { rows } = buildLabRowsFromBundle(
      [{ id: "lab-1", time_offset: 0, sodium: 145, potassium: null }],
      labTemplate,
    );

    expect(rowById(rows, "sodium")[0]).toBe("145");
    expect(rowById(rows, "potassium")[0]).toBe("");
  });

  it("reads unstructured values from the data blob by field name", () => {
    const template: LabTableData[] = [
      {
        field: "Custom Biomarker",
        rowType: "results",
        hideable: true,
      },
    ];

    const { rows } = buildLabRowsFromBundle(
      [
        {
          id: "lab-1",
          time_offset: 0,
          data: { unstructured: { "Custom Biomarker": "positive" } },
        },
      ],
      template,
    );

    expect(rows[0][0]).toBe("positive");
  });

  it("keeps the last row when two rows share a time offset", () => {
    const { rows } = buildLabRowsFromBundle(
      [
        { id: "lab-1", time_offset: 0, sodium: "145" },
        { id: "lab-2", time_offset: 0, sodium: "150" },
      ],
      labTemplate,
    );

    expect(rowById(rows, "sodium")[0]).toBe("150");
  });

  it("preserves template metadata on the processed rows", () => {
    const { rows } = buildLabRowsFromBundle(
      [{ id: "lab-1", time_offset: 0, potassium: "4.2" }],
      labTemplate,
    );

    const potassiumRow = rowById(rows, "potassium");
    expect(potassiumRow.unit).toBe("(mEq/L)");
    expect(potassiumRow.normalRange).toEqual({ low: 3.5, high: 5.0 });
    expect(potassiumRow.criticalRange).toEqual({ low: 3.0, high: 6.0 });
  });
});
