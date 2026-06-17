"use client";

import { useMemo } from "react";

import type { DatabaseMedAdministration } from "@/actions/simulation";
import { buildMarFromCaseBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marFromBundle";
import type { AllMedicationTypes, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import MarView from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marView";
import { useSimulationCase } from "@/context/SimulationCaseContext";

type SimulationMarPageProps = {
  params: {
    caseId: string;
    sessionId: string;
  };
  sessionAdministrations: DatabaseMedAdministration[];
};

function caseTemplateAdminsFromBundle(
  caseId: string,
  bundle: NonNullable<ReturnType<typeof useSimulationCase>["caseBundle"]>,
): DatabaseMedAdministration[] {
  const built = buildMarFromCaseBundle(bundle);
  return built.administrations.map((admin) => ({
    case_id: caseId,
    case_session_id: null,
    medication_order_id: admin.medicationOrderId,
    administrator: admin.administratorId,
    time_offset: admin.adminTimeMinuteOffset,
    status: admin.status,
    notes: admin.notes ?? null,
    administered_dose: admin.administeredDose,
    infusion_rate: null,
    is_in_presim: admin.visibleInPresim,
    source_type: "case_administration",
  }));
}

export default function SimulationMarPage({
  params,
  sessionAdministrations,
}: SimulationMarPageProps) {
  const { caseBundle, routeContext } = useSimulationCase();
  const resolvedCaseId = routeContext?.caseId ?? params.caseId;

  const { medicationOrders, medications, medicationAdministrations } = useMemo(() => {
    if (!caseBundle) {
      return {
        medicationOrders: [] as MedicationOrder[],
        medications: [] as AllMedicationTypes[],
        medicationAdministrations: sessionAdministrations,
      };
    }

    const built = buildMarFromCaseBundle(caseBundle);
    const uniqueMedsMap = new Map<string, AllMedicationTypes>();

    for (const order of built.medicationOrders) {
      const catalog = built.medsById[order.medicationId];
      if (catalog && !uniqueMedsMap.has(catalog.id)) {
        uniqueMedsMap.set(catalog.id, catalog);
      }
    }

    const templateAdmins = caseTemplateAdminsFromBundle(resolvedCaseId, caseBundle);

    return {
      medicationOrders: built.medicationOrders,
      medications: Array.from(uniqueMedsMap.values()),
      medicationAdministrations: [...templateAdmins, ...sessionAdministrations],
    };
  }, [caseBundle, resolvedCaseId, sessionAdministrations]);

  return (
    <MarView
      medicationOrders={medicationOrders}
      medications={medications}
      medicationAdministrations={medicationAdministrations}
      params={params}
    />
  );
}
