import { describe, expect, it } from "vitest";
import { buildChartingRowsFromBundle, mergeTemplateWithExistingRows } from "@/lib/flexSheet/flexSheetRowGenerator";
import type { DatabaseDocumentation } from "@/actions/simulation";
import type { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";

function doc(overrides: Record<string, unknown> = {}): DatabaseDocumentation {
  return {
    time_offset: 0,
    is_in_presim: false,
    ...overrides,
  } as DatabaseDocumentation;
}

function templateRow(id: string, overrides: Partial<FlexSheetData> = {}): FlexSheetData {
  return { id, field: id, componentType: "input", ...overrides };
}

describe("buildChartingRowsFromBundle", () => {
  describe("timeOffsets differentiation between presim and actual simulation", () => {
    it("returns all unique time offsets sorted ascending", () => {
      const result = buildChartingRowsFromBundle(
        [doc({ time_offset: 60 }), doc({ time_offset: 0 }), doc({ time_offset: 60 })],
        [],
      );

      expect(result.timeOffsets).toEqual([0, 60]);
    });

    it("flags only offsets whose documentation row is in presim", () => {
      const result = buildChartingRowsFromBundle(
        [
          doc({ time_offset: 0, is_in_presim: true }),
          doc({ time_offset: 30, is_in_presim: false }),
          doc({ time_offset: 60, is_in_presim: true }),
        ],
        [],
      );

      expect(result.timeOffsets).toEqual([0, 30, 60]);
      expect(result.timeOffsetsInPreSim).toEqual(new Set([0, 60]));
    });

    it("excludes actual-sim offsets from the presim set", () => {
      const result = buildChartingRowsFromBundle(
        [doc({ time_offset: 10, is_in_presim: false })],
        [],
      );

      expect(result.timeOffsetsInPreSim).toEqual(new Set());
    });

    it("falls back to offset 0 when there are no documentation rows", () => {
      expect(buildChartingRowsFromBundle([], []).timeOffsets).toEqual([0]);
      expect(buildChartingRowsFromBundle(null, []).timeOffsets).toEqual([0]);
      expect(buildChartingRowsFromBundle(undefined, []).timeOffsets).toEqual([0]);
    });

    it("ignores rows without a numeric time_offset", () => {
      const result = buildChartingRowsFromBundle(
        [
          doc({ time_offset: "0" as unknown as number, is_in_presim: true }),
          doc({ time_offset: 10, is_in_presim: true }),
        ],
        [],
      );

      expect(result.timeOffsets).toEqual([10]);
      expect(result.timeOffsetsInPreSim).toEqual(new Set([10]));
    });
  });

  describe("mapping template rows to documentation by id", () => {
    const template = [
      templateRow("hr"),
      templateRow("bp"),
      templateRow("temp"),
    ];

    it("maps each template row id to the matching documentation column", () => {
      const result = buildChartingRowsFromBundle(
        [doc({ time_offset: 0, hr: "72", bp: "120/80", temp: "98.6" })],
        template,
      );

      expect(result.rows).toEqual([
        { ...template[0], 0: "72" },
        { ...template[1], 0: "120/80" },
        { ...template[2], 0: "98.6" },
      ]);
    });

    it("populates every template row for every time offset", () => {
      const result = buildChartingRowsFromBundle(
        [
          doc({ time_offset: 0, hr: "72", temp: "98.6" }),
          doc({ time_offset: 60, hr: "84", temp: "99.1" }),
        ],
        [templateRow("hr"), templateRow("temp")],
      );

      expect(result.rows[0]).toEqual({ ...template[0], 0: "72", 60: "84" });
      expect(result.rows[1]).toEqual({ ...template[2], 0: "98.6", 60: "99.1" });
    });

    it("writes an empty string when no documentation row exists for an offset", () => {
      const result = buildChartingRowsFromBundle(
        [doc({ time_offset: 30, hr: "72" })],
        [templateRow("hr"), templateRow("bp")],
      );

      expect(result.rows[0]).toEqual({ ...template[0], 30: "72" });
      expect(result.rows[1]).toEqual({ ...template[1], 30: "" });

    });

    it("writes an empty string when the documentation row is missing the column", () => {
      const result = buildChartingRowsFromBundle(
        [doc({ time_offset: 0, bp: "120/80" })],
        [templateRow("hr")],
      );

      expect(result.rows[0]).toEqual({ ...template[0], 0: "" });
    });

    it("stringifies non-string cell values", () => {
      const result = buildChartingRowsFromBundle(
        [doc({ time_offset: 0, resp_rate: 18 })],
        [templateRow("resp_rate")],
      );

      expect(result.rows[0][0]).toBe("18");
    });

    it("uses the last documentation row for a duplicated offset", () => {
      const result = buildChartingRowsFromBundle(
        [
          doc({ time_offset: 0, hr: "72" }),
          doc({ time_offset: 0, hr: "88" }),
        ],
        [templateRow("hr")],
      );

      expect(result.rows[0][0]).toBe("88");
    });

  });
});

describe("mergeTemplateWithExistingRows", () => {
  describe("row set changes (specialty switch)", () => {
    it("drops saved rows that are not in the new template", () => {
      const template = [templateRow("hr")];
      const savedRows = [
        { ...templateRow("hr"), 0: "72" },
        { ...templateRow("bp"), 0: "120/80" },
      ];

      expect(mergeTemplateWithExistingRows(template, savedRows, [0])).toEqual([
        { ...templateRow("hr"), 0: "72" },
      ]);
    });

    it("adds template rows with no saved counterpart as bare rows", () => {
      const template = [templateRow("hr"), templateRow("temp")];
      const savedRows = [{ ...templateRow("hr"), 0: "72" }];

      expect(mergeTemplateWithExistingRows(template, savedRows, [0])).toEqual([
        { ...templateRow("hr"), 0: "72" },
        templateRow("temp"),
      ]);
    });

    it("rebuilds shared rows from the new template schema and includes only listed time offsets", () => {
      const template = [templateRow("hr")];
      const savedRows = [
        { ...templateRow("hr"), 0: "72", 60: "84", },
      ];

      expect(mergeTemplateWithExistingRows(template, savedRows, [0])).toEqual([
        { ...templateRow("hr"), 0: "72" },
      ]);
    });
  });

  describe("value carry-over", () => {
    it("copies only offsets present on the saved row", () => {
      const savedRows = [{ ...templateRow("hr"), 0: "72" }];

      const merged = mergeTemplateWithExistingRows([templateRow("hr")], savedRows, [0, 60, 120]);

      expect(merged[0]).toEqual({ ...templateRow("hr"), 0: "72" });
    });
  });

  describe("null and empty inputs", () => {
    it("returns the template untouched when savedRows is null", () => {
      const template = [templateRow("hr")];

      expect(mergeTemplateWithExistingRows(template, null, [0])).toEqual(template);
    });

    it("returns the template untouched when savedRows is empty", () => {
      const template = [templateRow("hr")];

      expect(mergeTemplateWithExistingRows(template, [], [0])).toEqual(template);
    });

    it("returns bare template rows when timePoints is empty", () => {
      const savedRows = [{ ...templateRow("hr"), 0: "72" }];

      expect(mergeTemplateWithExistingRows([templateRow("hr")], savedRows, [])).toEqual([
        templateRow("hr"),
      ]);
    });
  });
});