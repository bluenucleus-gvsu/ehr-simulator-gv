"use client";

import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { CaseSection } from "@/lib/saveCase";
import type { FormBlob } from "@/utils/form";
import { isTesterModeClient } from "@/utils/testerMode";
import { setTesterCaseDraft, upsertTesterCase } from "@/utils/testerLocalStore";

function labsPersistPayload(labs: FormBlob["labs"]) {
  return {
    data: labs.data,
    timePoints: labs.timePoints,
    timePointsInPreSim: Array.from(labs.timePointsInPreSim),
    visibleItems: Array.from(labs.visibleItems ?? new Set<string>()),
  };
}

function documentationPersistPayload(charting: FormBlob["charting"]) {
  return {
    data: charting.data,
    timePoints: charting.timePoints,
    timePointsInPreSim: Array.from(charting.timePointsInPreSim),
  };
}

function syncTesterCaseMeta(caseId: string, data: FormBlob) {
  if (!isTesterModeClient()) return;
  const d = data.demographics;
  upsertTesterCase({
    id: caseId,
    name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim(),
    first_name: d.firstName ?? "",
    last_name: d.lastName ?? "",
    description: d.summary ?? "",
    admitting_diagnosis: d.admittingDiagnosis ?? "",
  });
  setTesterCaseDraft(caseId, {
    demographics: data.demographics,
    history: data.history,
    notes: data.notes,
    orders: data.orders,
    labs: data.labs,
    charting: data.charting,
    intakeOutput: data.intakeOutput,
    medOrders: data.medOrders,
    medAdministrationInstances: data.medAdministrationInstances,
  } as unknown as Record<string, unknown>);
}

/**
 * Persists every case-builder section to the database (same payloads as each step’s Continue).
 * Demographics runs first so a new case row exists before other sections.
 */
export async function saveAllCaseBuilderProgress(
  data: FormBlob,
  caseId: string | undefined,
  setCaseId: (id: string) => void,
): Promise<string | undefined> {
  const demoResult = await saveCaseData({
    payload: data.demographics,
    section: CaseSection.DEMOGRAPHICS,
    caseId,
  });

  let effectiveCaseId = caseId;
  const demoRow = demoResult as { id?: string } | undefined;
  if (demoRow?.id) {
    effectiveCaseId = demoRow.id;
    setCaseId(demoRow.id);
  }

  if (!effectiveCaseId) {
    throw new Error("Complete demographics first so the case can be created.");
  }

  await Promise.all([
    saveCaseData({
      payload: data.history,
      section: CaseSection.HISTORY,
      caseId: effectiveCaseId,
    }),
    saveCaseData({
      payload: data.notes,
      section: CaseSection.CLINICAL_DOCUMENTS,
      caseId: effectiveCaseId,
    }),
    saveCaseData({
      payload: data.orders,
      section: CaseSection.ORDERS,
      caseId: effectiveCaseId,
    }),
    saveCaseData({
      payload: labsPersistPayload(data.labs),
      section: CaseSection.LABS,
      caseId: effectiveCaseId,
    }),
    saveCaseData({
      payload: documentationPersistPayload(data.charting),
      section: CaseSection.DOCUMENTATION,
      caseId: effectiveCaseId,
    }),
    saveCaseData({
      payload: data.intakeOutput,
      section: CaseSection.INTAKE_OUTPUT,
      caseId: effectiveCaseId,
    }),
    saveCaseData({
      payload: {
        orders: data.medOrders.createdOrders,
        administrations: data.medAdministrationInstances,
      },
      section: CaseSection.MEDICATION_ORDERS,
      caseId: effectiveCaseId,
    }),
  ]);

  syncTesterCaseMeta(effectiveCaseId, data);

  return effectiveCaseId;
}
