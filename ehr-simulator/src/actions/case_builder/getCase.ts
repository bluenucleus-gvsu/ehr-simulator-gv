"use server"

import { createServiceRoleSupabase } from "@/utils/supabase/service";

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
  /** Structured med orders + joined medication rows (when present in DB). */
  medicationOrders: any[]
}

export async function getCaseBundle(
  caseId: string,
): Promise<CaseBundle> {

  const supabase = createServiceRoleSupabase();

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
    const medsRes = await supabase.from("medications").select("*").in("id", medicationIds)
    if (medsRes.error) throw medsRes.error
    const byId = new Map((medsRes.data ?? []).map((m: { id: string }) => [m.id, m]))
    medicationOrders = rawOrders.map((row: { medication_id?: string | null }) => ({
      ...row,
      medications: row.medication_id ? byId.get(row.medication_id) ?? null : null,
    }))
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
    medicationOrders,
  }
}
