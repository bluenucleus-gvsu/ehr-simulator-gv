import { describe, expect, it, vi } from "vitest";

import { addMedia } from "@/actions/case_builder/updateMedia";
import { updateMedications } from "@/actions/case_builder/updateMedications";
import { updateMedia } from "@/actions/case_builder/updateMedia";
import { caseBuilderPath } from "@/lib/caseBuilder/routes";
import { assertValidSaveRequest } from "@/lib/caseBuilder/validation";
import { caseBundleToFormBlob } from "@/lib/caseBuilder/caseBundleToFormBlob";
import { CaseSection } from "@/lib/caseSections";
import type { CaseBundle } from "@/actions/case_builder/getCase";
import { medOrderFormStateFromCaseBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marFromBundle";
import {
  filterAdministrationsForOrders,
  normalizeOptionalNumericInput,
} from "@/lib/caseBuilder/medicationPayload";
import type { MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import { caseMeetsMinimumRequirements } from "@/lib/caseMinimumRequirements";
import {
  formatTimeOffset,
  timeOffsetMinutesFromParts,
  timeOffsetPartsFromMinutes,
} from "@/utils/form";

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

describe("case minimum requirements", () => {
  const usableCase = {
    first_name: "Avery",
    last_name: "Jones",
    description: "Post-operative patient",
    age: 27,
  };

  it("makes a case usable as soon as its minimum fields are present", () => {
    expect(caseMeetsMinimumRequirements(usableCase)).toBe(true);
  });

  it.each(["first_name", "last_name", "description", "age"] as const)(
    "rejects a case with no %s",
    (field) => {
      expect(caseMeetsMinimumRequirements({ ...usableCase, [field]: " " })).toBe(false);
    },
  );
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

  it("rejects duplicate lab column offsets", () => {
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      columns: [
        { id: "col-a", time_offset: 0, is_in_presim: false, phase: 1 },
        { id: "col-b", time_offset: 0, is_in_presim: false, phase: 1 },
      ],
    }, caseId)).toThrow(/duplicate time offsets/);
  });

  it("rejects lab columns with missing ids or invalid phases", () => {
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      columns: [
        { time_offset: 0, is_in_presim: false, phase: 1 },
      ],
    }, caseId)).toThrow(/columns\[0\].id is required/);
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      columns: [
        { id: "col-a", time_offset: 0, is_in_presim: false, phase: 0 },
      ],
    }, caseId)).toThrow(/phase must be a whole number/);
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      columns: [
        { id: "col-a", time_offset: 0, is_in_presim: false, phase: 11 },
      ],
    }, caseId)).toThrow(/phase must be a whole number/);
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      columns: [
        { id: "col-a", time_offset: 0, is_in_presim: false, phase: 1.5 },
      ],
    }, caseId)).toThrow(/phase must be a whole number/);
  });

  it("allows multiple live-release lab columns and rejects a live column with an offset", () => {
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      columns: [
        { id: "col-a", time_offset: null, is_in_presim: false, phase: 2 },
        { id: "col-b", time_offset: null, is_in_presim: false, phase: 3 },
      ],
    }, caseId)).not.toThrow();
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      columns: [
        { id: "col-a", time_offset: 30, is_in_presim: false, phase: 1 },
      ],
    }, caseId)).not.toThrow();
  });

  it("rejects release-live lab columns on phase 1 and staged columns with offsets", () => {
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      columns: [
        { id: "col-a", time_offset: null, is_in_presim: false, phase: 1 },
      ],
    }, caseId)).toThrow(/Phase 1 items must have a time offset/);
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      columns: [
        { id: "col-a", time_offset: 30, is_in_presim: false, phase: 2 },
      ],
    }, caseId)).toThrow(/cannot have a time offset/);
    expect(() => assertValidSaveRequest(CaseSection.LABS, {
      data: [],
      columns: [
        { id: "col-a", time_offset: null, is_in_presim: true, phase: 2 },
      ],
    }, caseId)).toThrow(/pre-sim/);
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

  it("validates staged media metadata", () => {
    expect(() => assertValidSaveRequest(CaseSection.MEDIA, [{
      id: "image",
      previewUrl: "https://example.test/image.png",
      phase: 2,
      isInPresim: false,
    }], caseId)).not.toThrow();
    expect(() => assertValidSaveRequest(CaseSection.MEDIA, [{
      id: "image",
      previewUrl: "https://example.test/image.png",
      phase: 2,
      isInPresim: true,
    }], caseId)).toThrow(/cannot be in pre-sim/);
  });
});

describe("media metadata persistence", () => {
  const media = {
    id: "image",
    previewUrl: "https://example.test/image.png",
    title: "Test scan",
    description: "Test findings",
    timeOffset: null,
    department: "Imaging",
    storagePath: "case/image.png",
    phase: 3,
    isInPresim: false,
  };

  it("hydrates phase and pre-simulation metadata from the case bundle", () => {
    const form = caseBundleToFormBlob({
      caseRow: {},
      caseImages: [{
        id: "image",
        preview_url: media.previewUrl,
        file_path: media.storagePath,
        title: media.title,
        description: media.description,
        time_offset: media.timeOffset,
        department: media.department,
        phase: media.phase,
        is_in_presim: media.isInPresim,
      }],
    } as never);

    expect(form.media).toEqual([media]);
  });

  it("saves media metadata, phase, and pre-simulation state through the media RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };
    const supabase = {
      from: vi.fn(() => query),
      rpc,
    };

    const result = await updateMedia(supabase as never, [media], caseId);

    expect(rpc).toHaveBeenCalledWith("case_builder_replace_media", {
      p_case_id: caseId,
      p_rows: [{
        preview_url: media.previewUrl,
        file_path: media.storagePath,
        title: media.title,
        description: media.description,
        time_offset: media.timeOffset,
        department: media.department,
        phase: 3,
        is_in_presim: false,
      }],
    });
    expect(result.data).toEqual([{
      id: media.storagePath,
      previewUrl: media.previewUrl,
      title: media.title,
      description: media.description,
      timeOffset: media.timeOffset,
      department: media.department,
      phase: media.phase,
      isInPresim: media.isInPresim,
      storagePath: media.storagePath,
    }]);
  });

  it("appends newly added media without replacing existing case media", async () => {
    const item = {
      ...media,
      id: "55555555-5555-4555-8555-555555555555",
    };
    const insert = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn(() => ({ insert })),
    };

    const result = await addMedia(supabase as never, [item], caseId);

    expect(supabase.from).toHaveBeenCalledWith("case_images");
    expect(insert).toHaveBeenCalledWith([{
      id: item.id,
      preview_url: item.previewUrl,
      file_path: item.storagePath,
      title: item.title,
      description: item.description,
      time_offset: null,
      department: item.department,
      phase: item.phase,
      is_in_presim: item.isInPresim,
    }]);
    expect(result.data?.[0].id).toBe(item.id);
  });

  it("validates optional media metadata and phase-specific offsets", () => {
    expect(() => assertValidSaveRequest(CaseSection.MEDIA, [{
      ...media,
      timeOffset: 15,
      phase: 1,
    }], caseId)).not.toThrow();
    expect(() => assertValidSaveRequest(CaseSection.MEDIA, [{
      ...media,
      timeOffset: 15,
      phase: 2,
    }], caseId)).toThrow(/cannot have a time offset/);
    expect(() => assertValidSaveRequest(CaseSection.MEDIA, [{
      ...media,
      timeOffset: 1.5,
      phase: 1,
    }], caseId)).toThrow(/must be a whole number/);
  });
});

describe("case-builder time offsets", () => {
  it("converts day, hour, and minute parts to minutes before simulation", () => {
    expect(timeOffsetMinutesFromParts({
      days: 1,
      hours: 2,
      minutes: 30,
    }, "before")).toBe(-1590);
  });

  it("splits a saved offset into positive duration fields", () => {
    expect(timeOffsetPartsFromMinutes(-1590)).toEqual({
      days: 1,
      hours: 2,
      minutes: 30,
    });
  });

  it("formats negative offsets into signed day, hour, and minute parts", () => {
    expect(formatTimeOffset(-1590)).toEqual({
      days: -1,
      hours: -2,
      minutes: -30,
    });
  });

  it("returns empty fields for an unset offset", () => {
    expect(timeOffsetPartsFromMinutes(null)).toEqual({
      days: "",
      hours: "",
      minutes: "",
    });
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
});
