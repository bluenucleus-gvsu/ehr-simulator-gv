import { afterAll, beforeAll, beforeEach, describe, expect } from "vitest";
import { randomUUID } from "node:crypto";

import { transformLabTableToSchema, type LabColumn } from "@/lib/labTypes";
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
const NON_LAB_COLUMNS = ["case_id", "time_offset", "is_in_presim", "phase", "label"];

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
      case_specialty: "med_surg"
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
    const formColumnA: LabColumn = {
      id: randomUUID(),
      time_offset: 0,
      is_in_presim: true,
      phase: 1,
      label: null,
    };
    const formColumnB: LabColumn = {
      id: randomUUID(),
      time_offset: -45,
      is_in_presim: false,
      phase: 1,
      label: null,
    };

    const labData: LabTableData[] = labTemplate.map((row, index) => ({
      ...row,
      [formColumnA.id]: String(index),
      [formColumnB.id]: String(index - 45),
    }));

    const labCols = new Set(
      labTemplate.filter((row) => row.id != null).map((row) => row.id),
    );

    const { labResults: labInsert } = transformLabTableToSchema(CASE_ID, {
      data: labData,
      columns: [formColumnA, formColumnB],
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
        expect(value).toBe(0);
      }

      if (col === "phase") {
        expect(value).toBe(1);
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
      columns: rebuiltColumns,
    } = buildLabRowsFromBundle(labResults ?? [], labTemplate);

    expect(rebuiltColumns.map((column) => column.time_offset)).toEqual([-45, 0]);
    expect(rebuiltColumns[0]).toMatchObject({ is_in_presim: false, phase: 1 });
    expect(rebuiltColumns[1]).toMatchObject({ is_in_presim: true, phase: 1 });

    for (const column of rebuiltColumns) {
      const formColumn = column.time_offset === 0 ? formColumnA : formColumnB;
      for (const row of labData) {
        if (row.rowType !== "results" || !row.id) {
          continue;
        }

        const rebuilt = rebuiltRows.find((rebuiltRow) => rebuiltRow.id === row.id);
        expect(rebuilt, `${row.id} missing after round trip`).toBeDefined();
        expect(rebuilt?.[column.id], `${row.id} @ ${column.time_offset}`).toBe(
          row[formColumn.id],
        );
      }
    }

    const potassiumRow = labData.find((row) => row.id === "potassium")!;
    const rebuiltPotassium = rebuiltRows.find((row) => row.id === "potassium")!;
    const potassiumColumn = rebuiltColumns.find(
      (column) => column.time_offset === 0,
    );
    if (!potassiumColumn) throw new Error("no rebuilt column at offset 0");

    expect(
      getResultStatus(
        rebuiltPotassium[potassiumColumn.id] as string,
        potassiumRow.normalRange,
        potassiumRow.criticalRange,
      ),
    ).toBe(LabSeverityLevel.CRITICAL);
  });
});