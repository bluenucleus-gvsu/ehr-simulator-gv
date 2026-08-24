import { describe, expect, it, vi } from "vitest";

import { updateMedications } from "@/actions/case_builder/updateMedications";
import { caseBuilderPath } from "@/lib/caseBuilder/routes";
import { assertValidSaveRequest } from "@/lib/caseBuilder/validation";
import { CaseSection } from "@/lib/saveCase";
import type { CaseBundle } from "@/actions/case_builder/getCase";
import { medOrderFormStateFromCaseBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marFromBundle";
import { buildLabRowsFromBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsFromBundle";
import type { LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import {
  filterAdministrationsForOrders,
  normalizeOptionalNumericInput,
} from "@/lib/caseBuilder/medicationPayload";
import type { MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";

const caseId = "11111111-1111-4111-8111-111111111111";
const orderId = "22222222-2222-4222-8222-222222222222";
const medicationId = "33333333-3333-4333-8333-333333333333";

describe("case-builder routes", () => {
  it("keeps a case ID on every wizard route", () => {
    expect(caseBuilderPath("/admin/case-builder/form/history", caseId)).toBe(
      `/admin/case-builder/form/history?caseId=${caseId}`,
    );
  });

  it("does not add an empty query parameter for a new case", () => {
    expect(caseBuilderPath("/admin/case-builder/form/demographics")).toBe(
      "/admin/case-builder/form/demographics",
    );
  });
});

describe("case-builder runtime validation", () => {
  it("accepts complete demographics", () => {
    expect(() => assertValidSaveRequest(CaseSection.DEMOGRAPHICS, {
      firstName: "Avery",
      lastName: "Jones",
      summary: "Post-operative patient",
      codeStatus: "Full",
      DOBMonth: "May",
      DOBDay: "12",
      age: "42",
      phaseCount: 3,
    })).not.toThrow();
  });

  it("rejects a non-UUID case ID before a section save", () => {
    expect(() => assertValidSaveRequest(CaseSection.ORDERS, [], "legacy-case-id"))
      .toThrow(/Case ID must be a UUID/);
  });

  it("rejects duplicate table offsets", () => {
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      timePoints: [0, 0],
      timePointsInPreSim: [],
    }, caseId)).toThrow(/duplicate time offsets/);
  });

  it("accepts database UUID medication identities and linked administrations", () => {
    expect(() => assertValidSaveRequest(CaseSection.MEDICATION_ORDERS, {
      orders: [{
        id: orderId,
        medicationId,
        frequency: "BID",
        priority: "Routine",
        phase: 2,
      }],
      administrations: [{
        medicationOrderId: orderId,
        adminTimeMinuteOffset: 0,
        administeredDose: 10,
        phase: 2,
      }],
    }, caseId)).not.toThrow();
  });

  it("rejects medication administrations whose order would not be saved", () => {
    expect(() => assertValidSaveRequest(CaseSection.MEDICATION_ORDERS, {
      orders: [],
      administrations: [{
        medicationOrderId: orderId,
        adminTimeMinuteOffset: 0,
        administeredDose: 10,
      }],
    }, caseId)).toThrow(/references an order that is not being saved/);
  });

  it("allows an empty media array so all media can be removed", () => {
    expect(() => assertValidSaveRequest(CaseSection.MEDIA, [], caseId)).not.toThrow();
  });
});

describe("medication save payloads", () => {
  it("removes administrations whose medication order is no longer being saved", () => {
    const administrations = [
      { medicationOrderId: orderId, status: "Due" },
      {
        medicationOrderId: "44444444-4444-4444-8444-444444444444",
        status: "Given",
      },
    ];

    expect(filterAdministrationsForOrders([{ id: orderId }], administrations)).toEqual([
      administrations[0],
    ]);
    expect(administrations).toHaveLength(2);
  });

  it("normalizes blank optional numeric inputs to null", () => {
    expect(normalizeOptionalNumericInput("")).toBeNull();
    expect(normalizeOptionalNumericInput("   ")).toBeNull();
    expect(normalizeOptionalNumericInput(undefined)).toBeNull();
  });

  it("preserves valid optional numeric inputs", () => {
    expect(normalizeOptionalNumericInput(0)).toBe(0);
    expect(normalizeOptionalNumericInput(12.5)).toBe(12.5);
    expect(normalizeOptionalNumericInput("12.5")).toBe(12.5);
  });

  it("sends a blank infusion rate to the database as null", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const order = {
      id: orderId,
      medicationId,
      dose: 10,
      frequency: "BID",
      priority: "Routine",
      indication: "Hypertension",
      orderingProvider: "Dr. Test",
      infusionRate: "",
      visibleInPresim: true,
      phase: 1,
    } as unknown as MedicationOrder;

    await updateMedications(
      { rpc } as never,
      { orders: [order], administrations: [] },
      caseId,
    );

    expect(rpc).toHaveBeenCalledWith("case_builder_replace_medications", {
      p_case_id: caseId,
      p_orders: [expect.objectContaining({ infusion_rate: null })],
      p_administrations: [],
    });
  });
});

describe("case-builder edit hydration", () => {
  it("preserves database medication UUIDs and positional duplicate orders", () => {
    const medication = {
      id: medicationId,
      generic_name: "acetaminophen",
      route: "PO",
      strength: 325,
      strength_unit: "mg",
      is_variable_dose: false,
      dispense_units: { name: "Tablet" },
    };
    const bundle = {
      medicationOrders: [
        { id: orderId, medication_id: medicationId, frequency: "BID", priority: "Routine", phase: 2, medications: medication },
        { id: "44444444-4444-4444-8444-444444444444", medication_id: medicationId, frequency: "PRN", priority: "PRN", phase: 3, medications: medication },
      ],
    } as unknown as CaseBundle;

    const hydrated = medOrderFormStateFromCaseBundle(bundle);
    expect(hydrated.createdOrders).toHaveLength(2);
    expect(hydrated.selectedMeds).toHaveLength(2);
    expect(hydrated.createdOrders[0].medicationId).toBe(medicationId);
    expect(hydrated.selectedMeds[0].id).toBe(medicationId);
    expect(hydrated.createdOrders.map((order) => order.phase)).toEqual([2, 3]);
  });

  it("rehydrates unstructured lab values instead of dropping them", () => {
    const template: LabTableData[] = [{
      field: "Custom Biomarker",
      rowType: "results",
      hideable: true,
    }];
    const hydrated = buildLabRowsFromBundle({
      labResults: [{ id: "lab-1", time_offset: 0, data: { unstructured: { "Custom Biomarker": "positive" } } }],
      imagingReports: [],
      microbiologyReports: [],
    }, template);

    expect(hydrated.rows[0][0]).toBe("positive");
  });
});
