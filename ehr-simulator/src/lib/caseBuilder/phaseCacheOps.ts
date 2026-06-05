import {
  defaultPhaseByScope,
  PHASE_TAB_SCOPES,
  type PhaseByScope,
  type PhaseScopedCache,
  type PhaseTabScope,
} from "@/lib/casePhases";
import {
  carryOverPhaseFromPrevious,
  carryOverScopeFromPrevious,
  phaseHasCacheEntry,
  phaseHasScopeCacheEntry,
} from "@/lib/caseBuilder/hydratePhaseCache";

/** Keep saved snapshot vs copy from the immediately previous phase. */
export type PhaseRestoreChoice = "restore" | "carry";

export { phaseHasCacheEntry, carryOverPhaseFromPrevious };

function phaseKeys(cache: PhaseScopedCache): number[] {
  const keys = new Set<number>();
  for (const record of [
    cache.orders,
    cache.labs,
    cache.medOrders,
    cache.medAdmins,
  ] as Record<number, unknown>[]) {
    for (const k of Object.keys(record)) {
      const n = Number(k);
      if (Number.isFinite(n) && n >= 1) keys.add(n);
    }
  }
  return [...keys];
}

/** Highest phase number that has any cached Orders/Labs/MAR data. */
export function maxPhaseInCache(cache: PhaseScopedCache): number {
  const keys = phaseKeys(cache);
  return keys.length > 0 ? Math.max(...keys) : 1;
}

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

export { phaseHasScopeCacheEntry, carryOverScopeFromPrevious };

/** Phases in range that have cached content for one tab scope. */
export function listPhasesWithScopeSavedData(
  cache: PhaseScopedCache,
  scope: PhaseTabScope,
  fromPhase: number,
  toPhase: number,
): number[] {
  const phases: number[] = [];
  for (let p = fromPhase; p <= toPhase; p++) {
    if (phaseHasScopeCacheEntry(cache, scope, p)) phases.push(p);
  }
  return phases;
}

/** Phases in range that still have cached content from before phase_count was lowered. */
export function listPhasesWithSavedData(
  cache: PhaseScopedCache,
  fromPhase: number,
  toPhase: number,
): number[] {
  const phases: number[] = [];
  for (let p = fromPhase; p <= toPhase; p++) {
    if (phaseHasCacheEntry(cache, p)) phases.push(p);
  }
  return phases;
}

/**
 * For each phase in [startPhase, endPhase], copy Orders/Labs/MAR from phase (p - 1).
 * Skips phases listed in keepSavedPhases (explicit "use saved data").
 */
export function cascadeCarryNewPhases(
  cache: PhaseScopedCache,
  startPhase: number,
  endPhase: number,
  keepSavedPhases: Set<number> = new Set(),
): PhaseScopedCache {
  let next = cache;
  for (let p = Math.max(2, startPhase); p <= endPhase; p++) {
    if (keepSavedPhases.has(p)) continue;
    next = carryOverPhaseFromPrevious(next, p);
  }
  return next;
}

export function applyPhaseCountResolutions(
  cache: PhaseScopedCache,
  previousCount: number,
  newCount: number,
  resolutions: Record<number, PhaseRestoreChoice>,
): PhaseScopedCache {
  const keepSaved = new Set(
    Object.entries(resolutions)
      .filter(([, choice]) => choice === "restore")
      .map(([phase]) => Number(phase))
      .filter((p) => Number.isFinite(p)),
  );
  return cascadeCarryNewPhases(cache, previousCount + 1, newCount, keepSaved);
}

export function ensurePhaseInitialized(
  cache: PhaseScopedCache,
  phase: number,
): PhaseScopedCache {
  if (phase <= 1) return cache;

  let next = cache;
  if (!phaseHasCacheEntry(next, phase - 1)) {
    next = ensurePhaseInitialized(next, phase - 1);
  }
  if (!phaseHasCacheEntry(next, phase)) {
    next = carryOverPhaseFromPrevious(next, phase);
  }
  return next;
}

export function ensureScopePhaseInitialized(
  cache: PhaseScopedCache,
  scope: PhaseTabScope,
  phase: number,
): PhaseScopedCache {
  if (phase <= 1) return cache;

  let next = cache;
  if (!phaseHasScopeCacheEntry(next, scope, phase - 1)) {
    next = ensureScopePhaseInitialized(next, scope, phase - 1);
  }
  if (!phaseHasScopeCacheEntry(next, scope, phase)) {
    next = carryOverScopeFromPrevious(next, scope, phase);
  }
  return next;
}
