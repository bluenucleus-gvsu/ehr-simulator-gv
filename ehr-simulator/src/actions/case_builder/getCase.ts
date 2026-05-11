"use server"

import { createClient } from "@supabase/supabase-js";

export interface CaseBundle {
  caseRow: any
  safetyAlerts: any[]
  familyHistory: any[]
  clinicalDocuments: any[]
  orders: any[]
  labResults: any[]
  imagingReports: any[]
  microbiologyReports: any[]
  documentationResults: any[]
  medicationAdministrations: any[]
}

export async function getCaseBundle(
  caseId: string,
): Promise<CaseBundle> {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

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
  ].filter(Boolean)

  if (errors.length > 0) {
    throw errors[0]
  }

  return {
    caseRow: caseRes.data,
    safetyAlerts: safetyAlertsRes.data ?? [],
    familyHistory: familyHistoryRes.data ?? [],
    clinicalDocuments: clinicalDocumentsRes.data ?? [],
    orders: ordersRes.data ?? [],
    labResults: labResultsRes.data ?? [],
    imagingReports: imagingReportsRes.data ?? [],
    microbiologyReports: microbiologyReportsRes.data ?? [],
    documentationResults: documentationResultsRes.data ?? [],
    medicationAdministrations: medicationAdministrationsRes.data ?? [],
  }
}
