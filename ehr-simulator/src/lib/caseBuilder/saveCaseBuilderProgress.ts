"use client";

import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { saveCaseJsonBlob } from "@/app/admin/case-builder/api/dump_case_json";
import { CaseSection } from "@/lib/saveCase";
import type { FormBlob } from "@/utils/form";
import { isTesterModeClient } from "@/utils/testerMode";
import { setTesterCaseDraft, upsertTesterCase } from "@/utils/testerLocalStore";
import {
  documentationPersistPayload,
  extractErrorMessage,
  fullCasePayloadForBlob,
  labsPersistPayload,
} from "./serializeFormBlob";

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
  data: FormBlob,
  caseId: string | undefined,
  setCaseId: (id: string) => void,
): Promise<string | undefined> {
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

  await saveSection("Orders", () =>
    saveCaseData({
      payload: data.orders,
      section: CaseSection.ORDERS,
      caseId: effectiveCaseId,
    }),
  );

  await saveSection("Labs", () =>
    saveCaseData({
      payload: labsPersistPayload(data.labs),
      section: CaseSection.LABS,
      caseId: effectiveCaseId,
    }),
  );

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

  await saveSection("Medications", () =>
    saveCaseData({
      payload: {
        orders: data.medOrders.createdOrders,
        administrations: data.medAdministrationInstances,
      },
      section: CaseSection.MEDICATION_ORDERS,
      caseId: effectiveCaseId,
    }),
  );

  syncTesterCaseMeta(effectiveCaseId, data);

  const d = data.demographics;
  const title = `Case ${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "Untitled Case";
  await saveSection("Case archive", () =>
    saveCaseJsonBlob(fullCasePayloadForBlob(data), title),
  );

  return effectiveCaseId;
}
