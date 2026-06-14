import { MedAdministrationInstance, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import { TablesInsert } from "../../database.types";
import { Database } from '../../database.types'

export type MedicationFrequency = Database['public']['Enums']['medication_frequencies'];
export type MedicationPriority = Database['public']['Enums']['medication_priorities'];

export type MedicationOrderInsert = TablesInsert<"medication_orders">
export type MedicationAdministrationInsert = TablesInsert<'medication_administrations'>;
export type FrequencyEnum = Database['public']['Enums']['medication_frequencies'];


export function transformMedicationAdministrationsToSchema(
  caseId: string,
  medAdministrations: MedAdministrationInstance[],
): MedicationAdministrationInsert[] {
  const medAdministrationsInsert: MedicationAdministrationInsert[] = []
  medAdministrations.forEach(medAdmin => {
    medAdministrationsInsert.push({
      case_id: caseId,
      // medication_id: medAdmin.medicationOrderId,
      medication_order_id: medAdmin.medicationOrderId,
      administrator: medAdmin.administratorId ?? "",
      time_offset: medAdmin.adminTimeMinuteOffset,
      status: medAdmin.status,
      notes: medAdmin.notes ?? "",
      administered_dose: medAdmin.administeredDose,
      is_in_presim: medAdmin.visibleInPresim
    })
  })
  return medAdministrationsInsert
}

export function transformMedicationOrdersToSchema(
  caseId: string,
  medOrders: MedicationOrder[],
): MedicationOrderInsert[] {
  const dbMedOrders: MedicationOrderInsert[] = []
  medOrders.forEach(order => {

    dbMedOrders.push({
      case_id: caseId,
      dose: order.dose,
      frequency: order.frequency as MedicationFrequency,
      indication: order.indication ?? "",
      infusion_rate: order.infusionRate || null,
      instructions: order.instructions || null,
      medication_id: order.medicationId,
      ordering_provider: order.orderingProvider || null,
      priority: order.priority as MedicationPriority,
      is_in_presim: order.visibleInPresim
    })
  })
  return dbMedOrders
}



