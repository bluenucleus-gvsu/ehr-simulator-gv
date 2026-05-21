"use server"

import { SupabaseClient } from "@supabase/supabase-js";
import { allMedications, MedAdministrationInstance, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";

type MedicationOrderInsert = {
  id: string;
  case_id: string;
  medication_id: string;
  dose: number;
  frequency: string;
  priority: string;
  instructions: string | null;
  indication: string | null;
  ordering_provider: string | null;
  infusion_rate: number | null;
  is_in_presim: boolean;
}

type MedicationAdministrationInsert = {
  case_id: string;
  medication_id: string | null;
  medication_order_id: string | null;
  administrator?: string;
  time_offset: number;
  status: string;
  notes?: string;
  administered_dose: number;
  is_in_presim: boolean;
}

export async function updateMedications(
  supabase: SupabaseClient,
  payload: { orders: MedicationOrder[]; administrations: MedAdministrationInstance[] },
  caseId: string
) {
  const medicationIdMap = await resolveDatabaseMedicationIds(supabase, payload.orders)
  await deleteMedications(supabase, caseId)
  await insertMedicationOrders(supabase, transformMedicationOrdersToSchema(caseId, payload.orders, medicationIdMap))
  await insertMedicationAdministrations(
    supabase,
    transformMedicationAdministrationsToSchema(caseId, payload.orders, payload.administrations, medicationIdMap),
  )
}

async function deleteMedications(supabase: SupabaseClient, caseId: string) {
  const { error: deleteAdminErr } = await supabase
    .from("medication_administrations")
    .delete()
    .eq("case_id", caseId)
  if (deleteAdminErr) throw new Error(deleteAdminErr.message)

  const { error: deleteOrderErr } = await supabase
    .from("medication_orders")
    .delete()
    .eq("case_id", caseId)
  if (deleteOrderErr) throw new Error(deleteOrderErr.message)
}

function normalizeInfusionRate(raw: unknown): number | null {
  if (raw == null || raw === "") return null
  const n = typeof raw === "number" ? raw : Number(String(raw).trim())
  return Number.isFinite(n) ? n : null
}

function transformMedicationOrdersToSchema(
  caseId: string,
  orders: MedicationOrder[],
  medicationIdMap: Map<string, string>,
): MedicationOrderInsert[] {
  return orders
    .filter((order) => order.id && medicationIdMap.has(order.medicationId) && order.frequency && order.priority)
    .map((order) => ({
      id: order.id,
      case_id: caseId,
      medication_id: medicationIdMap.get(order.medicationId)!,
      dose: Number(order.dose) || 0,
      frequency: order.frequency,
      priority: order.priority,
      instructions: order.instructions?.trim() || null,
      indication: order.indication?.trim() || null,
      ordering_provider: order.orderingProvider?.trim() || null,
      infusion_rate: normalizeInfusionRate(order.infusionRate),
      is_in_presim: Boolean(order.visibleInPresim),
    }))
}

function transformMedicationAdministrationsToSchema(
  caseId: string,
  orders: MedicationOrder[],
  medAdministrations: MedAdministrationInstance[],
  medicationIdMap: Map<string, string>,
): MedicationAdministrationInsert[] {
  const medicationIdByOrderId = new Map(
    orders
      .filter((order) => medicationIdMap.has(order.medicationId))
      .map((order) => [order.id, medicationIdMap.get(order.medicationId)!]),
  )

  return medAdministrations
    .filter((medAdmin) => medAdmin.medicationOrderId)
    .map((medAdmin) => ({
      case_id: caseId,
      medication_id: medicationIdByOrderId.get(medAdmin.medicationOrderId) ?? null,
      medication_order_id: medAdmin.medicationOrderId,
      administrator: medAdmin.administratorId ?? "",
      time_offset: medAdmin.adminTimeMinuteOffset,
      status: medAdmin.status,
      notes: medAdmin.notes ?? "",
      administered_dose: medAdmin.administeredDose,
      is_in_presim: medAdmin.visibleInPresim,
    }))
}

async function resolveDatabaseMedicationIds(
  supabase: SupabaseClient,
  orders: MedicationOrder[],
): Promise<Map<string, string>> {
  const catalogById = new Map(allMedications.map((med) => [med.id, med]))
  const requestedCatalogMeds = orders
    .map((order) => catalogById.get(order.medicationId))
    .filter((med): med is NonNullable<typeof med> => Boolean(med))

  if (requestedCatalogMeds.length === 0) {
    return new Map()
  }

  const genericNames = Array.from(new Set(requestedCatalogMeds.map((med) => med.genericName)))
  const { data, error } = await supabase
    .from("medications")
    .select("id, generic_name, route, strength")
    .in("generic_name", genericNames)

  if (error) throw new Error(error.message)

  const dbBySignature = new Map(
    (data ?? []).map((row) => [
      `${row.generic_name.toLowerCase()}|${row.route}|${Number(row.strength)}`,
      row.id,
    ]),
  )

  const resolved = new Map<string, string>()
  for (const med of requestedCatalogMeds) {
    const signature = `${med.genericName.toLowerCase()}|${med.route}|${Number(med.strength)}`
    const dbId = dbBySignature.get(signature)
    if (dbId) resolved.set(med.id, dbId)
  }

  return resolved
}

async function insertMedicationOrders(
  supabase: SupabaseClient,
  medicationOrders: MedicationOrderInsert[],
) {
  if (medicationOrders.length === 0) return
  const { error: insertErr } = await supabase.from("medication_orders").insert(medicationOrders)
  if (insertErr) throw new Error(insertErr.message)
}

async function insertMedicationAdministrations(
  supabase: SupabaseClient,
  medAdministrations: MedicationAdministrationInsert[],
) {
  if (medAdministrations.length === 0) return
  const { error: insertErr } = await supabase.from("medication_administrations").insert(medAdministrations)
  if (insertErr) throw new Error(insertErr.message)
}
