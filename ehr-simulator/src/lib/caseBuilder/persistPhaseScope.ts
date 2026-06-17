import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { loadMarPhaseLiveFields } from "@/lib/caseBuilder/marPhaseOps";
import { loadPhaseIntoLiveFields } from "@/lib/caseBuilder/hydratePhaseCache";
import {
  dedupeMedicationIdsAcrossPhases,
  medOrderIdsInOtherPhases,
} from "@/lib/caseBuilder/remapMedicationOrderIds";
import { labsPersistPayload } from "@/lib/caseBuilder/serializeFormBlob";
import type { PhaseScopedCache, PhaseTabScope } from "@/lib/casePhases";
import { CaseSection } from "@/lib/saveCase";
import type { FormBlob } from "@/utils/form";

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
      const data = loadPhaseIntoLiveFields(cache, phase);
      const liveOrders = overlay.medOrders?.createdOrders ?? data.medOrders.createdOrders;
      const liveAdmins = data.medAdmins;
      const idsInOtherPhases = medOrderIdsInOtherPhases(cache.medOrders, phase);
      const { orders, administrations } = dedupeMedicationIdsAcrossPhases(
        { createdOrders: liveOrders, selectedMeds: data.medOrders.selectedMeds },
        liveAdmins,
        idsInOtherPhases,
      );

      if (liveOrders.some((o) => idsInOtherPhases.has(o.id))) {
        cache = {
          ...cache,
          medOrders: {
            ...cache.medOrders,
            [phase]: { createdOrders: orders, selectedMeds: data.medOrders.selectedMeds },
          },
        };
      }

      await saveCaseData({
        section: CaseSection.MEDICATION_ORDERS,
        payload: { orders, administrations },
        caseId,
        phase,
      });
      break;
    }
    case "mar": {
      const { cache: nextCache, medOrders, medAdmins } = loadMarPhaseLiveFields(cache, phase);
      cache = nextCache;
      const liveAdmins = overlay.medAdministrationInstances ?? medAdmins;
      const orderIds = new Set(medOrders.createdOrders.map((o) => o.id));
      const administrations = liveAdmins.filter((a) => orderIds.has(a.medicationOrderId));

      await saveCaseData({
        section: CaseSection.MEDICATION_ORDERS,
        payload: { orders: medOrders.createdOrders, administrations },
        caseId,
        phase,
      });
      break;
    }
  }

  return cache;
}
