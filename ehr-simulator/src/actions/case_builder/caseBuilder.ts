"use server"

import { createClient } from "@supabase/supabase-js"
import { CaseSection } from "@/lib/saveCase"
import { upsertCaseDemographics } from "@/actions/case_builder/upsertCaseDemographics";
import { updatePatientHistory } from "@/actions/case_builder/updatePatientHistory";
import { updateClinicalDocuments } from "@/actions/case_builder/updateClinicalDocuments";
import { updateOrders } from "@/actions/case_builder/updateOrders";
import { updateLabs } from "@/actions/case_builder/updateLabs";
import { updateDocumentationResults } from "@/actions/case_builder/updateDocumentationResults";
import { updateMedications } from "@/actions/case_builder/updateMedications";
import { updateCaseIntakeOutput } from "@/actions/case_builder/updateCaseIntakeOutput";
import { runWriteForMode } from "@/utils/testerWriteGateway";

import { MedAdministrationInstance, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import type { IntakeOutputFormData } from "@/utils/form";

// TODO: Narrow type definitions for each section & enforce at runtime.
type SaveCaseArgs =
  | { section: typeof CaseSection.DEMOGRAPHICS; payload: any; caseId?: string | null }
  | { section: typeof CaseSection.HISTORY; payload: any; caseId?: string | null }
  | { section: typeof CaseSection.CLINICAL_DOCUMENTS; payload: any; caseId?: string | null }
  | { section: typeof CaseSection.ORDERS; payload: any; caseId?: string | null; phase?: number }
  | { section: typeof CaseSection.LABS; payload: any; caseId?: string | null; phase?: number }
  | { section: typeof CaseSection.DOCUMENTATION; payload: any; caseId?: string | null }
  | { section: typeof CaseSection.INTAKE_OUTPUT; payload: IntakeOutputFormData[]; caseId?: string | null }
  | {
      section: typeof CaseSection.MEDICATION_ORDERS;
      payload: { orders: MedicationOrder[]; administrations: MedAdministrationInstance[] };
      caseId?: string | null;
      phase?: number;
    }

export async function saveCaseData(args: SaveCaseArgs) {
  const { payload, section, caseId } = args;
  const phase = "phase" in args && typeof args.phase === "number" ? args.phase : 1;

  return runWriteForMode(
    async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      if (section === CaseSection.DEMOGRAPHICS) {
        return await upsertCaseDemographics(supabase, payload, caseId)
      }

      if (!caseId) throw new Error("Case ID is required");

      switch (section) {
        case CaseSection.HISTORY:
          return await updatePatientHistory(supabase, payload, caseId);
        case CaseSection.CLINICAL_DOCUMENTS:
          return await updateClinicalDocuments(supabase, payload, caseId);
        case CaseSection.ORDERS:
          return await updateOrders(supabase, payload, caseId, phase);
        case CaseSection.LABS:
          return await updateLabs(supabase, payload, caseId, phase);
        case CaseSection.DOCUMENTATION:
          return await updateDocumentationResults(supabase, payload, caseId);
        case CaseSection.INTAKE_OUTPUT:
          return await updateCaseIntakeOutput(supabase, payload, caseId);
        case CaseSection.MEDICATION_ORDERS:
          return await updateMedications(supabase, payload, caseId, phase);
      }
    },
    async () => ({
      success: true,
      message: "Case section saved locally for tester mode.",
      id: caseId ?? crypto.randomUUID(),
      data: { caseId: caseId ?? crypto.randomUUID(), section, payload, phase },
    }),
  );
}
