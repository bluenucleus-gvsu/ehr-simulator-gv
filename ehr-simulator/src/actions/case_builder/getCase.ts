"use server"

import { createCaseBuilderAdminClient } from "@/actions/case_builder/adminClient";
import { assertUuid } from "@/lib/caseBuilder/validation";

export interface CaseBundle {
  caseRow: CaseRow
  safetyAlerts: CaseBundleRow[]
  familyHistory: CaseBundleRow[]
  clinicalDocuments: CaseBundleRow[]
  orders: CaseBundleRow[]
  labResults: CaseBundleRow[]
  imagingReports: ImagingReportRow[]
  microbiologyReports: MicrobiologyReportRow[]
  documentationResults: CaseBundleRow[]
  medicationAdministrations: CaseBundleRow[]
  caseImages: CaseBundleRow[]
  /** Structured med orders + joined medication rows (when present in DB). */
  medicationOrders: CaseBundleRow[]
}

type NamedLookup = { id?: string | null; name?: string | null };

export type CaseRow = Record<string, unknown> & {
  id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  code_status?: string | null;
  attending_provider?: string | null;
  isolation_precautions?: NamedLookup | null;
  relationship_status?: NamedLookup | null;
};

export type CaseBundleRow = Record<string, unknown> & {
  id?: string | null;
  created_at?: string | null;
  time_offset?: number | null;
  is_in_presim?: boolean | null;
  phase?: number | null;
  condition?: string | null;
  relationship?: NamedLookup | null;
  safety_alert?: NamedLookup | null;
  lab_id?: string | null;
  name?: string | null;
  technique?: string | null;
  findings?: unknown;
  impressions?: string[] | null;
  sample_type?: string | null;
  appearance?: string | null;
  microscopy?: string | null;
  location?: string | null;
  culture_results?: string | null;
  sensitivity?: string | null;
  comments?: string | null;
  reporter?: string | null;
};

export type ImagingReportRow = CaseBundleRow & { is_critical?: boolean | null };
export type MicrobiologyReportRow = CaseBundleRow & { is_critical?: boolean | string | null };

export async function getCaseBuilderMedications() {
  const supabase = await createCaseBuilderAdminClient();
  const { data, error } = await supabase
    .from("medications")
    .select("*, dispense_units(name)")
    .order("generic_name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCaseBundle(
  caseId: string,
): Promise<CaseBundle> {

  assertUuid(caseId, "Case ID");
  const supabase = await createCaseBuilderAdminClient();

  const [
    caseRes,
    safetyAlertsRes,
    familyHistoryRes,
    clinicalDocumentsRes,
    ordersRes,
    labResultsRes,
    imagingReportsRes,
    microbiologyReportsRes,
    documentationResultsRes,
    medicationAdministrationsRes,
    medicationOrdersRes,
    caseImagesRes,
  ] = await Promise.all([
    supabase
      .from("cases")
      .select(`
        *,
        isolation_precautions:isolation_precautions_id ( id, name ),
        relationship_status:relationship_status_id ( id, name )
      `)
      .eq("id", caseId)
      .single(),

    supabase
      .from("case_safety_alerts")
      .select(`
        safety_alert:safety_alert_id ( id, name )
      `)
      .eq("case_id", caseId),

    supabase
      .from("case_family_history")
      .select(`
        *,
        relationship:relationship_id ( id, name )
      `)
      .eq("case_id", caseId)
      .order("created_at", { ascending: true }),

    supabase
      .from("clinical_documents")
      .select("*")
      .eq("case_id", caseId)
      .order("time_offset", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase
      .from("orders")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true }),

    supabase
      .from("lab_results")
      .select("*")
      .eq("case_id", caseId)
      .order("time_offset", { ascending: true }),

    supabase
      .from("imaging_reports")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true }),

    supabase
      .from("microbiology_reports")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true }),

    supabase
      .from("documentation_results")
      .select("*")
      .eq("case_id", caseId)
      .order("time_offset", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase
      .from("medication_administrations")
      .select("*")
      .eq("case_id", caseId)
      .order("time_offset", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase
      .from("medication_orders")
      .select("*")
      .eq("case_id", caseId),

    supabase
      .from("case_images")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true }),
  ])

  if (caseRes.error) throw caseRes.error
  if (!caseRes.data) throw new Error(`Case not found for id ${caseId}`)

  const errors = [
    safetyAlertsRes.error,
    familyHistoryRes.error,
    clinicalDocumentsRes.error,
    ordersRes.error,
    labResultsRes.error,
    imagingReportsRes.error,
    microbiologyReportsRes.error,
    documentationResultsRes.error,
    medicationAdministrationsRes.error,
    medicationOrdersRes.error,
    caseImagesRes.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    throw errors[0]
  }

  const rawOrders = medicationOrdersRes.data ?? []
  const medicationIds = [
    ...new Set(
      rawOrders
        .map((row: { medication_id?: string | null }) => row.medication_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ]

  let medicationOrders = rawOrders
  if (medicationIds.length > 0) {
    const medsRes = await supabase
      .from("medications")
      .select("*, dispense_units(name)")
      .in("id", medicationIds)
    if (medsRes.error) throw medsRes.error
    const byId = new Map((medsRes.data ?? []).map((m: { id: string }) => [m.id, m]))
    medicationOrders = rawOrders.map((row: { medication_id?: string | null }) => ({
      ...row,
      medications: row.medication_id ? byId.get(row.medication_id) ?? null : null,
    }))
  }

  return {
    caseRow: caseRes.data as CaseRow,
    safetyAlerts: (safetyAlertsRes.data ?? []) as CaseBundleRow[],
    familyHistory: (familyHistoryRes.data ?? []) as CaseBundleRow[],
    clinicalDocuments: (clinicalDocumentsRes.data ?? []) as CaseBundleRow[],
    orders: (ordersRes.data ?? []) as CaseBundleRow[],
    labResults: (labResultsRes.data ?? []) as CaseBundleRow[],
    imagingReports: (imagingReportsRes.data ?? []) as ImagingReportRow[],
    microbiologyReports: (microbiologyReportsRes.data ?? []) as MicrobiologyReportRow[],
    documentationResults: (documentationResultsRes.data ?? []) as CaseBundleRow[],
    medicationAdministrations: (medicationAdministrationsRes.data ?? []) as CaseBundleRow[],
    caseImages: (caseImagesRes.data ?? []) as CaseBundleRow[],
    medicationOrders: medicationOrders as CaseBundleRow[],
  }
}
