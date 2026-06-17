import type { CaseBundle } from "@/actions/case_builder/getCase";
import { buildLabRowsFromBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsFromBundle";
import { labTemplate } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { medOrderFormStateFromCaseBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marFromBundle";
import {
  cloneLabsTable,
  cloneMedAdmins,
  cloneMedOrders,
  cloneOrders,
  createEmptyPhaseCache,
  emptyLabsTable,
  emptyMedOrders,
  readPhase,
  type PhaseScopedCache,
  type PhaseTabScope,
} from "@/lib/casePhases";
import {
  allMedications,
  type MedAdministrationInstance,
  type MedicationOrder,
} from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import type { OrderType } from "@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData";
import { copyMedOrdersWithNewIds } from "@/lib/caseBuilder/remapMedicationOrderIds";
import { carryMarPhaseFromPrevious } from "@/lib/caseBuilder/marPhaseOps";

function selectedMedsFromOrders(createdOrders: MedicationOrder[]) {
  return createdOrders
    .map((o) => allMedications.find((m) => m.id === o.medicationId))
    .filter((m): m is (typeof allMedications)[number] => Boolean(m));
}

function medOrdersFormForPhase(createdOrders: MedicationOrder[]) {
  const selectedMeds = selectedMedsFromOrders(createdOrders);
  return {
    createdOrders: cloneMedOrders({ createdOrders, selectedMeds }).createdOrders,
    selectedMeds: structuredClone(selectedMeds),
  };
}

function mapOrderRow(o: Record<string, unknown>): OrderType {
  return {
    category: o.category as OrderType["category"],
    title: String(o.title ?? ""),
    details: String(o.details ?? ""),
    status: (o.status as OrderType["status"]) ?? "Active",
    orderingProvider: String(o.provider ?? ""),
    important: Boolean(o.is_important),
    visibleInPresim: Boolean(o.is_in_presim),
  };
}

function normalizeAdminStatus(raw: string | null | undefined): MedAdministrationInstance["status"] {
  const s = (raw ?? "").trim().toLowerCase();
  const map: Record<string, MedAdministrationInstance["status"]> = {
    given: "Given",
    held: "Held",
    missed: "Missed",
    refused: "Refused",
    due: "Due",
    scheduled: "Due",
  };
  return map[s] ?? "Due";
}

function mapAdminRow(a: Record<string, unknown>): MedAdministrationInstance {
  return {
    id: a.id ? String(a.id) : undefined,
    medicationOrderId: String(a.medication_order_id ?? ""),
    administratorId: String(a.administrator ?? ""),
    adminTimeMinuteOffset: Number(a.time_offset ?? 0),
    status: normalizeAdminStatus(a.status as string | null | undefined),
    administeredDose: Number(a.administered_dose ?? 0),
    notes: String(a.notes ?? ""),
    visibleInPresim: Boolean(a.is_in_presim),
  };
}

export function hydratePhaseCacheFromBundle(bundle: CaseBundle): PhaseScopedCache {
  const cache = createEmptyPhaseCache();

  for (const o of bundle.orders ?? []) {
    const phase = readPhase(o);
    if (!cache.orders[phase]) cache.orders[phase] = [];
    cache.orders[phase].push(mapOrderRow(o));
  }

  const labPhases = new Set<number>();
  for (const lr of bundle.labResults ?? []) {
    labPhases.add(readPhase(lr));
  }
  if (labPhases.size === 0) labPhases.add(1);

  for (const phase of labPhases) {
    const phaseLabResults = (bundle.labResults ?? []).filter((lr) => readPhase(lr) === phase);
    const phaseImaging = (bundle.imagingReports ?? []).filter((ir) => {
      const lab = phaseLabResults.find((lr) => lr.id === ir.lab_id);
      return Boolean(lab);
    });
    const phaseMicro = (bundle.microbiologyReports ?? []).filter((mr) => {
      const lab = phaseLabResults.find((lr) => lr.id === mr.lab_id);
      return Boolean(lab);
    });
    const hydrated = buildLabRowsFromBundle(
      {
        labResults: phaseLabResults,
        imagingReports: phaseImaging,
        microbiologyReports: phaseMicro,
      },
      labTemplate,
    );
    cache.labs[phase] = {
      data: hydrated.rows,
      timePoints: hydrated.timePoints,
      timePointsInPreSim: new Set(
        phaseLabResults.filter((lr) => lr.is_in_presim).map((lr) => Number(lr.time_offset)),
      ),
      visibleItems: new Set(
        hydrated.rows.filter((r) => r.hideable).map((r) => r.field),
      ),
    };
  }

  const medState = medOrderFormStateFromCaseBundle(bundle);
  const ordersByPhase = new Map<number, typeof medState.createdOrders>();
  for (const row of bundle.medicationOrders ?? []) {
    const phase = readPhase(row);
    if (!ordersByPhase.has(phase)) ordersByPhase.set(phase, []);
    let order = medState.createdOrders.find((o) => o.id === row.id);
    if (!order) {
      const single = medOrderFormStateFromCaseBundle({
        ...bundle,
        medicationOrders: [row],
      });
      order = single.createdOrders[0];
    }
    if (order) ordersByPhase.get(phase)!.push(order);
  }
  if (ordersByPhase.size === 0 && medState.createdOrders.length > 0) {
    ordersByPhase.set(1, medState.createdOrders);
  }
  for (const [phase, createdOrders] of ordersByPhase) {
    cache.medOrders[phase] = medOrdersFormForPhase(createdOrders);
  }

  for (const a of bundle.medicationAdministrations ?? []) {
    const phase = readPhase(a);
    const orderId = String(a.medication_order_id ?? "");
    if (!orderId) continue;
    if (!cache.medAdmins[phase]) cache.medAdmins[phase] = [];
    cache.medAdmins[phase].push(mapAdminRow(a));
  }

  // Ensure MAR phases list orders referenced by their administrations (e.g. after carry-over).
  const allOrdersById = new Map<string, MedicationOrder>();
  for (const form of Object.values(cache.medOrders)) {
    for (const o of form.createdOrders) allOrdersById.set(o.id, o);
  }
  for (const phaseKey of Object.keys(cache.medAdmins)) {
    const phase = Number(phaseKey);
    if (!Number.isFinite(phase)) continue;
    const admins = cache.medAdmins[phase] ?? [];
    const existing = new Set((cache.medOrders[phase]?.createdOrders ?? []).map((o) => o.id));
    const merged = [...(cache.medOrders[phase]?.createdOrders ?? [])];
    for (const admin of admins) {
      if (existing.has(admin.medicationOrderId)) continue;
      const order = allOrdersById.get(admin.medicationOrderId);
      if (order) {
        merged.push(order);
        existing.add(order.id);
      }
    }
    if (merged.length > 0) {
      cache.medOrders[phase] = medOrdersFormForPhase(merged);
    }
  }

  return cache;
}

export function loadPhaseIntoLiveFields(
  cache: PhaseScopedCache,
  phase: number,
): {
  orders: OrderType[];
  labs: ReturnType<typeof emptyLabsTable>;
  medOrders: ReturnType<typeof emptyMedOrders>;
  medAdmins: MedAdministrationInstance[];
} {
  return {
    orders: cache.orders[phase] ? cloneOrders(cache.orders[phase]) : [],
    labs: cache.labs[phase] ? cloneLabsTable(cache.labs[phase]) : emptyLabsTable(),
    medOrders: cache.medOrders[phase] ? cloneMedOrders(cache.medOrders[phase]) : emptyMedOrders(),
    medAdmins: cache.medAdmins[phase] ? cloneMedAdmins(cache.medAdmins[phase]) : [],
  };
}

export function phaseHasCacheEntry(cache: PhaseScopedCache, phase: number): boolean {
  return (
    Object.prototype.hasOwnProperty.call(cache.orders, phase) ||
    Object.prototype.hasOwnProperty.call(cache.labs, phase) ||
    Object.prototype.hasOwnProperty.call(cache.medOrders, phase) ||
    Object.prototype.hasOwnProperty.call(cache.medAdmins, phase)
  );
}

export function phaseHasScopeCacheEntry(
  cache: PhaseScopedCache,
  scope: PhaseTabScope,
  phase: number,
): boolean {
  switch (scope) {
    case "orders":
      return Object.prototype.hasOwnProperty.call(cache.orders, phase);
    case "labs":
      return Object.prototype.hasOwnProperty.call(cache.labs, phase);
    case "medOrders":
      return Object.prototype.hasOwnProperty.call(cache.medOrders, phase);
    case "mar":
      return Object.prototype.hasOwnProperty.call(cache.medAdmins, phase);
  }
}

export function carryOverScopeFromPrevious(
  cache: PhaseScopedCache,
  scope: PhaseTabScope,
  phase: number,
): PhaseScopedCache {
  if (phase <= 1) return cache;
  const sourcePhase = phase - 1;
  let next = cache;
  if (sourcePhase > 1 && !phaseHasScopeCacheEntry(next, scope, sourcePhase)) {
    next = carryOverScopeFromPrevious(next, scope, sourcePhase);
  }
  const source = loadPhaseIntoLiveFields(next, sourcePhase);
  const target = loadPhaseIntoLiveFields(next, phase);
  switch (scope) {
    case "orders":
      return persistLiveFieldsToCache(next, phase, {
        ...target,
        orders: cloneOrders(source.orders),
      });
    case "labs":
      return persistLiveFieldsToCache(next, phase, {
        ...target,
        labs: cloneLabsTable(source.labs),
      });
    case "medOrders": {
      const { medOrders } = copyMedOrdersWithNewIds(source.medOrders);
      return persistLiveFieldsToCache(next, phase, {
        ...target,
        medOrders,
      });
    }
    case "mar":
      return carryMarPhaseFromPrevious(next, phase);
  }
}

export function carryOverPhaseFromPrevious(
  cache: PhaseScopedCache,
  phase: number,
): PhaseScopedCache {
  if (phase <= 1) return cache;
  const sourcePhase = phase - 1;
  let next = cache;
  if (sourcePhase > 1 && !phaseHasCacheEntry(next, sourcePhase)) {
    next = carryOverPhaseFromPrevious(next, sourcePhase);
  }
  const source = loadPhaseIntoLiveFields(next, sourcePhase);
  const { medOrders, medAdmins } = copyMedOrdersWithNewIds(source.medOrders, source.medAdmins);
  return persistLiveFieldsToCache(next, phase, {
    ...source,
    medOrders,
    medAdmins,
  });
}

export function persistLiveFieldsToCache(
  cache: PhaseScopedCache,
  phase: number,
  live: {
    orders: OrderType[];
    labs: ReturnType<typeof emptyLabsTable>;
    medOrders: ReturnType<typeof emptyMedOrders>;
    medAdmins: MedAdministrationInstance[];
  },
): PhaseScopedCache {
  return {
    ...cache,
    orders: { ...cache.orders, [phase]: cloneOrders(live.orders) },
    labs: { ...cache.labs, [phase]: cloneLabsTable(live.labs) },
    medOrders: { ...cache.medOrders, [phase]: cloneMedOrders(live.medOrders) },
    medAdmins: { ...cache.medAdmins, [phase]: cloneMedAdmins(live.medAdmins) },
  };
}
