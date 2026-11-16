import { AllMedicationTypes, InjectableMedication, InsulinMedication, IvMedication, MedAdministrationInstance, MedicationOrder, OralMedication } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import { TablesInsert } from "../../database.types";
import { Database } from '../../database.types'
import { addHours, endOfHour, format, isSameDay, startOfHour } from "date-fns";
import { DatabaseMedication } from "@/actions/simulation";

export type MedicationFrequency = Database['public']['Enums']['medication_frequencies'];
export type MedicationPriority = Database['public']['Enums']['medication_priorities'];

export type MedicationOrderInsert = TablesInsert<"medication_orders">
export type MedicationAdministrationInsert = TablesInsert<'medication_administrations'>;
export type FrequencyEnum = Database['public']['Enums']['medication_frequencies'];
export interface MedCardColumn {
  startTime: Date;
  endTime: Date;
  colHeader: string;
  associatedAdministrations?: MedAdministrationInstance[];
}


export function transformMedicationAdministrationsToSchema(
  caseId: string,
  medAdministrations: MedAdministrationInstance[],
): MedicationAdministrationInsert[] {
  const medAdministrationsInsert: MedicationAdministrationInsert[] = []
  medAdministrations.forEach(medAdmin => {
    medAdministrationsInsert.push({
      case_id: caseId,
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



export function displayColumnShifterDate(firstCol: Date, lastCol: Date) {
  if (isSameDay(firstCol, lastCol)) {
    return format(firstCol, 'MM/dd');
  }
  return `${format(firstCol, 'MM/dd')}  –  ${format(lastCol, 'MM/dd')}`;
}

export const createColumns = (currentTime: Date, offsetHours: number, futureColCount = 2) => {
  const columnAnchor = startOfHour(currentTime);
  const columnCount = 6;
  const displayColumns: MedCardColumn[] = [];

  const startOffset = offsetHours - (columnCount - 1 - futureColCount);

  for (let i = 0; i < columnCount; i++) {
    const currentOffset = startOffset + i;

    const colStart = addHours(columnAnchor, currentOffset);
    const colEnd = endOfHour(colStart);

    displayColumns.push({
      startTime: colStart,
      endTime: colEnd,
      colHeader: format(colStart, 'HHmm')
    });
  }

  return displayColumns;
};

export function mapDatabaseMedToFrontend(dbMed: DatabaseMedication): AllMedicationTypes {
  // 1. Extract the base properties common to ALL medications
  const baseMed = {
    id: dbMed.id,
    genericName: dbMed.generic_name,
    brandName: dbMed.brand_name || undefined,
    route: dbMed.route,
    strength: dbMed.strength,
    strengthUnit: dbMed.strength_unit,
    dispenseUnit: dbMed.dispense_units.name || "Unknown",
    isVariableDose: dbMed.is_variable_dose,
  };

  // 2. Narrow based on the route
  switch (dbMed.route) {
    case "IV":
      return {
        ...baseMed,
        route: "IV",
        infusionRateUnit: (dbMed.infusion_rate_unit as "mL/hr" | "mg/hr" | "units/hr") || undefined,
        diluent: dbMed.diluent || undefined,
        totalVolume: dbMed.total_volume || undefined,
      } as IvMedication;

    case "PO":
      return {
        ...baseMed,
        route: "PO",
        dispenseUnit: dbMed.dispense_units.name,
      } as OralMedication;

    case "SC":
      if (dbMed.is_variable_dose) {
        return {
          ...baseMed,
        } as InsulinMedication;
      }
      return {
        ...baseMed,
        route: "SC",
      } as InjectableMedication;

    default:
      return baseMed as AllMedicationTypes;
  }
}

export const pluralize = (unitsOrdered: number | null, unitName: string) => {
  return unitsOrdered && unitsOrdered > 1 && unitName.at(-1) !== 's' ? unitName + 's' : unitName;
};

export const isSlidingScaleInsulin = (medication: AllMedicationTypes): medication is InsulinMedication => {
  return (medication.route === "SC" && medication.isVariableDose);
};


export function getMedDose(medication: AllMedicationTypes, order: MedicationOrder) {
  if (isSlidingScaleInsulin(medication) || medication.genericName === 'heparin sodium') {
    return "Variable"
  } else {

    const doseText = order.dose ?
      `${(order.dose / medication.strength) * medication.strength}${medication.strengthUnit}`
      : 'Dose Unknown'
    return doseText;
  }
}