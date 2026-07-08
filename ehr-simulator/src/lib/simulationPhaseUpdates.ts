import type { CaseBundle } from "@/actions/case_builder/getCase";
import { normalizeSimulationPhase } from "@/lib/simulationPhaseVisibility";

export type SimulationUpdateSectionKey = "orders" | "notes" | "mar";

export interface SimulationUpdateSection {
  key: SimulationUpdateSectionKey;
  label: string;
  totalCount: number;
  summary: string;
}

export interface SimulationPhaseUpdateSummary {
  fromPhase: number;
  toPhase: number;
  hasAnyNewData: boolean;
  sections: SimulationUpdateSection[];
}

type PhaseableRow = {
  phase?: number | null;
};

function countReleasedInRange(rows: PhaseableRow[] | null | undefined, fromPhase: number, toPhase: number) {
  if (!rows?.length) return 0;

  return rows.filter((row) => {
    const phase = normalizeSimulationPhase(row.phase);
    return phase > fromPhase && phase <= toPhase;
  }).length;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function joinParts(parts: string[]) {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

export function buildSimulationPhaseUpdateSummary(
  caseBundle: CaseBundle | null,
  fromPhase: number,
  toPhase: number,
): SimulationPhaseUpdateSummary {
  const clinicalOrders = countReleasedInRange(caseBundle?.orders, fromPhase, toPhase);
  const medicationOrders = countReleasedInRange(caseBundle?.medicationOrders, fromPhase, toPhase);
  const notes = countReleasedInRange(caseBundle?.clinicalDocuments, fromPhase, toPhase);
  const administrations = countReleasedInRange(caseBundle?.medicationAdministrations, fromPhase, toPhase);

  const sections: SimulationUpdateSection[] = [];

  const ordersTotal = clinicalOrders + medicationOrders;
  if (ordersTotal > 0) {
    const parts: string[] = [];
    if (clinicalOrders > 0) parts.push(pluralize(clinicalOrders, "clinical order"));
    if (medicationOrders > 0) parts.push(pluralize(medicationOrders, "medication order"));
    sections.push({
      key: "orders",
      label: "Orders",
      totalCount: ordersTotal,
      summary: `New ${joinParts(parts)} available.`,
    });
  }

  if (notes > 0) {
    sections.push({
      key: "notes",
      label: "Notes",
      totalCount: notes,
      summary: `New ${pluralize(notes, "note")} available.`,
    });
  }

  const marTotal = medicationOrders + administrations;
  if (marTotal > 0) {
    const parts: string[] = [];
    if (medicationOrders > 0) parts.push(pluralize(medicationOrders, "medication order"));
    if (administrations > 0) parts.push(pluralize(administrations, "administration"));
    sections.push({
      key: "mar",
      label: "MAR",
      totalCount: marTotal,
      summary: `New ${joinParts(parts)} available.`,
    });
  }

  return {
    fromPhase,
    toPhase,
    hasAnyNewData: sections.length > 0,
    sections,
  };
}
