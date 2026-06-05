import type { LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { labTemplate } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import type { MedAdministrationInstance } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import type { OrderType } from "@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData";
import { defaultOrders, type MedOrderFormData, type TableFormData } from "@/utils/form";

export const MAX_CASE_PHASES = 10;
export const DEFAULT_PHASE_COUNT = 1;

/** Case-builder tabs that each maintain their own phase progression (up to phaseCount). */
export type PhaseTabScope = "orders" | "labs" | "medOrders" | "mar";

export const PHASE_TAB_SCOPES: PhaseTabScope[] = [
  "orders",
  "labs",
  "medOrders",
  "mar",
];

export type PhaseScopeState = {
  activePhase: number;
  highestInitializedPhase: number;
};

export function defaultPhaseScopeState(): PhaseScopeState {
  return { activePhase: 1, highestInitializedPhase: 1 };
}

export type PhaseByScope = Record<PhaseTabScope, PhaseScopeState>;

export function defaultPhaseByScope(): PhaseByScope {
  return {
    orders: defaultPhaseScopeState(),
    labs: defaultPhaseScopeState(),
    medOrders: defaultPhaseScopeState(),
    mar: defaultPhaseScopeState(),
  };
}

export type PhaseScopedCache = {
  orders: Record<number, OrderType[]>;
  labs: Record<number, TableFormData<LabTableData>>;
  medOrders: Record<number, MedOrderFormData>;
  medAdmins: Record<number, MedAdministrationInstance[]>;
};

export function createEmptyPhaseCache(): PhaseScopedCache {
  return { orders: {}, labs: {}, medOrders: {}, medAdmins: {} };
}

export function emptyLabsTable(): TableFormData<LabTableData> {
  return {
    data: structuredClone(labTemplate),
    timePoints: [0],
    timePointsInPreSim: new Set<number>(),
    visibleItems: new Set<string>(),
  };
}

export function emptyMedOrders(): MedOrderFormData {
  return { createdOrders: [], selectedMeds: [] };
}

export function defaultOrdersForPhase(): OrderType[] {
  return structuredClone(defaultOrders);
}

export function cloneLabsTable(src: TableFormData<LabTableData>): TableFormData<LabTableData> {
  return {
    data: structuredClone(src.data),
    timePoints: [...src.timePoints],
    timePointsInPreSim: new Set(src.timePointsInPreSim),
    visibleItems: src.visibleItems ? new Set(src.visibleItems) : new Set<string>(),
  };
}

export function cloneMedOrders(src: MedOrderFormData): MedOrderFormData {
  return {
    createdOrders: structuredClone(src.createdOrders),
    selectedMeds: structuredClone(src.selectedMeds),
  };
}

export function cloneMedAdmins(src: MedAdministrationInstance[]): MedAdministrationInstance[] {
  return structuredClone(src);
}

export function cloneOrders(src: OrderType[]): OrderType[] {
  return structuredClone(src);
}

export function clampPhaseCount(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PHASE_COUNT;
  return Math.min(MAX_CASE_PHASES, Math.max(1, Math.floor(n)));
}

export function readPhase(row: { phase?: number | null } | null | undefined): number {
  const p = row?.phase;
  return typeof p === "number" && p >= 1 ? p : 1;
}
