import { loadMarPhaseLiveFields } from "@/lib/caseBuilder/marPhaseOps";
import { dedupeMedicationIdsAcrossPhases } from "@/lib/caseBuilder/remapMedicationOrderIds";
import type { MedicationPersistPart } from "@/actions/case_builder/updateMedications";
import {
  cloneMedAdmins,
  cloneMedOrders,
  emptyMedOrders,
  type PhaseByScope,
  type PhaseScopedCache,
  type PhaseTabScope,
} from "@/lib/casePhases";
import type { MedAdministrationInstance } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import type { MedOrderFormData } from "@/utils/form";

export type MedicationCachePayload = {
  cache: PhaseScopedCache;
  orders: MedOrderFormData["createdOrders"];
  administrations: MedAdministrationInstance[];
  part: MedicationPersistPart;
};

/** Write med orders for one phase (always replaces; no silent skip). */
export function commitMedOrdersPhase(
  cache: PhaseScopedCache,
  phase: number,
  data: MedOrderFormData,
): PhaseScopedCache {
  return {
    ...cache,
    medOrders: {
      ...cache.medOrders,
      [phase]: cloneMedOrders(data),
    },
  };
}

/** Write MAR admins for one phase (always replaces; no silent skip). */
export function commitMarAdminsPhase(
  cache: PhaseScopedCache,
  phase: number,
  admins: MedAdministrationInstance[],
): PhaseScopedCache {
  return {
    ...cache,
    medAdmins: {
      ...cache.medAdmins,
      [phase]: cloneMedAdmins(admins),
    },
  };
}

export function readMedOrdersPhase(cache: PhaseScopedCache, phase: number): MedOrderFormData {
  return cache.medOrders[phase] ? cloneMedOrders(cache.medOrders[phase]) : emptyMedOrders();
}

export function readMarAdminsPhase(
  cache: PhaseScopedCache,
  phase: number,
): MedAdministrationInstance[] {
  return cache.medAdmins[phase] ? cloneMedAdmins(cache.medAdmins[phase]) : [];
}

/** Phases to persist for Med Orders tab (cache keys only; no synthetic carry-over). */
export function medOrderPhasesToPersist(
  cache: PhaseScopedCache,
  phaseByScope: PhaseByScope,
  phaseCount: number,
): number[] {
  const highest = Math.min(phaseCount, phaseByScope.medOrders.highestInitializedPhase);
  const phases = new Set<number>();
  for (let p = 1; p <= highest; p++) {
    if (p === 1 || Object.prototype.hasOwnProperty.call(cache.medOrders, p)) {
      phases.add(p);
    }
  }
  for (const key of Object.keys(cache.medOrders)) {
    const p = Number(key);
    if (Number.isFinite(p) && p >= 1 && p <= phaseCount) phases.add(p);
  }
  return [...phases].sort((a, b) => a - b);
}

/** Phases to persist for MAR tab. */
export function marPhasesToPersist(
  cache: PhaseScopedCache,
  phaseByScope: PhaseByScope,
  phaseCount: number,
): number[] {
  const highest = Math.min(phaseCount, phaseByScope.mar.highestInitializedPhase);
  const phases = new Set<number>();
  for (let p = 1; p <= highest; p++) {
    if (
      p === 1 ||
      Object.prototype.hasOwnProperty.call(cache.medAdmins, p) ||
      Object.prototype.hasOwnProperty.call(cache.medOrders, p)
    ) {
      phases.add(p);
    }
  }
  for (const key of Object.keys(cache.medAdmins)) {
    const p = Number(key);
    if (Number.isFinite(p) && p >= 1 && p <= phaseCount) phases.add(p);
  }
  return [...phases].sort((a, b) => a - b);
}

export function medicationPhasesToPersistForScope(
  cache: PhaseScopedCache,
  scope: "medOrders" | "mar",
  phaseByScope: PhaseByScope,
  phaseCount: number,
): number[] {
  return scope === "medOrders"
    ? medOrderPhasesToPersist(cache, phaseByScope, phaseCount)
    : marPhasesToPersist(cache, phaseByScope, phaseCount);
}

export function medOrdersPhaseIsCommitted(cache: PhaseScopedCache, phase: number): boolean {
  return Object.prototype.hasOwnProperty.call(cache.medOrders, phase);
}

export function marPhaseIsCommitted(cache: PhaseScopedCache, phase: number): boolean {
  return Object.prototype.hasOwnProperty.call(cache.medAdmins, phase);
}

/** Orders-only payload for the Med Orders tab — never touches MAR rows in the DB. */
export function medOrdersPersistPayload(
  cache: PhaseScopedCache,
  phase: number,
  idsUsedInEarlierPhases: Set<string>,
): MedicationCachePayload | null {
  if (!medOrdersPhaseIsCommitted(cache, phase)) {
    return null;
  }

  const medOrders = readMedOrdersPhase(cache, phase);
  if (medOrders.createdOrders.length === 0) {
    return {
      cache,
      orders: [],
      administrations: [],
      part: "orders",
    };
  }

  const { orders } = dedupeMedicationIdsAcrossPhases(
    medOrders,
    [],
    idsUsedInEarlierPhases,
  );

  let nextCache = cache;
  const needsCacheUpdate = orders.some(
    (o, i) => o.id !== medOrders.createdOrders[i]?.id,
  );
  if (needsCacheUpdate) {
    nextCache = commitMedOrdersPhase(nextCache, phase, {
      createdOrders: orders,
      selectedMeds: medOrders.selectedMeds,
    });
  }

  return { cache: nextCache, orders, administrations: [], part: "orders" };
}

/** Administrations-only payload for the MAR tab — never rewrites med order rows in the DB. */
export function marPersistPayload(
  cache: PhaseScopedCache,
  phase: number,
): MedicationCachePayload | null {
  const medAdmins = readMarAdminsPhase(cache, phase);
  if (!marPhaseIsCommitted(cache, phase) && medAdmins.length === 0) {
    return null;
  }

  let medOrders = readMedOrdersPhase(cache, phase);
  if (medOrders.createdOrders.length === 0) {
    medOrders = loadMarPhaseLiveFields(cache, phase).medOrders;
  }

  const orderIds = new Set(medOrders.createdOrders.map((o) => o.id));
  const administrations = medAdmins.filter((a) => orderIds.has(a.medicationOrderId));

  if (administrations.length === 0 && !marPhaseIsCommitted(cache, phase)) {
    return null;
  }

  return {
    cache,
    orders: medOrders.createdOrders,
    administrations,
    part: "administrations",
  };
}

/** Full payload for case submit — orders from Med Orders cache + admins from MAR cache. */
export function combinedMedicationPersistPayload(
  cache: PhaseScopedCache,
  phase: number,
  idsUsedInEarlierPhases: Set<string>,
): MedicationCachePayload | null {
  const medOrders = readMedOrdersPhase(cache, phase);
  const medAdmins = readMarAdminsPhase(cache, phase);

  const hasOrders = medOrdersPhaseIsCommitted(cache, phase) && medOrders.createdOrders.length > 0;
  const hasAdmins = marPhaseIsCommitted(cache, phase) && medAdmins.length > 0;

  if (!hasOrders && !hasAdmins) {
    return null;
  }

  const orderIds = new Set(medOrders.createdOrders.map((o) => o.id));
  const filteredAdmins = medAdmins.filter((a) => orderIds.has(a.medicationOrderId));

  const { orders, administrations } = dedupeMedicationIdsAcrossPhases(
    medOrders,
    filteredAdmins,
    idsUsedInEarlierPhases,
  );

  let nextCache = cache;
  const needsCacheUpdate = orders.some(
    (o, i) => o.id !== medOrders.createdOrders[i]?.id,
  );
  if (needsCacheUpdate) {
    nextCache = commitMedOrdersPhase(nextCache, phase, {
      createdOrders: orders,
      selectedMeds: medOrders.selectedMeds,
    });
  }

  return { cache: nextCache, orders, administrations, part: "all" };
}

/**
 * @deprecated Prefer medOrdersPersistPayload / marPersistPayload / combinedMedicationPersistPayload.
 */
export function medicationPayloadFromCache(
  cache: PhaseScopedCache,
  phase: number,
  idsUsedInEarlierPhases: Set<string>,
  scope: "medOrders" | "mar",
): {
  cache: PhaseScopedCache;
  orders: MedOrderFormData["createdOrders"];
  administrations: MedAdministrationInstance[];
} | null {
  const payload =
    scope === "medOrders"
      ? medOrdersPersistPayload(cache, phase, idsUsedInEarlierPhases)
      : marPersistPayload(cache, phase);
  if (!payload) return null;
  return {
    cache: payload.cache,
    orders: payload.orders,
    administrations: payload.administrations,
  };
}

/** Live MAR fields for the UI — may synthesize carry-over without mutating the passed cache. */
export function readMarPhaseForDisplay(
  cache: PhaseScopedCache,
  phase: number,
): { medOrders: MedOrderFormData; medAdmins: MedAdministrationInstance[] } {
  const { medOrders, medAdmins } = loadMarPhaseLiveFields(cache, phase);
  return { medOrders, medAdmins };
}

export function allMedicationPhasesToPersist(
  cache: PhaseScopedCache,
  phaseByScope: PhaseByScope,
  phaseCount: number,
): number[] {
  const phases = new Set([
    ...medOrderPhasesToPersist(cache, phaseByScope, phaseCount),
    ...marPhasesToPersist(cache, phaseByScope, phaseCount),
  ]);
  return [...phases].sort((a, b) => a - b);
}

export function isMedicationScope(scope: PhaseTabScope): scope is "medOrders" | "mar" {
  return scope === "medOrders" || scope === "mar";
}
