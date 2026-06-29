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
  indication: string;
  // status: "active" | "completed" | "Held" | "cancelled";
  orderingProvider: string;
  infusionRate?: number
  dose: number | null,
  visibleInPresim: boolean
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
}


export const allMedications: AllMedicationTypes[] = [
  {
    id: "medMetoprololOral25",
    genericName: "metoprolol succinate",
    brandName: "Toprol XL",
    route: "PO", // This matches the discriminator for OralMedication
    strength: 25,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    isVariableDose: false
  },
  {
    id: "medPantoprazoleIv40",
    genericName: "pantoprazole",
    brandName: "Protonix",
    route: "PO",
    strength: 40,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    isVariableDose: false
  },

  {
    id: "medAmoxIv",
    genericName: "amoxicillin",
    brandName: "Amoxil IV",
    route: "IV",
    strength: 500,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    // --- IVMedication specific properties ---
    infusionRateUnit: 'mL/hr',
    diluent: "normal saline 0.9%",
    totalVolume: 50,
    infusionDurationHours: 0.5,
    isVariableDose: false
  },
  {
    id: "medAcetaminophenIv",
    genericName: "acetaminophen",
    brandName: "Ofirmev",
    route: "IV",
    strength: 1000,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    // --- IVMedication specific properties ---
    infusionRateUnit: 'mL/hr',
    totalVolume: 50,
    infusionDurationHours: 0.5,
    isVariableDose: false
  },
  {
    id: "medNormalSaline09Iv",
    genericName: "normal saline 0.9%",
    route: "IV",
    strength: 1000,
    strengthUnit: "mL",
    dispenseUnit: "Bag",
    infusionRateUnit: 'mL/hr',
    totalVolume: 1000,
    infusionDurationHours: 10,
    isVariableDose: false
  },
  {
    id: "medLactatedRingersIV",
    genericName: "Lactated Ringer's Injection ",
    route: "IV",
    strength: 1000,
    strengthUnit: "mL",
    dispenseUnit: "Bag",
    infusionRateUnit: 'mL/hr',
    totalVolume: 1000,
    infusionDurationHours: 10,
    isVariableDose: false
  },
  {
    id: "medPiperacillinTazobactamIV",
    genericName: "piperacillin tazobactam",
    route: "IV",
    strength: 3.375,
    strengthUnit: "g",
    dispenseUnit: "Vial",
    infusionRateUnit: 'mL/hr',
    diluent: 'normal saline 0.9%',
    totalVolume: 100,
    infusionDurationHours: 10,
    isVariableDose: false
  },
  {
    id: "medLisinoprilOral10",
    genericName: "lisinopril",
    brandName: "Zestril",
    route: "PO",
    strength: 10,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    isVariableDose: false
  },
  {
    id: "medVancomycinIv1000",
    genericName: "vancomycin",
    brandName: "Vancocin IV",
    route: "IV",
    strength: 1000, // 1000mg per dose/vial
    strengthUnit: "mg",
    dispenseUnit: "Bag",
    infusionRateUnit: 'mL/hr',
    diluent: "sodium chloride 0.9%",
    totalVolume: 250,
    infusionDurationHours: 2,
    isVariableDose: false
  },
  {
    id: "medAtorvastatinOral40",
    genericName: "atorvastatin",
    brandName: "Lipitor",
    route: "PO",
    strength: 40,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    isVariableDose: false
  },
  {
    id: "medAcetaminophenOral650",
    genericName: "acetaminophen",
    brandName: "Tylenol",
    route: "PO",
    strength: 650,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    isVariableDose: false
  },
  {
    id: "medInsulinGlargineSc",
    genericName: "insulin glargine",
    brandName: "Lantus",
    route: "SC",
    strength: 1,
    strengthUnit: "units",
    dispenseUnit: "Unit",
    isVariableDose: false
  },
  {
    id: "medInsulinAspartHum",
    genericName: "insulin aspart",
    brandName: "Humalog",
    route: "SC",
    strength: 1,
    strengthUnit: "units",
    isVariableDose: false,
    dispenseUnit: "Unit",
    bgDosing: [
      { bgRange: "<70", units: "0" },
      { bgRange: "70-150", units: "6" },
      { bgRange: "151-200", units: "8" },
      { bgRange: "201-250", units: "10" },
      { bgRange: "251-300", units: "12" },
      { bgRange: "301-350", units: "14" },
      { bgRange: "351-400", units: "16" },
      { bgRange: ">400", units: "18" },
    ],
  },
  {
    id: "medFurosemideOral20",
    genericName: "furosemide",
    brandName: "Lasix",
    route: "PO",
    strength: 20,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    isVariableDose: false
  },
  // {
  //   id: "medPantoprazoleIv40",
  //   genericName: "pantoprazole",
  //   brandName: "Protonix IV",
  //   route: "IV",
  //   strength: 40,
  //   strengthUnit: "mg",
  //   dispenseUnit: "Vial",
  //   administrationFrequencies: ["QD"],
  //   infusionRateUnit: "mL/hr",
  //   diluent: "D5W",
  //   totalVolume: 50,
  //   infusionDurationHours: 0.5,
  //   isContinuous: false,
  // },
  {
    id: "medEnoxaparinSc40",
    genericName: "enoxaparin",
    brandName: "Lovenox",
    route: "SC",
    strength: 40,
    strengthUnit: "mg",
    dispenseUnit: "Pre-filled Syringe",
    recommendedInjectionSites: ["Abdomen"],
    needleGauge: "30G",
    needleLength: "5/16 inch",
    reconstitutionRequired: false,
    isVariableDose: false
  },
  {
    id: "medMorphineIv10",
    genericName: "morphine sulfate",
    brandName: "Morphine IV",
    route: "IV",
    strength: 4,
    strengthUnit: "mg",
    dispenseUnit: "Ampule",
    infusionDurationHours: 1,
    isVariableDose: false
  },
  {
    id: "medAlbuterolInhalation",
    genericName: "albuterol sulfate",
    brandName: "ProAir HFA",
    route: "Inhalation",
    strength: 30,
    strengthUnit: "mcg",
    dispenseUnit: "puff",
    deviceType: "MDI",
    requiresSpacer: false,
    inhalationsPerDose: 2,
    isVariableDose: false
  },
  {
    id: "medOndansetronIv4",
    genericName: "ondansetron",
    brandName: "Zofran IV",
    route: "IV",
    strength: 4,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    isVariableDose: false
  },
  {
    id: "medCeftriaxoneIm250",
    genericName: "ceftriaxone",
    brandName: "Rocephin IM",
    route: "IM",
    strength: 250,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    recommendedInjectionSites: ["Gluteal muscle", "Vastus lateralis"],
    needleGauge: "22G",
    needleLength: "1.5 inches",
    reconstitutionRequired: true,
    reconstitutionInstructions: "Reconstitute with 1.8 mL sterile water for injection",
    isVariableDose: false
  },
  {
    id: "medCeftriaxoneIv1g",
    genericName: "ceftriaxone",
    brandName: "Rocephin",
    route: "IV",
    strength: 1,
    strengthUnit: "g",
    dispenseUnit: "Syringe",
    isVariableDose: false
  },
  {
    id: "medEpinephrineIm1mg",
    genericName: "epinephrine",
    brandName: "EpiPen",
    route: "IM",
    strength: 1,
    strengthUnit: "mg",
    dispenseUnit: "Auto-Injector",
    recommendedInjectionSites: ["Anterolateral thigh"],
    needleGauge: "23G",
    needleLength: "0.5 inches",
    reconstitutionRequired: false,
    isVariableDose: false
  },
  {
    id: "medMethylprednisoloneIv125",
    genericName: "methylprednisolone",
    brandName: "Solu-Medrol IV",
    route: "IV",
    strength: 125,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    infusionRateUnit: "mL/hr",
    diluent: "NS 0.9%",
    totalVolume: 100,
    infusionDurationHours: 1,
    isVariableDose: false
  },
  {
    id: "medMetoprololIvPush",
    genericName: "metoprolol tartate",
    brandName: "Lopressor",
    route: "IV",
    strength: 10,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    isVariableDose: false
  },
  {
    id: "medNitroglycerin04mgSl",
    genericName: "nitroglycerin",
    brandName: 'Nitrostat',
    route: "SL",
    strength: 0.4,
    strengthUnit: "mg",
    dispenseUnit: "Tab",
    isVariableDose: false
  },
  {
    id: 'medLidocaineInDex5',
    genericName: "lidocaine",
    route: 'IV',
    strength: 2,
    strengthUnit: 'mg',
    dispenseUnit: "Bag",
    infusionRateUnit: 'mL/hr',
    diluent: "dextrose 5.0%",
    totalVolume: 500,
    infusionDurationHours: 10,
    isVariableDose: false
  },
  {
    id: "medDopamine400InDex5",
    genericName: 'dopamine',
    route: 'IV',
    strength: 400,
    strengthUnit: 'mg',
    dispenseUnit: "Bag",
    infusionRateUnit: "mL/hr",
    diluent: "dextrose 5.0%",
    totalVolume: 250,
    isVariableDose: false
  },
  {
    id: "medAtropinePush",
    genericName: "atropine sulfate",
    route: "IV",
    strength: 0.5,
    strengthUnit: "mg",
    dispenseUnit: "Syringe",
    isVariableDose: false
  },
  {
    id: "medDextrose5inNS45",
    genericName: "dextrose 5% in NS 0.45%",
    route: "IV",
    strength: 1000,
    strengthUnit: 'mL',
    dispenseUnit: 'Bag',
    infusionRateUnit: 'mL/hr',
    isVariableDose: false
  },
  {
    id: "medAcetaminophenOral325",
    genericName: "acetaminophen",
    brandName: "Tylenol",
    route: "PO",
    strength: 325,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    isVariableDose: false
  },
  {
    id: "medCefazolin1000",
    genericName: "cefazolin",
    brandName: "Ancef",
    route: "IV",
    strength: 1000,
    strengthUnit: "mg",
    dispenseUnit: 'Vial',
    isVariableDose: false,
    infusionRateUnit: 'mL/hr'
  },
  {
    id: "medSodiumChloride",
    genericName: "sodium chloride",
    route: "PO",
    strength: 1,
    strengthUnit: "g",
    dispenseUnit: 'Tablet',
    isVariableDose: false
  }
];

export const medRouteSelections: string[] = ["PO", "IV", "SC", "Topical", "Inhalation", "IM", "SL", "Otic", "Ophthalmic"]
export const medActionSelections: string[] = ["Given", "Held", "Refused", "Patient Administered", "Override"]

