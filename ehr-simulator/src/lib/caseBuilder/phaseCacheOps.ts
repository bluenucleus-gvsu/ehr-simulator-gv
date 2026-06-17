import {
  defaultPhaseByScope,
  PHASE_TAB_SCOPES,
  type PhaseByScope,
  type PhaseScopedCache,
  type PhaseTabScope,
} from "@/lib/casePhases";
import {
  carryOverScopeFromPrevious,
  phaseHasScopeCacheEntry,
} from "@/lib/caseBuilder/hydratePhaseCache";
import { ensureMarPhaseInitialized } from "@/lib/caseBuilder/marPhaseOps";

export { carryOverScopeFromPrevious, phaseHasScopeCacheEntry };

function scopeRecord(
  cache: PhaseScopedCache,
  scope: PhaseTabScope,
): Record<number, unknown> {
  switch (scope) {
    case "orders":
      return cache.orders;
    case "labs":
      return cache.labs;
    case "medOrders":
      return cache.medOrders;
    case "mar":
      return cache.medAdmins;
  }
}

/** Highest phase number with saved data for a single tab scope. */
export function maxPhaseInScope(cache: PhaseScopedCache, scope: PhaseTabScope): number {
  const keys = Object.keys(scopeRecord(cache, scope))
    .map(Number)
    .filter((n) => Number.isFinite(n) && n >= 1);
  return keys.length > 0 ? Math.max(...keys) : 1;
}

export function phaseByScopeFromCache(
  cache: PhaseScopedCache,
  phaseCount: number,
): PhaseByScope {
  const next = defaultPhaseByScope();
  for (const scope of PHASE_TAB_SCOPES) {
    const highest = Math.min(phaseCount, Math.max(1, maxPhaseInScope(cache, scope)));
    next[scope] = { activePhase: 1, highestInitializedPhase: highest };
  }
  return next;
}

/** Remove one phase's cached content for a single tab scope. */
export function deleteScopePhase(
  cache: PhaseScopedCache,
  scope: PhaseTabScope,
  phase: number,
): PhaseScopedCache {
  switch (scope) {
    case "orders": {
      const orders = { ...cache.orders };
      delete orders[phase];
      return { ...cache, orders };
    }
    case "labs": {
      const labs = { ...cache.labs };
      delete labs[phase];
      return { ...cache, labs };
    }
    case "medOrders": {
      const medOrders = { ...cache.medOrders };
      delete medOrders[phase];
      return { ...cache, medOrders };
    }
    case "mar": {
      const medAdmins = { ...cache.medAdmins };
      delete medAdmins[phase];
      return { ...cache, medAdmins };
    }
  }
}

/** Drop cached content for one tab scope above maxInclusivePhase. */
export function deleteScopePhasesAbove(
  cache: PhaseScopedCache,
  scope: PhaseTabScope,
  maxInclusivePhase: number,
): PhaseScopedCache {
  switch (scope) {
    case "orders": {
      const orders = { ...cache.orders };
      for (const key of Object.keys(orders)) {
        const p = Number(key);
        if (Number.isFinite(p) && p > maxInclusivePhase) delete orders[p];
      }
      return { ...cache, orders };
    }
    case "labs": {
      const labs = { ...cache.labs };
      for (const key of Object.keys(labs)) {
        const p = Number(key);
        if (Number.isFinite(p) && p > maxInclusivePhase) delete labs[p];
      }
      return { ...cache, labs };
    }
    case "medOrders": {
      const medOrders = { ...cache.medOrders };
      for (const key of Object.keys(medOrders)) {
        const p = Number(key);
        if (Number.isFinite(p) && p > maxInclusivePhase) delete medOrders[p];
      }
      return { ...cache, medOrders };
    }
    case "mar": {
      const medAdmins = { ...cache.medAdmins };
      for (const key of Object.keys(medAdmins)) {
        const p = Number(key);
        if (Number.isFinite(p) && p > maxInclusivePhase) delete medAdmins[p];
      }
      return { ...cache, medAdmins };
    }
  }
}

/** Drop cached content for every tab scope above maxPhase. */
export function truncateCacheAbovePhase(
  cache: PhaseScopedCache,
  maxPhase: number,
): PhaseScopedCache {
  let next = cache;
  for (const scope of PHASE_TAB_SCOPES) {
    next = deleteScopePhasesAbove(next, scope, maxPhase);
  }
  return next;
}

export function ensureScopePhaseInitialized(
  cache: PhaseScopedCache,
  scope: PhaseTabScope,
  phase: number,
): PhaseScopedCache {
  if (phase <= 1) return scope === "mar" ? ensureMarPhaseInitialized(cache, 1) : cache;

  if (scope === "mar") {
    return ensureMarPhaseInitialized(cache, phase);
  }

  let next = cache;
  if (!phaseHasScopeCacheEntry(next, scope, phase - 1)) {
    next = ensureScopePhaseInitialized(next, scope, phase - 1);
  }
  if (!phaseHasScopeCacheEntry(next, scope, phase)) {
    next = carryOverScopeFromPrevious(next, scope, phase);
  }
  return next;
}
