"use server"

import { SupabaseClient } from "@supabase/supabase-js"
import {
  allMedications,
  type MedAdministrationInstance,
  type MedicationOrder,
} from "@/app/simulation/[sessionId]/chart/mar/components/marData"

const FREQUENCY_DEFAULT = "QD"
const PRIORITY_DEFAULT = "Routine"

function normalizeFrequency(raw: string | undefined): string {
  const f = (raw ?? "").trim()
  if (!f) return FREQUENCY_DEFAULT
  if (f === "Continuous") return "CONTINUOUS"
  return f
}

function normalizePriority(raw: string | undefined): string {
  const p = (raw ?? "").trim()
  if (p === "STAT" || p === "NOW" || p === "Routine" || p === "PRN") return p
  return PRIORITY_DEFAULT
}

/** Case builder keeps infusionRate as string while typing; DB stores text. */
function normalizeInfusionRateForDb(raw: unknown): string | null {
  if (raw == null || raw === "") return null
  const n = typeof raw === "number" ? raw : Number(String(raw).trim())
  if (!Number.isFinite(n)) return null
  return String(n)
}

async function resolveDbMedicationId(
  supabase: SupabaseClient,
  clientCatalogId: string,
): Promise<string | null> {
  const catalog = allMedications.find((m) => m.id === clientCatalogId)
  if (!catalog) return null

  const { data, error } = await supabase
    .from("medications")
    .select("id")
    .eq("generic_name", catalog.genericName)
    .eq("route", catalog.route)
    .eq("strength", catalog.strength)
    .maybeSingle()

  if (error) {
    console.error("resolveDbMedicationId", error)
    return null
  }
  return (data?.id as string | undefined) ?? null
}

export async function updateMedications(
  supabase: SupabaseClient,
  payload: { orders: MedicationOrder[]; administrations: MedAdministrationInstance[] },
  caseId: string,
) {
  const { error: delAdminErr } = await supabase
    .from("medication_administrations")
    .delete()
    .eq("case_id", caseId)
  if (delAdminErr) throw delAdminErr

  const { error: delOrdErr } = await supabase.from("medication_orders").delete().eq("case_id", caseId)
  if (delOrdErr) throw delOrdErr

  const orderIdToDbMedId = new Map<string, string>()
  const orderRows: Record<string, unknown>[] = []

  for (const o of payload.orders) {
    const dbMedId = await resolveDbMedicationId(supabase, o.medicationId)
    if (!dbMedId) {
      throw new Error(
        `Cannot save medication order: catalog id "${o.medicationId}" has no matching row in the medications table (formulary).`,
      )
    }
    orderIdToDbMedId.set(o.id, dbMedId)
    orderRows.push({
      id: o.id,
      case_id: caseId,
      medication_id: dbMedId,
      dose: Number(o.dose) || 0,
      frequency: normalizeFrequency(o.frequency),
      priority: normalizePriority(o.priority),
      instructions: o.instructions?.trim() ? o.instructions : null,
      indication: o.indication?.trim() ? o.indication : null,
      ordering_provider: o.orderingProvider?.trim() ? o.orderingProvider : null,
      infusion_rate: normalizeInfusionRateForDb(o.infusionRate),
      is_in_presim: o.visibleInPresim !== false,
    })
  }

  if (orderRows.length > 0) {
    const { error: insOrdErr } = await supabase.from("medication_orders").insert(orderRows)
    if (insOrdErr) throw insOrdErr
  }

  const orderIdSet = new Set(payload.orders.map((o) => o.id))
  const adminRows = payload.administrations
    .filter((a) => orderIdSet.has(a.medicationOrderId))
    .map((a) => ({
      case_id: caseId,
      medication_order_id: a.medicationOrderId,
      medication_id: orderIdToDbMedId.get(a.medicationOrderId) ?? null,
      administrator: a.administratorId ?? "",
      time_offset: a.adminTimeMinuteOffset,
      status: a.status,
      notes: a.notes ?? "",
      administered_dose: a.administeredDose,
      is_in_presim: a.visibleInPresim,
    }))

  if (adminRows.length > 0) {
    const { error: insAdmErr } = await supabase.from("medication_administrations").insert(adminRows)
    if (insAdmErr) throw insAdmErr
  }
}
