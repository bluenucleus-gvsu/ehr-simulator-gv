"use server"

import { CaseSection } from "@/lib/saveCase"
import { upsertCaseDemographics } from "@/actions/case_builder/upsertCaseDemographics";
import { updatePatientHistory } from "@/actions/case_builder/updatePatientHistory";
import { updateClinicalDocuments } from "@/actions/case_builder/updateClinicalDocuments";
import { updateOrders } from "@/actions/case_builder/updateOrders";
import { updateLabs } from "@/actions/case_builder/updateLabs";
import { updateDocumentationResults } from "@/actions/case_builder/updateDocumentationResults";
import { updateMedications } from "@/actions/case_builder/updateMedications";
import { updateMedia } from "@/actions/case_builder/updateMedia"
import { updateCaseIntakeOutput } from "@/actions/case_builder/updateCaseIntakeOutput";

import { MedAdministrationInstance, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import type { IntakeOutputFormData } from "@/utils/form";
import type {
  DemographicFormData,
  HistoryFormData,
  MediaImageData,
} from "@/utils/form";
import type { ClinicalNote } from "@/app/simulation/[caseId]/[sessionId]/chart/notes/components/notesData";
import type { OrderType } from "@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData";
import type { FlexSheetData } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";
import type { LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { createCaseBuilderAdminClient } from "@/actions/case_builder/adminClient";
import { assertValidSaveRequest } from "@/lib/caseBuilder/validation";

type SaveCaseArgs =
  | { section: typeof CaseSection.DEMOGRAPHICS; payload: DemographicFormData; caseId?: string | null }
  | { section: typeof CaseSection.HISTORY; payload: HistoryFormData; caseId?: string | null }
  | { section: typeof CaseSection.CLINICAL_DOCUMENTS; payload: ClinicalNote[]; caseId?: string | null }
  | { section: typeof CaseSection.ORDERS; payload: OrderType[]; caseId?: string | null }
  | { section: typeof CaseSection.LABS; payload: TableSavePayload<LabTableData>; caseId?: string | null }
  | { section: typeof CaseSection.DOCUMENTATION; payload: TableSavePayload<FlexSheetData>; caseId?: string | null }
  | { section: typeof CaseSection.INTAKE_OUTPUT; payload: IntakeOutputFormData[]; caseId?: string | null }
  | { section: typeof CaseSection.MEDICATION_ORDERS; payload: { orders: MedicationOrder[]; administrations: MedAdministrationInstance[] }; caseId?: string | null }
  | { section: typeof CaseSection.MEDIA; payload: MediaImageData[]; caseId?: string | null}

type TableSavePayload<T> = {
  data: T[];
  timePoints: number[];
  timePointsInPreSim: number[];
  visibleItems?: string[];
};

export async function saveCaseData({ payload, section, caseId }: SaveCaseArgs) {
  assertValidSaveRequest(section, payload, caseId);
  const supabase = await createCaseBuilderAdminClient();

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
        case CaseSection.INTAKE_OUTPUT:
          return await updateCaseIntakeOutput(supabase, payload, caseId);
        case CaseSection.MEDICATION_ORDERS:
          return await updateMedications(supabase, payload, caseId);
        case CaseSection.MEDIA:
          return await updateMedia(supabase, payload, caseId);
      }
    }
