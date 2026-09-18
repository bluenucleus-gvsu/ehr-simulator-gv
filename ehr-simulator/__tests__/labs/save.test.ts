import { describe, expect, it, vi } from "vitest";

import { transformLabTableToSchema } from "@/lib/labTypes";
import { updateLabs } from "@/actions/case_builder/updateLabs";
import type { LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";

const caseId = "11111111-1111-4111-8111-111111111111";

describe("transformLabTableToSchema", () => {
  it("produces one row per time point with case and presim flags", () => {
    const data: LabTableData[] = [
      { field: "Sodium", id: "sodium", rowType: "results", [0]: "145", [30]: "140" },
    ];

    const { labResults } = transformLabTableToSchema(caseId, {
      data,
      timePoints: [0, 30],
      timePointsInPreSim: new Set([0]),
    });

    expect(labResults).toHaveLength(2);
    expect(labResults[0]).toMatchObject({
      case_id: caseId,
      time_offset: 0,
      is_in_presim: true,
      sodium: "145",
    });
    expect(labResults[1]).toMatchObject({
      case_id: caseId,
      time_offset: 30,
      is_in_presim: false,
      sodium: "140",
    });
  });

  it("stores every lab value column as text", () => {
    const data: LabTableData[] = [
      { field: "Sodium", id: "sodium", rowType: "results", [0]: 145 },
      { field: "Potassium", id: "potassium", rowType: "results", [0]: "4.2" },
      { field: "Blood Type", id: "blood_type", rowType: "results", [0]: "O+" },
    ];

    const { labResults } = transformLabTableToSchema(caseId, {
      data,
      timePoints: [0],
      timePointsInPreSim: new Set([0]),
    });

    expect(labResults[0].sodium).toBe("145");
    expect(labResults[0].potassium).toBe("4.2");
    expect(labResults[0].blood_type).toBe("O+");
  });

  it("converts blank cell values to null", () => {
    const data: LabTableData[] = [
      { field: "Potassium", id: "potassium", rowType: "results", [0]: "" },
      { field: "Sodium", id: "sodium", rowType: "results", [0]: "" },
    ];

    const { labResults } = transformLabTableToSchema(caseId, {
      data,
      timePoints: [0],
      timePointsInPreSim: new Set([0]),
    });

    expect(labResults[0].potassium).toBeNull();
    expect(labResults[0].sodium).toBeNull();
  });

  it("skips divider rows and rows with no value", () => {
    const data: LabTableData[] = [
      { field: "Metabolic", rowType: "divider" },
      { field: "Sodium", id: "sodium", rowType: "results", [0]: "145" },
    ];

    const { labResults } = transformLabTableToSchema(caseId, {
      data,
      timePoints: [0],
      timePointsInPreSim: new Set([0]),
    });

    expect(labResults[0]).toMatchObject({ sodium: "145" });
    expect(labResults[0].data).toEqual({});
  });

  it("keeps rows without an id in the unstructured data blob", () => {
    const data: LabTableData[] = [
      { field: "Custom Biomarker", rowType: "results", hideable: true, [0]: "positive" },
      { field: "Another Biomarker", rowType: "results", hideable: true, [0]: "" },
    ];

    const { labResults } = transformLabTableToSchema(caseId, {
      data,
      timePoints: [0],
      timePointsInPreSim: new Set([0]),
    });

    expect(labResults[0].data).toEqual({
      unstructured: {
        "Custom Biomarker": "positive",
        "Another Biomarker": null,
      },
    });
  });

  it("reads cell values stored under string keys", () => {
    const data: LabTableData[] = [
      { field: "Sodium", id: "sodium", rowType: "results", ["0"]: "145" },
    ];

    const { labResults } = transformLabTableToSchema(caseId, {
      data,
      timePoints: [0],
      timePointsInPreSim: new Set([0]),
    });

    expect(labResults[0].sodium).toBe("145");
  });

  it("leaves unset columns out of the row entirely", () => {
    const data: LabTableData[] = [
      { field: "Sodium", id: "sodium", rowType: "results", [0]: "145" },
    ];

    const { labResults } = transformLabTableToSchema(caseId, {
      data,
      timePoints: [0],
      timePointsInPreSim: new Set([0]),
    });

    expect(labResults[0].potassium).toBeUndefined();
  });
});

describe("updateLabs", () => {
  it("calls the case_builder_replace_labs RPC with the transformed rows", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const data: LabTableData[] = [
      { field: "Sodium", id: "sodium", rowType: "results", [0]: "140" },
    ];

    await updateLabs(
      { rpc } as never,
      { data, timePoints: [0], timePointsInPreSim: [0] },
      caseId,
    );

    expect(rpc).toHaveBeenCalledWith("case_builder_replace_labs", {
      p_case_id: caseId,
      p_lab_rows: [
        expect.objectContaining({
          case_id: caseId,
          time_offset: 0,
          is_in_presim: true,
          sodium: "140",
        }),
      ],
    });
  });

  it("returns the transformed rows", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });

    const result = await updateLabs(
      { rpc } as never,
      { data: [], timePoints: [5], timePointsInPreSim: [] },
      caseId,
    );

    expect(result.labResults).toEqual([{
      case_id: caseId,
      time_offset: 5,
      is_in_presim: false,
      data: {},
    }]);
  });
});