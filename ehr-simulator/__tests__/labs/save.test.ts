import { describe, expect, it, vi } from "vitest";

import { transformLabTableToSchema } from "@/lib/labTypes";
import { updateLabs } from "@/actions/case_builder/updateLabs";
import type { LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import type { LabColumn } from "@/lib/labTypes";

const caseId = "11111111-1111-4111-8111-111111111111";

const timeOffsetColumn = (id: string, time_offset: number, overrides?: Partial<LabColumn>): LabColumn => ({
  id,
  time_offset,
  is_in_presim: false,
  phase: 1,
  label: null,
  ...overrides,
});

describe("transformLabTableToSchema", () => {
  it("produces one row per column with case, offset, presim, and phase", () => {
    const data: LabTableData[] = [
      { field: "Sodium", id: "sodium", rowType: "results", colA: "145", colB: "140" },
    ];

    const { labResults } = transformLabTableToSchema(caseId, {
      data,
      columns: [
        timeOffsetColumn("colA", 0, { is_in_presim: true, phase: 2 }),
        timeOffsetColumn("colB", 30),
      ],
    });

    expect(labResults).toHaveLength(2);
    expect(labResults[0]).toMatchObject({
      case_id: caseId,
      time_offset: 0,
      is_in_presim: true,
      phase: 2,
      sodium: "145",
    });
    expect(labResults[1]).toMatchObject({
      case_id: caseId,
      time_offset: 30,
      is_in_presim: false,
      phase: 1,
      sodium: "140",
    });
  });

  it("serializes live-release columns with a null time_offset and their label", () => {
    const { labResults } = transformLabTableToSchema(caseId, {
      data: [
        { field: "Sodium", id: "sodium", rowType: "results", live1: "145" },
      ],
      columns: [
        { id: "live1", time_offset: null, is_in_presim: false, phase: 1, label: "BMP — repeat draw" },
      ],
    });

    expect(labResults[0]).toMatchObject({
      time_offset: null,
      is_in_presim: false,
      phase: 1,
      label: "BMP — repeat draw",
      sodium: "145",
    });
  });

  it("stores blank labels as null", () => {
    const { labResults } = transformLabTableToSchema(caseId, {
      data: [],
      columns: [
        timeOffsetColumn("colA", 0, { label: "   " }),
        timeOffsetColumn("colB", 5, { label: undefined as unknown as null }),
      ],
    });

    expect(labResults[0]?.label).toBeNull();
    expect(labResults[1]?.label).toBeNull();
  });

  it("coerces values to text and blanks to null", () => {
    const { labResults } = transformLabTableToSchema(caseId, {
      data: [
        { field: "Sodium", id: "sodium", rowType: "results", colA: 145, colB: "" },
      ],
      columns: [
        timeOffsetColumn("colA", 0),
        timeOffsetColumn("colB", 5),
      ],
    });

    expect(labResults[0]?.sodium).toBe("145");
    expect(labResults[1]?.sodium).toBeNull();
  });

  it("skips divider rows", () => {
    const { labResults } = transformLabTableToSchema(caseId, {
      data: [
        { field: "Metabolic", rowType: "divider", colA: "145" },
      ],
      columns: [timeOffsetColumn("colA", 0)],
    });

    expect(labResults[0]).not.toHaveProperty("sodium");
  });

  it("skips results rows without an id", () => {
    const { labResults } = transformLabTableToSchema(caseId, {
      data: [
        { field: "Custom", rowType: "results", colA: "145" },
      ],
      columns: [timeOffsetColumn("colA", 0)],
    });

    expect(labResults[0]).not.toHaveProperty("Custom");
  });

  it("reads string-keyed cells", () => {
    const { labResults } = transformLabTableToSchema(caseId, {
      data: [
        { field: "Sodium", id: "sodium", rowType: "results", "colA": "145" },
      ],
      columns: [timeOffsetColumn("colA", 0)],
    });

    expect(labResults[0]?.sodium).toBe("145");
  });

  it("writes explicit null for empty cells but omits fields with no data row", () => {
    const { labResults } = transformLabTableToSchema(caseId, {
      data: [
        { field: "Sodium", id: "sodium", rowType: "results" },
      ],
      columns: [timeOffsetColumn("colA", 0)],
    });

    expect(labResults[0]).toMatchObject({ sodium: null });
    expect(labResults[0]).not.toHaveProperty("potassium");
    expect(labResults[0]).not.toHaveProperty("creatinine");
  });
});

describe("updateLabs", () => {
  it("sends transformed rows to the case_builder_replace_labs RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const supabase = { rpc } as unknown as Parameters<typeof updateLabs>[0];

    const payload = {
      data: [
        { field: "Sodium", id: "sodium", rowType: "results", colA: "145" } as LabTableData,
      ],
      columns: [timeOffsetColumn("colA", 0, { phase: 3 })],
    };

    const result = await updateLabs(supabase, payload, caseId);

    expect(rpc).toHaveBeenCalledWith("case_builder_replace_labs", {
      p_case_id: caseId,
      p_lab_rows: [
        expect.objectContaining({
          case_id: caseId,
          time_offset: 0,
          is_in_presim: false,
          phase: 3,
          sodium: "145",
        }),
      ],
    });
    expect(result.labResults).toHaveLength(1);
  });

  it("throws when the RPC returns an error", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: new Error("boom") });
    const supabase = { rpc } as unknown as Parameters<typeof updateLabs>[0];

    await expect(
      updateLabs(supabase, { data: [], columns: [] }, caseId),
    ).rejects.toThrow("boom");
  });
});