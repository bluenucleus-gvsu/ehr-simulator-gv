import type { CaseBundle } from "@/actions/case_builder/getCase";
import type {
  AdministrationStatus,
  AllMedicationTypes,
  MedAdministrationInstance,
  MedicationOrder,
  OralMedication,
} from "./marData";

type DbMedAdmin = {
  medication_order_id?: string | null;
  administrator?: string | null;
  time_offset: number;
  status?: string | null;
  notes?: string | null;
  administered_dose?: number | null;
  is_in_presim?: boolean;
  phase?: number | null;
  created_at?: string;
};

function normalizeAdminStatus(raw: string | null | undefined): AdministrationStatus {
  const s = (raw ?? "").trim();
  if (!s) return "Given";
  const lower = s.toLowerCase();
  const map: Record<string, AdministrationStatus> = {
    given: "Given",
    held: "Held",
    missed: "Missed",
    refused: "Refused",
    due: "Due",
  };
  if (map[lower]) return map[lower];
  if (["Given", "Held", "Missed", "Refused", "Due"].includes(s)) return s as AdministrationStatus;
  return "Given";
}

function embeddedMedication(row: { medications?: unknown }): Record<string, unknown> | null {
  const raw = row.medications;
  if (raw == null) return null;
  if (Array.isArray(raw)) return (raw[0] as Record<string, unknown>) ?? null;
  return raw as Record<string, unknown>;
}

function dispenseUnitName(med: Record<string, unknown>): string {
  const raw = med.dispense_units;
  const joined = Array.isArray(raw) ? raw[0] : raw;
  if (joined && typeof joined === "object" && "name" in joined) {
    return String((joined as { name?: unknown }).name ?? "dose");
  }
  return "dose";
}

/** Keep the database UUID as the medication identity used by medication_orders. */
function medicationFromDb(med: Record<string, unknown>): AllMedicationTypes | null {
  const id = String(med.id ?? "");
  const genericName = String(med.generic_name ?? "");
  const route = String(med.route ?? "") as AllMedicationTypes["route"];
  if (!id || !genericName || !route) return null;

  return {
    id,
    genericName,
    brandName: med.brand_name ? String(med.brand_name) : undefined,
    route,
    strength: Number(med.strength ?? 0),
    strengthUnit: String(med.strength_unit ?? ""),
    dispenseUnit: dispenseUnitName(med),
    isVariableDose: Boolean(med.is_variable_dose),
    infusionRateUnit: med.infusion_rate_unit
      ? String(med.infusion_rate_unit)
      : undefined,
    diluent: med.diluent ? String(med.diluent) : undefined,
    totalVolume: med.total_volume == null ? undefined : Number(med.total_volume),
    bgDosing: [],
  } as AllMedicationTypes;
}

function placeholderMedication(id: string, label: string): OralMedication {
  return {
    id,
    genericName: label || "Medication",
    route: "PO",
    strength: 0,
    strengthUnit: "",
    dispenseUnit: "dose",
    isVariableDose: false
  };
}

function parseInfusionRate(raw: string | null | undefined): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Rebuild Case Builder med order form state from persisted `medication_orders` + joined meds. */
export function medOrderFormStateFromCaseBundle(caseBundle: CaseBundle | null): {
  createdOrders: MedicationOrder[];
  selectedMeds: AllMedicationTypes[];
} {
  if (!caseBundle?.medicationOrders?.length) {
    return { createdOrders: [], selectedMeds: [] };
  }

  const createdOrders: MedicationOrder[] = [];
  const selectedMeds: AllMedicationTypes[] = [];

  for (const row of caseBundle.medicationOrders as Record<string, unknown>[]) {
    const id = String(row.id ?? "");
    if (!id) continue;

    const med = embeddedMedication(row);
    const catalog = med ? medicationFromDb(med) : null;
    if (!catalog) continue;

    // The medication form keeps this array positional with createdOrders.
    // Duplicate orders for the same medication therefore need duplicate entries.
    selectedMeds.push(catalog);
    const pr = String(row.priority ?? "");
    const priority: MedicationOrder["priority"] =
      pr === "STAT" || pr === "NOW" || pr === "Routine" || pr === "PRN" || pr === ""
        ? (pr as MedicationOrder["priority"])
        : "";

    createdOrders.push({
      id,
      medicationId: catalog.id,
      frequency: String(row.frequency ?? ""),
      priority,
      instructions: (row.instructions as string) ?? undefined,
      indication: String(row.indication ?? ""),
      orderingProvider: String(row.ordering_provider ?? ""),
      infusionRate: parseInfusionRate(row.infusion_rate as string | undefined),
      dose: Number(row.dose ?? 0),
      visibleInPresim: Boolean(row.is_in_presim ?? true),
      phase: Number(row.phase ?? 1),
    });
  }

  return { createdOrders, selectedMeds };
}

export function buildMarFromCaseBundle(caseBundle: CaseBundle | null): {
  medicationOrders: MedicationOrder[];
  administrations: MedAdministrationInstance[];
  medsById: Record<string, AllMedicationTypes>;
} {
  if (!caseBundle) {
    return { medicationOrders: [], administrations: [], medsById: {} };
  }

  const dbAdmins = (caseBundle.medicationAdministrations ?? []) as DbMedAdmin[];
  const dbOrders = (caseBundle.medicationOrders ?? []) as Record<string, unknown>[];

  const medsById: Record<string, AllMedicationTypes> = {};
  const medicationOrders: MedicationOrder[] = [];
  const orderIndex = new Map<string, MedicationOrder>();

  for (const row of dbOrders) {
    const id = String(row.id ?? "");
    if (!id) continue;

    const med = embeddedMedication(row);
    const catalog = med ? medicationFromDb(med) ?? undefined : undefined;
    const genericLabel = (med?.generic_name as string) ?? "Medication";
    const medicationId = catalog?.id ?? `db-med-${id}`;

    if (catalog) {
      medsById[catalog.id] = catalog;
    } else {
      medsById[medicationId] = placeholderMedication(medicationId, genericLabel);
    }

    const pr = String(row.priority ?? "");
    const priority: MedicationOrder["priority"] =
      pr === "STAT" || pr === "NOW" || pr === "Routine" || pr === "PRN" || pr === ""
        ? (pr as MedicationOrder["priority"])
        : "";

    const mo: MedicationOrder = {
      id,
      medicationId,
      frequency: String(row.frequency ?? ""),
      priority,
      instructions: (row.instructions as string) ?? undefined,
      indication: String(row.indication ?? ""),
      orderingProvider: String(row.ordering_provider ?? ""),
      infusionRate: parseInfusionRate(row.infusion_rate as string | undefined),
      dose: Number(row.dose ?? 0),
      visibleInPresim: Boolean(row.is_in_presim ?? true),
      phase: Number(row.phase ?? 1),
    };
    medicationOrders.push(mo);
    orderIndex.set(id, mo);
  }

  const administrations: MedAdministrationInstance[] = [];

  dbAdmins.forEach((a, index) => {
    const oid = a.medication_order_id ? String(a.medication_order_id) : "";

    if (!oid || !orderIndex.has(oid)) return;

    administrations.push({
      id: a.created_at ? `${a.created_at}-${index}` : `mar-admin-${index}`,
      medicationOrderId: oid,
      administratorId: a.administrator ?? "",
      adminTimeMinuteOffset: a.time_offset,
      status: normalizeAdminStatus(a.status),
      notes: a.notes ?? "",
      administeredDose: Number(a.administered_dose ?? 0),
      visibleInPresim: a.is_in_presim ?? true,
      phase: Number(a.phase ?? 1),
    });
  });

  return { medicationOrders, administrations, medsById };
}

/** Matches MAR tab filter semantics for Scheduled vs PRN vs Continuous. */
export function isContinuousOrderFrequency(frequency: string): boolean {
  return frequency === "Continuous" || frequency === "CONTINUOUS";
}

export function countMarOrdersByCategory(orders: MedicationOrder[]): {
  scheduled: number;
  prn: number;
  continuous: number;
} {
  let scheduled = 0;
  let prn = 0;
  let continuous = 0;
  for (const o of orders) {
    if (o.priority === "PRN") prn++;
    else if (isContinuousOrderFrequency(o.frequency)) continuous++;
    else scheduled++;
  }
  return { scheduled, prn, continuous };
}

export function countDueAdministrations(administrations: MedAdministrationInstance[]): number {
  return administrations.filter((a) => a.status === "Due").length;
}
