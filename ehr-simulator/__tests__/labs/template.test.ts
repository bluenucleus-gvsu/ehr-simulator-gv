import { describe, expect, it } from "vitest";

import { labTemplate } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";


describe("labTemplate", () => {
  it("gives results rows a unique id", () => {
    const ids = labTemplate
      .filter((row) => row.rowType === "results")
      .map((row) => row.id)
      .filter((id): id is string => Boolean(id));

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps dividers free of ids, units, and ranges", () => {
    for (const row of labTemplate.filter((row) => row.rowType === "divider")) {
      expect(row.id).toBeUndefined();
      expect(row.unit).toBeFalsy();
      expect(row.normalRange).toBeUndefined();
      expect(row.criticalRange).toBeUndefined();
    }
  });

  it("keeps normal ranges ordered low to high", () => {
    for (const row of labTemplate) {
      if (row.normalRange) {
        expect(
          row.normalRange.low <= row.normalRange.high,
          `${row.field} has an inverted normal range`,
        ).toBe(true);
      }
    }
  });

  it("keeps critical ranges ordered and encompassing the normal range", () => {
    for (const row of labTemplate) {
      if (!row.criticalRange) continue;
      expect(
        row.criticalRange.low <= row.criticalRange.high,
        `${row.field} has an inverted critical range`,
      ).toBe(true);
      if (row.normalRange) {
        expect(
          row.criticalRange.low <= row.normalRange.low &&
          row.criticalRange.high >= row.normalRange.high,
          `${row.field} critical range does not encompass the normal range`,
        ).toBe(true);
      }
    }
  });

  it("provides a critical range only when a normal range is also present", () => {
    for (const row of labTemplate) {
      if (row.criticalRange) {
        expect(row.normalRange, `${row.field} has a critical range but no normal range`).toBeDefined();
      }
    }
  });
});