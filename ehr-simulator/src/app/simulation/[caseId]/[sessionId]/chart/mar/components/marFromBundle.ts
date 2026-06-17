import type { CaseBundle } from "@/actions/case_builder/getCase";
import type { DatabaseMedication } from "@/actions/simulation";
import { mapDatabaseMedToFrontend } from "./marHelpers";
import type {
  AdministrationStatus,
  AllMedicationTypes,
  MedAdministrationInstance,
  MedicationOrder,
  OralMedication,
} from "./marData";
import { allMedications } from "./marData";

type DbMedAdmin = {
  medication_id?: string | null;
  medication_order_id?: string | null;
  administrator?: string | null;
  time_offset: number;
  status?: string | null;
  notes?: string | null;
  administered_dose?: number | null;
  is_in_presim?: boolean;
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

function findCatalogMedicationByCatalogId(catalogId: string): AllMedicationTypes | undefined {
  return allMedications.find((m) => m.id === catalogId);
}

function findCatalogMedicationByDbMed(med: {
  generic_name?: string;
  route?: string;
  strength?: number | string | null;
}): AllMedicationTypes | undefined {
  if (!med?.generic_name || !med?.route) return undefined;
  const g = med.generic_name.toLowerCase().trim();
  const route = med.route as AllMedicationTypes["route"];
  const strength = Number(med.strength);
  return allMedications.find(
    (m) =>
      m.genericName.toLowerCase() === g &&
      m.route === route &&
      Math.abs(Number(m.strength) - strength) < 0.001,
  );
}

function embeddedMedication(row: { medications?: unknown }): Record<string, unknown> | null {
  const raw = row.medications;
  if (raw == null) return null;
  if (Array.isArray(raw)) return (raw[0] as Record<string, unknown>) ?? null;
  return raw as Record<string, unknown>;
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
    const catalog = med
      ? findCatalogMedicationByDbMed(med as { generic_name?: string; route?: string; strength?: number })
      : undefined;
    if (!catalog) continue;

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
    });
  }

  return { createdOrders, selectedMeds };
}

function resolveMedicationForOrder(
  med: Record<string, unknown> | null,
  orderRowId: string,
): { medicationId: string; med: AllMedicationTypes } {
  const genericLabel = (med?.generic_name as string) ?? "Medication";
  const catalog = med
    ? findCatalogMedicationByDbMed(med as { generic_name?: string; route?: string; strength?: number })
    : undefined;

  if (catalog) {
    return { medicationId: catalog.id, med: catalog };
  }

  const dbMedId = med?.id ? String(med.id) : "";
  if (dbMedId && med?.generic_name && med?.route) {
    try {
      const mapped = mapDatabaseMedToFrontend(med as DatabaseMedication);
      return { medicationId: dbMedId, med: { ...mapped, id: dbMedId } };
    } catch {
      // fall through to placeholder
    }
  }

  const fallbackId = dbMedId || `db-med-${orderRowId}`;
  return {
    medicationId: fallbackId,
    med: placeholderMedication(fallbackId, genericLabel),
  };
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
  /** DB `medications.id` → `medication_orders.id` for the active phase. */
  const dbMedIdToOrderId = new Map<string, string>();

  /** When legacy administrations only store catalog id, map to structured order UUID if one exists. */
  const catalogIdToOrderId = new Map<string, string>();

  for (const row of dbOrders) {
    const id = String(row.id ?? "");
    if (!id) continue;

    const med = embeddedMedication(row);
    const dbMedId = med?.id ? String(med.id) : "";
    if (dbMedId) {
      dbMedIdToOrderId.set(dbMedId, id);
    }

    const { medicationId, med: resolvedMed } = resolveMedicationForOrder(med, id);
    medsById[resolvedMed.id] = resolvedMed;
    if (medicationId !== resolvedMed.id) {
      medsById[medicationId] = resolvedMed;
    }
    if (resolvedMed.id !== `db-med-${id}`) {
      catalogIdToOrderId.set(resolvedMed.id, id);
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
    };
    medicationOrders.push(mo);
    orderIndex.set(id, mo);
  }

  const extraCatalogIds = new Set<string>();

  for (const a of dbAdmins) {
    const oid = a.medication_order_id ? String(a.medication_order_id) : "";
    const mid = (a.medication_id ?? "").trim();

    if (oid && orderIndex.has(oid)) {
      continue;
    }
    if (mid) {
      if (catalogIdToOrderId.has(mid)) {
        continue;
      }
      extraCatalogIds.add(mid);
    }
  }

  for (const catalogId of extraCatalogIds) {
    if (orderIndex.has(catalogId)) continue;

    const catalog = findCatalogMedicationByCatalogId(catalogId);
    if (!catalog) {
      medsById[catalogId] = placeholderMedication(catalogId, catalogId);
    } else {
      medsById[catalog.id] = catalog;
    }

    const adminsFor = dbAdmins.filter((x) => {
      const mid = (x.medication_id ?? "").trim();
      if (mid !== catalogId) return false;
      const oid = x.medication_order_id ? String(x.medication_order_id) : "";
      if (oid && orderIndex.has(oid)) return false;
      if (catalogIdToOrderId.has(mid)) return false;
      return true;
    });
    const doses = adminsFor
      .map((x) => Number(x.administered_dose ?? 0))
      .filter((d) => Number.isFinite(d) && d > 0);
    const fallbackDose = catalog?.strength ?? doses[doses.length - 1] ?? 0;

    const mo: MedicationOrder = {
      id: catalogId,
      medicationId: catalog?.id ?? catalogId,
      frequency: "",
      priority: "",
      indication: "",
      orderingProvider: "",
      dose: fallbackDose,
      visibleInPresim: true,
    };
    medicationOrders.push(mo);
    orderIndex.set(catalogId, mo);
  }

  const administrations: MedAdministrationInstance[] = [];

  const resolveAdminOrderKey = (a: DbMedAdmin): string | null => {
    const oid = a.medication_order_id ? String(a.medication_order_id) : "";
    const mid = (a.medication_id ?? "").trim();

    if (oid && orderIndex.has(oid)) {
      return oid;
    }

    if (mid) {
      const byDbMed = dbMedIdToOrderId.get(mid);
      if (byDbMed && orderIndex.has(byDbMed)) {
        return byDbMed;
      }
      const resolved = catalogIdToOrderId.get(mid);
      if (resolved && orderIndex.has(resolved)) {
        return resolved;
      }
      if (orderIndex.has(mid)) {
        return mid;
      }
    }

    return null;
  };

  dbAdmins.forEach((a, index) => {
    const orderKey = resolveAdminOrderKey(a);
    if (!orderKey) return;

    administrations.push({
      id: a.created_at ? `${a.created_at}-${index}` : `mar-admin-${index}`,
      medicationOrderId: orderKey,
      administratorId: a.administrator ?? "",
      adminTimeMinuteOffset: a.time_offset,
      status: normalizeAdminStatus(a.status),
      notes: a.notes ?? "",
      administeredDose: Number(a.administered_dose ?? 0),
      visibleInPresim: a.is_in_presim ?? true,
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
