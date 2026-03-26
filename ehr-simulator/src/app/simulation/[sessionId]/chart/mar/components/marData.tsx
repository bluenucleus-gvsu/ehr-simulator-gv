interface BaseMedication {
  id: string;
  genericName: string;
  brandName?: string;
  route: "PO" | "IV" | "SC" | "Topical" | "Inhalation" | "IM" | "SL" | "Otic" | "Ophthalmic";     // Route will be a literal type for discrimination
  strength: number; // e.g., 25, 100
  strengthUnit: string; // e.g., "mg", "units/mL"
  dispenseUnit: string; // e.g., "Tablet", "Solution", "Cream", "Vial", "Syringe"
  administrationFrequencies: string[];
}


export interface OralMedication extends BaseMedication {
  route: "PO";
  canBeCrushedOrSplit: boolean;
  takeWithFood?: boolean;
}

export interface SublingualMedication extends BaseMedication {
  route: "SL";
}

export interface IvMedication extends BaseMedication {
  route: "IV";
  // infusionRate?: number;
  infusionRateUnit?: "mL/hr" | "mg/hr" | "units/hr";
  diluent?: string;
  totalVolume?: number;
  infusionDurationHours?: number;
  isContinuous: boolean;
}

interface InjectableMedication extends BaseMedication {
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
  unitsOrdered: number; // deprecated, using dose to represented amount of strengthUnits of medication ordered
  frequency: string;
  priority: "STAT" | "NOW" | "Routine" | 'PRN' | '';
  instructions?: string;
  indication: string;
  status: "active" | "completed" | "Held" | "cancelled";
  orderingProvider: string;
  infusionRate?: number
  dose: number,
  visibleInPresim: boolean
}

export type AdministrationStatus = 'Given' | 'Held' | 'Missed' | 'Refused' | 'Due'

export interface MedAdministrationInstance {
  id?: string;
  medicationOrderId: string;    // link to specific med order
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
    administrationFrequencies: ["QD", "BID"],
    // Properties specific to OralMedication:
    canBeCrushedOrSplit: false,
    takeWithFood: true,
  },
  {
    id: "medAmoxIv",
    genericName: "amoxicillin",
    brandName: "Amoxil IV",
    route: "IV",
    strength: 500,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    administrationFrequencies: ["Q6H", "Q8H"],
    // --- IVMedication specific properties ---
    infusionRateUnit: 'mL/hr',
    diluent: "normal saline 0.9%",
    totalVolume: 50,
    infusionDurationHours: 0.5,
    isContinuous: false,
  },
  {
    id: "medAcetaminophenIv",
    genericName: "acetaminophen",
    brandName: "Ofirmev",
    route: "IV",
    strength: 1000,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    administrationFrequencies: ["Q6H", "Q8H"],
    // --- IVMedication specific properties ---
    infusionRateUnit: 'mL/hr',
    // diluent: "normal saline 0.9%",
    totalVolume: 50,
    infusionDurationHours: 0.5,
    isContinuous: false,
  },
  {
    id: "medNormalSaline09Iv",
    genericName: "normal saline 0.9%",
    route: "IV",
    strength: 1000,
    strengthUnit: "mL",
    dispenseUnit: "Bag",
    administrationFrequencies: ["Q6H", "Q8H"],
    infusionRateUnit: 'mL/hr',
    totalVolume: 1000,
    infusionDurationHours: 10,
    isContinuous: true,
  },
  {
    id: "medLactatedRingersIV",
    genericName: "Lactated Ringer's Injection ",
    route: "IV",
    strength: 1000,
    strengthUnit: "mL",
    dispenseUnit: "Bag",
    administrationFrequencies: ["Q6H", "Q8H"],
    infusionRateUnit: 'mL/hr',
    totalVolume: 1000,
    infusionDurationHours: 10,
    isContinuous: true,
  },
  {
    id: "medPiperacillinTazobactamIV",
    genericName: "piperacillin tazobactam",
    route: "IV",
    strength: 3.375,
    strengthUnit: "g",
    dispenseUnit: "Vial",
    administrationFrequencies: ["Q6H", "Q8H"],
    infusionRateUnit: 'mL/hr',
    diluent: 'normal saline 0.9%',
    totalVolume: 100,
    infusionDurationHours: 10,
    isContinuous: false,
  },
  {
    id: "medLisinoprilOral10",
    genericName: "lisinopril",
    brandName: "Zestril",
    route: "PO",
    strength: 10,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    administrationFrequencies: ["QD"], // Once daily
    canBeCrushedOrSplit: true,
    takeWithFood: false,
  },
  {
    id: "medVancomycinIv1000",
    genericName: "vancomycin",
    brandName: "Vancocin IV",
    route: "IV",
    strength: 1000, // 1000mg per dose/vial
    strengthUnit: "mg",
    dispenseUnit: "Bag",
    administrationFrequencies: ["Q12H", "Q24H"],
    infusionRateUnit: 'mL/hr',
    diluent: "sodium chloride 0.9%",
    totalVolume: 250,
    infusionDurationHours: 2,
    isContinuous: false,
  },
  {
    id: "medAtorvastatinOral40",
    genericName: "atorvastatin",
    brandName: "Lipitor",
    route: "PO",
    strength: 40,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    administrationFrequencies: ["QD"],
    canBeCrushedOrSplit: false,
    takeWithFood: false,
  },
  {
    id: "medAcetaminophenOral650",
    genericName: "acetaminophen",
    brandName: "Tylenol",
    route: "PO",
    strength: 650,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    administrationFrequencies: ["PRN"], // As needed
    canBeCrushedOrSplit: true,
    takeWithFood: false,
  },
  {
    id: "medInsulinGlargineSc",
    genericName: "insulin glargine",
    brandName: "Lantus",
    route: "SC",
    strength: 1,
    strengthUnit: "units",
    dispenseUnit: "Unit",
    administrationFrequencies: ["QD"],
  },
  {
    id: "medInsulinAspartHum",
    genericName: "insulin aspart",
    brandName: "Humalog",
    route: "SC",
    strength: 1,
    strengthUnit: "units",
    dispenseUnit: "Unit",
    administrationFrequencies: ["QD"],
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
    administrationFrequencies: ["QD", "BID"],
    canBeCrushedOrSplit: true,
    takeWithFood: false,
  },
  {
    id: "medPantoprazoleIv40",
    genericName: "pantoprazole",
    brandName: "Protonix IV",
    route: "IV",
    strength: 40,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    administrationFrequencies: ["QD"],
    infusionRateUnit: "mL/hr",
    diluent: "D5W",
    totalVolume: 50,
    infusionDurationHours: 0.5,
    isContinuous: false,
  },
  {
    id: "medEnoxaparinSc40",
    genericName: "enoxaparin",
    brandName: "Lovenox",
    route: "SC",
    strength: 40,
    strengthUnit: "mg",
    dispenseUnit: "Pre-filled Syringe",
    administrationFrequencies: ["QD", "BID"],
    recommendedInjectionSites: ["Abdomen"],
    needleGauge: "30G",
    needleLength: "5/16 inch",
    reconstitutionRequired: false,
  },
  {
    id: "medMorphineIv10",
    genericName: "morphine sulfate",
    brandName: "Morphine IV",
    route: "IV",
    strength: 4,
    strengthUnit: "mg",
    dispenseUnit: "Ampule",
    administrationFrequencies: ["PRN", "Q4H"],
    infusionDurationHours: 1,
    isContinuous: false,
  },
  {
    id: "medAlbuterolInhalation",
    genericName: "albuterol sulfate",
    brandName: "ProAir HFA",
    route: "Inhalation",
    strength: 30,
    strengthUnit: "mcg",
    dispenseUnit: "puff",
    administrationFrequencies: ["Q4H", "PRN"],
    deviceType: "MDI",
    requiresSpacer: false,
    inhalationsPerDose: 2,
  },
  {
    id: "medOndansetronIv4",
    genericName: "ondansetron",
    brandName: "Zofran IV",
    route: "IV",
    strength: 4,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    administrationFrequencies: ["Q8H", "PRN"],
    isContinuous: false,
  },
  {
    id: "medCeftriaxoneIm250",
    genericName: "ceftriaxone",
    brandName: "Rocephin IM",
    route: "IM",
    strength: 250,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    administrationFrequencies: ["Once"],
    recommendedInjectionSites: ["Gluteal muscle", "Vastus lateralis"],
    needleGauge: "22G",
    needleLength: "1.5 inches",
    reconstitutionRequired: true,
    reconstitutionInstructions: "Reconstitute with 1.8 mL sterile water for injection",
  },
  {
    id: "medCeftriaxoneIv1g",
    genericName: "ceftriaxone",
    brandName: "Rocephin",
    route: "IV",
    strength: 1,
    strengthUnit: "g",
    dispenseUnit: "Syringe",
    administrationFrequencies: ["Once"],
    isContinuous: false
  },
  {
    id: "medEpinephrineIm1mg",
    genericName: "epinephrine",
    brandName: "EpiPen",
    route: "IM",
    strength: 1,
    strengthUnit: "mg",
    dispenseUnit: "Auto-Injector",
    administrationFrequencies: ["PRN"],
    recommendedInjectionSites: ["Anterolateral thigh"],
    needleGauge: "23G",
    needleLength: "0.5 inches",
    reconstitutionRequired: false,
  },
  {
    id: "medMethylprednisoloneIv125",
    genericName: "methylprednisolone",
    brandName: "Solu-Medrol IV",
    route: "IV",
    strength: 125,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    administrationFrequencies: ["Once", "Q6H"],
    infusionRateUnit: "mL/hr",
    diluent: "NS 0.9%",
    totalVolume: 100,
    infusionDurationHours: 1,
    isContinuous: false,
  },
  {
    id: "medMetoprololIvPush",
    genericName: "metoprolol tartate",
    brandName: "Lopressor",
    route: "IV",
    strength: 10,
    strengthUnit: "mg",
    dispenseUnit: "Vial",
    administrationFrequencies: ["Once", "Q6H"],
    isContinuous: false,
  },
  {
    id: "medNitroglycerin04mgSl",
    genericName: "nitroglycerin",
    brandName: 'Nitrostat',
    route: "SL",
    strength: 0.4,
    strengthUnit: "mg",
    dispenseUnit: "Tab",
    administrationFrequencies: ["PRN"],
  },
  {
    id: 'medLidocaineInDex5',
    genericName: "lidocaine",
    route: 'IV',
    strength: 2,
    strengthUnit: 'mg',
    dispenseUnit: "Bag",
    administrationFrequencies: ["Q6H", "Q8H"],
    infusionRateUnit: 'mL/hr',
    diluent: "dextrose 5.0%",
    totalVolume: 500,
    infusionDurationHours: 10,
    isContinuous: false,
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
    isContinuous: false,
    administrationFrequencies: []
  },
  {
    id: "medAtropinePush",
    genericName: "atropine sulfate",
    route: "IV",
    strength: 0.5,
    strengthUnit: "mg",
    dispenseUnit: "Syringe",
    administrationFrequencies: ["Once", "Q6H"],
    isContinuous: false,
  },
  {
    id: "medDextrose5inNS45",
    genericName: "dextrose 5% in NS 0.45%",
    route: "IV",
    strength: 1000,
    strengthUnit: 'mL',
    dispenseUnit: 'Bag',
    infusionRateUnit: 'mL/hr',
    isContinuous: true,
    administrationFrequencies: []
  },
  {
    id: "medAcetaminophenOral325",
    genericName: "acetaminophen",
    brandName: "Tylenol",
    route: "PO",
    strength: 325,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
    administrationFrequencies: ["PRN"], // As needed
    canBeCrushedOrSplit: true,
    takeWithFood: false,
  },
  {
    id: "medCefazolin1000",
    genericName: "cefazolin",
    brandName: "Ancef",
    route: "IV",
    strength: 1000,
    strengthUnit: "mg",
    dispenseUnit: 'Vial',
    administrationFrequencies: [],
    isContinuous: false,
    infusionRateUnit: 'mL/hr'
  },
  {
    id: "medSodiumChloride",
    genericName: "Sodium chloride",
    route: "PO",
    strength: 1,
    strengthUnit: "g",
    dispenseUnit: 'Tablet',
    administrationFrequencies: [],
    canBeCrushedOrSplit: true
  }
];


export const medicationOrders: MedicationOrder[] = [
  {
    id: 'orderAcetaminophenIV',
    medicationId: 'medAcetaminophenIv',
    unitsOrdered: 1,
    dose: 1000,
    frequency: "Q6hr",
    priority: "PRN",
    indication: 'Pain',
    status: 'active',
    orderingProvider: 'Dr. Samuel Wanjouri',
    visibleInPresim: true,
    infusionRate: 125
  },
  {
    id: 'orderSodiumChloride',
    medicationId: 'medSodiumChloride',
    unitsOrdered: 2,
    dose: 2,
    frequency: "Q6hr",
    priority: "PRN",
    indication: 'Hyponatremia',
    status: 'active',
    orderingProvider: 'Dr. Samuel Wanjouri',
    visibleInPresim: true
  },
  {
    id: 'orderOndansetronIv4',
    medicationId: 'medOndansetronIv4',
    unitsOrdered: 1000000,
    dose: 4,
    frequency: "Q6hr",
    priority: "PRN",
    indication: 'Nausea',
    status: 'active',
    orderingProvider: 'Dr. Samuel Wanjouri',
    visibleInPresim: true
  },
  {
    id: 'orderOndansetronIv2',
    medicationId: 'medOndansetronIv4',
    unitsOrdered: 1000000,
    dose: 2,
    frequency: "Q6hr",
    priority: "PRN",
    indication: 'Nausea',
    status: 'active',
    orderingProvider: 'Dr. Samuel Wanjouri',
    visibleInPresim: true
  },
  {
    id: 'orderCefazolin1000',
    medicationId: 'medCefazolin1000',
    unitsOrdered: 1,
    dose: 1000,
    frequency: "Q6hr",
    priority: "Routine",
    indication: 'Infx',
    status: 'active',
    orderingProvider: 'Dr. Samuel Wanjouri',
    visibleInPresim: true,
    infusionRate: 125

  },
  {
    id: "orderDextrose5inNS45",
    medicationId: "medDextrose5inNS45",
    unitsOrdered: 1,
    dose: 1000,
    frequency: 'Continuous',
    priority: "Routine",
    indication: '',
    status: "active",
    orderingProvider: "Dr. Nigel Amos",
    visibleInPresim: true,
    infusionRate: 125
  },
  {
    id: "orderAtropinePush",
    medicationId: "medAtropinePush",
    unitsOrdered: 1,
    dose: 0.5,
    frequency: 'Q1hr',
    priority: "PRN",
    indication: "Bradycardia",
    status: 'active',
    orderingProvider: 'Dr. Beatrice Chebet',
    visibleInPresim: true
  },
  {
    id: "orderDopamine400InDex5",
    medicationId: 'medDopamine400InDex5',
    unitsOrdered: 1,
    dose: 400,
    frequency: 'Once',
    priority: "Routine",
    indication: "Bradycardia",
    status: 'active',
    orderingProvider: "Dr. Hicham Makloufi",
    visibleInPresim: true
  },
  {
    id: 'orderLidocaineInDex5',
    medicationId: 'medLidocaineInDex5',
    unitsOrdered: 1,
    dose: 2,
    frequency: 'Continuous',
    priority: 'Routine',
    indication: 'PVCs',
    status: 'active',
    orderingProvider: 'Dr. Muhammad Al-Berzi',
    visibleInPresim: true
  },
  {
    id: "orderMetoprololIvPush",
    medicationId: "medMetoprololIvPush",
    unitsOrdered: 0.8,               // amount of orderableUnits to be administered to pt   
    dose: 9,
    frequency: "Q8H",
    priority: "STAT",
    indication: "Tachycardia",
    status: "active",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderAlbuterolInh",
    medicationId: "medAlbuterolInhalation",
    unitsOrdered: 1,               // amount of orderableUnits to be administered to pt   
    dose: 60,
    frequency: "Q8H",
    priority: "STAT",
    indication: "Asthma",
    status: "active",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },

  {
    id: "orderAmoxIv",
    medicationId: "medAmoxIv",
    unitsOrdered: 1,               // amount of orderableUnits to be administered to pt   
    dose: 500,
    frequency: "Q8H",
    infusionRate: 100,
    priority: "Routine",
    indication: "Infection",
    status: "active",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderPiperacillinTazobactamIV",
    medicationId: "medPiperacillinTazobactamIV",
    unitsOrdered: 1,               // amount of orderableUnits to be administered to pt   
    dose: 3.375,
    frequency: "Q8H",
    infusionRate: 100,
    priority: "Routine",
    indication: "Infection",
    status: "active",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderNormalSaline09",
    medicationId: "medNormalSaline09Iv",
    unitsOrdered: 1,
    dose: 500,
    infusionRate: 100,
    frequency: "Continuous",
    priority: "Routine",
    indication: "IV Fluids",
    status: "active",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderMetoprololOral25",
    medicationId: "medMetoprololOral25",
    dose: 50,
    unitsOrdered: 7,
    frequency: "Twice Daily",
    priority: "Routine",
    status: "active",
    indication: "Blood Pressure",
    instructions: "Check HR and BP within 30 minutes of administration.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderLisinoprilOral10",
    medicationId: "medLisinoprilOral10",
    unitsOrdered: 1, // Ordering 1 Tablet (10mg)
    dose: 10,
    frequency: "QD",
    priority: "Routine",
    status: "active",
    indication: "Hypertension",
    instructions: "Monitor blood pressure daily.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderVancomycinIv",
    medicationId: "medVancomycinIv1000",
    unitsOrdered: 1000, // Ordering 1 Bag (1000mg)
    dose: 1000,
    frequency: "Q12H",
    priority: "Routine",
    infusionRate: 250,
    status: "active",
    indication: "Infx",
    instructions: "Infuse over 2 hours. Monitor for Red Man Syndrome. Obtain trough level before 4th dose.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderAtorvastatinOral40",
    medicationId: "medAtorvastatinOral40",
    unitsOrdered: 1,
    dose: 40,
    frequency: "QD",
    priority: "Routine",
    status: "active",
    indication: "Hyperlipidemia",
    instructions: "Administer in the evening.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderAcetaminophenOral650",
    medicationId: "medAcetaminophenOral650",
    dose: 650,
    unitsOrdered: 2,
    frequency: "Q6hr",
    priority: "PRN",
    status: "active",
    indication: "Pain",
    instructions: "For pain of 4/10 or greater. Max dose of 4 tablets per 24 hours.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderAcetaminophenOral325",
    medicationId: "medAcetaminophenOral650",
    dose: 325,
    unitsOrdered: 1,
    frequency: "Q6hr",
    priority: "PRN",
    status: "active",
    indication: "Pain",
    instructions: "For pain of 4/10 or greater. Max dose of 4g per 24 hours.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderInsulinGlargineSc",
    medicationId: "medInsulinGlargineSc",
    unitsOrdered: 15,
    dose: 15,
    frequency: "QD",
    priority: "Routine",
    status: "active",
    indication: "Type 2 Diabetes",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderInsulinAspartHum",
    medicationId: "medInsulinAspartHum",
    unitsOrdered: 15,
    dose: 15,
    frequency: "QD",
    priority: "Routine",
    status: "active",
    indication: "Type 2 Diabetes",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderLactatedRingers",
    medicationId: "medLactatedRingersIV",
    unitsOrdered: 1,
    dose: 1000,
    infusionRate: 100,
    frequency: "Continuous",
    priority: "Routine",
    status: "active",
    indication: "Maintainence Fluids",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  // {
  //   id: "orderHydrocortisoneCream",
  //   medicationId: "medHydrocortisoneCream",
  //   unitsOrdered: 1, // Represents "one application"
  //   dose: 1,
  //   frequency: "Q4hr",
  //   priority: "PRN",
  //   status: "active",
  //   indication: "Itching",
  //   instructions: "Apply thin layer to affected area as needed for rash or itching.",
  //   orderingProvider: "Dr. Rahul Gupta",
  //   visibleInPresim: true
  // },
  {
    id: "orderFurosemideOral20",
    medicationId: "medFurosemideOral20",
    unitsOrdered: 1, // 1 Tablet
    dose: 20,
    frequency: "BID",
    priority: "Routine",
    status: "active",
    indication: "Edema",
    instructions: "Monitor daily weight and I/O.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderPantoprazoleIv40",
    medicationId: "medPantoprazoleIv40",
    unitsOrdered: 1, // 1 Vial
    dose: 40,
    frequency: "QD",
    priority: "Routine",
    infusionRate: 100, // 50mL over 0.5hr = 100mL/hr
    status: "active",
    indication: "GERD",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderEnoxaparinSc40",
    medicationId: "medEnoxaparinSc40",
    unitsOrdered: 1, // 1 Pre-filled Syringe
    dose: 40,
    frequency: "QD",
    priority: "Routine",
    status: "active",
    indication: "DVT Prophylaxis",
    instructions: "Administer to abdomen, 2 inches from umbilicus. Do not expel air bubble.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderMorphineIv",
    medicationId: "medMorphineIv10",
    unitsOrdered: 0.2, // 0.2 of the 10mg Ampule = 2mg dose
    dose: 2,
    frequency: "Q3hr",
    priority: "PRN",
    status: "active",
    indication: "Severe Pain",
    instructions: "For pain 7-10. Reassess pain in 30 minutes.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  // {
  //   id: "orderNitroPatchTd",
  //   medicationId: "medNitroPatchTd",
  //   unitsOrdered: 1, // 1 Patch
  //   dose: 0.4,
  //   frequency: "Daily",
  //   priority: "Routine",
  //   status: "active",
  //   indication: "Angina Prophylaxis",
  //   instructions: "Apply one patch daily in AM. Remove at night (12-hour nitrate-free interval). Rotate sites.",
  //   orderingProvider: "Dr. Rahul Gupta"
  // },
  // {
  //   id: "orderOndansetronIv4",
  //   medicationId: "medOndansetronIv4",
  //   unitsOrdered: 1, // 1 Vial
  //   frequency: "Q6hr",
  //   priority: "RN",
  //   infusionRate: 100, // 50mL over 0.5hr = 100mL/hr
  //   dose: 4,
  //   status: "active",
  //   indication: "Nausea/Vomiting",
  //   instructions: "As needed for nausea.",
  //   orderingProvider: "Dr. Rahul Gupta"
  // },
  {
    id: "orderCeftriaxoneIm250",
    medicationId: "medCeftriaxoneIm250",
    unitsOrdered: 1, // 1 Vial
    dose: 250,
    frequency: "Once",
    priority: "STAT",
    status: "active",
    indication: "Bacterial Infection",
    instructions: "Reconstitute with 1.8 mL sterile water and administer IM.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderEpinephrineIm1mg",
    medicationId: "medEpinephrineIm1mg",
    unitsOrdered: 1,
    dose: 1,
    frequency: "Q12hr",
    priority: "PRN",
    status: "active",
    indication: "Anaphylaxis",
    instructions: "Administer immediately for signs of severe allergic reaction (wheezing, hives, swelling).",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderMethylprednisoloneIv125",
    medicationId: "medMethylprednisoloneIv125",
    unitsOrdered: 1, // 1 Vial
    dose: 125,
    frequency: "Once",
    priority: "STAT",
    infusionRate: 100, // 100mL over 1hr = 100mL/hr
    status: "active",
    indication: "Severe Inflammation",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderNitroglycerin04mgSl",
    medicationId: "medNitroglycerin04mgSl",
    unitsOrdered: 1,
    dose: 0.4,
    frequency: "Q5min",
    priority: "PRN",
    status: "active",
    indication: "Angina",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  }
]

// negative time offset -> occurred in the past
export const medAdministrations: MedAdministrationInstance[] = [
  {
    medicationOrderId: "orderAtropinePush",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: -150,
    status: 'Given',
    notes: "",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderDopamine400InDex5",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: 60,
    status: 'Due',
    notes: "",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderCefazolin1000",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: -480,
    status: 'Held',
    notes: "",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderCefazolin1000",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: -120,
    status: 'Missed',
    notes: "",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderCefazolin1000",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: 420,
    status: 'Due',
    notes: "",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderDextrose5inNS45",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: -120,
    status: 'Given',
    notes: "",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderDextrose5inNS45",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: 361,
    status: 'Due',
    notes: "",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderDextrose5inNS45",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: -420,
    status: 'Given',
    notes: "",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderCefazolin1000",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: 60,
    status: 'Due',
    notes: "",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderCeftriaxoneIm250",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: -30,
    status: 'Given',
    notes: "",
    administeredDose: 250,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderCeftriaxoneIm250",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: -360,
    status: 'Given',
    notes: "",
    administeredDose: 250,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderMetoprololOral25",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: -200,
    status: 'Given',
    notes: " metoprolol",
    administeredDose: 25,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderAmoxIv",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: -31,
    status: 'Given',
    notes: "-61 amox.",
    administeredDose: 200,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderAmoxIv",
    administratorId: "RN Smith",
    adminTimeMinuteOffset: -180,
    status: 'Held',
    notes: "-61 amox.",
    administeredDose: 100,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderMetoprololOral25",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: 0,
    status: 'Due',
    notes: "-121 metoprolol dose.",
    administeredDose: 100,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderLisinoprilOral10",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: -121,
    status: 'Missed',
    notes: "-121 metoprolol dose.",
    administeredDose: 100,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderLisinoprilOral10",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: 60,
    status: 'Due',
    notes: "-121 metoprolol dose.",
    administeredDose: 100,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderVancomycinIv",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: 60,
    status: 'Due',
    notes: "-121 metoprolol dose.",
    administeredDose: 100,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderVancomycinIv",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: -140,
    status: 'Refused',
    notes: "-121 metoprolol dose.",
    administeredDose: 100,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderVancomycinIv",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: -360,
    status: 'Refused',
    notes: "-121 metoprolol dose.",
    administeredDose: 100,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderOndansetronIv4",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: -60,
    status: 'Held',
    notes: "-121 zofran dose.",
    administeredDose: 0,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderOndansetronIv4",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: 240,
    status: 'Due',
    notes: "-121 zofran dose.",
    administeredDose: 0,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderOndansetronIv4",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: -260,
    status: 'Refused',
    notes: "-121 zofran dose.",
    administeredDose: 0,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderOndansetronIv2",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: -10,
    status: 'Given',
    notes: "",
    administeredDose: 2,
    visibleInPresim: true
  },
  {
    medicationOrderId: "orderOndansetronIv2",
    administratorId: "RN Jones",
    adminTimeMinuteOffset: -530,
    status: 'Given',
    notes: "",
    administeredDose: 2,
    visibleInPresim: true
  },
]


export const medRouteSelections: string[] = ["PO", "IV", "SC", "Topical", "Inhalation", "IM", "SL", "Otic", "Ophthalmic"]
export const medActionSelections: string[] = ["Given", "Held", "Refused", "Patient Administered", "Override"]

