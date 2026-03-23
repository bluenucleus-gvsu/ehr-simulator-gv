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

import { MedAdministrationInstance } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";

// TODO: Narrow type definitions for each section & enforce at runtime.
type SaveCaseArgs =
  | { section: typeof CaseSection.DEMOGRAPHICS; payload: any; caseId?: string | null }
  | { section: typeof CaseSection.HISTORY; payload: any; caseId?: string | null }
  | { section: typeof CaseSection.CLINICAL_DOCUMENTS; payload: any; caseId?: string | null }
  | { section: typeof CaseSection.ORDERS; payload: any; caseId?: string | null }
  | { section: typeof CaseSection.LABS; payload: any; caseId?: string | null }
  | { section: typeof CaseSection.DOCUMENTATION; payload: any; caseId?: string | null }
  | { section: typeof CaseSection.MEDICATION_ORDERS; payload: MedAdministrationInstance[]; caseId?: string | null }

export async function saveCaseData({ payload, section, caseId }: SaveCaseArgs) {
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
      return await updateOrders(supabase, payload, caseId);
    case CaseSection.LABS:
      return await updateLabs(supabase, payload, caseId);
    case CaseSection.DOCUMENTATION:
      return await updateDocumentationResults(supabase, payload, caseId);
    case CaseSection.MEDICATION_ORDERS:
      return await updateMedications(supabase, payload, caseId);
  }
}



