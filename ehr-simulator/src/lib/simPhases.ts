import type { CaseBundle } from "@/actions/case_builder/getCase";
import {
  clampPhaseCount,
  DEFAULT_PHASE_COUNT,
  readPhase,
} from "@/lib/casePhases";

/** Resolved phase state for simulation (student chart + faculty controls). */
export type SimulationPhaseContext = {
  phaseCount: number;
  currentPhase: number;
  /** True when the case supports more than one phase (`phase_count > 1`). */
  isMultiPhase: boolean;
};

/**
 * For each phased section, which authored `phase` row to show when the session is on
 * `simulationPhase`. Uses the latest authored phase at or below the session phase
 * (e.g. session phase 4 with orders only through 2 → show orders phase 2).
 */
export type SimulationEffectivePhases = {
  simulationPhase: number;
  orders: number;
  labs: number;
  medOrders: number;
  mar: number;
};

export const SIM_PHASE_UPDATED_TABS = ["Orders", "Labs", "MAR"] as const;

export function resolvePhaseCount(raw: number | null | undefined): number {
  return clampPhaseCount(raw ?? DEFAULT_PHASE_COUNT);
}

export function resolveCurrentPhase(
  raw: number | null | undefined,
  phaseCount: number,
): number {
  const count = resolvePhaseCount(phaseCount);
  if (raw == null || !Number.isFinite(raw)) return DEFAULT_PHASE_COUNT;
  const phase = Math.floor(raw);
  if (phase < 1) return DEFAULT_PHASE_COUNT;
  return Math.min(count, phase);
}

export function resolveSimulationPhaseContext(opts: {
  phaseCount?: number | null;
  currentPhase?: number | null;
}): SimulationPhaseContext {
  const phaseCount = resolvePhaseCount(opts.phaseCount);
  const currentPhase = resolveCurrentPhase(opts.currentPhase, phaseCount);
  return {
    phaseCount,
    currentPhase,
    isMultiPhase: phaseCount > 1,
  };
}

function collectPhases(rows: { phase?: number | null }[] | undefined): number[] {
  const set = new Set<number>();
  for (const row of rows ?? []) {
    set.add(readPhase(row));
  }
  return [...set];
}

/** Latest authored phase number for a section that is still at or below the session phase. */
export function effectivePhaseForSection(
  authoredPhases: number[],
  simulationPhase: number,
): number {
  const cap = Math.max(1, simulationPhase);
  const eligible = authoredPhases.filter((p) => p >= 1 && p <= cap);
  if (eligible.length === 0) return DEFAULT_PHASE_COUNT;
  return Math.max(...eligible);
}

export function resolveEffectivePhases(
  bundle: CaseBundle,
  context: SimulationPhaseContext,
): SimulationEffectivePhases {
  const simulationPhase = context.currentPhase;
  return {
    simulationPhase,
    orders: effectivePhaseForSection(collectPhases(bundle.orders), simulationPhase),
    labs: effectivePhaseForSection(collectPhases(bundle.labResults), simulationPhase),
    medOrders: effectivePhaseForSection(
      collectPhases(bundle.medicationOrders),
      simulationPhase,
    ),
    mar: effectivePhaseForSection(
      collectPhases(bundle.medicationAdministrations),
      simulationPhase,
    ),
  };
}

function filterOrders(bundle: CaseBundle, phase: number) {
  return (bundle.orders ?? []).filter((row) => readPhase(row) === phase);
}

function filterLabResults(bundle: CaseBundle, phase: number) {
  const allowedLabIds = new Set(
    (bundle.labResults ?? []).filter((lr) => readPhase(lr) === phase).map((lr) => lr.id),
  );
  return {
    labResults: (bundle.labResults ?? []).filter((lr) => allowedLabIds.has(lr.id)),
    imagingReports: (bundle.imagingReports ?? []).filter((ir) => allowedLabIds.has(ir.lab_id)),
    microbiologyReports: (bundle.microbiologyReports ?? []).filter((mr) =>
      allowedLabIds.has(mr.lab_id),
    ),
  };
}

function filterMedications(
  bundle: CaseBundle,
  medOrdersPhase: number,
  marPhase: number,
) {
  const medicationOrders = (bundle.medicationOrders ?? []).filter(
    (row) => readPhase(row) === medOrdersPhase,
  );
  const orderIds = new Set(medicationOrders.map((o) => String(o.id)));
  const medicationAdministrations = (bundle.medicationAdministrations ?? []).filter(
    (row) =>
      readPhase(row) === marPhase && orderIds.has(String(row.medication_order_id ?? "")),
  );
  return { medicationOrders, medicationAdministrations };
}

/**
 * Filters Orders / Labs / MAR for the active simulation using per-section effective phases.
 */
export function filterCaseBundleForSimulation(
  bundle: CaseBundle,
  context: SimulationPhaseContext,
): CaseBundle {
  const effective = resolveEffectivePhases(bundle, context);
  const labs = filterLabResults(bundle, effective.labs);
  const meds = filterMedications(bundle, effective.medOrders, effective.mar);
  return {
    ...bundle,
    orders: filterOrders(bundle, effective.orders),
    ...labs,
    ...meds,
  };
}

export function simulationPhaseLabel(context: SimulationPhaseContext): string | null {
  if (!context.isMultiPhase) return null;
  return `Phase ${context.currentPhase}`;
}

export function phaseAdvanceAlertTitle(newPhase: number): string {
  return `Simulation advanced to Phase ${newPhase}`;
}

export function phaseAdvanceAlertDescription(newPhase: number): string {
  const tabs = SIM_PHASE_UPDATED_TABS.join(", ");
  return `Your patient chart has progressed to Phase ${newPhase}. Review updated content in: ${tabs}.`;
}
