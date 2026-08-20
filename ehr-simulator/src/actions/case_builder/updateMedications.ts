"use server"

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MedAdministrationInstance,
  MedicationOrder,
} from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";

export async function updateMedications(
  supabase: SupabaseClient,
  payload: { orders: MedicationOrder[]; administrations: MedAdministrationInstance[] },
  caseId: string,
) {
  const orders = payload.orders.map((order) => ({
    id: order.id,
    medication_id: order.medicationId,
    dose: Number(order.dose) || 0,
    frequency: order.frequency,
    priority: order.priority,
    instructions: order.instructions?.trim() || null,
    indication: order.indication?.trim() || null,
    ordering_provider: order.orderingProvider?.trim() || null,
    infusion_rate: order.infusionRate ?? null,
    is_in_presim: Boolean(order.visibleInPresim),
    phase: Number(order.phase ?? 1),
  }));
  const administrations = payload.administrations.map((administration) => ({
    medication_order_id: administration.medicationOrderId,
    administrator: administration.administratorId?.trim() || "System",
    time_offset: Number(administration.adminTimeMinuteOffset),
    status: administration.status,
    notes: administration.notes?.trim() || "",
    administered_dose: Number(administration.administeredDose),
    is_in_presim: Boolean(administration.visibleInPresim),
    phase: Number(administration.phase ?? 1),
  }));

  const { error } = await supabase.rpc("case_builder_replace_medications", {
    p_case_id: caseId,
    p_orders: orders,
    p_administrations: administrations,
  });
  if (error) throw new Error(error.message);
}
