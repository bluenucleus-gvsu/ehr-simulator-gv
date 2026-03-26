interface BaseMedication {
  id: string;
  genericName: string;
  brandName?: string;
  route: 'PO' | 'IV' | 'SC' | 'Topical' | 'Inhalation' | 'IM' | 'SL' | 'Otic' | 'Ophthalmic';     // Route will be a literal type for discrimination
  strength: number;
  strengthUnit: string;
  dispenseUnit: string; // e.g., "Tablet", "Solution", "Cream", "Vial", "Syringe"
  // administrationFrequencies: string[];
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
  isContinuous: boolean;
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
  },
  {
    id: "medPantoprazoleIv40",
    genericName: "pantoprazole",
    brandName: "Protonix",
    route: "PO",
    strength: 40,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
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
    // --- IVMedication specific properties ---
    infusionRateUnit: 'mL/hr',
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
  },
  {
    id: "medAcetaminophenOral650",
    genericName: "acetaminophen",
    brandName: "Tylenol",
    route: "PO",
    strength: 650,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
  },
  {
    id: "medInsulinGlargineSc",
    genericName: "insulin glargine",
    brandName: "Lantus",
    route: "SC",
    strength: 1,
    strengthUnit: "units",
    dispenseUnit: "Unit",
  },
  {
    id: "medInsulinAspartHum",
    genericName: "insulin aspart",
    brandName: "Humalog",
    route: "SC",
    strength: 1,
    strengthUnit: "units",
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
  },
  {
    id: "medAtropinePush",
    genericName: "atropine sulfate",
    route: "IV",
    strength: 0.5,
    strengthUnit: "mg",
    dispenseUnit: "Syringe",
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
  },
  {
    id: "medAcetaminophenOral325",
    genericName: "acetaminophen",
    brandName: "Tylenol",
    route: "PO",
    strength: 325,
    strengthUnit: "mg",
    dispenseUnit: "Tablet",
  },
  {
    id: "medCefazolin1000",
    genericName: "cefazolin",
    brandName: "Ancef",
    route: "IV",
    strength: 1000,
    strengthUnit: "mg",
    dispenseUnit: 'Vial',
    isContinuous: false,
    infusionRateUnit: 'mL/hr'
  },
  {
    id: "medSodiumChloride",
    genericName: "sodium chloride",
    route: "PO",
    strength: 1,
    strengthUnit: "g",
    dispenseUnit: 'Tablet',
  }
];

export const medicationOrders: MedicationOrder[] = [
  // {
  //   id: "orderCeftriaxoneIv1g",
  //   medicationId: "medCeftriaxoneIv1g",
  //   unitsOrdered: 0,
  //   frequency: "Q8H",
  //   priority: "PRN",
  //   indication: "Infection",
  //   orderingProvider: "Dr. Adler",
  //   dose: 1,
  //   visibleInPresim: false,
  //   status: "active",
  //   instructions: "For future use. Administer over 2-4 minutes."
  // },
  // {
  //   id: "orderLactatedRingers500",
  //   medicationId: "medLactatedRingersIV",
  //   unitsOrdered: 0,
  //   frequency: "ONCE",
  //   priority: "PRN",
  //   indication: "Hypotension",
  //   orderingProvider: "Dr. Adler",
  //   dose: 500,
  //   visibleInPresim: false,
  //   status: "active",
  //   infusionRate: 999,
  //   instructions: "For future use. Administer over 30 minutes."
  // },
  {
    id: "orderOndansetronIv4",
    medicationId: "medOndansetronIv4",
    frequency: "Q6H",
    priority: "PRN",
    indication: "Nausea",
    orderingProvider: "Dr. Chen",
    dose: 4,
    visibleInPresim: true,
    instructions: "Administer over 2 minutes."
  },
  {
    id: "orderLisinoprilOral10",
    medicationId: "medLisinoprilOral10",
    frequency: "QD",
    priority: "Routine",
    indication: "HTN",
    orderingProvider: "Dr. Chen",
    dose: 10,
    visibleInPresim: true,
    instructions: "Hold if BP < 100/60. Notify provider if held. "
  },
  {
    id: "orderPantoprazolePo40",
    medicationId: "medPantoprazoleIv40",
    frequency: "QD",
    priority: "Routine",
    indication: "GERD",
    orderingProvider: "Dr. Chen",
    dose: 40,
    visibleInPresim: true,
    instructions: " "
  },
  {
    id: "orderSodiumChloride",
    medicationId: "medSodiumChloride",
    frequency: "BID",
    priority: "Routine",
    indication: "Hyponatremia",
    orderingProvider: "Dr. Chen",
    dose: 1,
    visibleInPresim: true,
    instructions: "Hold if serum sodium greater than 135."
  },
  {
    id: "orderAcetaminophenIV",
    medicationId: "medAcetaminophenIv",
    frequency: "Q8H",
    priority: "PRN",
    indication: "Pain/Fever",
    orderingProvider: "Dr. Chen",
    dose: 1000,
    visibleInPresim: true,
    instructions: "For mild pain (1-3) or temperature greater than 38.0. If unable to take PO.",
    infusionRate: 400
  },
  {
    id: "orderAcetaminophenOral650",
    medicationId: "medAcetaminophenOral650",
    frequency: "Q6H",
    priority: "PRN",
    indication: "Pain/Fever",
    orderingProvider: "Dr. Chen",
    dose: 650,
    visibleInPresim: true,
    instructions: "For mild pain (1-3) or temperature greater than 38.0"
  },
  {
    id: "orderNormalSaline09",
    medicationId: "medNormalSaline09Iv",
    frequency: "CONTINUOUS",
    priority: "Routine",
    indication: "Hydration",
    orderingProvider: "Dr. Chen",
    dose: 1000,
    visibleInPresim: true,
    infusionRate: 75,
    instructions: " "
  },
  {
    id: "orderFurosemideOral20",
    medicationId: "medFurosemideOral20",
    dose: 20,
    frequency: "BID",
    priority: "Routine",
    indication: "Edema",
    instructions: "Monitor daily weight and I/O.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderPantoprazoleIv40",
    medicationId: "medPantoprazoleIv40",
    dose: 40,
    frequency: "QD",
    priority: "Routine",
    infusionRate: 100, // 50mL over 0.5hr = 100mL/hr
    indication: "GERD",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderEnoxaparinSc40",
    medicationId: "medEnoxaparinSc40",
    dose: 40,
    frequency: "QD",
    priority: "Routine",
    indication: "DVT Prophylaxis",
    instructions: "Administer to abdomen, 2 inches from umbilicus. Do not expel air bubble.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderMorphineIv",
    medicationId: "medMorphineIv10",
    dose: 2,
    frequency: "Q3hr",
    priority: "PRN",
    indication: "Severe Pain",
    instructions: "For pain 7-10. Reassess pain in 30 minutes.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderCeftriaxoneIm250",
    medicationId: "medCeftriaxoneIm250",
    dose: 250,
    frequency: "Once",
    priority: "STAT",
    indication: "Bacterial Infection",
    instructions: "Reconstitute with 1.8 mL sterile water and administer IM.",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderEpinephrineIm1mg",
    medicationId: "medEpinephrineIm1mg",
    dose: 1,
    frequency: "Q12hr",
    priority: "PRN",
    indication: "Anaphylaxis",
    instructions: "Administer immediately for signs of severe allergic reaction (wheezing, hives, swelling).",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderMethylprednisoloneIv125",
    medicationId: "medMethylprednisoloneIv125",
    dose: 125,
    frequency: "Once",
    priority: "STAT",
    infusionRate: 100, // 100mL over 1hr = 100mL/hr
    indication: "Severe Inflammation",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  },
  {
    id: "orderNitroglycerin04mgSl",
    medicationId: "medNitroglycerin04mgSl",
    dose: 0.4,
    frequency: "Q5min",
    priority: "PRN",
    indication: "Angina",
    orderingProvider: "Dr. Rahul Gupta",
    visibleInPresim: true
  }
]

// negative time offset -> occurred in the past
export const medAdministrations: MedAdministrationInstance[] = [
  {
    id: "adminNormalSaline09_1",
    medicationOrderId: "orderNormalSaline09",
    administratorId: "Max Smith, RN",
    adminTimeMinuteOffset: -3000,
    status: "Given",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    id: "adminNormalSaline09_2",
    medicationOrderId: "orderNormalSaline09",
    administratorId: "Derek Van Boven, RN",
    adminTimeMinuteOffset: -2220,
    status: "Given",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    id: "adminNormalSaline09_3",
    medicationOrderId: "orderNormalSaline09",
    administratorId: "Kevin Gerbie, RN",
    adminTimeMinuteOffset: -1440,
    status: "Given",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    id: "adminNormalSaline09_4",
    medicationOrderId: "orderNormalSaline09",
    administratorId: "Nate Craft, RN",
    adminTimeMinuteOffset: -660,
    status: "Given",
    administeredDose: 1000,
    visibleInPresim: true
  },
  {
    id: "adminAcetaminophenOral650_1",
    medicationOrderId: "orderAcetaminophenOral650",
    administratorId: "Derek Van Boven, RN",
    adminTimeMinuteOffset: -1200,
    status: "Given",
    administeredDose: 650,
    visibleInPresim: true
  },
  {
    id: "adminAcetaminophenOral650_2",
    medicationOrderId: "orderAcetaminophenOral650",
    administratorId: "Nate Craft, RN",
    adminTimeMinuteOffset: -480,
    status: "Given",
    administeredDose: 650,
    visibleInPresim: true
  },
  {
    id: "adminSodiumChloride_1",
    medicationOrderId: "orderSodiumChloride",
    administratorId: "Max Smith, RN",
    adminTimeMinuteOffset: -2760,
    status: "Given",
    administeredDose: 1,
    visibleInPresim: true
  },
  {
    id: "adminSodiumChloride_2",
    medicationOrderId: "orderSodiumChloride",
    administratorId: "Max Smith, RN",
    adminTimeMinuteOffset: -2040,
    status: "Given",
    administeredDose: 1,
    visibleInPresim: true
  },
  {
    id: "adminSodiumChloride_3",
    medicationOrderId: "orderSodiumChloride",
    administratorId: "Derek Van Boven, RN",
    adminTimeMinuteOffset: -1260,
    status: "Given",
    administeredDose: 1,
    visibleInPresim: true
  },
  {
    id: "adminSodiumChloride_4",
    medicationOrderId: "orderSodiumChloride",
    administratorId: "Nate Craft, RN",
    adminTimeMinuteOffset: -720,
    status: "Given",
    administeredDose: 1,
    visibleInPresim: true
  },
  {
    id: "adminSodiumChloride_due",
    medicationOrderId: "orderSodiumChloride",
    administratorId: "System",
    adminTimeMinuteOffset: 0,
    status: "Due",
    administeredDose: 1,
    visibleInPresim: false
  },
  {
    id: "adminLisinoprilOral10_1",
    medicationOrderId: "orderLisinoprilOral10",
    administratorId: "Max Smith, RN",
    adminTimeMinuteOffset: -2760,
    status: "Given",
    administeredDose: 10,
    visibleInPresim: true
  },
  {
    id: "adminProtonix1",
    medicationOrderId: "orderPantoprazolePo40",
    administratorId: "Max Smith, RN",
    adminTimeMinuteOffset: -2760,
    status: "Given",
    administeredDose: 10,
    visibleInPresim: true
  },
  {
    id: "adminLisinoprilOral10_2",
    medicationOrderId: "orderLisinoprilOral10",
    administratorId: "Derek Van Boven, RN",
    adminTimeMinuteOffset: -1260,
    status: "Given",
    administeredDose: 10,
    visibleInPresim: true
  },
  {
    id: "adminProtonix2",
    medicationOrderId: "orderPantoprazolePo40",
    administratorId: "Derek Van Boven, RN",
    adminTimeMinuteOffset: -1260,
    status: "Given",
    administeredDose: 10,
    visibleInPresim: true
  },
  {
    id: "adminLisinoprilOral10_due",
    medicationOrderId: "orderLisinoprilOral10",
    administratorId: "System",
    adminTimeMinuteOffset: 0,
    status: "Due",
    administeredDose: 10,
    visibleInPresim: false
  },
  {
    id: "adminProtonix3",
    medicationOrderId: "orderPantoprazolePo40",
    administratorId: "System",
    adminTimeMinuteOffset: 0,
    status: "Due",
    administeredDose: 10,
    visibleInPresim: false
  },
  {
    id: "adminOndansetronIv4_1",
    medicationOrderId: "orderOndansetronIv4",
    administratorId: "Max Smith, RN",
    adminTimeMinuteOffset: -3000,
    status: "Given",
    administeredDose: 4,
    visibleInPresim: true
  },
  {
    id: "adminOndansetronIv4_2",
    medicationOrderId: "orderOndansetronIv4",
    administratorId: "Derek Van Boven, RN",
    adminTimeMinuteOffset: -1440,
    status: "Given",
    administeredDose: 4,
    visibleInPresim: true
  }
]

export const medRouteSelections: string[] = ["PO", "IV", "SC", "Topical", "Inhalation", "IM", "SL", "Otic", "Ophthalmic"]
export const medActionSelections: string[] = ["Given", "Held", "Refused", "Patient Administered", "Override"]

