"use client";

import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { updateCasePhaseCount } from "@/actions/case_builder/updateCasePhaseCount";
import { saveCaseJsonBlob } from "@/app/admin/case-builder/api/dump_case_json";
import type { CaseBuilderSaveSnapshot } from "@/context/FormContext";
import { CaseSection } from "@/lib/saveCase";
import { loadPhaseIntoLiveFields } from "@/lib/caseBuilder/hydratePhaseCache";
import { phaseHasScopeCacheEntry } from "@/lib/caseBuilder/phaseCacheOps";
import { dedupeMedicationIdsAcrossPhases } from "@/lib/caseBuilder/remapMedicationOrderIds";
import { isTesterModeClient } from "@/utils/testerMode";
import { setTesterCaseDraft, upsertTesterCase } from "@/utils/testerLocalStore";
import {
  documentationPersistPayload,
  extractErrorMessage,
  fullCasePayloadForBlob,
  labsPersistPayload,
} from "./serializeFormBlob";

function syncTesterCaseMeta(caseId: string, snapshot: CaseBuilderSaveSnapshot) {
  if (!isTesterModeClient()) return;
  const d = snapshot.blob.demographics;
  upsertTesterCase({
    id: caseId,
    name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim(),
    first_name: d.firstName ?? "",
    last_name: d.lastName ?? "",
    description: d.summary ?? "",
    admitting_diagnosis: d.admittingDiagnosis ?? "",
  });
  setTesterCaseDraft(caseId, {
    demographics: snapshot.blob.demographics,
    history: snapshot.blob.history,
    notes: snapshot.blob.notes,
    orders: snapshot.blob.orders,
    labs: snapshot.blob.labs,
    charting: snapshot.blob.charting,
    intakeOutput: snapshot.blob.intakeOutput,
    medOrders: snapshot.blob.medOrders,
    medAdministrationInstances: snapshot.blob.medAdministrationInstances,
    phaseCount: snapshot.phaseCount,
    phaseByScope: snapshot.phaseByScope,
    phaseCache: snapshot.phaseCache,
  } as unknown as Record<string, unknown>);
}

async function saveSection(
  label: string,
  save: () => ReturnType<typeof saveCaseData>,
): Promise<unknown> {
  try {
    return await save();
  } catch (err) {
    throw new Error(`${label}: ${extractErrorMessage(err)}`);
  }
}

/**
 * Persists every case-builder section in wizard order (same as Continue on each step).
 * Demographics runs first so a new case row exists before other sections.
 */
export async function saveAllCaseBuilderProgress(
  snapshot: CaseBuilderSaveSnapshot,
  caseId: string | undefined,
  setCaseId: (id: string) => void,
): Promise<string | undefined> {
  const data = snapshot.blob;

  const demoResult = await saveSection("Demographics", () =>
    saveCaseData({
      payload: data.demographics,
      section: CaseSection.DEMOGRAPHICS,
      caseId,
    }),
  );

  let effectiveCaseId = caseId;
  const demoRow = demoResult as { id?: string } | undefined;
  if (demoRow?.id) {
    effectiveCaseId = demoRow.id;
    setCaseId(demoRow.id);
  }

  if (!effectiveCaseId) {
    throw new Error("Complete demographics first so the case can be created.");
  }

  if (!isTesterModeClient()) {
    await saveSection("Phase count", async () =>
      updateCasePhaseCount(effectiveCaseId!, snapshot.phaseCount),
    );
  }

  await saveSection("History", () =>
    saveCaseData({
      payload: data.history,
      section: CaseSection.HISTORY,
      caseId: effectiveCaseId,
    }),
  );

  await saveSection("Clinical notes", () =>
    saveCaseData({
      payload: data.notes,
      section: CaseSection.CLINICAL_DOCUMENTS,
      caseId: effectiveCaseId,
    }),
  );

  const { phaseByScope, phaseCache } = snapshot;
  const multiPhase = snapshot.phaseCount > 1;

  const ordersPhases = Math.min(
    snapshot.phaseCount,
    phaseByScope.orders.highestInitializedPhase,
  );
  for (let phase = 1; phase <= ordersPhases; phase++) {
    if (phase > 1 && !phaseHasScopeCacheEntry(phaseCache, "orders", phase)) continue;
    const phaseData = loadPhaseIntoLiveFields(phaseCache, phase);
    const phaseLabel = multiPhase ? ` (phase ${phase})` : "";
    await saveSection(`Orders${phaseLabel}`, () =>
      saveCaseData({
        payload: phaseData.orders,
        section: CaseSection.ORDERS,
        caseId: effectiveCaseId,
        phase,
      }),
    );
  }

  const labsPhases = Math.min(snapshot.phaseCount, phaseByScope.labs.highestInitializedPhase);
  for (let phase = 1; phase <= labsPhases; phase++) {
    if (phase > 1 && !phaseHasScopeCacheEntry(phaseCache, "labs", phase)) continue;
    const phaseData = loadPhaseIntoLiveFields(phaseCache, phase);
    const phaseLabel = multiPhase ? ` (phase ${phase})` : "";
    await saveSection(`Labs${phaseLabel}`, () =>
      saveCaseData({
        payload: labsPersistPayload(phaseData.labs),
        section: CaseSection.LABS,
        caseId: effectiveCaseId,
        phase,
      }),
    );
  }

  const medOrdersPhases = Math.min(
    snapshot.phaseCount,
    phaseByScope.medOrders.highestInitializedPhase,
  );
  const marPhases = Math.min(snapshot.phaseCount, phaseByScope.mar.highestInitializedPhase);
  const medPhases = Math.max(medOrdersPhases, marPhases);
  const medOrderIdsUsedInEarlierPhases = new Set<string>();
  for (let phase = 1; phase <= medPhases; phase++) {
    const inMedOrdersRange = phase <= medOrdersPhases;
    const inMarRange = phase <= marPhases;
    const hasMedOrders =
      inMedOrdersRange &&
      (phase === 1 || phaseHasScopeCacheEntry(phaseCache, "medOrders", phase));
    const hasMar =
      inMarRange && (phase === 1 || phaseHasScopeCacheEntry(phaseCache, "mar", phase));
    if (!hasMedOrders && !hasMar) continue;
    const phaseData = loadPhaseIntoLiveFields(phaseCache, phase);
    const { orders, administrations } = dedupeMedicationIdsAcrossPhases(
      phaseData.medOrders,
      phaseData.medAdmins,
      medOrderIdsUsedInEarlierPhases,
    );
    const phaseLabel = multiPhase ? ` (phase ${phase})` : "";
    await saveSection(`Medications${phaseLabel}`, () =>
      saveCaseData({
        payload: { orders, administrations },
        section: CaseSection.MEDICATION_ORDERS,
        caseId: effectiveCaseId,
        phase,
      }),
    );
  }

  await saveSection("Charting", () =>
    saveCaseData({
      payload: documentationPersistPayload(data.charting),
      section: CaseSection.DOCUMENTATION,
      caseId: effectiveCaseId,
    }),
  );

  await saveSection("Intake & output", () =>
    saveCaseData({
      payload: data.intakeOutput,
      section: CaseSection.INTAKE_OUTPUT,
      caseId: effectiveCaseId,
    }),
  );

  syncTesterCaseMeta(effectiveCaseId, snapshot);

  const d = data.demographics;
  const title = `Case ${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "Untitled Case";
  await saveSection("Case archive", () =>
    saveCaseJsonBlob(
      {
        ...fullCasePayloadForBlob(data),
        phaseCount: snapshot.phaseCount,
        phaseCache: snapshot.phaseCache,
      },
      title,
    ),
  );

  return effectiveCaseId;
}
