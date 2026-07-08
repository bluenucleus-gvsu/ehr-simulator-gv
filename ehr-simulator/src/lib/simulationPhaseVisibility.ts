export const MIN_SIMULATION_PHASE = 1;

export function normalizeSimulationPhase(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return MIN_SIMULATION_PHASE;
  }

  return Math.max(MIN_SIMULATION_PHASE, Math.trunc(value));
}

export function isVisibleForSimulationPhase(input: {
  isPresim: boolean;
  isVisibleInPresim: boolean | null | undefined;
  releasePhase: number | null | undefined;
  currentPhase: number;
}): boolean {
  if (input.isPresim) {
    return input.isVisibleInPresim !== false;
  }

  return normalizeSimulationPhase(input.releasePhase) <= normalizeSimulationPhase(input.currentPhase);
}
