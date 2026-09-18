import { afterAll, beforeAll, beforeEach, describe, expect } from "vitest";
import { randomUUID } from "node:crypto";

import { transformLabTableToSchema } from "@/lib/labTypes";
import { buildLabRowsFromBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsFromBundle";
import {
  labTemplate,
  getResultStatus,
  LabSeverityLevel,
  type LabTableData,
} from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { supabase } from "@/lib/supabaseClient";
import { getCaseBundle } from "@/actions/case_builder/getCase";

const CASE_ID = randomUUID();
const TIME_OFFSET_1 = 0;
const TIME_OFFSET_2 = -45;
const NON_LAB_COLUMNS = ["case_id", "data", "time_offset", "is_in_presim"];

/* 
  Tests full Lab Result path from Case Builder to EHR View
  Path: Lab Form Data -> transformLabTableToSchema() -> supabase.upsert() -> getCaseBundle()
    -> buildLabRowsFromBundle()
*/

describe("Lab Results round trip process", () => {
  beforeAll(async () => {
    const { error } = await supabase.from("cases").insert({
      id: CASE_ID,
      name: "Lab Round-Trip Test",
      first_name: "Samuel",
      last_name: "Jones",
      code_status: "Full",
    });
    if (error) throw new Error(`Could not create test case: ${error.message}`);
  });

  beforeEach(async () => {
    await supabase.from("lab_results").delete().eq("case_id", CASE_ID);
  });

  afterAll(async () => {
    await supabase.from("lab_results").delete().eq("case_id", CASE_ID);
    await supabase.from("cases").delete().eq("id", CASE_ID);
  });

  it("creates lab form data, upserts to Supabase, and retrieves correct data back", async () => {
    const labData: LabTableData[] = labTemplate.map((row, index) => ({
      ...row,
      [TIME_OFFSET_1]: String(index + TIME_OFFSET_1),
      [TIME_OFFSET_2]: String(index + TIME_OFFSET_2),
    }));

    const labCols = new Set(
      labTemplate.filter((row) => row.id != null).map((row) => row.id),
    );

    const { labResults: labInsert } = transformLabTableToSchema(CASE_ID, {
      data: labData,
      timePoints: [TIME_OFFSET_1, TIME_OFFSET_2],
      timePointsInPreSim: new Set([TIME_OFFSET_1]),
    });

    const presimRow = labInsert[0];

    Object.entries(presimRow).map(([col, value]) => {
      if (!NON_LAB_COLUMNS.includes(col)) {
        expect(labCols.has(col), `${col} not found`).toEqual(true);
        expect(typeof value, `Lab result ${col} not coerced to string`).toBe(
          "string",
        );
      }

      if (col === "time_offset") {
        expect(typeof value).toBe("number");
      }

      if (col === "is_in_presim") {
        expect(value, `Presim-marked column has been reverted`).toEqual(true);
      }
    });

    const { error } = await supabase
      .from("lab_results")
      .upsert(labInsert, { onConflict: "case_id,time_offset" });

    if (error) {
      throw new Error(`upsert failed: ${error.message}`);
    }

    const simCase = await getCaseBundle(CASE_ID);
    const labResults = simCase.labResults;

    expect(
      labResults,
      "Lab results fom getCaseBundle() are unexpectedly null.",
    ).not.toBeNull();

    const {
      rows: rebuiltRows,
      timePoints,
      timePointsInPresim,
    } = buildLabRowsFromBundle(labResults, labTemplate);

    expect(timePoints).toEqual([TIME_OFFSET_2, TIME_OFFSET_1]);
    expect(timePointsInPresim).toEqual([TIME_OFFSET_1]);

    for (const row of labData) {
      if (row.rowType !== "results" || !row.id) {
        continue;
      }

      const rebuilt = rebuiltRows.find((rebuiltRow) => rebuiltRow.id === row.id);
      expect(rebuilt, `${row.id} missing after round trip`).toBeDefined();

      for (const offset of [TIME_OFFSET_1, TIME_OFFSET_2]) {
        expect(rebuilt?.[offset], `${row.id} @ ${offset}`).toBe(row[offset]);
      }
    }

    const potassiumRow = labData.find((row) => row.id === "potassium")!;
    const rebuiltPotassium = rebuiltRows.find((row) => row.id === "potassium")!;

    expect(
      getResultStatus(
        rebuiltPotassium[TIME_OFFSET_1] as string,
        potassiumRow.normalRange,
        potassiumRow.criticalRange,
      ),
    ).toBe(LabSeverityLevel.CRITICAL);
  });
});
