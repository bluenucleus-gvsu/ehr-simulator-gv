interface BaseMedication {
  id: string;
  genericName: string;
  brandName?: string;
  route: 'PO' | 'IV' | 'SC' | 'Topical' | 'Inhalation' | 'IM' | 'SL' | 'Otic' | 'Ophthalmic';     // Route will be a literal type for discrimination
  strength: number;
  strengthUnit: string;
  dispenseUnit: string; // e.g., "Tablet", "Solution", "Cream", "Vial", "Syringe"
  isVariableDose: boolean;
}


export interface OralMedication extends BaseMedication {
  route: "PO";
  // canBeCrushedOrSplit: boolean;
  // takeWithFood: boolean;
}

export interface SublingualMedication extends BaseMedication {
  route: "SL";
}

export interface IvMedication extends BaseMedication {
  route: "IV";
  infusionRateUnit?: "mL/hr" | "mg/hr" | "units/hr";
  diluent?: string;
  totalVolume?: number;
  infusionDurationHours?: number;
}

export interface InjectableMedication extends BaseMedication {
  route: "SC" | "IM";
  recommendedInjectionSites?: string[];
  needleGauge?: string;
  needleLength?: string;
  reconstitutionRequired?: boolean;
  reconstitutionInstructions?: string;
}

interface TopicalMedication extends BaseMedication {
  route: "Topical";
  applicationArea: string;
  patchApplicationFrequency?: string;
  patchChangeInstructions?: string;
}

interface InhalerMedication extends BaseMedication {
  route: "Inhalation";
  deviceType: "MDI" | "DPI" | "nebulizer";
  requiresSpacer?: boolean;
  inhalationsPerDose: number;
}

export interface InsulinMedication extends InjectableMedication {
  bgDosing: { bgRange: string, units: string }[],
}

export type AllMedicationTypes =     // route property acts as discriminator
  OralMedication |
  IvMedication |
  InjectableMedication |
  TopicalMedication |
  InhalerMedication |
  InsulinMedication |
  SublingualMedication


// Each order is associated with one medication and details how, when, why it should be given  
export interface MedicationOrder {
  id: string;
  medicationId: string;
  frequency: string;
  priority: "STAT" | "NOW" | "Routine" | 'PRN' | '';
  instructions?: string;
  indication?: string;
  // status: "active" | "completed" | "Held" | "cancelled";
  orderingProvider: string;
  infusionRate?: number
  dose: number | null,
  visibleInPresim: boolean
  phase?: number
  label?: string | null
}

export type AdministrationStatus = 'Given' | 'Held' | 'Missed' | 'Refused' | 'Due'

export interface MedAdministrationInstance {
  id?: string;
  medicationOrderId: string;
  administratorId: string;
  adminTimeMinuteOffset: number;
  status: AdministrationStatus;
  notes?: string;
  administeredDose: number;
  visibleInPresim: boolean;
  phase?: number;
}


export const medRouteSelections: string[] = ["PO", "IV", "SC", "Topical", "Inhalation", "IM", "SL", "Otic", "Ophthalmic"]
export const medActionSelections: string[] = ["Given", "Held", "Refused", "Patient Administered", "Override"]
