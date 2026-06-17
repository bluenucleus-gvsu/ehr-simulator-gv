"use server"

import { SupabaseClient } from "@supabase/supabase-js";
import { MedAdministrationInstance, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import { FrequencyEnum, MedicationAdministrationInsert, MedicationOrderInsert } from "@/lib/medicationTypes";

export async function updateMedications(
  supabase: SupabaseClient,
  payload: { orders: MedicationOrder[]; administrations: MedAdministrationInstance[] },
  caseId: string,
  phase: number = 1,
) {
  await deleteMedications(supabase, caseId, phase);
  await insertMedicationOrders(supabase, transformMedicationOrdersToSchema(caseId, phase, payload.orders));
  await insertMedicationAdministrations(
    supabase,
    transformMedicationAdministrationsToSchema(caseId, phase, payload.orders, payload.administrations),
  );
}

async function deleteMedications(supabase: SupabaseClient, caseId: string, phase: number) {
  const { error: deleteAdminErr } = await supabase
    .from("medication_administrations")
    .delete()
    .eq("case_id", caseId)
    .eq("phase", phase);
  if (deleteAdminErr) throw new Error(deleteAdminErr.message);

  const { error: deleteOrderErr } = await supabase
    .from("medication_orders")
    .delete()
    .eq("case_id", caseId)
    .eq("phase", phase);
  if (deleteOrderErr) throw new Error(deleteOrderErr.message);
}

function transformMedicationOrdersToSchema(
  caseId: string,
  phase: number,
  orders: MedicationOrder[],
): MedicationOrderInsert[] {
  return orders
    .filter((order) => order.id && order.frequency && order.priority)
    .map((order) => ({
      id: order.id,
      case_id: caseId,
      phase,
      medication_id: order.medicationId,
      dose: Number(order.dose) || 0,
      frequency: order.frequency as FrequencyEnum,
      priority: order.priority as MedicationOrderInsert["priority"],
      instructions: order.instructions?.trim() || null,
      indication: order.indication?.trim() || null,
      ordering_provider: order.orderingProvider?.trim() || null,
      infusion_rate: order.infusionRate || null,
      is_in_presim: Boolean(order.visibleInPresim),
    }));
}

function transformMedicationAdministrationsToSchema(
  caseId: string,
  phase: number,
  orders: MedicationOrder[],
  medAdministrations: MedAdministrationInstance[],
): MedicationAdministrationInsert[] {
  const savedOrderIds = new Set(
    orders.filter((order) => order.id && order.frequency && order.priority).map((order) => order.id),
  );

  return medAdministrations
    .filter(
      (medAdmin) =>
        medAdmin.medicationOrderId && savedOrderIds.has(medAdmin.medicationOrderId),
    )
    .map((medAdmin) => ({
      case_id: caseId,
      phase,
      medication_order_id: medAdmin.medicationOrderId,
      administrator: medAdmin.administratorId ?? "",
      time_offset: medAdmin.adminTimeMinuteOffset,
      status: medAdmin.status,
      notes: medAdmin.notes ?? "",
      administered_dose: medAdmin.administeredDose,
      is_in_presim: medAdmin.visibleInPresim,
    }));
}

async function insertMedicationOrders(
  supabase: SupabaseClient,
  medicationOrders: MedicationOrderInsert[],
) {
  if (medicationOrders.length === 0) return;
  const { error: insertErr } = await supabase.from("medication_orders").insert(medicationOrders);
  if (insertErr) throw new Error(insertErr.message);
}

async function insertMedicationAdministrations(
  supabase: SupabaseClient,
  medAdministrations: MedicationAdministrationInsert[],
) {
  if (medAdministrations.length === 0) return;
  const { error: insertErr } = await supabase.from("medication_administrations").insert(medAdministrations);
  if (insertErr) throw new Error(insertErr.message);
}
