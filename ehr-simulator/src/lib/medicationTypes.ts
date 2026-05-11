import { MedAdministrationInstance } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";

export type MedicationAdministrationInsert = {
  case_id: string,
  medication_id: string,
  administrator?: string,
  time_offset: number,
  status: string,
  notes?: string,
  administered_dose: number,
  is_in_presim: boolean
}

export function transformMedicationOrdersToSchema(
  caseId: string,
  medAdministrations: MedAdministrationInstance[],
): MedicationAdministrationInsert[] {
  const medAdministrationsInsert: MedicationAdministrationInsert[] = []
  medAdministrations.forEach(medAdmin => {
    medAdministrationsInsert.push({
      case_id: caseId,
      medication_id: medAdmin.medicationOrderId,
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


