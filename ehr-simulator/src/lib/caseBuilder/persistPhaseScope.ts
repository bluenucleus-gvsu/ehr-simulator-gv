import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import {
  combinedMedicationPersistPayload,
  isMedicationScope,
  marPersistPayload,
  medOrdersPersistPayload,
  medicationPhasesToPersistForScope,
} from "@/lib/caseBuilder/medicationPhaseCache";
import { loadPhaseIntoLiveFields, phaseHasScopeCacheEntry } from "@/lib/caseBuilder/hydratePhaseCache";
import { maxPhaseInScope } from "@/lib/caseBuilder/phaseCacheOps";
import { labsPersistPayload } from "@/lib/caseBuilder/serializeFormBlob";
import type { PhaseByScope, PhaseScopedCache, PhaseTabScope } from "@/lib/casePhases";
import { CaseSection } from "@/lib/saveCase";
import type { FormBlob } from "@/utils/form";

function phasesToPersistForScope(
  cache: PhaseScopedCache,
  scope: PhaseTabScope,
  phaseByScope: PhaseByScope,
  phaseCount: number,
): number[] {
  if (isMedicationScope(scope)) {
    return medicationPhasesToPersistForScope(cache, scope, phaseByScope, phaseCount);
  }
  const highest = Math.min(
    phaseCount,
    Math.max(phaseByScope[scope].highestInitializedPhase, maxPhaseInScope(cache, scope)),
  );
  const phases: number[] = [];
  for (let p = 1; p <= highest; p++) {
    if (phaseHasScopeCacheEntry(cache, scope, p)) {
      phases.push(p);
    }
  }
  return phases;
}

async function saveMedicationPayload(
  caseId: string,
  phase: number,
  payload: NonNullable<ReturnType<typeof medOrdersPersistPayload>>,
): Promise<void> {
  await saveCaseData({
    section: CaseSection.MEDICATION_ORDERS,
    payload: { orders: payload.orders, administrations: payload.administrations },
    caseId,
    phase,
    medicationPart: payload.part,
  });
}

/** Persist every initialized phase for one tab scope (orders, labs, med orders, or MAR). */
export async function persistAllScopePhasesToDatabase(opts: {
  caseId: string;
  scope: PhaseTabScope;
  cache: PhaseScopedCache;
  phaseByScope: PhaseByScope;
  phaseCount: number;
}): Promise<PhaseScopedCache> {
  let cache = opts.cache;
  const { caseId, scope, phaseByScope, phaseCount } = opts;
  const phases = phasesToPersistForScope(cache, scope, phaseByScope, phaseCount);

  if (scope === "medOrders") {
    const medOrderIdsUsedInEarlierPhases = new Set<string>();
    for (const phase of phases) {
      const payload = medOrdersPersistPayload(cache, phase, medOrderIdsUsedInEarlierPhases);
      if (!payload) continue;
      cache = payload.cache;
      await saveMedicationPayload(caseId, phase, payload);
    }
    return cache;
  }

  if (scope === "mar") {
    for (const phase of phases) {
      const payload = marPersistPayload(cache, phase);
      if (!payload) continue;
      await saveMedicationPayload(caseId, phase, payload);
    }
    return cache;
  }

  for (const phase of phases) {
    cache = await persistScopePhaseToDatabase({ caseId, scope, phase, cache });
  }
  return cache;
}

/** Persist one tab scope + phase to the database (after cache flush). */
export async function persistScopePhaseToDatabase(opts: {
  caseId: string;
  scope: PhaseTabScope;
  phase: number;
  cache: PhaseScopedCache;
  overlay?: Partial<FormBlob>;
}): Promise<PhaseScopedCache> {
  const { caseId, scope, phase, overlay = {} } = opts;
  let cache = opts.cache;

  switch (scope) {
    case "orders": {
      const data = loadPhaseIntoLiveFields(cache, phase);
      await saveCaseData({
        section: CaseSection.ORDERS,
        payload: overlay.orders ?? data.orders,
        caseId,
        phase,
      });
      break;
    }
    case "labs": {
      const data = loadPhaseIntoLiveFields(cache, phase);
      await saveCaseData({
        section: CaseSection.LABS,
        payload: labsPersistPayload(overlay.labs ?? data.labs),
        caseId,
        phase,
      });
      break;
    }
    case "medOrders": {
      const payload = medOrdersPersistPayload(cache, phase, new Set());
      if (!payload) break;
      cache = payload.cache;
      await saveMedicationPayload(caseId, phase, payload);
      break;
    }
    case "mar": {
      const payload = marPersistPayload(cache, phase);
      if (!payload) break;
      await saveMedicationPayload(caseId, phase, payload);
      break;
    }
  }

  return cache;
}

/** Persist all medication phases for final case submit (orders + administrations). */
export async function persistAllMedicationPhasesToDatabase(opts: {
  caseId: string;
  cache: PhaseScopedCache;
  phaseByScope: PhaseByScope;
  phaseCount: number;
}): Promise<PhaseScopedCache> {
  let cache = opts.cache;
  const phases = new Set<number>([
    ...medicationPhasesToPersistForScope(cache, "medOrders", opts.phaseByScope, opts.phaseCount),
    ...medicationPhasesToPersistForScope(cache, "mar", opts.phaseByScope, opts.phaseCount),
  ]);
  const sorted = [...phases].sort((a, b) => a - b);
  const medOrderIdsUsedInEarlierPhases = new Set<string>();

  for (const phase of sorted) {
    const payload = combinedMedicationPersistPayload(cache, phase, medOrderIdsUsedInEarlierPhases);
    if (!payload) continue;
    cache = payload.cache;
    await saveMedicationPayload(opts.caseId, phase, payload);
  }

  return cache;
}
