import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";

import { buildTableTemplate } from "@/lib/flexSheet/flexSheetTemplate";
import { transformFlexSheetPayloadToSchema } from "@/lib/flexSheet/flexSheetHelpers";
import { coerceValueForSave } from "@/lib/flexSheet/flexSheetSave";
import { buildChartingRowsFromBundle } from "@/lib/flexSheet/flexSheetRowGenerator";
import { caseBundleToFormBlob } from "@/lib/caseBuilder/caseBundleToFormBlob";
import { FlexSheetSection, flexSheetSections } from "@/lib/flexSheet/flexSheetSections";
import type { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";
import { getCaseBundle } from "@/actions/case_builder/getCase";
import { supabase } from "@/lib/supabaseClient";

const CASE_ID = randomUUID();
const TIME_OFFSET_1 = 0;
const TIME_OFFSET_2 = -45;
const NON_DATA_COLUMNS = ["case_id", "time_offset", "is_in_presim"];

const SECTIONS = [
  FlexSheetSection.VITALS,
  FlexSheetSection.INPUT,
  FlexSheetSection.OUTPUT,
  FlexSheetSection.BASE_PAIN,
  FlexSheetSection.GENERAL_APPEARANCE,
  FlexSheetSection.CIWA,
];

const TEMPLATE = buildTableTemplate(new Set(SECTIONS));

const flexSheetColumns = new Set(
  Object.values(flexSheetSections).flatMap((rows) =>
    rows.map((row) => row.id).filter((id) => id != null),
  ),
);

function cellValueFor(row: FlexSheetData, offset: number): string | string[] | undefined {
  if (row.componentType === "static" || row.componentType === "totalScoreRow") {
    return undefined;
  }
  if (row.componentType === "checkboxlist") {
    return offset === TIME_OFFSET_1 ? ["WDL", row.id] : ["WDL"];
  }
  return `${row.id}@${offset}`;
}

function buildFormData(): FlexSheetData[] {
  return TEMPLATE.map((row) => {
    const filled = { ...row };
    [TIME_OFFSET_1, TIME_OFFSET_2].forEach((offset) => {
      const value = cellValueFor(row, offset);
      if (value !== undefined) {
        filled[offset] = value;
      }
    });
    return filled;
  });
}

describe("coerceValueForSave", () => {
  it("coerces blank/undefined/null values to null", () => {
    expect(coerceValueForSave("")).toBeNull();
    expect(coerceValueForSave(undefined)).toBeNull();
    expect(coerceValueForSave(null)).toBeNull();
  });

  it("joins arrays into a CSV string and empty arrays to null", () => {
    expect(coerceValueForSave(["WDL", "appearance"])).toBe("WDL,appearance");
    expect(coerceValueForSave([])).toBeNull();
  });

  it("stringifies primitives", () => {
    expect(coerceValueForSave(72)).toBe("72");
    expect(coerceValueForSave("120/80")).toBe("120/80");
  });
});

/*
  Tests the full FlexSheet path from Case Builder to EHR View
  Path: FlexSheet Form Data -> transformFlexSheetPayloadToSchema() -> supabase.insert()
    -> getCaseBundle() -> caseBundleToFormBlob() (which uses buildChartingRowsFromBundle())
*/
describe("FlexSheet round trip process", () => {
  beforeAll(async () => {
    const { error } = await supabase.from("cases").insert({
      id: CASE_ID,
      name: "FlexSheet Round-Trip Test",
      first_name: "Samuel",
      last_name: "Jones",
      code_status: "Full",
      case_specialty: "med_surg",
      flexsheet_sections: SECTIONS,
    });
    if (error) throw new Error(`Could not create test case: ${error.message}`);
  });

  beforeEach(async () => {
    await supabase.from("documentation_results").delete().eq("case_id", CASE_ID);
  });

  afterAll(async () => {
    await supabase.from("documentation_results").delete().eq("case_id", CASE_ID);
    await supabase.from("cases").delete().eq("id", CASE_ID);
  });

  it("creates flexsheet form data, inserts to Supabase, and retrieves correct data back", async () => {
    const formData = buildFormData();

    const rows = transformFlexSheetPayloadToSchema(CASE_ID, {
      data: formData,
      timePoints: [TIME_OFFSET_1, TIME_OFFSET_2],
      timePointsInPreSim: new Set([TIME_OFFSET_1]),
    });

    expect(rows).toHaveLength(2);

    const presimRow = rows[0];
    Object.entries(presimRow).forEach(([col, value]) => {
      if (!NON_DATA_COLUMNS.includes(col)) {
        expect(flexSheetColumns.has(col), `${col} is not a flexsheet column`).toBe(true);
        expect(typeof value, `FlexSheet column ${col} not coerced to string`).toBe("string");
      }

      if (col === "time_offset") {
        expect(typeof value).toBe("number");
      }

      if (col === "is_in_presim") {
        expect(value, "Presim-marked column has been reverted").toBe(true);
      }
    });

    expect(rows[1].is_in_presim).toBe(false);
    expect(rows[0].general_appearance_selections).toBe("WDL,general_appearance_selections");

    const { error } = await supabase
      .from("documentation_results")
      .insert(rows);

    if (error) throw new Error(`insert failed: ${error.message}`);

    const simCase = await getCaseBundle(CASE_ID);
    expect(
      simCase.documentationResults,
      "documentationResults from getCaseBundle() are unexpectedly null.",
    ).not.toBeNull();

    const rebuilt = buildChartingRowsFromBundle(simCase.documentationResults, TEMPLATE);
    expect(rebuilt.timeOffsets).toEqual([TIME_OFFSET_2, TIME_OFFSET_1]);
    expect(rebuilt.timeOffsetsInPreSim).toEqual(new Set([TIME_OFFSET_1]));

    const blob = caseBundleToFormBlob(simCase);
    expect(blob.tableTemplate).toEqual(SECTIONS);
    expect(blob.charting.timePoints).toEqual([TIME_OFFSET_2, TIME_OFFSET_1]);
    expect(blob.charting.timePointsInPreSim).toEqual(new Set([TIME_OFFSET_1]));

    for (const row of formData) {
      if (row.componentType === "static" || row.componentType === "totalScoreRow") {
        continue;
      }

      const rebuiltRow = blob.charting.data.find((candidate) => candidate.id === row.id);
      expect(rebuiltRow, `${row.id} missing after round trip`).toBeDefined();

      for (const offset of [TIME_OFFSET_1, TIME_OFFSET_2]) {
        expect(rebuiltRow?.[offset], `${row.id} @ ${offset}`).toBe(String(row[offset]));
      }
    }
  });
});