import type {
  MedAdministrationInstance,
  MedicationOrder,
} from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import {
  cloneMedAdmins,
  cloneMedOrders,
  emptyMedOrders,
  type PhaseScopedCache,
} from "@/lib/casePhases";
import { loadPhaseIntoLiveFields } from "@/lib/caseBuilder/hydratePhaseCache";
import { copyMedOrdersWithNewIds } from "@/lib/caseBuilder/remapMedicationOrderIds";

export function phaseHasMedOrdersEntry(cache: PhaseScopedCache, phase: number): boolean {
  return Object.prototype.hasOwnProperty.call(cache.medOrders, phase);
}

/** Med Orders tab owns orders per phase — ensure a row exists before MAR reads it. */
export function ensureMedOrdersPhaseInCache(
  cache: PhaseScopedCache,
  phase: number,
): PhaseScopedCache {
  if (phase <= 1) {
    if (!phaseHasMedOrdersEntry(cache, 1)) {
      return { ...cache, medOrders: { ...cache.medOrders, 1: emptyMedOrders() } };
    }
    return cache;
  }

  let next = cache;
  if (!phaseHasMedOrdersEntry(next, phase - 1)) {
    next = ensureMedOrdersPhaseInCache(next, phase - 1);
  }
  if (!phaseHasMedOrdersEntry(next, phase)) {
    const source = loadPhaseIntoLiveFields(next, phase - 1).medOrders;
    const { medOrders } = copyMedOrdersWithNewIds(source);
    next = { ...next, medOrders: { ...next.medOrders, [phase]: medOrders } };
  }
  return next;
}

/** Re-link administrations to the target phase's med orders (matched by medicationId). */
export function remapAdminsToTargetOrders(
  admins: MedAdministrationInstance[],
  sourceOrders: MedicationOrder[],
  targetOrders: MedicationOrder[],
): MedAdministrationInstance[] {
  const sourceById = new Map(sourceOrders.map((o) => [o.id, o]));
  const targetByMedId = new Map<string, string>();
  for (const order of targetOrders) {
    if (!targetByMedId.has(order.medicationId)) {
      targetByMedId.set(order.medicationId, order.id);
    }
  }

  const remapped: MedAdministrationInstance[] = [];
  for (const admin of admins) {
    const sourceOrder = sourceById.get(admin.medicationOrderId);
    const targetOrderId = sourceOrder
      ? targetByMedId.get(sourceOrder.medicationId)
      : undefined;
    if (!targetOrderId) continue;
    remapped.push({
      ...structuredClone(admin),
      id: crypto.randomUUID(),
      medicationOrderId: targetOrderId,
    });
  }
  return remapped;
}

/** MAR reads orders from Med Orders cache; admins from MAR cache for this phase. */
export function loadMarPhaseLiveFields(
  cache: PhaseScopedCache,
  phase: number,
): {
  cache: PhaseScopedCache;
  medOrders: ReturnType<typeof emptyMedOrders>;
  medAdmins: MedAdministrationInstance[];
} {
  const next = ensureMedOrdersPhaseInCache(cache, phase);
  const medOrders = next.medOrders[phase]
    ? cloneMedOrders(next.medOrders[phase])
    : emptyMedOrders();
  const medAdmins = next.medAdmins[phase] ? cloneMedAdmins(next.medAdmins[phase]) : [];

  const orderIds = new Set(medOrders.createdOrders.map((o) => o.id));
  const filteredAdmins = medAdmins.filter((a) => orderIds.has(a.medicationOrderId));

  return { cache: next, medOrders, medAdmins: filteredAdmins };
}

/** Carry MAR admins from phase N−1 onto phase N med orders (from Med Orders tab). */
export function carryMarPhaseFromPrevious(
  cache: PhaseScopedCache,
  phase: number,
): PhaseScopedCache {
  if (phase <= 1) return cache;

  const sourcePhase = phase - 1;
  let next = ensureMedOrdersPhaseInCache(cache, phase);
  const targetOrders = loadPhaseIntoLiveFields(next, phase).medOrders;
  const sourceFields = loadPhaseIntoLiveFields(next, sourcePhase);

  const carriedAdmins = remapAdminsToTargetOrders(
    sourceFields.medAdmins,
    sourceFields.medOrders.createdOrders,
    targetOrders.createdOrders,
  );

  return {
    ...next,
    medAdmins: {
      ...next.medAdmins,
      [phase]: cloneMedAdmins(carriedAdmins),
    },
  };
}

export function ensureMarPhaseInitialized(
  cache: PhaseScopedCache,
  phase: number,
): PhaseScopedCache {
  if (phase <= 1) {
    return ensureMedOrdersPhaseInCache(cache, 1);
  }

  let next = cache;
  if (!Object.prototype.hasOwnProperty.call(next.medAdmins, phase - 1)) {
    next = ensureMarPhaseInitialized(next, phase - 1);
  }
  next = ensureMedOrdersPhaseInCache(next, phase);
  if (!Object.prototype.hasOwnProperty.call(next.medAdmins, phase)) {
    next = carryMarPhaseFromPrevious(next, phase);
  }
  return next;
}
