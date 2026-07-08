export const MIN_SIMULATION_PHASE = 1;

export function isVisibleForSimulationPhase(input: {
  isPresim: boolean;
  isVisibleInPresim: boolean | null | undefined;
  releasePhase: number;
  currentPhase: number;
}): boolean {
  if (input.isPresim) {
    return input.isVisibleInPresim !== false;
  }

  return input.releasePhase <= input.currentPhase;
}
