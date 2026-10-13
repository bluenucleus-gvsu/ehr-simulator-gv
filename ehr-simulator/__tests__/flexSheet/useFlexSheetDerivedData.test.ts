import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFlexSheetDerivedData } from "@/hooks/useFlexSheetDerivedData";
import { calculateColTotal } from "@/lib/flexSheet/flexSheetHelpers";
import type { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";

const TIME_OFFSETS = [0, 60];

const baseData: FlexSheetData[] = [
  { id: "hr", field: "HR", componentType: "input", 0: "72", 60: "84" },
  {
    id: "generalAppearanceTitle",
    field: "General Appearance",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [{ assessment: "General Appearance", description: "WDL" }],
  },
  {
    id: "general_appearance_selections",
    field: "General Appearance",
    componentType: "checkboxlist",
    0: "WDL",
    60: "WDL",
  },
  { id: "appearance", field: "Appearance", componentType: "input", hideable: true },
  { id: "safety_check", field: "Safety Check", componentType: "input", hideable: true },
  {
    id: "ciwaArSectionTitle",
    field: "CIWA-Ar",
    componentType: "static",
    rowType: "titleRow",
    toolId: "ciwa",
  },
  {
    id: "ciwa_nausea_vomiting",
    field: "Nausea & Vomiting",
    componentType: "assessmentselect",
    toolId: "ciwa",
    0: "7",
    60: "3",
  },
  {
    id: "ciwa_tremor",
    field: "Tremor",
    componentType: "assessmentselect",
    toolId: "ciwa",
    0: "2",
    60: "5",
  },
  {
    id: "morseFallRiskTitle",
    field: "Morse Fall Risk",
    componentType: "static",
    rowType: "titleRow",
    toolId: "morse",
  },
  {
    id: "morse_fall_history",
    field: "History of Falling",
    componentType: "assessmentselect",
    toolId: "morse",
    0: "0",
    60: "25",
  },
];

function render(
  data: FlexSheetData[] = baseData,
  fieldSelections: Record<string, string[]> = {},
  timeOffsets: number[] = TIME_OFFSETS,
) {
  return renderHook(() => useFlexSheetDerivedData(data, fieldSelections, timeOffsets)).result.current;
}

function variant(mutate: (rows: FlexSheetData[]) => void): FlexSheetData[] {
  const rows = baseData.map((row) => ({ ...row }));
  mutate(rows);
  return rows;
}

describe("useFlexSheetDerivedData", () => {
  describe("hideable row visibility", () => {
    it("shows non-hideable rows and hides hideable rows by default", () => {
      const ids = render().map((row) => row.id);

      expect(ids).toContain("hr");
      expect(ids).toContain("generalAppearanceTitle");
      expect(ids).toContain("general_appearance_selections");
      expect(ids).not.toContain("appearance");
      expect(ids).not.toContain("safety_check");
    });

    it("reveals a hideable row when its subset is selected in any column", () => {
      const ids = render(baseData, { "general_appearance_selections-0": ["WDL", "appearance"] }).map(
        (row) => row.id,
      );

      expect(ids).toContain("appearance");
      expect(ids).not.toContain("safety_check");
    });

    it("does not reveal hideable rows when only WDL is selected", () => {
      const ids = render(baseData, { "general_appearance_selections-0": ["WDL"] }).map((row) => row.id);

      expect(ids).not.toContain("appearance");
      expect(ids).not.toContain("safety_check");
    });
  });

  describe("assessment tool totals", () => {
    it("inserts a totalScoreRow directly after the tool titleRow", () => {
      const filtered = render();

      const ciwaTitleIndex = filtered.findIndex((row) => row.id === "ciwaArSectionTitle");
      const totalRow = filtered[ciwaTitleIndex + 1];

      expect(totalRow.id).toBe("CIWA-ArTotalScore");
      expect(totalRow.componentType).toBe("totalScoreRow");
      expect(totalRow.rowType).toBe("totalScoreRow");
      expect(totalRow.toolId).toBe("ciwa");
      expect(totalRow.field).toBe("CIWA-Ar");
    });

    it("sums tool values per offset", () => {
      const filtered = render();
      const totalRow = filtered.find((row) => row.id === "CIWA-ArTotalScore");

      expect(totalRow?.[0]).toBe("9");
      expect(totalRow?.[60]).toBe("8");
    });

    it("computes partial sums and blanks offsets with no values", () => {
      const partial = variant((rows) => {
        rows[6][60] = undefined;
        rows[7][0] = undefined;
      });

      const totalRow = render(partial).find((row) => row.id === "CIWA-ArTotalScore");
      expect(totalRow?.[0]).toBe("7");
      expect(totalRow?.[60]).toBe("5");

      const blank = variant((rows) => {
        rows[6][60] = undefined;
        rows[7][60] = undefined;
      });
      const blankTotal = render(blank).find((row) => row.id === "CIWA-ArTotalScore");
      expect(blankTotal?.[60]).toBe("");
    });

    it("treats a zero value as entered, not blank", () => {
      const totalRow = render().find((row) => row.id === "Morse Fall RiskTotalScore");

      expect(totalRow?.[0]).toBe("0");
      expect(totalRow?.[60]).toBe("25");
    });

    it("skips non-numeric values when summing", () => {
      const nonNumeric = variant((rows) => {
        rows[7][0] = "abc";
      });

      const totalRow = render(nonNumeric).find((row) => row.id === "CIWA-ArTotalScore");
      expect(totalRow?.[0]).toBe("7");
      expect(totalRow?.[60]).toBe("8");
    });

    it("excludes the static titleRow from the sum", () => {
      const titled = variant((rows) => {
        rows[5][0] = "99";
      });

      const totalRow = render(titled).find((row) => row.id === "CIWA-ArTotalScore");
      expect(totalRow?.[0]).toBe("9");
    });
  });

  describe("ordering", () => {
    it("preserves row order and places each total after its tool titleRow", () => {
      expect(render().map((row) => row.id)).toEqual([
        "hr",
        "generalAppearanceTitle",
        "general_appearance_selections",
        "ciwaArSectionTitle",
        "CIWA-ArTotalScore",
        "ciwa_nausea_vomiting",
        "ciwa_tremor",
        "morseFallRiskTitle",
        "Morse Fall RiskTotalScore",
        "morse_fall_history",
      ]);
    });
  });
});

describe("calculateColTotal", () => {
  const toolRows: FlexSheetData[] = [
    { id: "a", field: "A", componentType: "assessmentselect", toolId: "t", 0: "7", 60: "3" },
    { id: "b", field: "B", componentType: "assessmentselect", toolId: "t", 0: "2", 60: "5" },
  ];

  it("sums values at each offset", () => {
    const total = calculateColTotal("Tool", "t", toolRows, [0, 60]);
    expect(total[0]).toBe("9");
    expect(total[60]).toBe("8");
  });

  it("returns blank for offsets with no values", () => {
    const total = calculateColTotal("Tool", "t", toolRows, [120]);
    expect(total[120]).toBe("");
  });

  it("skips non-numeric values", () => {
    const rows = [{ ...toolRows[0], 0: "abc" }];
    const total = calculateColTotal("Tool", "t", rows, [0]);
    expect(total[0]).toBe("");
  });

  it("treats a zero value as entered", () => {
    const rows = [{ ...toolRows[0], 0: "0" }];
    const total = calculateColTotal("Tool", "t", rows, [0]);
    expect(total[0]).toBe("0");
  });

  it("emits a totalScoreRow with tool metadata", () => {
    const total = calculateColTotal("CIWA-Ar", "ciwa", toolRows, [0]);
    expect(total.id).toBe("CIWA-ArTotalScore");
    expect(total.componentType).toBe("totalScoreRow");
    expect(total.rowType).toBe("totalScoreRow");
    expect(total.toolId).toBe("ciwa");
  });
});