import type { MedAdministrationInstance } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import type { MedOrderFormData } from "@/utils/form";

/** New UUIDs for copied med orders so each simulation phase can persist its own rows. */
export function copyMedOrdersWithNewIds(
  sourceOrders: MedOrderFormData,
  sourceAdmins: MedAdministrationInstance[] = [],
): { medOrders: MedOrderFormData; medAdmins: MedAdministrationInstance[] } {
  const idMap = new Map<string, string>();

  const createdOrders = sourceOrders.createdOrders.map((order) => {
    const newId = crypto.randomUUID();
    idMap.set(order.id, newId);
    return { ...structuredClone(order), id: newId };
  });

  const medOrders: MedOrderFormData = {
    createdOrders,
    selectedMeds: structuredClone(sourceOrders.selectedMeds),
  };

  const medAdmins = sourceAdmins.map((admin) => ({
    ...structuredClone(admin),
    id: crypto.randomUUID(),
    medicationOrderId: idMap.get(admin.medicationOrderId) ?? admin.medicationOrderId,
  }));

  return { medOrders, medAdmins };
}

/**
 * Before persisting multiple phases, ensure order UUIDs are unique across phases
 * (fixes caches created before carry-over remapping).
 */
export function dedupeMedicationIdsAcrossPhases(
  medOrders: MedOrderFormData,
  medAdmins: MedAdministrationInstance[],
  idsUsedInEarlierPhases: Set<string>,
): {
  orders: MedOrderFormData["createdOrders"];
  administrations: MedAdministrationInstance[];
} {
  const idMap = new Map<string, string>();

  const orders = medOrders.createdOrders.map((order) => {
    if (!idsUsedInEarlierPhases.has(order.id)) {
      idsUsedInEarlierPhases.add(order.id);
      return order;
    }
    const newId = crypto.randomUUID();
    idMap.set(order.id, newId);
    idsUsedInEarlierPhases.add(newId);
    return { ...structuredClone(order), id: newId };
  });

  const administrations = medAdmins.map((admin) => ({
    ...structuredClone(admin),
    medicationOrderId: idMap.get(admin.medicationOrderId) ?? admin.medicationOrderId,
  }));

  return { orders, administrations };
}

export function medOrderIdsInOtherPhases(
  medOrdersByPhase: Record<number, MedOrderFormData>,
  excludePhase: number,
): Set<string> {
  const ids = new Set<string>();
  for (const [phaseKey, form] of Object.entries(medOrdersByPhase)) {
    const phase = Number(phaseKey);
    if (!Number.isFinite(phase) || phase === excludePhase) continue;
    for (const order of form.createdOrders) ids.add(order.id);
  }
  return ids;
}
